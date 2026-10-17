# Project Notes

## Default delivery workflow

- For routine, clearly scoped work in this repository, carry the request through
  investigation, implementation, tests, security checks, commit, push, CI,
  explicit image publication, host deployment, health/feature verification,
  and final reporting. The user should not need to ask separately for each
  routine step.
- Before editing, inspect the worktree and preserve unrelated user changes.
  Before pushing, fetch `origin/master` and do not overwrite upstream work.
- Run the server and client tests, `npm run build:prod`, production dependency
  audits, and `git diff --check` before committing. The server currently has
  upstream high/moderate audit findings without non-breaking fixes; fail the
  routine release gate on critical findings and report the known lower-severity
  findings in the final outcome.
- After pushing `master`, wait for the `Build` workflow for the exact commit to
  succeed. Then dispatch `Publish image` with the full commit SHA, wait for it
  to publish successfully, and deploy that exact SHA with
  `deploy/deploy-host.sh <full-commit-sha>`.
- Verify `homeserver.service`, the local HTTP root, the running image revision,
  and the requested feature after deployment. Verification must not modify
  user files, health data, torrents, ebooks, or other persistent state unless
  the request explicitly authorizes it.
- Stop and ask before destructive operations, credential or secret changes,
  irreversible data changes, uncertain service targets, force pushes, history
  rewrites, or a deployment whose rollback path cannot be identified. Never
  expose environment-file contents in logs.
- Do not publish or deploy from an uncommitted tree, a failed CI run, or a
  commit other than the exact reviewed `master` commit.

Ordinary pushes run CI but do not publish an image. Image publication is an
explicit release action so documentation or incomplete work cannot
automatically replace production `latest`.

## Test environment

- Run `npm test` from `server/` outside the sandbox. The server e2e tests
  bind a local listener, and sandboxed runs can fail with `listen EPERM` or
  null `supertest` port errors even when the tests pass normally. Use the Node
  version from the repository `.nvmrc` for both server and client commands.
