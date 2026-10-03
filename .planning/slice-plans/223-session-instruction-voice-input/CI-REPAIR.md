# Execution CI repairs

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

## Dictation keyboard inventory repair

Registered revision `fcf43c8802a9a92935e1506683f4edba9e7ec0e6` failed
[run 37097443707, attempt 1](https://github.com/terryyin/open-dough/actions/runs/37097443707),
job 111130153915, dashboard (9/9). Exact-attempt logs identify one stale
keyboard inventory: `codexEffortDialogCases.ts` expects Host after the first
Tab from the instruction field, where the newly added Record button belongs.
This assertion defect is owned by slice 4; no infrastructure disposition applies.

Slice 5's writer acknowledged quiescence, then managed stash preserved its four
unfinished production paths. A fresh repair agent reproduced that exact failure
at current HEAD before editing (terminal exit 1):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts --grep 'model changes preserve compatible effort and retain incompatible selection with linked keyboard feedback' --workers=1
```

The repair adds Record focus and one Tab before the retained Host, Model and
Reasoning effort checks. All compatibility, linked feedback, Start gating,
reset and dismissal assertions remain. Root inspected the helper, its sole
spec caller, actual dialog controls and real Git/start/preview fixture; only
native Codex transport is substituted. Whole-spec green reached exit 0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts --workers=1
```

All 12 cases passed. Existing launch layout/model inventories already include
Record; other Tab consumers exercise unrelated dashboard controls. The omitted
root-level helper was a slice-4 consumer-review gap, not covered by the narrower
earlier search. No product code changes. Fresh independent refactoring found
no candidate, retaining proof without reruns. Coordinator formatting passed;
changed files remain below 250 lines. Slice 4 stays done and slice 5 planned.
This increment publishes the repair before managed restoration and resumption.

## Cursor confirmation snapshot repair

The completion boundary found unread failure evidence for registered revision
`0f10b8ebda76b66befd890c86825396ac6399d5a`,
[run 37098217155, attempt 1](https://github.com/terryyin/open-dough/actions/runs/37098217155).
Exact-attempt inspection confirmed its only failed job: 111132389245,
dashboard (4/9). The instructed ad hoc Cursor test captured a saved `uncertain`
record before native confirmation, then asserted `confirmed` on that stale object.
Production paths, this test and fixtures were unchanged from the established
claim. This inherited test race is a defect; later green CI does not erase it.

All writers were complete. Managed preservation returned `clean`, with no owned
stash entry; the pre-existing stash was preserved. A fresh repair agent used the
existing held native-prompt fixture locally to observe the actual saved uncertain
record, release the child in `finally`, and wait for actual UI confirmation.
The retained stale snapshot reproduced the exact CI assertion, terminal exit 1:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts --grep 'why is the CI slow' --workers=1
```

The repair rereads the durable record after confirmation. Exact instruction,
argv, workspace, omitted flags, absence of invented skill/story/Take, native
uncertainty before confirmation and Git invariants remain asserted. Root inspected
the full test and fixture; neighboring Cursor consumers already wait for acceptance
or intentionally assert uncertainty. Shared fixtures and production are unchanged.
All three cases and strict typecheck reached terminal exit 0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Setup uses the real preview dashboard, durable machine document and Git origin;
only native Cursor transport is substituted. A first reproduction held too long
and failed at article discovery; its child was released and terminal exit observed.
That attempt is excluded from accepted red proof. No product review conclusion
changes; only the saved-record timing proof is corrected.

The Codex stream delivered these events without durable acknowledgement. Root
inspected exact mailbox sequences 1 and 2, matching the two diagnosed attempts;
supported delivery-progress acknowledgement retains their event files and repairs.
Completion at the repair's accepted revision owns the final CI verdict/shutdown.
