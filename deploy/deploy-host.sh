#!/usr/bin/env bash
set -euo pipefail

if [[ ${1:-} =~ ^[0-9a-f]{40}$ ]]; then
  release_sha=$1
else
  echo "usage: $0 <full-commit-sha>" >&2
  exit 2
fi

repo_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
unit_source="$repo_dir/deploy/systemd/homeserver.service"
unit_target="$HOME/.config/systemd/user/homeserver.service"
image_env="$HOME/.config/homeserver/deployed-image.env"
image="ghcr.io/tbhanson96/homeserver:sha-$release_sha"
mkdir -p "$(dirname "$unit_target")" "$(dirname "$image_env")"
old_digest=$(podman inspect homeserver --format '{{.ImageDigest}}' 2>/dev/null || true)
old_ref=
if [[ $old_digest == sha256:* ]]; then
  old_ref="ghcr.io/tbhanson96/homeserver@$old_digest"
fi

rollback() {
  local reason=$1
  echo "deployment verification failed: $reason" >&2
  if [[ -n $old_ref ]]; then
    printf 'HOMESERVER_IMAGE=%s\n' "$old_ref" > "$image_env"
    systemctl --user daemon-reload
    systemctl --user restart homeserver.service || true
    echo "rollback attempted with previous digest $old_digest" >&2
  else
    echo "no previous image digest was available for automatic rollback" >&2
  fi
  exit 1
}

podman pull "$image"
revision=$(podman image inspect "$image" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
[[ $revision == "$release_sha" ]] || rollback "published image revision is '$revision', expected '$release_sha'"

systemd-analyze --user verify "$unit_source"
install -m 0644 "$unit_source" "$unit_target"
printf 'HOMESERVER_IMAGE=%s\n' "$image" > "$image_env"
chmod 0600 "$image_env"
systemctl --user daemon-reload
systemctl --user restart homeserver.service || rollback "service restart failed"

healthy=false
for _ in {1..60}; do
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/ >/dev/null; then
    healthy=true
    break
  fi
  sleep 1
done
[[ $healthy == true ]] || rollback "HTTP root did not become ready"

running_revision=$(podman inspect homeserver --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
[[ $running_revision == "$release_sha" ]] || rollback "running revision is '$running_revision', expected '$release_sha'"
systemctl --user is-active --quiet homeserver.service || rollback "service is not active"

echo "deployed homeserver revision $release_sha"
