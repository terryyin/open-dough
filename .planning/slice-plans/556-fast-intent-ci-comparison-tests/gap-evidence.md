# Cancelled and proofless comparison proof

[Active plan](PLAN.md) · [Shared proof strategy](proof-strategy.md)

Slice 2 adds nineteen in-process cases through the existing real comparison
read and raw acquisition harness, with no production/support behavior change.
All domain data uses MakeMe; independently named results and acquisition lists
observe selection/provenance rather than supplying the selected result.

The cancelled cases observe nearest usable later proof across cancelled,
unbuilt, missing/invalid proof revisions; failed later proof and fast-forward;
running/read-head stops and refreshability; nearest unusable-proof wording and
running evidence; inclusion at revision 30 and exclusion beyond; exact-only
timed-out/unexplained landings; and selection of completed attempt one beneath
cancelled attempt two. Gap cases observe cancelled Baseline provenance,
story-side usable-proof walks and bounds, Baseline proof bounds, equivalent-only
proof restriction, absent wall bounds versus invalid job chains, and opaque
adapter identity without fabricated numeric proof metadata.

Proof commands, all terminal exit 0:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice2-affected.json npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/intent/ci-time-without-runner-waits.spec.ts tests/intent/intent-ci-comparison-cancelled-landing.spec.ts
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice2-rules-final.json npm run test:dashboard -- backend-tests/intent/ci-comparison-cancelled.spec.ts backend-tests/intent/ci-comparison-proof-gaps.spec.ts
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs
npm run typecheck:dashboard
```

Affected selection: strict 55/55, runner 25,085.658 ms / wall 25.62 s. New
cases took 0–13 ms, actual history wiring 2,401 ms, and four retained cancelled
UI journeys 14,836/12,962/7,464/7,502 ms. Two later test-input type repairs
(builder initialization and explicit absent timestamp input) received final-byte
strict 19/19 proof: runner 955.79 ms / wall 1.32 s, cases 0–5 ms. No shared
case setup was moved into hooks. Baseline proof selection is bounded to thirty
revisions; status classification may inspect a farther ancestor solely as a
diff basis. The initial contrary test expectation was corrected while retaining
the no-proof-beyond-bound assertion.

A coordinated scratch change reduced the real forward walk from `limit` to
`limit - 1`. Both selected fixed-bound cases failed because the 30th usable
build was lost and only 29 revisions were read. Source bytes were restored
exactly (SHA256 `e58fd70389078bc22a2ea923d4e4e5d13846e722226754525f92ce0514ed9222`);
final passing proof followed restoration. Raw evidence is
`/tmp/seed286-execution-20261109/slice2-bound-fault*`.

The 81-row completed consumer trace is retained at
`/tmp/seed286-execution-20261109/slice2-consumer-trace-dispositions.md`.
Actual Git later-history and adapter discovery/normalization/error/deadline
owners passed; preselected normalized runs do not stand for those owners.

Retain `intent-ci-comparison-cancelled-landing.spec.ts`'s actual published merge
→ Git/provider → authenticated answer → rendered provenance owner (next build,
count one, Branch 3 min 20 s, listing counts and one artifact read). Distinct UI
figures/dashes, accessible cues, hidden IDs, Check again/selection recovery and
navigation remain protected by predecessors pending slices 3/4. G1 owns their
retirement and final aggregate measurement; no predecessor was removed here.

The affected profile ran awake on AC under `caffeinate -s -i`, load
14.71/11.98/9.22 and 56% free memory, alongside another owned two-worker suite.
Final observation: load 8.23/10.41/9.08, memory 55%. No aggregate speedup is
claimed while original UI variants remain. Independent refactoring/delivery
and final portable/loaded CI remain required.

Independent refactoring completed: all seventeen original case/loop statements
are byte-identical and present once; nineteen expanded titles/assertions now
live in cancelled, cancelled-awaiting, exact-landing, proof-gaps and timing-gaps
specs. No production/shared behavior changed. The replacement command below
passed strictly 19/19, cases 0–8 ms, runner 4,205.367 ms / wall 5.34 s at load
25.13/14.09/10.37, AC, alongside four-worker/two-worker owned selections:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice2-refactor-rules.json npm run test:dashboard -- backend-tests/intent/ci-comparison-cancelled.spec.ts backend-tests/intent/ci-comparison-cancelled-awaiting.spec.ts backend-tests/intent/ci-comparison-exact-landing.spec.ts backend-tests/intent/ci-comparison-proof-gaps.spec.ts backend-tests/intent/ci-comparison-timing-gaps.spec.ts
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh tests/support/dashboard-test-files.test.mjs
npm run typecheck:dashboard
```

Inventory proof assigns every spec exactly once across twelve CI shards.
`slice2-refactor/case-path-mapping.md` gives the complete case relocation;
completed base/path consumer traces cover 516 generic exclusions plus seven
actual path/discovery consumers. Earlier selection/acquisition/fault proof
remains applicable; the old two-file rule command is superseded by this one.

Delivery's formatter required explicit checked array indexes and removal of
unused generation parameters. The same nineteen cases passed after this
mechanical repair (`slice2-mechanical-repair.json`, strict 19/19, 926.646 ms
runner); case data and all distinguishing assertions remain unchanged.
