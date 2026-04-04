# Project Notes

- Run `npm test` in `/Users/tim/Repo/homeserver-v2/server` outside the sandbox. The server e2e tests bind a local listener, and sandboxed runs can fail with `listen EPERM` / null `supertest` port errors even when the tests pass normally.
