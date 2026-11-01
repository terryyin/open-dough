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
  read "history" in that light.
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
  browsing and rolling evidence experience; its quantitative disadvantage is unknown.
- **One source-browser story for every language:** possible as delivery
  checkpoints, but plain text, folders, and explicit file selection are the same
  observable behavior. A Python-only reader adds no demonstrated independent
  outcome after a configurable text reader exists. Recommend a Cucumber pilot,
  then one general source-browsing increment evaluated with TypeScript, Python,
  Node, and shell examples. Split only if refinement reveals distinct behavior.
- **One universal reporting story or JUnit-only import:** unnecessarily combines
  different runner semantics. Reuse native reports and add one real producer
  family at a time. Avoid a plugin platform or a universal scoring model.
- **Recommended:** deliver the visible frame, source access, one end-to-end
  locally produced Proof history, and early CI corroboration. Extend the shared
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
5. **Bounded clinical history:** retain failed and incomplete observations as
   well as passes, per configured suite, with each run's original scope. Proposed
   starting retention is the latest ten compact run records per suite, subject
   to review. A focused run must not masquerade as a full run, erase the meaning
   of an earlier full observation, or combine old passing cases into a current
   green suite. Keep raw screenshots/videos out of the compact rolling record.
6. **Native reporting before new machinery:** Cucumber.js emits Cucumber
   Messages, and Doughnut's preprocessor can emit Messages too. This is a
   promising common input, not proven compatibility of their installed versions.
   Map source scenarios/outline rows and retry attempts using each run's actual
   source, not generated runtime IDs across unrelated runs. Keep collection,
   ordinary diagnostics, and strict pass/fail rules coherent. Open Dough already
   has an opt-in Playwright proof record, but it has no explicit tested revision
   and no automatic history/retention policy.
7. **Folder truth and timing:** summarize one selected run's observed children
   before considering cross-run or mixed-runner totals. Show unobserved,
   excluded, skipped, and incomplete work. Summed case durations are not elapsed
   wall time under parallelism; shared setup/hook cost is only attributed where
   observed. Do not invent folder wall time from case sums or imply that a
   folder's source listing is the runner's collected-case inventory.
8. **CI corroboration:** compare applicable tested source and selection before
   comparing case outcomes. A broader CI run can corroborate the matched local
   subset; excluded host-only cases remain unchecked. Missing expected cases,
   changed source, malformed records, retry-assisted passes, and interrupted CI
   need explicit classifications. CI reports its consistency verdict and any
   diagnostic evidence without replacing or appending to the retained local
   Proof history. It corroborates reproducibility; it does not authenticate who
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
  source association, selection, and history requirements by itself.
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

<a id="review-test-optimization-candidates"></a>

### 4. Review test optimization candidates and accepted slow tests

**Identity:** SEED-192#review-test-optimization-candidates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/437-review-test-optimization-candidates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9a23b041463a58d99703ba80d656e17861f15eff1e0b317a4467374d600f7cbb","plan":"d55fb91981ca7b8a4fa07047ac009d90d01f0b2ea7c9e6ed086a9e8a629a9df4"}}
```

**Beneficiary:** A developer reviewing one configured project in Intent, such as
Terry reviewing Open Dough, Doughnut, or Pygardon.

**Goal:** In Intent, the developer can read the project's Test Optimization
Candidates record as published: the slow tests still waiting on a decision, and
those whose cost was accepted. From an entry, they open the tests it names in
the Intent source reader and come back to the entry, without switching to an
editor. This tests whether reading the tests themselves helps developers
understand optimization decisions better than reading the record and the tests
separately. Terry evaluates the experience against today's manual workflow
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).

**Facts observed during refinement (2026-11-01, read-only):**

- All three projects publish `.planning/TEST-OPTIMIZATION-CANDIDATES.md` in the
  format owned by Open Dough's
  [candidate record](../../src/skills/dough-test-optimization/references/candidate-record.md).
  Its `**Locations / scope:**` field is free prose with no path convention.
- Open Dough (local main): the 4 pending/accepted entries name 7 test files,
  all inside its configured `dashboard/tests` location. Most are
  repository-relative backticked paths. Two are bare filenames, and one of
  those, `story-review-completed.spec.ts`, matches two published files
  (`dashboard/tests/` and `dashboard/tests/boundary/`).
- Doughnut (`69c994a896`): of 6 pending/accepted entries, one names a bare
  `.feature` filename that resolves uniquely to a configured location. One
  names a Java glob, and four have no path. Its 10 profile-only exclusions are
  Markdown links (relative to `.planning/`) to configured feature files, each
  naming a scenario.
- Pygardon (`e72b32b0a`): the 3 accepted entries name pytest files under
  `tests/`, and the 1 pending entry names host settings. It configures only
  Gherkin locations, although Intent already supports the `python` kind. It
  also records 1 profile-only exclusion and 23 transferred obligations.
- The dashboard already reads published repository files pinned to a revision,
  and its recorded-link resolver
  ([`sourceLink.ts`](../../dashboard/src/sourceLink.ts)) turns a link relative
  to its containing file into a pinned GitHub snapshot or an explanation that
  it cannot be used. Intent's file selection is currently local to its browser
  ([`IntentBrowser.tsx`](../../dashboard/src/IntentBrowser.tsx)).

**Selected direction:** Show the record's entries as a list inside Intent, read
at the same published revision as the Intent locations. Recognize each location
reference the Locations field records and match it against the files of the
project's configured Intent locations at that revision. A match selects the
file in the same Intent selection the location tree uses. Every other reference
stays visible as recorded text, with an explanation where it names a test file
that cannot be opened.

**Alternatives considered (explore / borrow):**

| Option | Assessment |
| --- | --- |
| Keep reading the record in an editor and opening tests by hand | The baseline and fallback. It fails the requested integrated review. |
| Render the record's Markdown, with only its own links clickable | Simplest, but Open Dough's record uses backticked paths, not links, so it would get no test links. Fails the purpose for the main evaluation project. |
| Mark the source tree's files with their candidates instead of listing entries | Loses entries without file locations (Pygardon's host settings, Doughnut's frontend isolation) and the grouping by decision. Possible later as an addition to the list. |
| Require structured repository-relative locations in the record format first | More precise, but delays value until every project's record is rewritten. It changes a published skill without evidence that resolution fails. Deferred; revisit if real records keep failing to resolve. |
| **Borrowed: terminal and IDE file-link detection** (selected, adapted) | A code editor's terminal finds path-like text in output, resolves it against the workspace, offers a choice when several files match, and leaves text alone when nothing matches. Mapped here: Locations prose is the output, and the configured Intent files at the read revision are the workspace. Where the analogy breaks: a terminal tolerates opening a wrong file, but here a guessed file would mislead the review. So only a full path, or a name that matches exactly one file, opens directly. A name that matches several files lists every match by full path and opens none on its own. |

**Challenge:** The purpose is understanding *why* tests are slow or accepted by
reading them. A list that fails to resolve most references would meet the
wording and miss the purpose. On current records that risk is real outside Open
Dough. Pygardon's accepted pytest files sit outside its configured locations,
and most of Doughnut's pending and accepted entries name no file. The story
therefore shows each entry's full recorded rationale even when nothing opens,
and gives each unopenable reference a specific reason, such as "outside
configured Intent locations", so the developer can see what to fix: in
Pygardon, configuring `tests/` as a `python` location. Configuring a project's
locations stays that project's decision, following the human-owned framing. The
strongest remaining doubt is whether the dashboard's prose recognition stays
reliable as records change. The deferred structured format is the remedy if
real use shows failures. The hypothesis that reading the tests helps can only
be judged in Terry's evaluation.

**Scope:**

- **Record view in Intent.** For the selected project, Intent offers its Test
  Optimization Candidates record, read from `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
  at the same published revision Intent names for its locations. The view names
  that revision.
- **Entries.** Every pending candidate and every accepted necessary cost appears,
  in the record's order, under its own labelled group. Each entry shows its
  slug and its recorded fields: locations, observed cost with its measurement
  conditions, unique protection, alternatives attempted, disposition and
  rationale, date, any human decision needed, and evidence. Entries appear
  regardless of duration, measurement, or runtime report. Accepted costs keep
  their rationale and are never shown as skipped or excluded.
- **Other recorded sections** (Profile-only exclusions, Transferred obligations,
  Latest pass) use the same rule and may appear under their own record headings.
  Only pending and accepted are promised and verified. Profile-only exclusions
  must never be presented as accepted costs.
- **Test links.** In the Locations field, a full repository path, a Markdown
  link (resolved relative to the record), or a bare filename that matches
  exactly one file in a configured Intent location opens that file in the Intent
  Purpose reader. It becomes the same selection the location tree shows. A
  family that names several files links each one. When the record identifies a
  case unambiguously, by line (`path:line`) or by a case name that appears
  exactly once in the file (`path::name`, or a named Gherkin scenario), the
  reader shows the file at that case. Otherwise the file opens at its start,
  with the recorded case text kept beside the link.
- **Return to the entry.** After reading a test, the developer returns to the
  record view at the entry they came from, with the record still shown. Opening
  a test neither rereads nor resets the record.
- **Truthful gaps.** A reference to a test file that cannot be opened stays as
  recorded text with its specific reason. The reason is one of: not published at
  this revision (missing or moved), outside the project's configured Intent
  locations, or names several files (each listed by full path, none opened on
  its own). Prose without a file reference, such as host settings, a symbol, or
  a glob, stays plain text and claims no gap.
- **Evidence access.** Evidence and other recorded text keep their wording.
  Recorded Markdown links follow the existing recorded-link resolver: a link to
  a configured test file opens in Intent, and any other link opens the
  published snapshot at the read revision. Text such as `40e1d2f9:path` stays
  as recorded.
- **Record states.** These each have their own explanation: an absent record
  (no pass has recorded findings), an unreadable read with retry, a mismatched
  file (not headed `# Test Optimization Candidates`, or missing the required
  sections), and a readable record whose pending and accepted groups are both
  `None.`. A mismatched record shows no partial guess. These states do not
  disturb browsing the Intent locations.
- **Proof.** Automated dashboard proof uses fixtures shaped like the real
  records (backticked, bare-name, ambiguous, linked, unconfigured, absent).
  Story completion also needs Terry's evaluation on the real Open Dough record,
  plus a recorded look at Doughnut and Pygardon at their current revisions.
  Apply the repository's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Scope limits (deferred promises, not rejections):**

- A structured location syntax in the candidate-record format, and any change
  to the dough-test-optimization skill.
- Badges or marks for candidates in the location tree, and runtime Proof,
  profiling, or automated assessment.
- Editing, moving, or deciding entries. Those belong to the
  dough-test-optimization workflow.
- Changing any project's Intent location configuration, including Pygardon's
  `tests/`.
- Story-scoped filtering of entries.

**Required restrictions:**

- Never open a guessed file. Ambiguous or unmatched references never select a
  test on their own, because a wrong file would misrepresent the protection the
  decision relies on.
- Read the record and the location files at the same named revision, so an
  entry and the source it opens describe the same published state
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
- Keep the record's own vocabulary and groups. Acceptance filters nothing, as
  the record format requires.

**Key examples:**

1. Open Dough at a published revision → developer opens the record in Intent →
   one pending entry (`launch-records-poll-waits`) and three accepted entries
   appear in labelled groups with cost, rationale, date, and evidence. Selecting
   `dashboard/tests/agent-launch-second-server.spec.ts` in `agent-launch-poles`
   shows that file's source in Purpose, selected in the location tree. Going
   back returns to `agent-launch-poles`.
2. `long-integrated-journeys` names four files → each is its own link, and
   opening one leaves the other three available from the entry.
3. `story-review-completed-journey-landed-runs-tail` records the bare name
   `story-review-completed.spec.ts`, which matches two files → the entry lists
   `dashboard/tests/story-review-completed.spec.ts` and
   `dashboard/tests/boundary/story-review-completed.spec.ts` as separate choices.
   Neither opens without the developer's selection.
4. Pygardon → `real-h264-codec-roundtrip` shows its full rationale. Its
   `tests/test_clip_core.py::test_clip_segments_h264_reencodes_video` reference
   explains that the file is outside Pygardon's configured Intent locations and
   opens nothing. After Pygardon configures `tests/` as `python` and publishes,
   the same entry opens the file at that test.
5. Doughnut → `frontend-browser-file-isolation` names no file and shows its
   text without a gap warning. `e2e-batch-cold-start` opens
   `e2e_test/features/cli/cli_notebook_lfs.feature` from its bare name.
6. A record moved a test after the entry was written → its path is not
   published at this revision → the entry says so and opens nothing else.
7. A project without the file → Intent says no optimization record has been
   published and leaves browsing unchanged. A record whose pending and accepted
   sections are both `None.` says it records no pending or accepted entries.

**UX/UI:** A developer reviewing a project's maintained tests. They first see
the record's groups and entries, then decide which test to read. Feedback and
recovery are the specific gap reasons, retry for a failed read, and returning
to the entry. Interaction choices that change the promise: the record and the
source reader share one Intent selection, so a test opened from an entry is the
same selection the tree and Purpose show. The entry the developer came from
survives reading a test. Ambiguous names make the developer choose. Layout,
placement of the record view within Intent, and control treatment are planning
and design details. Both stay keyboard-operable and usable at narrow width,
like the existing Intent browser.

**Architecture:** This adds a second published record and a second way to
select source in Intent.

- **Shared Intent selection.** The selected file, and the case when one is
  identified, moves from `IntentBrowser`'s local state to one owner for the
  project's Intent workspace. The location tree and the record view both use
  it. The seed's later Purpose/Proof layouts and story scope also depend on
  that one selection, so this generalizes the delivered single-entry browser
  rather than adding a parallel path.
- **Reading the record.** The server-side read follows the existing pinned
  Intent location read: same revision, distinct absent, unreadable, and
  mismatched outcomes. Parsing follows the format owned by the
  dough-test-optimization skill's candidate record, and the dashboard does not
  redefine that format.
- **Matching references.** Matching recorded references to files is a pure
  function. Its inputs are the recorded text, the record's path, and the
  configured locations' file inventory at that revision. Its output is a
  match, several candidate files, outside configured locations, not published,
  or not a file reference.
- **Evidence links.** These reuse the existing recorded-link resolver.

Applicable Accepted decisions: [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
treats the record as a published repository fact and the selection as
disposable UI state.
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps Purpose
distinct, so the record view is not Proof.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) compares
the review with the manual workflow, and
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors reusing existing solutions. None conflicts.

**Product prerequisites:** Configured-source browsing is delivered
(SEED-192#browse-test-purpose and SEED-192#browse-configured-test-source are
done). No blocking dependency remains.

**Safe stopping point:** The complete recorded list, with its truthful links and
gaps, is useful without runtime Proof or automated assessment.

<a id="review-story-intent-impact"></a>

### 5. Review a story's impact on test intent

**Identity:** SEED-192#review-story-intent-impact
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can focus an intent review on what a story changed,
  while retaining access to the surrounding maintained test source.
- **Evaluation:** Select a story with a recoverable source comparison, including
  a completed story, and inspect the relevant test-file changes with the compared
  revisions. Return to the whole-project view without losing the selected project.
- **Value / learning:** Connects the new Intent view to the near-future question
  about a story, rather than making a whole-product assessment the entry cost.
- **Boundary:** Reuses the meaning of existing story comparisons. Changed-test
  selection is an initial impact view; unchanged tests may also protect affected
  behavior. An unavailable comparison explains the gap rather than showing
  an empty change as evidence of no impact.
- **Effort hypothesis:** Unbanded; comparatively middle, medium confidence.
  Assumes existing Review changes can supply a usable comparison. Completed-story
  attribution and continuity with project browsing need refinement.
- **Product prerequisites:** A story identity and an available comparison for the
  evaluated case. No blocking story dependency has been established.
- **Safe stopping point:** Developers can review a story's changes to Purpose
  even if runtime reporting or assisted assessment is never added.

<a id="proof-file-version-after-upgrade"></a>

### 6a. Keep Proof's file version true after a dashboard upgrade

**Identity:** SEED-192#proof-file-version-after-upgrade
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/440-proof-file-version-after-upgrade/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f8a7ed0db62304b8d65a0e22b557d4f07b724823e925641b38d1b7efd3675cfa","plan":"23eaecc1f5c5e60581ecbd66070af632657d86aa3e6b67c239daf22ea9136d5b"}}
```

**Goal:** A developer reading a feature file's Proof in Intent after upgrading
the dashboard sees "This file version" whenever the observation's recorded blob
matches the published feature file. Today a feature listing a dashboard version
remembered before listings carried blob shas makes every row read "Earlier file
version" until the feature folder changes. This corrects the closed
SEED-192#read-observed-test-proof, recoverable at
`2d2d6a2f:.planning/seeds/SEED-192-review-product-intent.md`.

**Scope:** A remembered feature listing without blob shas is never used for the
file-version match. Keep one tree read per location and revision, reuse of a
listing across revisions that did not touch its folder, and every Proof state and journey.
Test-tier consolidation of the proof answer's other variants is not part of
this correction.

**Key example:** A feature listing without blob shas was retained at revision
A. Revision B changes only the proof folder. Intent at B answers the blob of
every listed feature, and a matching observation reads "This file version".

**Plan:** [440-proof-file-version-after-upgrade](../slice-plans/440-proof-file-version-after-upgrade/PLAN.md)


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
  outcomes remains consistent without requiring equal durations.
- **Value / learning:** Tests the trust boundary before proliferating producers:
  selection, evidence-only commits, CI exclusions, and nonidentical resources.
- **Boundary:** One project, one runner family. CI's comparison output does not
  create, refresh, or overwrite retained local history. Define comparison of
  case identities/outcomes, retries, incomplete runs, and report-only trigger
  behavior. Performance gates and proof authenticity are separate concerns.
- **Effort hypothesis:** Unbanded; higher, low confidence. Actual Pygardon source
  recipe/controller and differing local/CI tags must be respected.
- **Product prerequisites:** Retained locally produced Cucumber evidence and an
  independently runnable CI selection; only matched source/scope is corroborated.
- **Safe stopping point:** An actionable CI consistency verdict for Cucumber.js;
  earlier source and local history views still work when CI is unavailable.


<a id="read-cypress-cucumber-proof"></a>

### 8. Read Doughnut Cucumber proof with recent history

**Identity:** SEED-192#read-cypress-cucumber-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A Doughnut developer can review local Cypress-Cucumber evidence
  for a selected feature through the same Intent experience.
- **Evaluation:** Produce and publish a real record through Doughnut's existing
  runner, read feature/case history, and check comparable observations against
  its CI selection. Outline rows and retries retain their source association.
- **Value / learning:** Tests whether the first Cucumber input and evidence
  meanings survive a second real execution integration.
- **Boundary:** Cypress preprocessor Messages and Doughnut's existing runner,
  diagnostics, tags, and isolation. Reuse learned history/read/CI policy without
  assuming Cucumber.js-generated identifiers or changing either project's runner.
- **Effort hypothesis:** Unbanded; middle-to-higher, low-to-medium confidence.
  Both emit Messages, but version compatibility and Cypress run semantics need
  observation. No generic adapter framework is justified by this alone.
- **Product prerequisites:** The evidence/history and CI comparison outcomes at
  integration; no formal start dependency has been established.
- **Safe stopping point:** Doughnut file-level history and bounded corroboration
  stand alone; large attachments do not enter the compact retained record.


<a id="inspect-hierarchical-proof-cost"></a>

### 9. Find expensive proof in the test hierarchy

**Identity:** SEED-192#inspect-hierarchical-proof-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can locate observed execution cost and result gaps
  by selecting folders and drilling into their tests.
- **Evaluation:** Select a Cucumber folder and one real run, read its observed
  child outcomes and costs, then open a feature. A focused run exposes unobserved
  children. Concurrent case-duration sums are labelled separately from run wall
  time; unavailable folder wall time remains unavailable.
- **Value / learning:** Makes existing observations navigable for maintenance
  without requiring an automated judgment about cost or intent quality.
- **Boundary:** Begin with the configured hierarchy and one supported Cucumber
  run. No union of unrelated historical passes, mixed-runner performance ranking,
  invented shared-setup attribution, or whole-product protection claim. Other
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
  and recent history beside the TypeScript source already readable in Intent.
- **Evaluation:** Collect a real local Vitest run in each frontend, inspect
  file/case outcomes and history, use supported folder summaries, and corroborate
  comparable claims against each project's CI selection.
- **Value / learning:** Tests shared reporting across browser-mode and happy-dom
  Vitest without conflating their execution environments.
- **Boundary:** The two frontends, including explicit browser-project identity,
  retries, and existing reporter/failure behavior. Open Dough dashboard tests
  remain Playwright. CLI Vitest is a later selection rather than hidden scope.
- **Effort hypothesis:** Unbanded; middle, medium confidence after the first
  proof/CI case. Split the frontend variants only if real reporting behavior
  proves materially different; Vue versus React alone does not require a split.
- **Product prerequisites:** TypeScript source reading and established run-history
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
  strict terminal outcome and bounded history in Intent, and corroborate its
  applicable claims against the actual CI selection/shards.
- **Value / learning:** Brings the dashboard's own test intent into Proof and
  tests reuse of its already available opt-in record.
- **Boundary:** Add missing source association, publication, and history around
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
  and recent history alongside the configured pytest source.
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
  its existing command, read cases/subtests, terminal outcome, and history, and
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
unsettled comparison policy, split that learning from its local-history outcome
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
