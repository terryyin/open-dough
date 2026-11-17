# Slice 6 acceptance

Source unchanged on trunk pin `7ce6ee91536ba1c445bd30cac9913910a9169e03`.
Root inspected lookup, comparison provider, menu separation, CSS repair and
actual setup/assertions in both new journeys and the ad hoc exclusion.
Commitments 4, 6, 7, 22, 24 observed; G1 proved. No remaining mismatch.

Taken workspace real journey publishes Take, commits line54, keeps its launch
and opens the real Git/server comparison. File and Add note-only line saves
show/read back exact snapshot endpoints, displayed comparison name and line
text. Frontend retention journey replaces a launch, reloads and reads its
saved note; then publishes Done with no active membership or machine record,
reloads and reads the same note/count from Recently done. Ad hoc diff has
neither Add note nor line menu. Unchanged server/store proof remains valid.

Browser prefix: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR
-u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config <config>
--reporter=list <selection>`. Sequential default two workers on AC.

| Config | Selection | Terminal result |
| --- | --- | --- |
| dashboard/frontend.playwright.config.ts | review/ stories/story-notes sessions/recently-done-ad-hoc-review.spec.ts | 25 passed, 23.3s |
| e2e/playwright.config.ts | review/ intent/intent-story-add-note.spec.ts intent/intent-story-follow-up.spec.ts | 102 passed, 1 phone geometry failure, 3m |
| e2e/playwright.config.ts | review/story-review-touch.spec.ts review/story-review-workspace-add-note.spec.ts | after repair 5 passed, 16.2s |
| e2e/playwright.config.ts | review/story-review-diff-context.spec.ts review/story-review-diff-line-follow-up.spec.ts review/story-review-panes.spec.ts review/recently-done-one-shot-review.spec.ts | after repair 7 passed, 16.8s |
| dashboard/frontend.playwright.config.ts | intent/intent-read-reuse-story.spec.ts | 1 passed, 3.3s |

Phone landscape exposed a 2px code pane after adding the workspace action.
Coarse-pointer code now has minimum `--control-size`; existing review-body
scroll owns overflow. Original assertion unchanged. Full touch plus other
affected geometry purposes renewed; unaffected 102 behavioral observations
reused. The initial broad command remains recorded as failed.

`npm run typecheck:dashboard` and `git diff --check` passed. Implementer
conservative wall upper bound under14m, including about4m command waits.
Complete [consumer dispositions](slice-6-consumers.md) and
[geometry dispositions](slice-6-touch-consumers.md) retain purpose mapping.

Additional root backlog/seed edits are records-only: at Terry's request,
existing SEED-345 proof-decision story incorporates the overrun and requested
direction, is first in Backlog and explicitly not-ready pending investigation.
Refactoring remains unbounded; simple instructions precede timing machinery.
No instruction implementation is part of this slice.

Fresh independent refactor shared historical comparison and rename-path facts
in `reviewedFileContext.ts` across Notes, Follow up and file reads. Retention
setup now uses the existing MakeMe repository builder; all product observations
remain. Renewed frontend review+retention15 passed (15.7s), final retention and
Intent reuse2 passed (6.3s), and full real review/ plus Intent note/Follow up
103 passed (3.1m), including original phone geometry assertions. Types and
whitespace passed. Root inspected helper/callers and retained test observations;
no gap. [Refactor consumer record](slice-6-refactor.md). About five active minutes.

First fresh preparation stopped before commit for no-param-reassign on the
new retention fixture assignment. Root used the existing substitute's
Object.assign convention for that same assignment, without a new path/helper
or changed proof boundary. Already traced within refactor_6's accepted return.
Renewed the single retention spec with the same frontend command prefix:
one passed (3.5s). Other accepted proof unchanged; guarded preparation retried.
