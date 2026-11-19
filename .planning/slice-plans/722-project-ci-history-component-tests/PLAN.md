# Prove Project CI history through the components that show it

**Identity:** SEED-413#renovate-dashboard-frontend-unit-tests
**Source:** [Prove Project CI history through the components that show it](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-frontend-unit-tests)

**Source review:** [Independent source review](source-review.md)

## Goal and scope

A developer can verify Project Intent's trunk CI history in plain Vitest and
headless Chromium by supplying the same typed history, judgment and proof that
the production components receive. Migrate the five cases in
`dashboard/frontend-tests/intent/intent-ci-wall-time-history{,-gaps,-order,-window}.spec.ts`.
Their independent wording, accessibility, layout, ordering and chart assertions
belong to the slices below. The old cases use a built app and route substitutes.

The Story Notes pilot
owns the shared browser MakeMe entry and the frontend page-object opt-out.
The seed records that dependency. The existing frontend runner can already
execute and report this family. Backend collection, wire admission, Done
and scope histories, revision updates, the suite-wide speed target and runner
retirement are outside this family. The frontend remainder owns the campaign.

## Approach and proof boundaries

- Reuse `IntentCiHistory` with `HistoryReading` for the date span, evidence
  and chart. Use `aCiHistoryAnswer` and `measuredHistoryOf` to give it an
  ordered `MeasuredHistory`. Expected labels, values and SVG geometry stay
  independent of production formatting and layout functions.
- Reuse `JudgedBranch` when the behavior includes its siblings. It supplies
  the production judgment, Proof, history and Check again in keyboard order.
  Give it a matching typed judgment and proof. Use its real markup and CSS
  with the 390 × 844 Chromium viewport for layout, and native key delivery
  for focus traversal. Ordinary disclosure and DOM reads can run in-page.
- Expose the existing browser-safe history, judgment and proof builders from
  the pilot's MakeMe entry as each case needs them. The source definitions
  are in `Distribution/tests/support/{ciHistoryAnswerTestData,comparisonViewTestData,ciProofTestData}.mjs`.
  Keep one implementation per builder and preserve the Node MakeMe API.
  The existing production prop types suffice. Add zero test-support wrappers.
- Keep the same family filter and literal case titles in typed
  `intent-ci-wall-time-history*.mounted.spec.ts` files. Group related cases
  by the owner they render. Use `createElement` in the selected TypeScript
  files, as the current group, Intent inventory and typecheck all cover
  `.mounted.spec.ts`. Every new case replaces the old assertions it covers
  in the same slice.

This follows both topics in the [Architectural North Star](../../NORTH-STAR.md).
The history read owns the facts and their order. The UI owns what the reader
can see and reach. Judge the improvement by retained evidence and measured
developer feedback cost. [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

Observed in the preparation worktree on 2026-11-19 with Node 24.21 and Vitest
5.1.0. Revision `a9e583777` added only the backend preparation to the
earlier `267a27502` checkout. All temporary edits were reverted.

| Operation | Observation and limits |
| --- | --- |
| Read mixed evidence directly in Chromium (slice 1) | At `267a27502`, a temporary Vitest case mounted `IntentCiHistory` from a MakeMe builder and the real conversion. Two points with a gap gave the independently expected row order, explicit measured duration distinct from wall time, and two disconnected SVG moves in 19 ms. At `a9e583777`, a second case passed the existing window's twenty builds and six gaps through the same boundary and observed 26 rows and stroke lengths 6, 2, 3, 3, 2, 4. Filtering gaps out of the production component made the 26-row assertion fail. Restoring it passed in 29 ms. |
| See the judgment and Proof and use native keyboard navigation in the parent (slices 2–3) | At `267a27502`, the parent with one measured run passed Shift+Tab from Check again, Enter on the disclosure and Tab to its run link in 202 ms. At `a9e583777`, the actual seven-gap answer, MakeMe judgment and completed proof rendered in `JudgedBranch`. The case observed run 41, the judged subject and wall-time label, traversed links 301–305 by keyboard, and measured page and descendant widths at 390 px. Removing the history child made the focus check fail. Restoring it passed. This exercises panel layout; true collection still has its own integrated tests. |
| Reach the cases through the maintained group (all slices) | At `a9e583777`, `node scripts/test-frontend.mjs intent/intent-ci-wall-time-history-probe --workers=2` ran the window and phone probes from a `.mounted.spec.ts` file, wrote their passed proof records, and took 2.68 s on the initial run. The same command with `--list --reporter=line` listed both literal titles under mounted Chromium. `npm run typecheck:dashboard` passed. The probe used the builders' browser-safe modules. With the pilot's planned opt-out applied temporarily, the selector reported MakeMe on and page objects off. The actual shared entry and opt-out are supplier outcomes. |
| Compare feedback fairly (slice 3) | `node scripts/test-frontend.mjs intent/intent-ci-wall-time-history --workers=2` selected the five original cases at `267a27502`. The warmed repeat took 4.21 s elapsed and 3.37 s summed across cases. CI summed 5.73 s for the same five. The complete two-worker local run took 7 min 15 s for 731 passing cases. Probe runs measure only a subset and cannot establish delivered family speed. |

At `2a5d2ce6a` the frontend runner gained a disposable machine home.
`node scripts/test-frontend.mjs intent/intent-ci-wall-time-history navigation/board-indicators.mounted.spec.ts --workers=2`
then reported all five built-app history cases and both mounted Chromium cases
passed in one group proof record. This change affects the runner environment.
The component, data and native key paths exercised above are identical.

## Execution context

Story Branch Mode in the established `codex/prove-project-ci-history-through-the-components`
worktree. Publisher `dashboard-territory.local-open-dough`, agent Ai-chan. Claim
`a354099b409102a1031e9f2f82f975bbd3068467` accepted on `origin/main` and
published as the execution branch base. Starting revision `f9e6023bc520c5a8485f619d0ede25c1b097b1c7`.
The readiness review basis predates the pilot closure. That closure removed the
obsolete plan link and settled the supplier dependency. The selected scope
agrees with the executable plan.

Codex CI observer for `terryyin/open-dough`, workflow `ci.yml`, execution branch
`codex/prove-project-ci-history-through-the-components`, coordinator
`ai-chan-f57056ac`, directory `/tmp/dough-ci-501/watch-3vYp1O`,
PID 81472, session 41509, cell `g217:11`.

## Ordered slices

### 1. Read the window in landing order and see every gap

Type: Behavior
Status: done

Behavior: Given builds in backend landing order with reversed build dates or
the twenty-build window with intervening gaps, the reader opens the evidence.
Rows retain dates, date attributes, reasons, provenance, revisions and attempts.
The date extent uses the minimum and maximum build dates. The latest value
uses the last measured entry and its supplied time. The real SVG follows build
dates and durations, breaks at each gap, and offers no window selector.

Proof: Migrate the `-order` and `-window` cases to the rendered history.
Check exact rows and dates, the no-choice controls, reversed x positions, the
rise and fall of the twenty points and the six stroke lengths in the old
window case. Include a build whose measured time differs from elapsed wall
time. Keep the backend-selected window as input. Run the family and typecheck.

Accepted proof: The two original titles passed on mounted Chromium in
`intent-ci-wall-time-history-evidence.mounted.spec.ts`. The order case checked
the reversed x positions, disconnected points, date attributes, three ordered
rows and run 213's three-minute measure over its five-minute attempt. The
window case checked 26 rows, all twenty points and six stroke lengths. The
five-case family, Story Notes consumers, backend lifecycle consumer, case
listing and dashboard typecheck passed. Local evidence is in the checkout's
Git evidence directory in `slice1-return.md`.
Published branch revision: `9ec3bb95400e7b4be6f11e35fdb275695490a383`.

### 2. Read a measured or empty history beside the trunk judgment and Proof

Type: Behavior
Status: done

Behavior: Given a passing trunk judgment and its proof, a reader sees those
labels with either a one-build or an empty history. One build names the time,
date, source of collection, revision, run and attempt, shows the chart and
reveals its evidence by keyboard. An empty history explains the absence and
keeps the judgment and proof visible.

Proof: Migrate both cases from the unsuffixed `.spec.ts`. In `JudgedBranch`,
assert the exact judgment and Proof labels in both states. Check the history
heading, date, latest label and value, chart, evidence and run href in the
measured state. At phone width, reach the disclosure from Check again with
Shift+Tab, open it with Enter and tab to the run link. Measure overflow in
the document and history descendants. In the empty state require an absent
chart and disclosure. Run the family through the frontend group.

Accepted proof: Both original titles passed on mounted Chromium in
`intent-ci-wall-time-history.mounted.spec.ts`. The measured case verified
the exact labels and evidence, Shift+Tab, Enter and Tab to run 41,
and that the document and history descendants fit at 390 × 844. The empty
case kept the matching judgment and three Proof labels and offered no chart
or disclosure. The focused frontend run (26 cases), backend proof consumers
(10), five-title listing and dashboard typecheck passed. Local evidence is
in the checkout's Git evidence directory in `slice2-return.md`.

### 3. Reach the evidence for each unmeasured landing on a phone

Type: Behavior
Status: planned

Behavior: Given the seven unmeasured landings in the existing case, opening Builds
and evidence lists each landing with the exact reason and the build that stood
for it when applicable. The heading and absence message explain that nothing
was measured. The five linked attempts are reachable in order without
horizontal scrolling.

Proof: Migrate `-gaps`. Assert all seven rows including pending and final
reasons, exact/equivalent/later provenance, and each evidenced run. Traverse
links 301–305 with native Tab in the parent and check both their names and
hrefs. Check the chart is absent and measure document and descendant widths.
Remove the last built-app history case. Search for remaining consumers before
removing any support. For example, `frontendIntentCi.ts` still calls
`serveFrontendCiHistory` and E2E still uses the history page object.

Run the complete family twice at two workers with the same warmed setup as
the baseline. Capture elapsed time, natural load and summed case duration
from `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`. Verify the original five
behaviors are accounted for, their replacement cases list and report under
Dashboard Frontend Test, summed case time improves, and the family uses zero
built-app routes or frontend page objects. Report any command-start cost
separately. This family adds no E2E cases.

## Local gates and delivery

Use `npm run test:dashboard:frontend -- intent/intent-ci-wall-time-history --workers=2`
for the family and `--list --reporter=line` for discovery.
Run `npm run typecheck:dashboard` for typed browser inputs, and the relevant
builder consumers if a shared definition changes. Apply the installed
[MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
[page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
to the actual spec paths. Keep the default timeout. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
On a fully awake Mac on AC power use `caffeinate -s -i` for long runs. On
battery plug in, or keep the lid open under `caffeinate -i` and inspect the
sleep log afterwards. [Local test resources](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

Keep each migration and its replacement proof together through the project's
post-change refactor, commit and CI gates. Slice-plan refinement was
unnecessary. Each slice has one reader outcome and retires the corresponding
built-app cases. Review found no remaining slice-specific concern.
