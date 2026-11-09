# Check environment


The runner gives every check, in the whole suite or a chosen run alike, the
environment in `scripts/test-environment.bash`, before any check starts:

- **Bash 5 or newer, first on `PATH`.** macOS's Bash 3.2 can silently ignore
  failing `[[ ... ]]` assertions under `set -e`, and the runner times checks
  with Bash 5's `EPOCHREALTIME`. Checks launch `bash` through `PATH`, so the
  runner refuses an older `bash` there even when a newer one started it; put a
  current Bash's bin directory first, for example
  `PATH="/path/to/current-bash/bin:$PATH" npm test`. This is a contributor
  requirement; the product installer still supports Bash 3.2.
- **CI's uncolored output.** `FORCE_COLOR` and `NO_COLOR` are unset, so a
  check that compares tool output, such as Node's assertion diffs, sees the
  same bytes as in CI.
- **CI's Git state.** No global, system, or inherited configuration,
  identity or repository-location variables such as an alternate object
  store; automatic maintenance off, so no detached repack
  rewrites `.git/objects` while a check snapshots or removes a fixture (a push
  over Git's local transport drops these settings, so a fixture that copies a
  pushed-to bare remote turns maintenance off in that remote's own config); no
  identity or default branch, so a commit fails unless the check sets one (a
  shell fixture gets it from `tests/helpers/release-fixture.bash`'s
  `configure_fixture_git`).
- **No GitHub request owner.** `DOUGH_GITHUB_REQUEST_OWNER_ROOT` names a
  root of the job's own that admits no owner, so a check whose processes ask
  GitHub (`src/skills/dough-execute-plan/scripts/github-requests.mjs`) without
  naming a private root is answered by none, this machine's real one included,
  and fails with `Asked GitHub without a request owner root of its own.` Such
  a shell check gives those processes its own root and ends the owner there
  with `tests/helpers/private-request-owner.bash`, a node test with
  `github-request-owner-test-fixtures.mjs` beside that script
  (`tests/test-runner-github-requests.sh` proves both).
- **Chosen checks follow the same rules**, silence included, but are not held
  to the time budget (`tests/test-runner-selection.sh` proves a chosen run).

Running a check directly (`bash tests/<name>.sh`, `node --test <file>`) is
unsupported, except for a check's own options, which the runner never passes:
invoke the native ADR-awareness wrappers (manually triggered paid runs and
inventories, described with their proof scripts in
`tests/native-adr-awareness-wrappers.md`) or the
[native publication checks](native-publication.md) directly, with Bash 5 first on
`PATH`, outside the runner's Git state. CI's Bash can be older than a local
one and behave differently inside traps (before Bash 5.3 a bare `return` in a
function called from a trap takes the interrupted command's status).

### Reproducing CI's platform

Use the [container diagnostic helper](ci-container.md) when a check fails only
on CI or needs CI's Bash and Git. Ordinary checks stay native.

### Repeating CI on one revision

When a check passes and fails on CI without a code change, run CI itself on
that revision repeatedly and count what failed:

```sh
bash scripts/ci-repeat.sh 20            # the current branch, 20 times
bash scripts/ci-repeat.sh 5 some-branch # another pushed ref
```

It dispatches `ci.yml` unchanged on the ref's revision through `gh`, at most
two at a time, and counts only its own runs, naming each failing dashboard spec
location and other failed job with its failed-repetition count; it exits 0 only
when every repetition passed. Each also runs `lint` and `test`, so run it on
demand only. Its header lists its settings; `tests/ci-repeat.sh` proves it.

A dashboard failure on unchanged code, on CI or locally, is likewise a defect
to find and fix, not a reason to rerun until green. To repeat the dashboard
suite on this machine, idle, under load, or from a fresh worktree, use
`scripts/dashboard-repeat.sh`; the
[dashboard tests guide](../dashboard/tests/README.md) describes it and where a
failed run keeps its report and traces.
