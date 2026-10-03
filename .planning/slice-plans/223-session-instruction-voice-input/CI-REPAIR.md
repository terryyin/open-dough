# Project-settings CI repair

Part of [the active plan](PLAN.md); slice 2 remains `done`. No voice prerequisite
or slice 3 completion is claimed here.

Registered revision `e646e078e2c9c9b1d5d1437d5b6e89bb6dc807ed` failed
[run 37089347147, attempt 1](https://github.com/terryyin/open-dough/actions/runs/37089347147).
Exact-attempt logs were inspected. All 14 failures are stale consumers of the
intentional move from banner Add/Remove to System settings, or old empty-state
copy; no infrastructure disposition applies:

- Job 111106153214 (1/9): two keyboard journeys, four header viewport cases,
  and project-add refusal still target the removed controls.
- Job 111106153225 (2/9): two refresh journeys use the stale snapshot inventory.
- Job 111106153186 (4/9): two read-failure journeys use that same inventory.
- Job 111106153245 (5/9): two empty-list cases and development first-start
  still expect immediate Add or the former explanation.

All implementation/refactor writers had completed with terminal proof before
the coordinator's managed CI stash preserved the uncommitted credential work.
The repair changes five test/helper files and no production code. Root inspected
their actual assertions and the shared helper's current callers:

- `accessible-overview-keyboard.spec.ts`: one System settings stop replaces
  Add/Remove while exact forward/reverse order, visible focus, link activation,
  live announcements and read-control focus remain asserted.
- `dashboard-header.spec.ts`: the actual System settings control is observed
  in each viewport; pinned-header geometry, contrast, evidence and reflow checks
  are retained.
- `dashboardPage.ts`: exact snapshot inventory includes System settings once;
  total decreases by one. Both callers (`read-failure.spec.ts` and
  `read-failure-refresh.spec.ts`) retain snapshot membership, order, errors,
  retrieval times, retry focus and whole replacement observations.
- `project-add-refusal.spec.ts`: enter settings before Add; unchanged linked
  error, retained inputs, enabled retry and storage assertions remain. Cancel
  and Back return before observing unchanged selection/no new repository read.
- `project-configuration.spec.ts`: useful empty-state text/settings entry and
  Add availability are observed without weakening saved bytes, no-GitHub-call
  or unknown-project refusal assertions.

Whole-test search found no remaining stale banner consumers or old empty copy.
Remaining Add controls belong to settings/dialog journeys already adapted.
The omitted consumer updates were a slice-2 proof-scope gap; earlier passing
settings/storage/terminal proof was not evidence for these unchanged test files.

Minimal red reproduced the missing Remove focus target (terminal exit 1):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/accessible-overview-keyboard.spec.ts --grep 'announces reading' --workers=1
```

Focused green reached terminal exit 0; the explicit list confirmed 30 cases in
six files, including every failed case and relevant neighboring/shared callers:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/dashboard-header.spec.ts dashboard/tests/project-add-refusal.spec.ts dashboard/tests/project-configuration.spec.ts dashboard/tests/read-failure.spec.ts dashboard/tests/read-failure-refresh.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Setup uses real isolated dashboard/configuration/read services and files with
synthetic external GitHub/native seams; origin mismatch uses real Git. Strict
typecheck and whitespace checks passed. Fresh independent refactoring found no
further candidate and reused unchanged proof without tests. The coordinator's
`npm run format` passed under the same runtime/key-unset prefix; changed files
remain at most 250 lines. This increment delivers the repair; the managed stash
is restored afterward.
