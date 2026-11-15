# Slice 3 assertion dispositions

Originals at `f3afab3d19cc02c594421a5a06753adb8a00884f`:
`dashboard/tests/intent/intent-story-changes-{gaps,only}.spec.ts`.
This map precedes deletion. Maintained Frontend cases retain the original
case names and all their assertions, using the actual built app and controlled
service answers. No GitHub call-count assertion existed in these six cases.
Frontend requests and route-fulfilled streams are not upstream/SSE proof.

## Setup and observing locations

`dashboard/tests/support/frontendIntentStory.ts` builds the published Story A/B
backlog and source with MakeMe/describedRevision, reusing the original
`intentTrunkRevision` bytes. It supplies selected location inventories explicitly,
kept machine launch evidence separately from absent evidence, and schema-checked
review snapshots/diffs through `frontendStoryReview`. This proves how the client
uses those answers, not how Git chooses them. `frontendIntentCi.ts` supplies only
explicit empty judgment/history and unavailable comparison answers required by
actual story/Project scope transitions; it performs no CI acquisition.

Shared observing owners remain `intentStoryPage.ts` (header, outside count,
file rows, diff and expansion), `intentModePage.ts` (views/scopes), and
`intentPerspectivePage.ts` (published source and groups). `expectOutsideCount`
asserts the number, accessible name, title, no superseded sentence, and vertical
placement on the story title line, including non-null geometry.

## Every original browser assertion

The destination prefix below is `dashboard/frontend-tests/intent/`.

| Original case and assertion group | Maintained case and observing location |
| --- | --- |
| gaps: **an active story with no workspace…** — selected card, Story A title, unavailable status and full no-workspace/published-tree explanation; no Retry and no comparison revisions | `intent-story-changes-gaps.spec.ts`, same named case; `openStoryIntent`, `storyTitle`, `storyHeaderDetail`, `storyHeaderReading`, scoped status/Retry assertions. Setup has no machine launch/workspace evidence. |
| same — no Selected story only, change marks, changed-folder marks, outside count, no-test/no-changes claim; expanding the published group/folders exposes kept file; opening a.spec.ts reads exact original `a 11` source | same case, `expectPublishedTreeUsable`; actual group/folder actions and file/Purpose assertion. |
| gaps: **a failed comparison read…** — worktree read 500 yields exact compact alert+Retry and full failure/published-tree explanation; no revisions; all published-tree usability/negative assertions above | same named destination case; endpoint failure route and `expectPublishedTreeUsable`. Separate kept launch evidence enables the review read. |
| same — after manual Retry the comparison finishes, revisions appear, alert disappears, toggle is off, outside count is exactly 2 (all helper assertions), modified and added files are visible | same destination case, failed route changes to fallback to schema-checked successful review; original Retry, header/count and file assertions retained. |
| gaps: **without configured Intent locations…** — selected story is first page-frame child, Story A title, unavailable comparison, exact identity, absent toggle and outside count; initial CI comparison view with visible CI status | same named destination case; explicit `locations:null` and no machine workspace; original frame/header/view/region assertions. |
| same — Changed tests gives no-locations explanation and no CI status region; Project Intent removes story header, gives no-locations explanation beside exact CI status of main heading; Optimization Candidates gives same explanation | same case, real `chooseStoryTab`, `openProjectIntent`, `chooseOptimizationCandidates`; all original assertions retained. |
| same — Back to selected story restores Changed tests, header and explanation; after Development deselection, Project Intent has no header/Back control, CI status tab selected and explanation+main heading retained | same case, real return/Development/card clear/Intent actions; original selected-card assertion, tab and content negatives retained. |
| only: **Selected story only shows just…** — initially off; hand arrangement replaced when enabled; first changed location open, tests collapsed, arriving/boundary/out folders open; five exact changed rows visible; kept/other rows and other folder absent; outside count 2; no no-tests message | `intent-story-changes-only.spec.ts`, same named case, first step and original `expectStoryExpansion`, row/count/negative assertions. Schema-checked files include all original rename paths and the two outside changes. |
| same — choose modified file, diff heading exact; selected row, heading, expansion and checked choice survive Intent coverage hide and Changed tests return; file hidden in coverage | same case, second step; actual view actions and retained `expectKept` assertions. Explicit file diff answer belongs to reviewed a.spec.ts. |
| same — manually collapse out, then disable: changed folders reopen, other collapsed, kept visible, other file hidden, all five changed rows visible | same case, third step with original folder/toggle actions and assertions. |
| same — while Intent hidden, select Story B: exact selected identity, CI comparison initial view; Changed tests unavailable, toggle absent and first location collapsed. Reselect A: card selected, exact identity, CI comparison initial view, comparison completed, toggle off, original expansion, other collapsed and kept visible | same case, final step; actual Development/card/Intent transitions, with launch evidence only for A. All original observations retained. |
| only: **a story that changed only product code…** — comparison detail/revisions visible, off initially, exact outside count 1, no none message or changed rows, first group collapsed | same named destination case; explicit one modified product file through MakeMe and review snapshot; original header/count/negative/group assertions. |
| same — enable gives exact no-test-files explanation, outside count 1, zero location sections; disable removes explanation, restores exactly 2 sections with first group still collapsed | same case, original actions and all count/text/expansion assertions. |
| only: **Selected story only stays on…** — enabled with original expansion; newer published revision is read in board status while story has no revision notice, toggle/expansion retained | same named destination case; real navigator-lock precondition, paused clock, mutable revision answer, recurring check observation and exact original status/notice/choice/expansion assertions. Published seed documents prevent unrelated recovery from suspending checks. |
| same — Project Intent has one notice; Show latest removes it; Back returns to Changed tests with checked toggle, original expansion and absent other file | same case, original actual scope/update actions and all assertions retained. Revision transport is controlled; real source ownership is separately retained below. |

## Real source judgment, independently inspected

- `e2e/intent/intent-story-changes.spec.ts`, **Intent highlights a selected Taken
  story's test changes over the published tree, each changed file with Review
  changes' own diff**: `selectTakenStoryInIntent` publishes trunk, a real Take
  and changed worktree; `publishIntentTrunk`/`changeIntentTests` use real Git.
  The case checks exact baseline/head header revisions, actual changed paths,
  outside count, expanded folders, `more` in the diff and equality with Review,
  then unchanged published `kept 11` and no diff, and clear-selection Project
  Intent without overlay or inherited file selection.
- `e2e/intent/intent-story-changes-moves.spec.ts`, **deletions and renames admitted
  by either path…**: the same real setup; original old/new rename paths,
  deletion, either-side admission, neither-side exclusion/count, on/off tree,
  unchanged exclusion and exact diff equality with real Review are observed.
- `e2e/review/story-review-nothing.spec.ts`, **a story whose kept launch record
  names no workspace offers no review**: real machine launch store record with
  no workspace, real server and Git project; absent Review control, actual HTTP
  404 and exact no-workspace explanation. `story-review-workspace.spec.ts`'s
  **a story with no launch record naming a workspace has nothing to review**
  is supplementary pure selection proof, not server/GitHub evidence.
- `dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts`,
  **answers not-configured when the settings omit intent locations**: real
  dashboard boundary reads `{}` settings from FakeGitHub and answers HTTP 200
  with exact revision and `locations:null`; this owns classification rather
  than the Frontend setup above.

Completion/history selection remains slice 5; these original six cases made
no completed-story source assertion. Existing live/published source models,
ADRs 0002/0008/0010 and the North Star remain unchanged.

## Proof results and consumers

Results, scratch restoration and exact consumer dispositions are recorded below
before source retirement. Failure handling follows the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Atomic source-review inputs: C029 “preserve selected-story changes” is observed
by all three `only` cases and the real Git highlight/rename journeys; C030
“preserve selected-story gaps” by all three `gaps` cases and the real absent-
workspace HTTP case. C076's Taken-story condition is real in the Git journey
and explicitly supplied in the Frontend Taken backlog. C077's location/nested-
folder browsing is observed by the actual location/folder actions in the
highlight/rename journeys and the retained expansion/toggle steps. C078 opens
`changed.modified` in both the maintained first `only` case and the real diff
journey. Later Review/reading-return/count aggregates retain their plan owners;
none substitutes for an immediate assertion mapped above.

### Commands and terminal results

Host inspected before launch: this macOS machine awake on AC, load
7.64/13.69/13.94, 537,000 free 16-KiB pages plus inactive memory; one unrelated
shell process used one CPU. One-worker focused browser proof was credible.
Browser commands were sequenced under `caffeinate -s -i`; failures, contention
or a changed workload required reconsideration. No timeout changed.

- `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-story-changes-gaps.spec.ts intent/intent-story-changes-only.spec.ts --workers=1 --reporter=line`:
  final restored exit 0, **6 passed (13.9s)**. Log
  `/tmp/647-slice3-frontend-restored.log`. Earlier attempts exposed an invalid
  empty-array no-settings answer and missing published seed bodies activating
  detail recovery (and therefore suspending recurring revision checks). Setup
  now supplies `null` for absence and readable A/B seeds; the clock matches the
  substitute's read timestamp. No product/assertion change fixed either issue.
- Scratch fault: temporarily replace `shownOverlay`'s filtered choice in
  `useIntentStoryTree.ts` with `overlay`. Both original and maintained first
  `only` case failed at the same kept-file `toHaveCount(0)` assertion, receiving
  1. Original command:
  `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-story-changes-only.spec.ts --grep 'Selected story only shows just' --workers=1 --reporter=line`.
  Maintained command replaces `test:dashboard:integrated` with
  `test:dashboard:frontend`. Logs `/tmp/647-slice3-{old,new}-fault.log`.
  Exact product restoration left no product diff; original restored exit 0,
  **1 passed (11.0s)** in `/tmp/647-slice3-old-restored.log`, followed by the
  six-case restored pass above.
- `caffeinate -s -i npm run test:e2e -- intent/intent-story-changes.spec.ts intent/intent-story-changes-moves.spec.ts review/story-review-nothing.spec.ts --grep 'Intent highlights|deletions and renames admitted|kept launch record names no workspace' --workers=1 --reporter=line`:
  exit 0, **3 passed (16.0s)**; `/tmp/647-slice3-e2e.log`.
- `caffeinate -s -i npm run test:dashboard:backend -- intent/authenticated-read-intent-locations.spec.ts --grep 'answers not-configured' --workers=1 --reporter=line`:
  exit 0, **1 passed (1.6s)**; `/tmp/647-slice3-backend.log`.
- `npm run typecheck:dashboard`: final exit 0;
  `/tmp/647-slice3-typecheck-final.log`.

### Consumer dispositions

Whole-checkout installed `consumer-trace.mjs --checkout "$PWD" --base HEAD`
was run with explicit terms `putFrontendIntentStory`,
`answerFrontendIntentChanges`, `selectFrontendIntentStory`,
`selectFrontendChangedTests`, `answerFrontendIntentCi`, `frontendIntentChanges`,
`selectTakenStoryInIntent`, and `intentTrunkRevision`. Full raw trace:
`/tmp/647-slice3-consumers-final.md`. Followed imported fixture/page-object
owners and the kept-publication chain to their observing journeys.

| Located actual consumer | Disposition |
| --- | --- |
| Both maintained Frontend specs; all new answer/selection exports | run: all six cases, including unchanged source, failure recovery, real scope/view/selection actions, exact outside counts and refresh. These two specs use the story support; the Java spec also uses the shared CI answer setup after independent refactoring. |
| E2E `intent-story-changes.spec.ts` | run: real Git comparison/source judgment; updated the two live companion links to maintained Frontend paths. |
| E2E `intent-story-changes-moves.spec.ts` | run: real rename/deletion acquisition and either-side admission. |
| E2E `review/story-review-nothing.spec.ts`, selected no-workspace case | run: real missing-workspace refusal. Other cases excluded: their inputs/boundaries did not change. |
| Backend `authenticated-read-intent-locations.spec.ts`, selected not-configured case | run: real no-locations classification. Other cases excluded: no selection/parser/server change. |
| `intentStoryPage.ts`, `intentStoryWorktree.ts`, view/source/card/clock/request owners and underlying MakeMe/describedRevision helpers | reused unchanged through the above executed journeys; no helper or export removed. |
| Remaining Integrated `intent-project-visit-selection`, `intent-project-visit`, `intent-read-reuse-story`, `intent-reading-place`, `intent-sidebar-toggle`, `intent-story-review-return`, `intent-story-summary-title`, `intent-story-views-narrow` | excluded: still use unchanged `selectTakenStoryInIntent`, original fixture data and page objects; conversion changes none of their inputs/owners or registrations. Their source specs remain. |
| E2E `intent-story-changes-marked` and `intent-story-changes-landed-run` | excluded: unchanged review mark/run paths and unchanged real helper. Main/moves runs above observe the reused changed-tree source path. |
| `keptPublishedStory.ts` → direct Recently done/CI prior-state/repeat E2E and Backend consumers; `projectScopeHistoryFixture.ts` → `intent-scope-glance`, `intent-scope-prior-build-states`, `intent-project-scope-timing-refresh`; `ciFollowUpSettledReading.ts` → `intent-ci-follow-up`, `intent-ci-follow-up-proof`, `intent-ci-follow-up-return`; retained-landing/repeat support chain | excluded: the original `intentTrunkRevision` export, contents, real-Git materialization and kept-publication APIs are unchanged. Frontend only adds a read-only consumer of their existing data. |
| Exact original two specs and `integrated.longest-first-project` rows | retired after the map and restored proof; no other timing row/runner changed. |
| Original identities in source review, plans, stored Done/coverage reports | retained as historical evidence; do not relabel historical sources. |
| All other raw matches in production, installed/payload guidance, unrelated tests and records | excluded: generated common terms/import strings or historical literals, with no import/caller of the new fixtures or removed specs and no changed production contract. |

Destination selection resolved `makeMe:true`, `pageObjects:true`; both shared
conventions and project construction/journey guidance were applied. Project-
formatted projection: gaps 211 lines, only 241, story support 151, CI support
56; the companion E2E file remains 250. No formatting, refactor pass, staged
lint, commit, push or plan-status change was performed by this agent.

`npm run test:dashboard:integrated -- --list --reporter=line` exited 0:
208 tests in 102 files; neither retired spec appears, and neither timing row
remains. Log `/tmp/647-slice3-integrated-list.log`. `git diff --check` passed.
Implementation/diagnosis/proof setup/cleanup used approximately 11 active
minutes (host start 15:23:20 UTC; final checks 15:34:36 UTC), within the 15-minute
limit. Every launched command reached a terminal result. No promise is deferred
to CI; coordinator-owned refactoring, covering Frontend group, formatting and
staged lint/delivery remain outside this implementation return.


## Named-sibling provider reconciliation

Supplier `SEED-334#retire-dashboard-integrated-ui-test`, published supplier
`b37a3616f314333005e61812fc8207f0538cc002`, landed as **Move Intent CI status and
timing checks** at authoritative trunk
`aabd7c58ae8af823024aaebe671b6612f19690f8`. Adopted its exact published blobs:

- `dashboard/tests/support/frontendCiStatusAnswers.ts`
- `dashboard/tests/support/frontendCiHistoryAnswers.ts`
- `Distribution/tests/support/ciHistoryAnswerTestData.mjs`
- `Distribution/tests/support/ciMakeMe.mjs`

Safe file copies from `git show <revision>:<path>` were verified byte-for-byte.
The canonical MakeMe registry keeps every prior baseline descriptor and replaces
our uncommitted `aLandedCiHistoryAnswer` addition with `aCiHistoryAnswer` and
`CiHistoryAnswerBuilder`. No sibling tests were retired here; no product or
service-state/branch-head change, merge, branch change or publication occurred.

`frontendIntentCi.ts` now calls `serveFrontendCiStatus(page, { main: judgment })`
with the same explicit unread judgment and
`serveFrontendCiHistory(page, makeMe.aCiHistoryAnswer.please())`. Status kept
behavior/counts/failure/holds belong to that canonical provider. Project history
keeps its published exclusion of both `scope` and `revision`. Our remaining
empty scoped history requires the exact authenticated-read pathname,
`intent=ci-history` and a present `scope`; the unavailable comparison likewise
requires that pathname and `intent=ci-comparison`. No acquisition/source
judgment is claimed. `summaryScopeHistory.ts` remains excluded: its mounted Done
Summary comparison lifecycle does not fit this whole-app empty scope answer.
Independent refactoring's `intentModePage.openStoryIntent(page, title)`, explicit
Story A/Changed tests choices, all expectations and coordinator records remain.

Renewed host basis (16:10:27 UTC): awake on AC, load 5.11/6.61/7.22,
956,024 inactive 16-KiB pages plus free/speculative memory; unrelated preview,
virtualization and shell work observed. Chose guarded one-worker focused proof,
reconsidering failures/contention/workload change. A later memory-pressure
observation reported 67% free; it is supplemental, not backdated launch evidence.

- `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-code-browse-java.spec.ts intent/intent-story-changes-gaps.spec.ts intent/intent-story-changes-only.spec.ts --workers=1 --reporter=line`:
  exit 0, **8 passed (17.8s)**; `/tmp/647-slice3-canonical-frontend.log`.
- Provider-path/export-only consumer extension:
  `/tmp/647-slice3-canonical-consumers.md`. `frontendIntentCi` → Java and both
  story specs: run above, including actual parser/rendering consumers of the
  concrete empty history. Other existing MakeMe descriptors and consumers are
  excluded: unchanged. Unused canonical provider convenience APIs are adopted
  verbatim, with their sibling ownership retained; no local behavior extended.
- Project-formatted projection: `frontendIntentCi.ts` 69 lines, canonical
  `ciMakeMe.mjs` 250. Canonical files are preserved byte-for-byte; no formatter
  or hook-owned lint ran. Existing test-source convention selections still
  apply; no new test source or dedicated builder test was introduced.

The previous real E2E/Backend and old/new scratch proof remain applicable:
production code, real-source setup and their observing paths did not change.

`npm run typecheck:dashboard` exited 0;
`/tmp/647-slice3-canonical-typecheck.log`. Final `git diff --check` passed;
all four adopted files still match their exact supplier blobs and HEAD remains
`f3afab3d19cc02c594421a5a06753adb8a00884f`. Canonical status/history/builder
projections are 224/41/93 lines; this proof record projects below 250 lines.
All launched commands terminated. The bounded reconciliation charged 2
additional active minutes conservatively (13 total against the supplied
11-minute prior accounting; 2 of the 15-minute implementation budget remain). No proof gap remains for
this adoption; independent reconciliation review and coordinator covering/
delivery gates remain. No formatting, staged lint, commit, push or done action.

Coordinator acceptance: source unchanged at pinned trunk `aabd7c58ae8af823024aaebe671b6612f19690f8`; the plan's633→651 coordination amendment was absorbed. Five adopted modules byte-match published trunk. Independent reconciliation also reused canonical syntaxGrammar for Java/Purpose, retaining exact RGB/target/scroll/read-count observations. Focused9 passed17.0s; typecheck/diffcheck passed.

Covering PASS: `caffeinate -s -i npm run test:dashboard:frontend -- --workers=2`, terminal exit0, `/tmp/647-slice3-canonical-group.log` and `.exit`. Awake AC, load6.03/5.61/6.09,69%memory free, no competing Playwright run observed. No consumer proof deferred. Prior covering pass before canonical adoption is retained separately in `/tmp/647-slice3-frontend-group.log`.
