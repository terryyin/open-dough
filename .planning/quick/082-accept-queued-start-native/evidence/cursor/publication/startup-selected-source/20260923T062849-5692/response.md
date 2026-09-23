I'll follow the project's Open Dough execute-plan guidance and preparation gate, starting by reading the relevant skill.Next I'll load trunk-publication preconditions, execution location, and the Story A / backlog context.I'll check the preparation readiness gate, hook contract, and current workspace state next.Hook contract is absent (sample hooks only), so the claim transition is allowed. Starting queued trunk-mode execution next.Startup refused the unpublished local story source — I'll inspect how source validation works and what the published trunk has.**Stopped before implementation.** Queue claim publication was refused; Story A was not taken or implemented.

### Outcome
- **Mode:** trunk (`--push-authorized --workspace-authorized`)
- **Startup receipt:** `ok: false`, `status: source-refused`, `implemented: false`
- **Error:** `unpublished selected story source in originating checkout`
- **Cause:** `.planning/seeds/A.md` in the integration checkout differs from published trunk (`Changed locally after preparation.` vs `Execute A.`)
- **Remote trunk:** unchanged (`5554dec`)
- **Queue:** still lists SEED-A#a; no Taken entry
- **Workspace:** `native-execution` was not created
- **Local changes:** preserved (staged `human-staged.txt`, unstaged `trunk.txt` / seed edit, untracked `human-unstaged.txt`)

Per Open Dough, a refused claim stops before the preparation gate and implementation. To proceed, the selected story source in the originating checkout must match published trunk without discarding other pending local work, or that seed edit must be published/reconciled first.
