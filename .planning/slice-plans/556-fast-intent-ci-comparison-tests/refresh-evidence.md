# Stored review Refresh proof

Slice 5 Refresh implementation at `817cb6883c46ea008669945f2d824f0969524051`
plus the returned uncommitted test changes. The project's
[failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as written.
This record does not settle G1, G3, final family performance, or target CI.

## Owners declared before measurement

- `dashboard/backend-tests/review/story-review-stored-runs.spec.ts`: real stored
  capture preference/order, reporting-reference identity after native replacement,
  persisted landing preservation, and actual deletion of the replacement session.
- `dashboard/backend-tests/review/story-review-stored-retention.spec.ts`: actual
  retained-record reads after expiration, next capture then legacy selection,
  and the inclusive 30-day boundary followed by one millisecond beyond it.
- `dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts`: three
  retained integrations connecting the real store, Refresh transport, production
  selection and displayed immutable Git diff. These were integration owners in
  the first revised spec header and coordinator handoff, before the first run.
- The existing `story-review-one-shot.spec.ts` and
  `recently-done-one-shot-review.spec.ts` remain actual native launch/capture
  owners. Their installed launch, delivery, receiver and retirement helpers are
  unchanged. The earlier 3-case pass predates the incoming Done/history changes;
  a current 3-case run below replaces that preservation evidence.

## Arrangement and distinct assertions

`storedReviewChoices.ts` directly keeps canonical MakeMe launch/landing records.
Its private origin contains actual base → first → second → third commits;
each comparison adds exactly its independently expected `name.txt` line/file.
The existing native choice helper stays unchanged because its other consumers
edit live workspaces or test actual installed capture. No Refresh case launches
a native session to manufacture a record, and no endpoint returns a canned review.

`reviewRunRecords.ts` states shared one-shot facts through the existing launch
builder. The builder now accepts an explicitly discriminated one-shot branch
and a canonical `aLaunchLanding` result. Ordinary claimed branches and ad-hoc
policy outputs retain their existing paths; the focused representative consumers
below execute both. Store rules own a fresh machine home and restore its binding
after cleanup. Refresh servers and operation children use their existing private
machine home. Neither path reads the developer's real machine launch document.

The identity rule first prefers a capture over a newer legacy gap, then observes
the explicit `[third, legacy, first]` order, replaces the native session through
`replaceKeptSession`, and reads back the same reporting key and original landing.
The deletion rule calls real `deleteRecord`: deleting the old session is false,
deleting the replacement is true, and `[third, second]` remains with third chosen.
Its minimal private Git pair is necessary because this operation also removes
captured Git pins. The other store rules need only canonical comparison facts.

The retention rule marks third's Done time expired, observes second selected,
then expires second and observes only legacy with no captured comparison.
The UI retention journey separately deletes that remaining capture and checks
the literal legacy explanation, no file list and no Mark reviewed action.
The other UI journeys preserve first after adding third and replacing its
native session, and choose third after deleting the replacement. Their original
literal diff, order, value and count assertions remain.

## Current observations

Commands run from the recorded execution checkout with
`PATH=/opt/homebrew/bin:$PATH`, Node `24.21.0`, Bash `5.3.20`, ordinary two
workers, default retained-on-failure tracing and no retries or timeout changes.
Every browser run used `caffeinate -s -i` on an awake AC-powered machine.
Per-case runner duration includes fixture arrangement, actions, assertions and
cleanup. Shared runner/build/worker costs still belong in the final family profile.

| Observation | Strict result | Runner duration | Case durations |
| --- | --- | --- | --- |
| Current store rules + ordinary builder consumers + Refresh | 21/21 passed | 8,034.606 ms | rules 8 / 158 / 8 ms; Refresh 4,284 / 4,390 / 2,725 ms |
| Current native launch/capture preservation | 3/3 passed | 13,629.478 ms | completed 7,257; unfinished 6,866; retired/restarted 5,448 ms |
| Final canonical replacement input in Refresh | 3/3 passed | 10,423.353 ms | 6,015 / 6,247 / 2,977 ms |

Raw proof files are under `/tmp/seed286-execution-20261109/`:
`slice5-focused-current.json`, `slice5-native-current.json`, and
`slice5-refresh-final.json`. The nine-role inventory and full source-promise
mapping are in `slice5-role-inventory.json` and `slice5-return.md` there.

The first new-store run failed because one-shot request policy lacked the
schema's required tracking discriminator. A direct schema check established
that cause; the canonical builder now supplies it. The first Refresh run's
literal diff assertion caught `name` instead of the predecessor helper's
`name.txt` content; the directly arranged commit bytes were corrected. The
preserved expectations passed afterward. Neither failure was excused or hidden.

Focused preflight: AC 96%, load `2.38 / 2.91 / 3.19`; native preflight:
AC 96%, load `4.37 / 5.01 / 4.12`, 72% free memory, plus another project's
pytest process. Native ran `14:34:52.806–14:35:06.140Z`; the comparison profile's
runner began `14:35:08.148Z`, so their case windows did **not** overlap.
The final Refresh run at `14:39:02.926–14:39:12.925Z` overlapped the other
implementation's required 16-file, 31-case external-consumer gate. Its nearby
observation was AC 96%, load `4.44 / 4.07 / 3.90`. Do not describe these as
unloaded runs.

## Literal proof commands

The environment prefix for each Playwright command was
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/<file>.json caffeinate -s -i`.

Current `PATH=/opt/homebrew/bin:$PATH npx tsc --build dashboard/tsconfig.json --pretty false`
and `git diff --check` also exited zero. The exact optional reference input
omits an undefined field; the captured record values observed by Refresh are unchanged.

```sh
npm run test:dashboard -- dashboard/backend-tests/review/story-review-stored-runs.spec.ts dashboard/backend-tests/review/story-review-stored-retention.spec.ts dashboard/backend-tests/review/story-review-workspace.spec.ts dashboard/backend-tests/launches/launch-record-session-rules.spec.ts dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts
npm run test:dashboard -- dashboard/tests/review/story-review-one-shot.spec.ts dashboard/tests/review/recently-done-one-shot-review.spec.ts
npm run test:dashboard -- dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts
```

## Consumer trace and remaining acceptance

The installed trace ran against `d77917ebcc3ad52279bd7346f9f2fb9cefedc4b5`,
then with the nine Refresh paths and all explicit store/selection/builder terms.
All 178 scoped consumers have dispositions in
`slice5-consumer-trace-final-dispositions.md`; the raw full/scoped records and
literal invocation are retained beside it. The actual native helper consumers
remain unchanged; ordinary workspace/session-schema consumers passed in the 21.

The coordinator owns G1/G3 acceptance, the ordinary whole-family comparison
including all replacements and retained wiring, shared overhead measurements,
loaded/environment limits, target CI, formatting and independent refactoring.
No absolute arbitrary-machine timing guarantee is inferred from these profiles.
