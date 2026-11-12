## Decisive premises and preparation observations

All observations used this owned checkout at `47b348b3a` on 2026-11-12, Node24,
macOS, Chromium integration fixtures and the commands below. Dependencies were
installed here with `npm ci` after the first attempt exposed missing local
`node_modules`; that initial attempt never reached the journeys. No lockfile changed.

| Premise / consuming operation | Observation and result | Limit / consequence |
| --- | --- | --- |
| Procedural comparison and fluent held entry can share a control locator without inheriting each other's wait protocol. | Scratch extraction into `storyCardControls` was called by `openStoryReview` and `StoryCard`; P1 passed both selected cases in 21.915 s. The fluent case deliberately ended after held-entry replacement and late-answer assertions. | Compatibility only for those entry consumers; it did not cover Final report or every caller. All four edited files restored byte-for-byte before recording. |
| The complete Codex review/report handoff needs a cold-setup correction before its default-timeout proof is usable. | P0: width-kept and comparison passed (21.410 / 10.931 s); full replacement exhausted 30 s. Trace: origin12.18 s + dashboard9.43 s; report assertion had only100 ms before teardown. No report-result request preceded shutdown. | This is a failing harness defect, not an exempt base failure or evidence of a broken report. Slice1 owns its required repair. |
| Moving only immutable queued Codex preview inputs into worker setup can preserve the complete replacement/retention journeys. | P2 scratch reused the existing Claude preview/run-artifact pattern plus SEED-287's `f228466a5` Codex variant. Both complete cases passed twice:8.873 / 6.756 s and7.314 / 5.418 s; full runner37.210 s includes preparation. `npm run typecheck:dashboard` passed. | Default timeouts and all scenario assertions unchanged. Three scratch files restored byte-for-byte. This settles the bounded repair approach, not suite-wide or sustained load reliability. |
| Current tree/context/freshness routes reach the observations the migration must preserve. | P3 passed all three intact tree, diff-context and Refresh cases; runner 17.255 s, with each case retaining its original observations. | Execution still compares assertions and reruns all changed consumers; samples do not disposition the whole finding. |

P0: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-review-baseline.json caffeinate -s -i npm run test:dashboard -- tests/navigation/side-panel-content-replacement.spec.ts tests/review/story-review-comparison.spec.ts tests/navigation/side-panel-width-kept.spec.ts --grep "a review, another story's review|the switch shows the same snapshot|a width chosen on the terminal is recovered" --workers=1`.

P1: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-review-scratch.json caffeinate -s -i npm run test:dashboard -- tests/navigation/side-panel-content-replacement.spec.ts tests/review/story-review-comparison.spec.ts --grep "a review, another story's review|the switch shows the same snapshot" --workers=1`.
The limited fluent prefix used existing worker `queuedCodexOriginReady`.

P2: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-cold-setup-scratch.json caffeinate -s -i npm run test:dashboard -- tests/navigation/side-panel-content-replacement.spec.ts --workers=1 --repeat-each=2`.
Scratch changes added `queuedCodexPreviewReady` in the common `pageTest` pool,
shared Claude/Codex `preparePreviewInputs`, exposed `queuedCodexPreviewTest`
from `preparationPage`, and used it in the intact replacement spec.

P3: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-review-reading-baseline.json caffeinate -s -i npm run test:dashboard -- tests/review/story-review-tree.spec.ts tests/review/story-review-diff-context.spec.ts tests/review/story-review-refresh.spec.ts --workers=1`.
These observations reach actual fixture-backed browser operations, not listing
only. They do not claim deliberate-fault discrimination for every assertion.
Temporary proof records aid this session; the revision, setup, commands, results
and limits above carry the retained evidence without relying on temporary files.

Host decision:16 logical CPUs,48 GiB RAM,AC power,58% memory free; unrelated
Python/test/deployment processes were active. One-minute load ranged about30–50,
then32 at P2 collection. Chose one worker and AC `caffeinate -s -i`, sequenced
owned browser checks and left unrelated processes alone. No sleep/wake event
was found in the failed run's window. Reassess current load, memory and competing
work before broad execution proof; these samples establish no universal threshold.

## Plan construction rationale

At preparation, no new blocker on a sibling story, trunk-only step, fixed timing
limit or sizing band was invented. The slices share the model: controls own
mechanics, scenarios own protocol and expected facts; different fixture tiers
retain their proof boundaries. No preparatory framework or future-only
representation is needed. Slice-plan refinement was not needed after
construction: the necessary harness Structure immediately enables entry, and
the four Behavior boundaries retain separate observable outcomes and focused
proof loops. No remaining slice-specific concern was identified at preparation
beyond completing the explicitly owned repair and proof; readiness was assessed
against the final premise results and selected source. Execution discoveries
remain in the active plan's Story obligations.
