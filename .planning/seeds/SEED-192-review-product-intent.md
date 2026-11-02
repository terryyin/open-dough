---
id: SEED-192
status: active
planted: 2026-10-30
planted_during: Terry Yin's request to decompose the product intent review near-future direction
trigger_when: Developers review the lasting intent and proof introduced or affected by a story
scope: epic
---

# SEED-192: Review product intent as development changes the product

## Why This Matters

For developers reviewing and maintaining product intent, reading test source in
editors and piecing together separate run output should change to a coherent
Intent workspace for Purpose and observed Proof. Begin with actual automated
test source and named real projects, within the
[near-future direction](../PRODUCT-BACKLOG.md#near-future-direction) and the
[product intent review memorandum](../../docs/product-intent-review-memorandum.md).
Terry evaluates the first experience. The cost of today's manual workflow has
not been measured; usefulness must be judged against that baseline.

**Decomposition kept 2026-10-31:** Terry requested a visible Development/Intent
frame first, explicit per-project test-folder types, source browsing before
Proof, bounded rolling run history, folder summaries, further test families,
and CI corroboration of locally produced proof with resource-aware timing.
Terry kept this decomposition and directed the backlog to follow the order
below, with optimization-candidate review after source browsing. Existing story
identities are preserved. The stories remain preparation input; execution
approaches and implementation are not selected by this backlog decision.

## Human-Owned Framing and Constraints

Established by Terry's 2026-10-30 and 2026-10-31 discussions:

- The developer should be able to see and feel the overall frame before the
  Intent reader is built. Development and Intent are the initial perspectives;
  Intent can initially explain that its content is forthcoming. Structure waits.
- Each project explicitly configures its intent locations and what they contain.
  Start with Cucumber source in Doughnut and Pygardon. Automatic detection is
  deferred. Next consider TypeScript, Python, and script tests.
- Purpose initially means actual static test source. File and folder browsing
  needs no runtime reports, generated narrative, or authored intent catalogue.
- Projects produce Proof through their test commands outside CI. Keep a bounded,
  rolling history, show selected-file Proof, then folder-level observations.
  CI independently checks the relevant claims; it does not produce the retained
  dashboard Proof history. CPU and other resources can change run time.
  On 2026-11-01 Terry replaced rolling run history with a latest per-test
  snapshot that every ordinary run updates, under a published
  [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md); later stories still to be refined
  use that latest-observation model. Earlier direction notes below retain their
  original historical wording; active guidance and stories use the replacement.
- Preserve the selected project and the shared frame. Purpose/Proof side-by-side
  and tabbed layouts share one selection; the switch preserves selection and any
  story scope. Near-future direction belongs in Development.
- The existing optimization-candidate story was requested at priority 2 earlier
  on 2026-10-31. Its links require useful source browsing, not merely an empty
  frame. Terry selected its revised placement after the source-browsing stories,
  at priority 4, when keeping this decomposition on 2026-10-31.
- Story impact, protection, and complexity remain part of the parent direction.
  Source changes and passing runs alone do not establish intent protection.
  Domain models, types, and written specifications remain later extensions.

The first learning question is whether the real frame makes the two perspectives
understandable without disrupting Development. The next is whether explicit
locations make real test source easy to find. Before spreading report collection,
test the more consequential assumption that retained local proof can be associated
with tested source and meaningfully corroborated by independent CI.

## Alternatives and Recommendation

- **Defer:** keeps the existing editor/report workflow, but misses the explicitly
  requested Intent experience. Terry has selected advancement of this direction.
- **Use editors, Review changes, and existing reports:** the strongest smaller
  alternative. It remains the comparison and fallback, and can support early
  protection/complexity reviews. It does not supply the requested integrated
  browsing and latest-observation experience; its quantitative disadvantage is unknown.
- **One source-browser story for every language:** possible as delivery
  checkpoints, but plain text, folders, and explicit file selection are the same
  observable behavior. A Python-only reader adds no demonstrated independent
  outcome after a configurable text reader exists. Recommend a Cucumber pilot,
  then one general source-browsing increment evaluated with TypeScript, Python,
  Node, and shell examples. Split only if refinement reveals distinct behavior.
- **One universal reporting story or JUnit-only import:** unnecessarily combines
  different runner semantics. Reuse native reports and add one real producer
  family at a time. Avoid a plugin platform or a universal scoring model.
- **Recommended:** deliver the visible frame, source access, the first project's
  latest local observations, and early CI corroboration. Extend the shared
  reading experience by actual runner family, with folder summaries once one
  family's observations can already be read. Later families include their CI
  corroboration under the policy learned from the first case.

## Research Basis and Architectural Considerations

### Observed project inventory

Read-only inspection on 2026-10-31; these are checkout observations, not new test
runs or measurements. Open Dough was inspected at `7e198a7c3374`; Doughnut at
`1233bbd6db20`; Pygardon at `5df070ed54fc`. No client-project files were changed.

| Project | Initial source locations | Actual runners and relevant distinctions |
| --- | --- | --- |
| Open Dough | `dashboard/tests/`; shell checks under `tests/`; Node tests under `tests/`, `scripts/`, and skill-script locations selected by the existing test command | Dashboard TypeScript tests use Playwright Test, not Vitest. `scripts/test.sh` schedules shell checks and `node --test` files. |
| Doughnut | `e2e_test/features/`; frontend test locations under `frontend/`; Node script tests under `scripts/` and `infra/` | Cucumber features run through Cypress and `@badeball/cypress-cucumber-preprocessor`. Frontend Vitest uses real-browser projects, including touch, with different CI retry/parallel settings. |
| Pygardon | `e2e_test/features/`; separately `e2e_test/packaged/features/`; colocated tests under `frontend/src/`; `tests/` for pytest | Cucumber.js uses Playwright as browser automation. Its CI profile and tags differ from local defaults. Frontend uses Vitest with happy-dom. pytest defaults and CI exclude different slow/host-only selections. |

Doughnut also has CLI Vitest, CLI Python unittest, and Java/JUnit backend tests.
The requested Pygardon Python increment means pytest, not all Python tests in
all projects. Java/JUnit and additional CLI/packaged profiles are scope choices
for later selection; a generic source reader need not prohibit them. Source
browsing does not imply their execution evidence is already supported.

### Constraints from current Accepted ADRs

- [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md):
  keep Development, Product intent, Purpose, and Proof distinct. An initial
  scope limit does not justify a product gate against another readable format.
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  retain useful stopping points, reuse suitable existing solutions, and build
  supporting machinery when the selected outcome needs it. Delivery order alone
  does not justify blocking story dependencies.
- [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  repository records own durable project facts; published facts, local
  observations, and disposable UI state stay distinguishable. Project registration
  and machine paths remain host settings. No application/server database is selected.
- [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
  compare the useful review with the existing manual workflow, including human
  effort, collection overhead, retained data, and future maintenance cost.
- [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md):
  this Intent-specific direction belongs with product intent and planning.
  No new ADR acceptance, supersession, or exception is proposed. Relevant index
  and record statuses agree; no conflict was found in this recommendation.

### Recommended boundaries for refinement

These are proposed responsibilities and evidence semantics, not a technical
schema, executable design, or a newly accepted architecture decision.

1. **Project-owned configuration:** record intent roots, explicit source kind,
   and file selection in each repository's `.planning/open-dough.json`, extending
   its existing project settings. Identify the execution runner separately when
   Proof needs it: Gherkin does not mean Cucumber.js, and TypeScript does not mean
   Vitest. File selection matters for colocated tests and mixed helper folders.
   Read config and source at the same named published revision. Missing config,
   an empty configured location, and a failed read have different meanings.
   Dashboard project registration remains machine-local. A settings editor is
   not needed for the first browsing story; repository configuration suffices.
2. **Reuse the existing frame and source concepts:** the current React dashboard
   already has project selection, session preservation, settings navigation,
   review file trees, exact source text, and authenticated pinned Git reads.
   These inform reuse; they are not a ready-made Intent tree. The current
   published-directory helper lists files only, while story-review text is
   admitted within a particular comparison. Intent needs its own project/root
   reading scope without depending on a live session or story workspace.
3. **Producer ownership:** a project's normal authorized test workflow produces
   evidence; the dashboard reads it. Prefer compact repository-published run
   records for shared viewing without a developer clone. Local unpublished
   results may exist before publication but are not published Proof. Keep the
   current bounded working set small; deleting old records does not erase Git
   history or guarantee bounded lifetime repository storage. The exact record
   path, retention count, and size budget need first-Proof refinement.
4. **Source association from the first run:** a run identifies the product,
   tests, relevant dependency/configuration basis, selection, producer, time,
   terminal outcome, and observed attempts. A feature-file hash or passing exit
   alone cannot show that current implementation was tested. Dirty source stays
   identifiable or explicitly unmatched. Publishing an evidence-only commit
   must not invalidate its tested source merely because the enclosing commit
   changed; CI compares the tested basis, not blindly the report commit's HEAD.
5. **Latest per-test observations:** each ordinary run updates only the cases
   it observed. The latest observation wins whatever its outcome; cases not run
   keep their earlier observations. Retain each observation's time, attempts
   and source association. A focused run neither claims a full run nor turns
   a mixture of older passes into a current green suite. Consolidation preserves
   those latest observations; raw screenshots/videos stay outside compact Proof.
6. **Native reporting before new machinery:** Cucumber.js emits Cucumber
   Messages, and Doughnut's preprocessor can emit Messages too. This is a
   promising common input, not proven compatibility of their installed versions.
   Map source scenarios/outline rows and retry attempts using each run's actual
   source, not generated runtime IDs across unrelated runs. Keep collection,
   ordinary diagnostics, and strict pass/fail rules coherent. Open Dough already
   has an opt-in Playwright proof record, but it has no explicit tested revision
   and no automatic history/retention policy.
7. **Folder truth and timing:** summarize the latest observations of the
   folder's cases, retaining their differing times and source versions. Expose
   unobserved, excluded, skipped and incomplete work. These observations may
   come from different runs; a sum of their durations is neither one run's
   elapsed wall time nor current suite cost. Attribute shared setup/hooks only
   where observed. A source listing is not the runner's collected-case inventory.
8. **CI corroboration:** compare applicable tested source and selection before
   comparing case outcomes. A broader CI run can corroborate the matched local
   subset; excluded host-only cases remain unchecked. Missing expected cases,
   changed source, malformed records, retry-assisted passes, and interrupted CI
   need explicit classifications. CI reports its consistency verdict and any
   diagnostic evidence without changing retained local observations. It
   corroborates reproducibility; it does not authenticate who
   created a local observation or prove that a test correctly expresses intent.
9. **Resource-aware comparisons:** durations, timestamps, worker counts, and
   execution order need not match. Record relevant runner/browser/runtime and
   resource context where available; compare timing only within comparable
   contexts. Do not choose an arbitrary CPU multiplier or timing tolerance as a
   consistency gate. Actual failures/timeouts retain their observed outcome;
   resource differences qualify interpretation rather than turning them into
   passes. Performance-regression enforcement is a separate later decision.

Both Open Dough and Pygardon's GitHub workflow declarations ignore pushes that
change only `.planning/**` or `docs/**`. Pygardon uses its own source-check
recipe/controller for execution. If report publication uses an ignored path,
first-Proof/CI refinement must establish which source run is checked and how a
report-only update requests corroboration; ordinary push behavior cannot be
assumed sufficient. Respect existing CI adapters and test selection policies.

### External reporting research

The following official documentation supports feasibility, not a selected
implementation. Installed-version compatibility still needs a real run during
refinement or execution.

- Cucumber.js recommends its [Messages formatter](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)
  for structured output; legacy JSON is in maintenance mode. The
  [Messages model](https://github.com/cucumber/messages/blob/main/README.md)
  retains source/run information and has versioned schemas.
- The Cypress preprocessor documents [Messages reports](https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/messages-report.md),
  including optional embedded media, which reinforces the need for compact retention.
- [Vitest reporters](https://vitest.dev/guide/reporters) provide JSON results and
  allow multiple reporters. Keep existing quiet/strict reporters rather than
  accidentally replacing their behavior when collection is added.
- [Playwright reporters](https://playwright.dev/docs/test-reporters) support JSON
  and multiple reporters; Open Dough's [existing proof contract](../../dashboard/tests/proof-record.md)
  is a more directly relevant reuse candidate than replacing its strict reporter.
- [pytest JUnit output](https://docs.pytest.org/en/stable/how-to/output.html#creating-junitxml-format-files)
  includes setup/teardown in durations by default; it does not settle our full
  source association, selection, and latest-observation requirements by itself.
- [Node test reporters](https://nodejs.org/api/test.html#test-reporters) expose
  structured events; console output is not a stable programmatic contract.

## Shared Evidence and Sizing Boundaries

Follow the [initial Intent UX/UI direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
Every candidate is evaluated by Terry or a developer reviewing the named project.
Every stopping point preserves useful behavior without later stories. Source
reads name their revision; Proof names its actual run and supported scope.
Missing observations remain unknown. No synthetic sample establishes a real pass.

Open Dough has no established S/M/L calibration, as already recorded here and in
[SEED-052](SEED-052-start-agent-work-from-dashboard.md#open-decisions-before-refinement-or-planning).
No bands or time commitments are invented. Comparative hypotheses below are
unbanded; confidence includes integration, verification, and cleanup. The new
track has three source/frame outcomes and nine Proof/CI outcomes; four existing
review candidates remain. Most uncertainty lies in the first Proof and CI cases.
At decomposition, none had an execution approach or readiness assessment.
Individual refinements and their recorded facts below carry current preparation.

## Story Decomposition

<a id="review-story-intent-impact"></a>

### 5. Review a story's impact on test intent

**Identity:** SEED-192#review-story-intent-impact
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/441-review-story-intent-impact/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9840a41e74f59afdf926142ada9c2ecc959dcfab6612a368f5a0a4fcccb7c16d","plan":"4e2f55876911b0fe7445f52efbd2c44dd263ca82c1f39e35d051bc69405227fc"}}
```

**Execution note (2026-11-02):** Stopped mid slice 1 by human decision after
local suite hang/stagnation. Uncommitted board-selection work and harness
mitigations remain for landing with this stop. Plan Learnings record the suite
root cause and point at SEED-218#fix-owned-calls-start-slack-hang. Resume this
story after that fix, or when full `npm test` and dashboard gates are known
green again.

**Beneficiary:** A developer reviewing what one story changed in a configured
project's maintained tests, such as Terry reviewing an Open Dough story in
progress or one just completed.

**Goal:** The developer selects a story on the Development board and, in
Intent, sees that story's test-file changes in place in the project's test
source. They can filter to only the changed files or keep the whole tree with
those changes highlighted. A changed file shows its change exactly as Review
changes shows it. This connects Intent to the near-future question about a
story, instead of making a whole-product read the entry cost. Terry evaluates
it against today's workflow of Review changes plus reading tests in an editor
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

**Facts observed during refinement (2026-11-02, read-only, at `469cdf78`):**

- The board already has a selected story. `Columns.tsx` holds one
  `selectedIdentity` in component state. "Inspect story" toggles it, and the
  same button deselects. A selected card shows `StoryDetail` and
  `.story-card-selected`. Nothing else can read this state, Intent included.
  Clicking a card's empty area does nothing.
- Opening a session from the Sessions sidebar does not select its story. It
  marks the card `.in-side-panel`, which has the same `--accent-soft` fill as a
  selected card (`story-cards.css`). That is probably why opening a session
  looks like selecting a story.
- Recently done cards (`DoneStoryCard.tsx`) have no selection at all. They
  always offer Review changes for a completed story.
- Review changes compares the story's baseline with its "to" tree. For a
  workspace, the baseline is the merge base with the remote target, and the
  "to" tree includes uncommitted changes. A landed run uses its captured
  comparison. A completed story without usable local evidence uses its
  published history comparison (`storyReviewContract.ts`). The file list
  (`/__agent-launch/review`) gives each file's kind: added, modified, deleted,
  or renamed with its old path.
- Intent already reuses Review's generic `FileTree`, `reviewFileTree`, and
  `story-review-files.css`. Its location groups are exclusive and start
  collapsed. Folders inside a location start expanded, because the collapsed
  set starts empty. `FileDiff` and `DiffLines` render a diff from props
  without StoryReview context, but `FileDiff` is bound to the review endpoints
  for its source and identity.
- Review's tree styles added files with `--ready`, deleted files with
  line-through, and renamed files in italics. It has no modified style and no
  marker for folders that contain changes, because it only lists changed files.
- Intent reads its configuration and test source at the project's published
  revision. Files that an unlanded story adds do not exist there.

**Selected direction:** Use one story selection per project, owned above the
Development board and Intent. The board and Intent both read and set it.
Intent reads the selected story's default Review changes comparison, the same
read and meaning Review changes uses. It joins those changed paths to the
configured locations' files by repository path. The tree, change styles, and
diff are Review's own components, extended once for both views.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Keep Review changes plus an editor | The baseline and fallback. Review lists every changed file without the surrounding test tree, and the editor lacks the change. |
| Open Review changes filtered to Intent locations | Reuses the most, but loses the unchanged surrounding tests and Intent's Purpose/Proof reading. Fails the "all files, highlighted" mode Terry asked for. |
| Read Intent at the story's head revision instead of the published revision | It would show added files natively. But it has no published revision for uncommitted workspace changes, and it would make Proof and the candidates record describe a different state. Rejected for this story. |
| **Story lens over published Intent** (selected) | Intent stays the published product view ([north star](../../docs/dashboard-ux-ui-north-star.md#story-scoped-intent): "a lens on that view"). The story's comparison overlays it: changed files are marked, added ones are inserted, and selecting a changed file shows Review's diff. |
| **Borrowed: map overlay layers** (adapted) | A map keeps the base map and toggles a route layer, either dimming the rest or showing only the route. Here the published tree is the base map, and the comparison is the layer: "Selected story only" shows only the layer, while "all" highlights it on the base. Where the analogy breaks: a map layer aligns by coordinates. A file the story added has no place in the base tree, so it must be inserted, and a deletion stays visible as removed rather than disappearing. |

**Challenge:** The purpose is focusing the review on the story's test intent.
A filter can satisfy its wording and still mislead in three ways:

- A story that changed no test files shows an empty tree, which reads as "no
  impact".
- A missing comparison looks the same as no change.
- Changed tests outside configured locations vanish silently.

The scope below therefore gives each of these its own explanation. The
strongest remaining doubt is the seed's own boundary: changed tests are only
an initial impact view, because unchanged tests may protect the affected
behavior. "All files, highlighted" keeps those unchanged tests one click away.
Judging protection belongs to story 10.

**Scope:**

- **Select a story on the board.** Clicking the empty area of an active story
  card selects that story, exactly as "Inspect story" does today, so it shows
  its detail. Clicking the selected card's empty area again, or its "Hide
  detail" button, deselects it. Clicks on the card's buttons, links, inputs,
  session entries, and disclosures keep their own behavior and do not change
  the selection. A Recently done card is selectable and deselectable the same
  way, showing the selected state. A done card has no detail to show. One
  story is selected per project at a time, active or done.
- **Selected state.** A selected card has a visible selected state. It can be
  told apart from "shown in Side panel", which currently uses the same fill.
  Opening a session from the sidebar does not change the selection.
- **Selection reaches Intent.** The selection survives switching between
  Development and Intent, and Intent names the selected story. Selection stays
  disposable page state, not part of the URL
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
- **Toggle.** With a story selected, Intent offers a "Selected story only"
  toggle. It is off by default, so Intent first shows the whole tree with the
  story's changes highlighted. Without a selected story, Intent shows no toggle
  or highlight and behaves as today, apart from the new folder default below.
- **Comparison.** Intent uses the selected story's default Review changes
  comparison: all changes, including uncommitted workspace changes, at the
  revisions Review would use. It reads the comparison through the same read
  Review changes uses, not a second derivation. Intent states which revisions
  it compared. A story with no comparison Review changes could offer, such as
  an active story with no recoverable workspace, gets an explanation. A failed
  read gets an explanation and a retry. Neither is ever shown as "no changes".
- **What is in scope.** Changed files whose path, or old path for a rename,
  falls in a configured Intent location's file selection (kind and include
  patterns). Files the story added are shown where they belong in the tree.
  Changed files outside configured locations are not listed. Intent says how
  many there are and that Review changes shows them.
- **Selected story only.** The tree contains only the in-scope changed files
  and their folders. A story with no in-scope changes says so: "No test files
  in Intent locations changed in this story". It also gives the count outside
  the locations, when there are any.
- **All files, highlighted.** The full published tree, with changed files
  styled by their kind (added, modified, deleted, renamed). Every folder and
  location group that contains a change has a distinct
  contains-changes background. A deleted file stays visible and styled as
  removed.
- **Shared styling.** One set of change-kind styles serves Review changes and
  Intent, including a new modified style. Review changes shows the same
  styles. Its tree holds only changed files, so it needs no contains-changes
  background, but nothing forbids one there.
- **Reading a changed file.** Selecting a changed file shows its diff in the
  Purpose area, using the same diff component, styles, and context expansion
  as Review changes. Unchanged files show their published source as today.
  Proof keeps describing the published revision and says so. Proof for the
  story's version of a file is not claimed.
- **Folder defaults.** Folders start collapsed whenever a tree is first shown,
  in Intent with or without a selected story. When Intent opens with a selected
  story, or when the developer switches the toggle either way, folders that
  contain changes open. So does the first location group, in configured order,
  that contains changes, because the groups stay exclusive. Other folders stay
  collapsed. Selecting a different story while Intent is hidden does not
  rearrange an open tree. The rule applies the next time Intent opens, or at
  the next toggle.
- **One implementation.** The comparison read, the change kinds and their
  styles, the file tree, and the diff each have one implementation that both
  views use. No copies are made for Intent.
- **Proof.** Dashboard Playwright proof covers the key examples with a
  workspace fixture and a completed-story fixture. Story completion also needs
  Terry's evaluation on a real Open Dough story. Apply the repository's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Scope limits (deferred promises, not rejections):**

- Choosing another comparison in Intent: since review mark, commit range, or
  committed only.
- Intent configuration as changed by the story itself. Locations stay those of
  the published revision.
- Proof for the story's changed version, and judging whether the changes
  protect the story's intent (story 10) or how complex they are (story 11).
- Marking review progress from Intent.
- Story selection through the URL, and selecting a story from the sidebar or
  from story references beyond today's behavior.

**Required restrictions:**

- Never present a missing or failed comparison, or a story without in-scope
  changes, as an empty change set. The seed boundary treats an empty change
  shown as evidence of no impact as false evidence.
- Changed files show the same comparison Review changes shows for that story,
  so the two views never disagree about what a story changed.

**Key examples:**

1. A Taken story with a workspace changed `dashboard/tests/a.spec.ts` and added
   `dashboard/tests/boundary/b.spec.ts`. The developer clicks the card's empty
   area, and it shows as selected with its detail. They switch to Intent: the
   `dashboard/tests` group is open with `boundary/` expanded, and other folders
   are collapsed. `a.spec.ts` is styled modified, `b.spec.ts` is styled added,
   and both folders have the contains-changes background. Selecting
   `a.spec.ts` shows the same diff Review changes shows.
2. In that view the developer turns on "Selected story only". Only the two
   files and their folders remain, expanded. Turning it off shows all files
   again, with changed folders opened and others collapsed.
3. The story also changed `dashboard/src/App.tsx`. Intent does not list it and
   says one changed file outside Intent locations is shown in Review changes.
4. A story changed only product code → "Selected story only" says no test files
   in Intent locations changed, with the count outside.
5. A completed story in Recently done → clicking its card selects it. Intent
   shows its changes from the published history comparison, naming the
   compared revisions.
6. An active story with no recoverable workspace → Intent explains that no
   comparison is available, and the tree stays usable as the whole project.
7. The developer clicks the selected card's empty area again. The selection
   clears, and Intent shows no toggle or highlights. Clicking "Start" or a
   session entry on a card does not select it.
8. No story selected → Intent opens with every folder collapsed.

**UX/UI:** The developer chooses the story in Development, where stories live.
Intent then shows which story it is scoped to, the compared revisions, and the
toggle, so the lens is never invisible. Interaction choices that change the
promise:

- The card's empty-area click joins the existing inspection selection rather
  than adding a second "review selection". So selecting also shows detail, and
  one selection means one meaning.
- The toggle defaults to the whole tree, keeping Intent the maintained product
  view with the story as a lens.
- Folder expansion follows the toggle and Intent opening, not live selection
  changes, so the developer's tree doesn't jump.

Highlight colors, the toggle's control and placement, and wording are design
details. They follow Review changes' existing tokens and Intent's existing
controls. Card-area selection needs a keyboard equivalent, which is the
existing Inspect button.

**Architecture:**

- **Story selection moves up.** The selected story moves from `Columns` local
  state to one page-level owner per project, shared by the active columns,
  Recently done, and Intent. Today's reveal-and-select from story navigation
  keeps working through it. It is disposable UI state (ADR 0008).
- **Comparison reuse.** Intent consumes the existing story-review read and
  contract. It reuses the default comparison `StoryReviewSnapshotView` uses,
  extracted where needed so both views call one function or hook, and it adds
  no new server derivation. `FileDiff`/`DiffLines` stay the single diff
  renderer.
- **Overlay is a pure join.** Inputs: the configured locations' files at the
  published revision, plus the comparison's changed files. Output: per-file
  change kind, inserted added files, per-folder "contains changes", and the
  count outside the locations. The shared `reviewFileTree`/`FileTree` gains
  change marking once for both callers.
- Applicable Accepted decisions: ADR 0008 (published facts vs local workspace
  observations vs UI state; Intent names its published revision while the
  overlay names the compared revisions), [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)
  (a story is Development, so the story scope is a lens on Intent and doesn't
  redefine Purpose), and [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (reuse the existing solution). None conflicts.

<a id="check-cucumber-proof-in-ci"></a>

### 7. Check locally collected Cucumber proof against CI

**Identity:** SEED-192#check-cucumber-proof-in-ci
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Pygardon developer can tell whether independent CI corroborates
  the applicable retained local Cucumber proof or why comparison is incomplete.
- **Evaluation:** CI reads the local record published with a source basis, runs
  its own selection, and reports matching observations, a specific discrepancy,
  or an explicit unchecked scope. A slower compatible CI run with matching
  outcomes remains consistent without requiring equal durations. Compare each
  observation's tested source and selection, not merely the commit containing
  the proof file or an unchanged Gherkin blob. Unestablished implementation,
  steps or configuration provenance remains explicitly unchecked.
- **Value / learning:** Tests the trust boundary before proliferating producers:
  selection, evidence-only commits, CI exclusions, and nonidentical resources.
- **Boundary:** One project, one runner family. CI's comparison output does not
  create, refresh, or overwrite retained local observations. Define comparison of
  case identities/outcomes, retries, incomplete runs, and report-only trigger
  behavior. Performance gates and proof authenticity are separate concerns.
- **Effort hypothesis:** Unbanded; higher, low confidence. Actual Pygardon source
  recipe/controller and differing local/CI tags must be respected.
- **Product prerequisites:** Retained locally produced Cucumber evidence and an
  independently runnable CI selection; only matched source/scope is corroborated.
- **Safe stopping point:** An actionable CI consistency verdict for Cucumber.js;
  source and latest local observations remain readable when CI is unavailable.


<a id="read-cypress-cucumber-proof"></a>

### 8. Read the latest Doughnut Cypress-Cucumber proof

**Identity:** SEED-192#read-cypress-cucumber-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/442-read-cypress-cucumber-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ff65b5aac5cbe9f974dd33c51ff659cc162dab55f04f73627d7dbf569cb29822","plan":"6a6f145e538da613520b903ee3cfec74c4529161e226e369500a4cc7cd639882"}}
```

**Beneficiary:** A Doughnut developer reviewing Cypress-Cucumber protection for a
selected feature in Intent, such as Terry reviewing Doughnut beside its Gherkin.

**Goal:** Through Doughnut's ordinary Cypress Cucumber runs, the project records
the same compact latest-observation Proof that Intent already reads for
Pygardon. Selecting a Doughnut feature in Intent shows each scenario and outline
row's latest committed observation beside Purpose. This tests whether the first
Cucumber evidence meanings survive a second real runner
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

**Facts observed during refinement (2026-11-02, read-only):**

- Open Dough Intent already parses and shows the
  [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md)
  format (`dashboard/src/cucumberProof.ts`, `dashboard/server/intentProofRead.ts`,
  `dashboard/src/IntentProof.tsx`). Latest observation wins by `finishedAt`;
  identity is `feature` + `scenario` + optional `example` cells — never
  runner-generated IDs. Proof is read once with Intent locations.
- Pygardon already records that format with a Cucumber.js plugin
  (`e2e_test/plugins/cucumberProof.mts` at Pygardon `d62f58fb9`) and declares
  `proof: "e2e_test/proof"` on its Gherkin location. Open Dough ships the
  reference only; each project owns its recorder.
- Doughnut at `1581250a75` runs features through Cypress 16.2.1 and
  `@badeball/cypress-cucumber-preprocessor` 28.0.1 (`e2e_test/config/common.ts`,
  `addCucumberPreprocessorPlugin`). Its `.planning/open-dough.json` already lists
  `e2e_test/features` as Gherkin and declares **no** `proof` directory. The
  preprocessor depends on `@cucumber/messages` ^34 and can write
  `cucumber-messages.ndjson` when `messages.enabled` is true (default false).
  Messages accumulate in the preprocessor's Node process and are flushed in
  `after:run`. Doughnut's `composeCypressPluginEvents` already composes multiple
  `after:run` handlers. Cypress retries set Messages `willBeRetried`; the
  preprocessor discards intermediate attempt messages on reload. Spec-level hook
  failures prevent that spec's Messages contribution. `filterSpecs` /
  `omitFiltered` are already on. Scenario Outlines exist in the suite.
- CI corroboration of local Cucumber proof does **not** exist in product code.
  Story 7 (`#check-cucumber-proof-in-ci`) remains not-refined and owns that
  first comparison policy. No formal blocking dependency is recorded.

**Selected direction:** Add a Doughnut-owned proof recorder on the Cypress
preprocessor Messages path that writes the existing compact proof files. Declare
the proof directory on Doughnut's Gherkin Intent location. Intent reads Doughnut
the same way it reads Pygardon. Keep Cucumber.js plugin wiring out of Cypress.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Leave Doughnut on editor + Cypress output | Baseline and fallback. It does not put latest observations in Intent beside Purpose. |
| Run Doughnut features through Cucumber.js to reuse Pygardon's plugin | Rejected by this story's boundary: Cypress owns isolation, tags, diagnostics and exit. |
| Enable Messages ndjson only and teach Intent to read ndjson | Invents a second proof format and risks committing bulky attachments. Rejected. |
| Post-process a Messages file after `cy:run` with a separate script | Credible, but a second command can be skipped and drifts from ordinary runs. Prefer recording inside the composed Cypress Node lifecycle so every ordinary profile that runs features records. |
| **Cypress Messages → compact proof in Doughnut** (selected) | Reuses the published format and Intent reader. Records from the preprocessor's Messages accumulation (enabled report and/or in-process envelopes) without changing Cypress exit or diagnostics. |
| **Borrowed: Pygardon's proof plugin mapping** (adapted) | Same roles: Messages envelopes → source-keyed observation → one uniquely named compact file per run, latest wins across files. Where the analogy breaks: Cucumber.js loads a `plugin` in its coordinator; Cypress accumulates Messages across specs in the preprocessor and finishes in `after:run`, with Cypress retries and hook-failure gaps the Pygardon plugin never sees. |

**Challenge:** The purpose is Intent review of **local** Cypress-Cucumber
evidence. Evaluation text that also asks for CI corroboration can meet its
wording by waiting on, or reinventing, story 7's unsettled comparison policy
while still leaving the Purpose unmet if Doughnut never records. The strongest
consequential doubt for the selected path is the opposite miss: a recorder that
writes files while mis-mapping outline rows, retries, or filtered specs so
Intent shows wrong associations. Scope therefore pins source identity and
Cypress semantics, and defers CI to story 7 rather than stretching this story
across an unbuilt policy.

**Scope:**

- **Recorder ownership.** Doughnut implements and maintains the recorder in its
  repository. Open Dough's Intent reader and compact proof format stay as they
  are unless a Cypress observation forces a format-compatible fix; no generic
  multi-runner adapter framework is added
  ([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).
- **Messages path.** Record from Doughnut's existing `@badeball/cypress-cucumber-preprocessor`
  Messages stream / accumulation. Enabling a Messages file for the recorder's
  own use is allowed; that ndjson is not committed Proof and must not carry
  screenshots, videos or other bulky attachments into the compact record.
- **Compact proof.** Each ordinary finished run that observes at least one
  in-scope scenario writes one uniquely named version-1 proof file under the
  declared proof directory, matching the Cucumber proof reference fields and
  atomic rewrite rules. Identify scenarios only by feature path (repo-root,
  `/` separators), scenario name as written in Gherkin, and outline `example`
  cell values. Record only finished last attempts (`willBeRetried` false) that
  actually ran. A focused or tagged run updates only the cases it observed;
  other identities keep earlier observations.
- **Configuration.** Declare `proof` on Doughnut's Gherkin Intent location in
  `.planning/open-dough.json`. Record only features under that location.
  Install the recorder in every Cypress profile that runs those features so
  focused, tagged and full runs all record.
- **Preserve the runner.** Existing Cypress output, diagnostics, tags,
  isolation, composition of plugin event handlers, and command exit meaning
  stay unchanged. The recorder prints nothing and never fails the run. When it
  cannot record (for example outside a Git checkout, or when the preprocessor
  produced no usable Messages for the observed specs), it records nothing and
  leaves the run intact.
- **Intent reading.** With proof committed at a published Doughnut revision,
  Intent shows that feature's latest observations the same way as for Pygardon:
  per-scenario outcome, attempts, duration, time, commit, and whether the
  published feature blob matches the observed one; unobserved scenarios stay
  explicit; a missing proof declaration, empty proof, and unreadable or
  malformed proof remain distinct.
- **Verification.** Prove with a real Doughnut Cypress selection that records
  and a published revision Intent can read. Cover outline rows and a
  retry-assisted outcome where Doughnut's runner can produce them. Apply the
  repository's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).
  Terry evaluates usefulness against today's Cypress output + editor workflow.

**Scope limits (deferred promises, not rejections):**

- CI corroboration of Doughnut's local observations (story 7 owns the first
  comparison policy; once that policy exists, including corroboration in this
  producer's complete outcome is a later choice, not this story's delivery).
- Folder-level Proof summaries (story 9).
- Committing Messages ndjson, screenshots, videos, traces or step logs as Proof.
- Recording features outside the declared Gherkin Intent location, including
  throwaway specs.
- Changing Doughnut's Cypress tags, isolation, or CI selection. Enabling
  ordinary Cypress retries for retry-assisted successful proof is in scope
  for this story (2026-11-02 developer choice, aligned with SEED-220).
- A shared Open Dough-shipped Cypress recorder package, or teaching Intent a
  second proof format.
- Vitest, Node, Playwright or other Doughnut non-Cypress families.

**Required restrictions:**

- Never treat a mixture of older and newer case observations as one current
  full-suite green result; a focused run claims only what it ran.
- Never key observations by Cypress or preprocessor generated IDs across runs.
- Never present missing, empty or unreadable Doughnut proof as an observed
  pass.

**Key examples:**

1. Doughnut declares `proof` for `e2e_test/features`. An ordinary `cy:run`
   selection that finishes two scenarios writes one new compact proof file and
   leaves Cypress exit and diagnostics unchanged. A third scenario not in the
   selection is absent from that file.
2. Those two observations are committed. In Intent, at that published revision,
   selecting feature A shows both scenarios' latest outcomes with time, commit
   and file-version match; a scenario never observed reads Not observed.
3. A later focused run re-runs only one previously passed scenario and it
   fails. After commit, that identity has no successful proof in Intent (Not
   observed / cleared), while another scenario's earlier pass remains — same
   successful-only meaning as SEED-220 (2026-11-02 developer choice; do not
   show Failed as latest observation).
4. A Scenario Outline row is observed: Intent names the outline's Gherkin
   scenario name and that row's example cells, distinct from other rows.
5. A scenario passes on a Cypress retry: Intent shows a retry-assisted pass with
   attempt count, not a clean single-attempt pass.
6. Before any proof directory is declared, Intent for Doughnut Gherkin still
   browses Purpose and explains that proof is not recorded, pointing at the
   Cucumber proof reference — same absent-proof meaning as today.
7. A run outside Git, or a spec whose hook failure yields no Messages
   contribution, leaves prior committed proof unchanged and does not fail
   Cypress for that reason.

**Architecture:**

- **Producer in Doughnut, reader in Open Dough.** Durable proof files are
  repository records of the observed project
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
  The dashboard continues to read committed proof at the published revision; it
  does not become the authority that creates Doughnut's observations.
- **One evidence format.** Cypress production must satisfy the existing compact
  schema so Purpose and Proof vocabulary stay intact
  ([ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)). Extending
  Intent with a Cypress-specific schema would split Proof meanings.
- **No premature shared framework.** A second producer justifies reuse of the
  format and reader, not a plugin platform
  ([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).
- **CI policy stays with story 7.** This story does not invent corroboration
  dispositions. Applicable Accepted decisions checked: ADR 0000, 0001, 0002,
  0008, 0010. Index and in-file statuses agree; no conflict with the selected
  path. Proposed ADR 0007 / 0009 are non-binding here.


<a id="inspect-hierarchical-proof-cost"></a>

### 9. Find expensive proof in the test hierarchy

**Identity:** SEED-192#inspect-hierarchical-proof-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can locate observed execution cost and result gaps
  by selecting folders and drilling into their tests.
- **Evaluation:** Select a Cucumber folder and read its latest observed
  child outcomes and costs, then open a feature. Publish a later focused run:
  only its cases change, earlier observations retain their time/source version,
  and never-observed children remain explicit. Label duration sums as sums of
  latest observations; folder wall time remains unavailable without direct proof.
- **Value / learning:** Makes existing observations navigable for maintenance
  without requiring an automated judgment about cost or intent quality.
- **Boundary:** Begin with the configured hierarchy and supported Cucumber
  observations. Do not infer current suite status from mixed observations.
  Exclude mixed-runner performance ranking, invented shared-setup attribution,
  and whole-product protection claims. Other
  producers reuse the rule where their observations support it.
- **Effort hypothesis:** Unbanded; middle, medium confidence after file-level
  Proof. Case selection and timing definitions drive the uncertainty.
- **Product prerequisites:** A browsable hierarchy and readable observations for
  at least one runner; a second Cucumber producer is not required.
- **Safe stopping point:** Honest folder-level outcomes/costs with drill-down,
  useful even if every other report family is cancelled.


<a id="assess-story-intent-protection"></a>

### 10. Review how well a story's intent is protected

**Identity:** SEED-192#assess-story-intent-protection
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer receives an explainable assessment of how clearly
  one real story's intent is distilled into maintained high-level tests, what
  those tests protect, and where evidence is insufficient.
- **Evaluation:** For one newly developed or completed story with recoverable
  intent and source, state the developer's review basis first. Review an
  AI-assisted assessment against the actual story, test source, and applicable
  execution evidence. The developer can follow the reasoning to its sources
  and make a concrete retain, clarify, or strengthen decision, or reject the
  assessment as unhelpful with its limitation recorded.
- **Value / learning:** Tests the direction's hardest assumption before building
  a general coverage model. Compare useful findings, unsupported claims, and
  review effort with an ordinary review using the existing tools.
- **Boundary:** One bounded case with qualitative reasoning and explicit unknowns.
  A changed-file list, passing run, or line-coverage percentage alone cannot
  establish intent protection. Existing tools and reports may supply the review;
  a new dashboard automation or stored intent catalogue is not required.
- **Effort hypothesis:** Unbanded; bounded exploratory case, low confidence.
  Selecting a case with recoverable intended behavior limits scope. Assessment
  reliability is the uncertainty; an inconclusive result is valid learning.
- **Product prerequisites:** Recoverable story intent, relevant test source,
  available execution evidence, and a developer able to evaluate the result.
  No blocking story dependency has been established.
- **Safe stopping point:** The case retains its useful maintenance decision and
  evidence limits. Wider automation remains a later choice informed by this
  result; the judgment does not become a whole-product protection claim.

<a id="assess-story-test-complexity"></a>

### 11. Review complexity introduced by a story's tests

**Identity:** SEED-192#assess-story-test-complexity
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can distinguish useful protection from avoidable
  complexity in a story's expression of intent and its tests.
- **Evaluation:** Review one real story's test changes and the supporting setup
  using the memorandum's criteria. Explain the relevant boundary, concepts,
  coupling, and mock assumptions with source references. The developer can judge
  a concrete simplify or retain proposal against the behavior it protects.
- **Value / learning:** Tests whether the proposed heuristics support a worthwhile
  maintenance decision, rather than merely rewarding short test bodies.
- **Boundary:** Account for supporting code as well as test bodies, and separate
  behavioral complexity from proof complexity and run time. Low-level tests and
  mocks carry costs to explain and weigh. A universal complexity score or an
  automatic rewrite is a later decision.
- **Effort hypothesis:** Unbanded; bounded exploratory case, low confidence.
  Source outside the changed test body may be needed to understand its costs.
  Scope stays at one story and its relevant support rather than a suite audit.
- **Product prerequisites:** A real story comparison, relevant test/support
  source, and a developer able to assess the tradeoff. No blocking story
  dependency has been established.
- **Safe stopping point:** A justified retain or simplify decision and the
  heuristic's limitations remain useful even if no automated metric follows.
  The assessment changes no tests or project testing rules by itself.

<a id="read-vitest-proof"></a>

### 12. Read frontend Vitest proof in both projects

**Identity:** SEED-192#read-vitest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Doughnut and Pygardon developers can review frontend test results
  and latest observations beside the TypeScript source already readable in Intent.
- **Evaluation:** Collect a real local Vitest run in each frontend, inspect
  latest file/case outcomes, use supported folder summaries, and corroborate
  comparable claims against each project's CI selection.
- **Value / learning:** Tests shared reporting across browser-mode and happy-dom
  Vitest without conflating their execution environments.
- **Boundary:** The two frontends, including explicit browser-project identity,
  retries, and existing reporter/failure behavior. Open Dough dashboard tests
  remain Playwright. CLI Vitest is a later selection rather than hidden scope.
- **Effort hypothesis:** Unbanded; middle, medium confidence after the first
  proof/CI case. Split the frontend variants only if real reporting behavior
  proves materially different; Vue versus React alone does not require a split.
- **Product prerequisites:** TypeScript source reading and established latest-observation
  and CI comparison semantics at integration.
- **Safe stopping point:** Usable frontend Proof in both projects, with
  environment and unsupported observations explicit.


<a id="read-playwright-proof"></a>

### 13. Read Open Dough dashboard Playwright proof

**Identity:** SEED-192#read-playwright-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** An Open Dough developer can inspect observed dashboard protection
  beside its TypeScript tests using the existing strict run semantics.
- **Evaluation:** Retain a real dashboard run, review its selection, attempts,
  strict terminal outcome and latest case observations in Intent, and corroborate its
  applicable claims against the actual CI selection/shards.
- **Value / learning:** Brings the dashboard's own test intent into Proof and
  tests reuse of its already available opt-in record.
- **Boundary:** Add missing source association, publication, and latest observations around
  the existing contract. A listed-only, running, skipped, or raw-runner pass
  cannot be upgraded to executed strict pass. Preserve quiet diagnostics.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Repetition/retry,
  shared hooks, and shard scope already have meaningful distinctions to retain.
- **Product prerequisites:** Source reader and established Proof/CI semantics.
- **Safe stopping point:** Honest dashboard file/folder Proof without migrating
  tests to another runner or waiting for Python/script collection.


<a id="read-pytest-proof"></a>

### 14. Read Pygardon pytest proof

**Identity:** SEED-192#read-pytest-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Pygardon developer can review observed Python test protection
  and latest observations alongside the configured pytest source.
- **Evaluation:** Record an actual authorized pytest selection, inspect file/case
  and parameterized outcomes, then corroborate the applicable subset in CI.
  Slow and host-Docker selections absent from CI stay explicitly unchecked.
- **Value / learning:** Extends evidence to Python while preserving its real
  collection, setup/teardown, expected-failure, and parallel-run meanings.
- **Boundary:** Pygardon's selected pytest suite; not legacy Python trees or
  Doughnut CLI unittest. Source root, default markers, and CI selection are
  separate facts; visible source does not imply executed coverage.
- **Effort hypothesis:** Unbanded; middle-to-higher, low-to-medium confidence.
  Existing progress containment, plugins, and xdist must retain their behavior.
- **Product prerequisites:** Python source reading and established Proof/CI semantics.
- **Safe stopping point:** Reviewable Python Proof with its actual limits; no
  invented per-folder wall cost or current pass from an unmatched older run.


<a id="read-node-test-proof"></a>

### 15. Read Node script-test proof

**Identity:** SEED-192#read-node-test-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Open Dough and Doughnut developers can inspect script-test
  evidence alongside the configured Node test source.
- **Evaluation:** Capture a real `node --test` selection in each project through
  its existing command, read cases/subtests, latest outcomes and attempts, and
  corroborate matched CI observations.
- **Value / learning:** Makes script protection visible at the runner's actual
  case granularity without treating a wrapper's exit as every case passing.
- **Boundary:** Node test events and the selected project commands. Preserve
  existing scheduler ownership, quiet/strict failures, and nested-case meanings.
  A suite plus its child cases must not inflate counts or summed duration.
- **Effort hypothesis:** Unbanded; middle, medium confidence. Two project wrappers
  use one runner family; console scraping is not a reporting contract.
- **Product prerequisites:** Configured script source and shared Proof/CI semantics.
- **Safe stopping point:** Useful Node-script Proof independently of shell checks,
  Java/JUnit, or other not-yet-selected runners.


<a id="read-shell-check-proof"></a>

### 16. Read shell-check proof at its observed granularity

**Identity:** SEED-192#read-shell-check-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** An Open Dough developer can review retained evidence for shell
  checks whose protection is currently visible only through command output.
- **Evaluation:** Run selected checks through the existing scheduler, review
  each check's observed result and duration beside its source, and corroborate
  comparable check-level observations in CI.
- **Value / learning:** Extends the review to a real remaining test family without
  manufacturing case identities or counts unavailable from the command.
- **Boundary:** Selected Open Dough shell checks. A shell process can truthfully
  yield file/check-level evidence; case-level claims require a real producer.
  Preserve strict command exit and timing semantics. Add Doughnut shell checks
  only when a concrete runnable target is selected.
- **Effort hypothesis:** Unbanded; middle, low-to-medium confidence. The existing
  scheduler already observes job exit/time, but retention and source mapping
  still need integration; parsing arbitrary scripts is not part of this story.
- **Product prerequisites:** Configured source and shared Proof/CI semantics.
- **Safe stopping point:** Honest coarse-grained Proof, labelled as such, remains
  useful without pretending it has the same detail as Cucumber or pytest.

## Ordering, Existing Stories, and Scope Reduction

The numbered sections record the backlog order Terry selected on 2026-10-31;
they do not establish a mandatory dependency chain. The existing seven identities
remain canonical here. Specifically, the Cucumber source pilot closed as SEED-192#browse-test-purpose;
`read-observed-test-proof` delivered Pygardon's first local Cucumber case, and
`inspect-hierarchical-proof-cost` keeps folder Proof. These are not duplicated
under new identities. Other existing review candidates retain their outcomes.

The selected order starts with the frame (1), then the Cucumber pilot (2), then
other configured source (3). The strongest rejected smaller option for the
frame is a disposable mockup: Terry explicitly wants to experience the real
interface and return to working Development. This story is justified by that
learning, not merely as infrastructure for later readers.

The earlier optimization-candidate priority becomes selected position 4, after
its source-navigation prerequisites. Story impact (5) keeps the review centered
on a story. First local Proof (6) precedes CI corroboration (7), then Doughnut's
second producer (8). Folder Proof (9) needs only one producer and may move before
8 if that offers earlier value. Preserve the bounded protection/complexity
learning (10–11) before expanding collection across every remaining family
(12–16). Those review cases can also use existing tools sooner.

The kept decomposition differs from Terry's rough sequence in three deliberate ways:

- Combine language-only source extensions when they share the same reading
  outcome; retain TypeScript, Python, Node, and shell as real evaluation examples.
- Separate runner-specific collection even where the source language matches.
- Check CI consistency on one Cucumber family early, then include corroboration
  in each later producer's complete outcome rather than postpone one very large
  cross-runner reconciliation story until last.

Once the comparison policy is understood, corroboration is part of a later
producer's promised evidence quality. If a new runner introduces a separate
unsettled comparison policy, split that learning from its latest-local-Proof outcome
instead of silently enlarging the producer story.

No formal blocking dependency has been recorded: common code and delivery order
alone do not establish that another story cannot start. Each consumer owns its
integration. Establish a blocking agreement later only if refinement demonstrates
an actual supplier outcome required before work can start.

If investment must shrink, retain the source-only product after 3. Next retain
one Cucumber producer plus its corroboration (6–7). Drop additional producer
families in reverse order of demonstrated use; shell/Node and unrequested
Java/CLI expansion are the first candidates to defer, rather than spreading
partially trustworthy evidence everywhere. Keep an early protection review to
test the parent direction's hardest assumption. History can be modest; source
association and truthful selection/outcomes cannot be deferred without weakening
what the first Proof claims.

## Open Decisions Before Refinement or Planning

- First Proof's profile, tested basis, publication and retention were settled
  on 2026-11-01 and published as the [Cucumber proof reference](../../src/skills/dough-test-optimization/references/cucumber-proof.md): proof is
  a latest per-scenario snapshot, not run history. How source and proof-only changes
  obtain CI corroboration remains with [story 7](#check-cucumber-proof-in-ci).
- Refine comparison dispositions: what local scope requires CI corroboration,
  how unmatched/host-only scopes are reported, and what discrepancies fail a
  check. Durations alone do not decide logical consistency in this proposal.
- Select a real story and a developer's prior review basis for each assessment
  case; define what decision and review cost would justify keeping the method.
- Establish Open Dough S/M/L calibration before assigning bands. Comparative
  uncertainty is recorded; no borrowed client-project timing policy applies.

## When to Surface

Terry kept this revised decomposition and its backlog order on 2026-10-31.
Refine one selected story before
execution planning; reevaluate wider producer work from actual early use.

## Breadcrumbs

- Terry's 2026-10-30 direction: initial source browser, story scope, Purpose/Proof
  layouts, timing/hierarchy, and longer-term forms of intent expression.
- Terry's earlier 2026-10-31 request: optimization candidates and accepted slow
  tests at priority 2, with links into the test-source browser.
- Terry's current 2026-10-31 request: decompose the broad first story, lead with
  the real frame, use explicit folder types across Open Dough/Doughnut/Pygardon,
  collect bounded local Proof history and folder observations, then corroborate
  against CI with resource-aware timings.
- Terry's 2026-10-31 keep and landing instruction: retain this decomposition,
  queue its stories in the proposed order, and place optimization-candidate
  review after source browsing.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Initial Intent direction](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
- [Project visibility requirements](../../docs/project-visibility-requirements.md#product-intent-perspective-the-current-product).
- [Current dashboard behavior](../../dashboard/README.md),
  [source reads](../../dashboard/server/ghContents.ts),
  [review text](../../dashboard/server/storyReviewFileResponse.ts), and
  [existing dashboard proof contract](../../dashboard/tests/proof-record.md).
- Doughnut checkout: `package.json`, `frontend/vitest.config.ts`,
  `e2e_test/config/common.ts`, `e2e_test/config/ci.ts`, `backend/build.gradle`.
- Pygardon checkout: `cucumber.js`, `e2e_test/packaged/cucumber.js`,
  `frontend/vite.config.ts`, `pyproject.toml`, `scripts/check-prepared-checkout.sh`,
  and `.github/workflows/ci.yml`. These paths are research references within
  their named repositories, not Open Dough installation requirements.
