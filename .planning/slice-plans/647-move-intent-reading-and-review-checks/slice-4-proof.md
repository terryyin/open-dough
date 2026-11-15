# Slice 4 presentation and Review return proof

Source: six unchanged originals at `e234257ded1594371583fbaa405216448e14b80d`.
Implementation is uncommitted for coordinator review. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. No product behavior changes or speed claim.

## Assertion dispositions and named observing cases

Every original assertion and observing helper call is mapped individually in
[presentation](slice-4-presentation-proof.md) and
[reading/return](slice-4-reading-proof.md). Destination names are unchanged
under `dashboard/frontend-tests/intent/`; the cases retain original scenario
order and independent expected values. This includes all original screenshot
captures, CSS-rule/focus checks and conditional token/diff-line observations.

| Destination | Named maintained cases and actual setup/observation |
| --- | --- |
| `intent-story-ci-cues` | `tree file rows and location headers show shared CI cues with distinct selection and focus`: actual Done card selection, Changed tests, file Proof; exact count/duration words and reasons, selected/focused tint/border, 3px focus ring with 2px offset, selected change mark plus cue, no folder cues, four desktop/phone light/dark captures, then deselection removes all cues. |
| `intent-story-coverage` | `Intent shows an Insufficient evidence report with its reason and unavailable cost`; `Intent shows Unavailable and the reason when completion has no assessment report`; `Intent says an older completion read without an assessment saved none`; `Intent coverage waits for the done record, and a failed read offers Retry without saying no assessment was saved`. Published records contain the original report/reason or absent assessment. Last case holds the real browser Done-body request after card selection, observes exactly one held read, fails it, excludes both no-assessment and Unavailable, then Retry reveals exact report and removes unknown. |
| `intent-story-dark-appearance` | `a Done story's Intent evidence stays readable under the system dark appearance`: actual Done selection and CI/Changed tests/coverage/Summary transitions; contrast on headings, headers, filenames, missing evidence, added/removed lines and source; files hidden/shown at 1280 and 390; focused file and cue state; retained history text/chart/mark contrast; live dark→light→dark preserves selected story/source and restores token colour. |
| `intent-story-review-return` | `closing Review changes opened by keyboard from the header keeps the story's reading and returns the keyboard to the header's count`: Taken Story A and original eight changed-file facts plus long added deep spec. Explicit 120-line diff makes halfway scroll meaningful. Enter opens Review from outside count 2, its file browser is observed, Enter closes it; story/file/Changed tests/header focus and exact scroll return, then Proof remains chosen and comparison control visible after repeating keyboard Review. |
| `intent-story-summary-title` | `a long story title shows once in full above the story's views, whichever is chosen`: builder states original exact long Taken title; shared published seed/launch uses that same story. Full unique title wraps without overflow, header identity and independent arranged baseline are observed, title stays above all three views, active-story assessment explanation remains exact. |
| `intent-story-views-narrow` | `narrow, a selected story's views and Hide files stay reachable by keyboard without widening the page`; `without a story the shared header, project views and reader fit narrow and short reading with keyboard controls`. Actual Taken entry and actual unselected Project Intent; original 390×760 plus 390×560, 720×460 and both zoomed viewport variants, exact bounds/no overflow, Tab/Enter/Space/Home/End, chosen/focused view, toggle absence on coverage/candidates, and minimum reader height all retained. |

## Service arrangement and source ownership

The Done premise was observed before dependent conversion: existing Done
publication and `frontendPublishedReview` reach actual file Purpose and Proof
using a recent completion date and explicit `landingRevision`. The initial
builder default date was outside Recently done; the next diagnosed failure
returned current-revision locations for a landed-revision request. Both setup
defects were corrected, and the bounded premise passed (5.5s).

`prepareFrontendDoneIntent` retains that minimal arrangement: MakeMe publishes
Story A's recent Done record and coverage value, current published backlog
contains Story B, and explicit immutable landed files/locations answer only
that completion revision. The published Review snapshot names that completion.
This is controlled presentation input, not historical source judgment. It does
not use the mutable current-files map as a historical store.

The positive comparison adapter reuses `summaryScopeFacts` and `serveComparison`
with the original baseline/branch/landed file-breakdown values; comparison
identity and requested proof run/attempt/revision are checked. Only the
comparison service family is adapted. Existing status/history adapters and
held-read lifecycle are reused. Full-app state/focus/reading assertions are not
replaced by mounts. `serveComparison` only narrows its parameter type; mounted
runtime behavior is unchanged. Taken setup's new optional story preserves all
default facts and is exercised by the long-title case.

Real source/run selection and acquisition stay in inspected E2E:
`intent-story-changes` (actual worktree comparison and same Review diff),
`intent-story-completed` (real CLI completion, published comparison distinct
from newer trunk, exact saved assessment), and
`intent-summary-story-comparison-source` (clean/conflicting merges, actual
landed Purpose revision, exact one source request, later file absent and compact
Proof). CLI `product-backlog-complete-intent-coverage.test.mjs` observes actual
Insufficient/unavailable report persistence and older missing assessment.
Backend `story-review-historical-choice` observes real historical-vs-live
choice and explicit unusable-run refusal. Frontend request logs are not GitHub
acquisition evidence; these six originals added no separate upstream count or
SSE assertion requiring another replacement.

## Same-promise scratch discrimination

- Review baseline old passed. Omit `element.focus({ preventScroll: true })`
  in `keyboardReturn.ts`: old and maintained Review cases both failed at
  header `outsideCount(...).toBeFocused()` (inactive). Restore: old passed;
  maintained full journey passed, including both Purpose and Proof returns.
- Title baseline old passed. Add `white-space: nowrap` to
  `.intent-story-title`: old and maintained title cases both failed the exact
  overflow assertion (expected false, received true). Restore: old passed;
  final maintained command repeats the restored title.
- Both scratch production files are byte-identical to HEAD afterward.

## Host and commands

Observed awake macOS on AC, load 9.22/8.35/6.53, memory free 69%, no competing
test/build run. Guarded single-worker focused checks; later owned heavy checks
are sequenced. No timeout override, `test.slow`, lint, format, commit or push.
An early old/new restored command pair overlapped briefly; each was one worker,
both passed, and subsequent heavy proof is sequenced.

Raw logs outside checkout `/tmp/dough-647-slice4-*.log`:

| Literal command (under `caffeinate -s -i` for browser runs) | Result |
| --- | --- |
| `npm run test:dashboard:frontend -- intent/intent-story-coverage.spec.ts --workers=1 --reporter=line` | Bounded premise: failed missing recent date, failed current-vs-landed locations shape, diagnosed variants fixed; final passed 1 / 5.5s. |
| `npm run test:dashboard:integrated -- intent/intent-story-review-return.spec.ts --workers=1 --reporter=line` | Baseline passed 1 / 6.0s; focus fault failed exact focus; restored passed 1 / 6.5s. |
| `npm run test:dashboard:frontend -- intent/intent-story-review-return.spec.ts --workers=1 --reporter=line` | Same focus fault failed exact focus. |
| `npm run test:dashboard:integrated -- intent/intent-story-summary-title.spec.ts --workers=1 --reporter=line` | Baseline passed; nowrap fault failed exact overflow; restored passed 1 / 5.3s. |
| `npm run test:dashboard:frontend -- intent/intent-story-summary-title.spec.ts --workers=1 --reporter=line` | Same nowrap fault failed exact overflow. |
| `npm run test:dashboard:frontend -- intent/intent-story-review-return.spec.ts intent/intent-story-summary-title.spec.ts intent/intent-story-views-narrow.spec.ts --workers=1 --reporter=line` | Restored passed 4 / 8.0s. |
| `npm run test:dashboard:frontend -- intent/intent-story-ci-cues.spec.ts intent/intent-story-coverage.spec.ts intent/intent-story-dark-appearance.spec.ts intent/intent-story-review-return.spec.ts intent/intent-story-summary-title.spec.ts intent/intent-story-views-narrow.spec.ts --workers=1 --reporter=line` | Passed all 10 / 17.9s before title scratch; final restored repeat below. |
| `npm run typecheck:dashboard` | Initial unused-import/union/adaptation typing defects fixed; second exit 0. |

Additional final results and consumer dispositions are recorded below after
terminal observation. No converted source is deleted without its table above.

Final proof (all terminal exit 0):

- `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-story-ci-cues.spec.ts intent/intent-story-coverage.spec.ts intent/intent-story-dark-appearance.spec.ts intent/intent-story-review-return.spec.ts intent/intent-story-summary-title.spec.ts intent/intent-story-views-narrow.spec.ts intent/intent-story-changes-only.spec.ts intent/intent-story-changes-gaps.spec.ts --workers=1 --reporter=line`: **16 passed / 29.8s**, `/tmp/dough-647-slice4-final-focused.log`; includes all six destinations after both scratch restorations and final landed-fixture consistency edits.
- `caffeinate -s -i npm run test:e2e -- intent/intent-story-changes.spec.ts intent/intent-story-completed.spec.ts intent/intent-summary-story-comparison-source.spec.ts --workers=1 --reporter=line`: **4 passed / 27.2s**, `/tmp/dough-647-slice4-e2e.log`.
- `caffeinate -s -i npm run test:dashboard:backend -- review/story-review-historical-choice.spec.ts runtime/runner-ownership.spec.ts --grep 'historical review|Dashboard Integrated UI Test runs' --workers=1 --reporter=line`: **2 passed / 12.9s**, `/tmp/dough-647-slice4-backend.log`.
- `node --test Distribution/tests/support/product-backlog-complete-intent-coverage.test.mjs`: **4 passed / 707ms**, `/tmp/dough-647-slice4-coverage-cli.log`.
- `npm run typecheck:dashboard`: final exit **0**, `/tmp/dough-647-slice4-typecheck-final.log`.

All **135 assertion/helper call occurrences** map by occurrence, with unchanged
expected expressions and order. Coverage retains four separate cases. Removed
only six converted sources and six duration rows, with the live runner example
and companion links aligned. [Consumer dispositions](slice-4-consumers.md).

`npm run test:dashboard:integrated -- --list --reporter=line`: exit **0**,
**173 tests / 81 files**; all six retired source paths absent,
`/tmp/dough-647-slice4-integrated-list.log`. `git diff --check` passed.
Read-only project-formatted projections: CI cues239, coverage119, dark216,
Review117, title75, narrow146; Done fixture97, comparison adapter52, shared
comparison facts150, Taken fixture127. No formatter wrote files.

Implementation charged **13 active minutes conservatively**, bounded Done
premise under five. All launched commands ended; no outstanding proof or
production scratch diff. Independent refactoring/delivery remains coordinator
owned; planning authority and coordinator records were preserved.

## Independent refactor and coordinator acceptance

Fresh refactoring changed only imports and a live companion link in four
destinations. Cues/dark use the existing shared label owner directly; dark/title
use direct Distribution builder paths. Narrow's sidebar link resolves to its
retained source. All assertions, scenario facts, expected values, ordering,
helpers and product boundaries remain unchanged. Fifteen consumers are disposed
in `/tmp/dough-647-slice4-refactor-consumer-trace.md`; typecheck passed.

The first quiet refactor run exited 0 but retained no optional per-case record.
Its claimed selection/pass was not accepted from that log alone. Coordinator
renewed only the three affected journeys, on awake AC, load 2.75/3.69/5.17,
69% free memory and no competing owned proof:
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice4-refactor-observed.json caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-story-ci-cues.spec.ts intent/intent-story-dark-appearance.spec.ts intent/intent-story-summary-title.spec.ts --workers=1`.
Exit 0; schema 1, run `077c282d-f6bc-4614-8f57-25a2d137b5a9`, correct checkout
and Frontend config, selectedCount 3, phase completed, strictStatus passed,
all three named attempts passed, 9.24s. This resolves the reported evidence gap.
The unchanged Frontend16, E2E4, Backend2, CLI4 and Integrated listing retain
matching setup and observations; the covering focused suite needs no broader run.

Freshness before acceptance and delivery remained unchanged at pinned trunk
`0eee72caf91e812741909448456897c4c16b596d`. Its sole new first-parent
integration closes source-review guidance work and adds independent navigation
test assertions; named siblings648/651 and consumed Intent behavior are unchanged.

Selective formatting stopped before staging/commit on two mechanical lint
findings: an unused callback argument in the long diff fixture and computed
property deletion in the landed file map. The repair retains exactly the same
120 strings using the existing array-key idiom and uses `Reflect.deleteProperty`
on the same ordinary object. No helper, dependency, path or representation was
added; this is within the accepted refactor paths and consumer trace.
Renewed affected proof:
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice4-mechanical-proof.json caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-story-ci-cues.spec.ts intent/intent-story-dark-appearance.spec.ts intent/intent-story-coverage.spec.ts intent/intent-story-review-return.spec.ts --workers=1`.
Exit 0, completed strict pass, seven selected and passed attempts, 12.72s;
run `07d9b6c8-989c-41bc-883c-5c351b20ea55`. The three Done consumers and full
Review-return journey retain their observations after the mechanical repair.
Dashboard typecheck passed again on that repaired candidate.
