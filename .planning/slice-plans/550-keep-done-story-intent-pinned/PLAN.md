# Keep Done story Intent pinned to the landed result

**Identity:** SEED-283#keep-done-story-intent-pinned
**Source:** [selected story](../../seeds/SEED-283-keep-done-story-intent-pinned.md#keep-done-story-intent-pinned)
**Source review:** [independent source commitments](source-review.md)

## Execution context

Established `SEED-283#keep-done-story-intent-pinned`, publisher `dashboard-territory.local-open-dough`, agent
`bastiaan-chan`, Story Branch Mode, authorized remote/trunk `origin/main`. Owned checkout:
`/Users/terryyin/git/open-dough/.worktrees/keep-done-story-intent-pinned-to-the-landed-resu`; branch
`codex/keep-done-story-intent-pinned-to-the-landed-resu`. Starting revision
`de07d137ff98a2a0e635d2d43ca610bef89434f6`; published claim/initial candidate
`2ee6aa08a70a414caba882a971b77da90d06ac79`. Initial Ready retained **Changed since readiness review** until
the actual slice 3 in-place refinement review reassessed preparation; ordinary delivery does not renew it.
SEED-282's shared page/header/comparison landed before Take; this execution adapts those owners.

Checkout setup `npm ci --ignore-scripts --no-audit --no-fund` and `npm run typecheck:dashboard` passed
2026-11-09. Hook: check-only staged lint, plus dashboard typecheck for staged scripts. Selective formatter:
`npm run format`. No numeric slice budget; preserve one proof loop. Existing planning authority permits
refinement within the unchanged story.

GitHub observer: execution-branch CI for `terryyin/open-dough`, coordinator `seed283-root`, retained directory
`/tmp/dough-ci-501/watch-Fzp5fG`; exact live binding remains in coordinator context. Claim's main CI is
unobserved here. Latest accepted execution CI remains pending with this observer.

Initial setup/resource and slice 1/2 evidence remain in [source review](source-review.md).

Latest delivery: slice 3 accepted on the execution branch at `db8ca909986425b77080466a47ba4ff8079040b0`,
suffix base `fa740edaf788d556205ed349e0111d2213c4806b`; retained observer reused.

## Goal and scope

A developer can review a Done story's changed tests and recorded evidence after trunk has moved on. Its
browser uses the story's baseline/result diff and landing's test locations, inventory, and unchanged-file
source. All three Done tabs stay independent of project freshness. Project Intent owns its revision notice and
refresh, and visibly names the revision its browser shows, even after a planning-only update and with no file
selected.

Historical gaps explain the unavailable source without substituting current trunk or implying no changes. CI,
source, and saved coverage retain independent loading/failure/absence/result states and supported recovery.
Project refresh keeps the prior shown revision through updating/failure and advances the label on accepted
locations, with the existing reading/focus/retry behavior.

No CI endpoint, collection, proof-schema, assessment-process, history-retention, or selection-workflow change.
Preserve explicit equivalent/later-build provenance and Check again: a proof's measured revision is distinct
from the source tree at landing. SEED-282 owns common layout/comparison presentation and is not a
prerequisite. Reconcile with that work if it lands first rather than duplicating its presentation. The established execution instruction authorizes implementation.

## Architecture and existing solutions

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md), [ADR
0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md), and [ADR 0002, principles 2 and
5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md). Index/statuses agree; no
conflict/supersession. Git/records own evidence; caches and reading place are disposable. The [North
Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation) supports these
read/presentation responsibilities without a new topic, database, service or ADR.

PFE at `c7e41e9e4abdd957e3b1117a1bba13d27749d1e6`, adapted to landed SEED-282:

- `IntentPerspective` supplies one project locations read to both scopes. Separate historical inputs
  from project refresh using existing `IntentReadingScope`; never lend another selected story's revision.
- `storyComparisonShown` owns diffs; `storyReviewPublished` exposes completion and tree separately.
  Read source/settings at the result **commit**, never raw tree/synthetic baseline/current-trunk fallback.
  Reuse supported retained landing provenance; keep CI's measured endpoint distinct.
- `authenticatedIntentRead`, `useIntentLocations`, and `server/intentLocationsRead` already read/cache
  explicit revisions. Reuse location selection, `intentStoryOverlay`, rename mapping, outside count,
  and `IntentFileReading`; create no second Done browser, evidence model, or selection grammar.
- `IntentCiEvidence`, `intentCiComparisonResolve`, and `IntentStoryCoverage` own independent evidence
  and recovery. Keep them useful when source is unavailable.
- `IntentRevisionNotice`/`useIntentLocations` distinguish observed, requested and shown revisions.
  Label the successfully shown browser revision with existing update/retry/focus behavior, including
  no-file reading; the selected-file caption cannot replace it.

PFE revisit at `db8ca9099`: a landing owns one launch's first publication, not completed identity. Reuse
`publishedStoryEndpoints`/`deliveredCompletion` and `publishedStoryReview`; expose their trusted-repository
operation for validated capture fallback. Intent reads the default answer; generic Review owns explicit choices.
This preserves the Accepted ADRs and replaces generic run preference only for the historical default.

Story source belongs to its published result; Project reading advances through its own refresh.

## Outside-in proof ownership

Arrange automated domain data through the shared MakeMe API under [test data
architecture](../../../tests/README.md#test-data-architecture). Extend the existing canonical
completion/published-revision fixtures; state post-landing file/settings facts at the case site. Do not stub
the result the production historical reader must establish.

| Final promise | Owner | Observable proof |
| --- | --- | --- |
| Historical locations/inventory/source and original diff survive later test rename/deletion/addition and settings change | 1 | Extend `intent-story-completed.spec.ts` and `intent-story-completed-source.spec.ts` with the real completion fixtures: advance trunk with changed test paths and removed/changed locations, then open Changed tests. Assert landing's location, unchanged source, modified/added/deleted/renamed diff, absence of later-only files, and equality with Review changes. Cover Trunk completion and the Story Branch/merge fixture in `intent-summary-story-comparison-file.spec.ts`. Record actual revision arguments; do not satisfy the browser by intercepting a fabricated historical answer. |
| All three Done tabs lack project freshness controls and keep story evidence after a project visit/refresh | 1 | A controlled-clock Done journey observes a newer published trunk, switches all tabs, visits Project Intent and refreshes, then returns to the same story/file/Purpose or Proof/scroll. Assert no story revision notice/Show latest, fixed story comparison endpoints and saved coverage, project-only refresh, and keyboard return. Extend `intent-project-visit.spec.ts` using its existing isolation journey. |
| Historical comparison/source/coverage gaps are distinct, explained, and do not silently show current tests | 1 | Update the shallow-history case in `intent-story-completed-source.spec.ts`; add a failed historical locations read with supported Retry. Assert the Done view never claims the current tree is its history or that missing evidence means no changes. Retain `intent-story-coverage.spec.ts`'s saved unavailable/no-assessment/failed-record states and CI-gap journeys; one unavailable source must not hide the other tabs. |
| Existing historical CI provenance and recovery remain supported | 1 | Retain `intent-ci-comparison-gaps.spec.ts`, `intent-ci-comparison-cancelled-landing.spec.ts`, `intent-ci-comparison-cancelled-landing-gaps.spec.ts`, and `intent-ci-comparison-retry.spec.ts` through the affected Intent suite. Extend only the cross-tab revision isolation observation; do not rewrite endpoint rules. |
| Project browser's shown revision stays visible and advances after planning-only updates, including no file selection | 2 | Extend `intent-revision-notice.spec.ts` with unchanged test files plus a changed planning record: before refresh label remains old, during held read label stays old, success moves it to the new revision and keeps it visible. Observe with a selected file and after returning to the project browser's no-file homepage. Verify actual locations requests use that new revision. |
| Failed updates keep old label/source, Retry applies the requested revision, and focus/reading survive | 2 | Extend `intent-revision-update-outcomes.spec.ts` and `intent-revision-update-boundaries.spec.ts`: retain old shown label through network/unreadable-settings failure and reopening; successful Retry advances it. Keep selected-path deletion explanation, project-switch isolation, keyboard focus and reading-place assertions. Project CI's independently followed revision is not labelled as the browser's shown source. |
| Completed-result identity outranks older captures; validated capture recovery remains supported | 4 | Real earlier refinement/execution captures followed by later completion, then genuine final capture M with configured history shallow at later C. Assert actual default reply, original diff/source revision, no earlier-run substitution, default-state recovery and explicit-run preservation. |
| Maintained guidance describes the delivered evidence and refresh boundaries | 1, 2 | Update historical story/CI wording with slice 1 and Project Intent/revision wording with slice 2 in the existing Intent documents. Review the concrete examples against delivered behavior. |

## Ordered slices

### 1. Read a Done story from its published result

Type: Behavior
Status: done
Proof: [slice 1 acceptance](source-review.md#slice-1-acceptance-evidence), G1/G2 and the original proof rows above.

Done historical locations/inventory/unchanged source and original diffs remain fixed through later trunk and
settings changes. All three Done tabs lack Project refresh; independent CI/coverage, reading and recovery stay
usable. Real completion, rename/Review equality and unavailable-history/saved-report observations are retained.

### 2. Show the Project Intent browser's current revision through refresh

Type: Behavior
Status: done
Proof: [slice 2 acceptance](source-review.md#slice-2-acceptance-evidence), final full gate and G3.

The persistent Project label names accepted locations, including no-file/planning-only refresh. Held/failed
updates retain prior label/reading, accepted Retry advances it, and Project/CI/story reading stay independent.

### 3. Keep Done Intent historical while its workspace remains

Type: Behavior
Status: done
Proof: [slice 3 acceptance](source-review.md#slice-3-acceptance-evidence), G4/G5, strict full30807 terminal9e33e1 exit0.

Internal historical requests bypass live workspaces; outside Review carries that choice while ordinary card
Review stays live. Cross-mode and Active-to-Done state isolation, actual published/captured source/diff and
missing-history cases are proved. Detailed slices: `git show db8ca9099:.planning/slice-plans/550-keep-done-story-intent-pinned/PLAN.md`.
Retained run preference still needs the completed-result identity correction in slice 4; compatible proof stands.

### 4. Identify the completed result before choosing retained history

Type: Behavior
Status: done
Proof: G6; real earlier refinement and earlier execution captures precede a later CLI completion without a new
capture. Done Intent must show the actual published completion's original diff, locations/inventory/source and
outside-Review equality. Never lend it the earlier run's tree or missing-settings explanation.

Use published completion as the historical default. A saved launch's first publication is not necessarily its
Done result. Only fall back to a retained execution capture when it names this source/story/target, has the valid
canonical Done record absent at its base, and the full existing endpoint-recovery verdict (claim/agent/mode
evidence included) identifies that exact captured revision as completion. Unproved identity remains a historical gap; ordinary Review/explicit run
choices, including refinement, retain their existing meaning. No workflow-only or ancestry-only recognizer.

Expose the existing completion-recovery operation for trusted server-owned retained Git context, preserving its
algorithm and configured-project validation. Separate Intent's default-answer read from Review's explicit-run
selection, sharing existing query/read owners; an old automatic key cannot override a later default answer.
These are necessary changes within the existing Review/history read boundary, not a new store or UI workflow.
Full Intent exposed concurrent named-target fetches; share outstanding work and retain mutation ownership
through actual Git child closure. Existing read bounds remain; causal and consumer proof is in the sidecar.

Prove genuine fallback after later C makes configured history shallow while saved M stays recoverable: exact
completion derivation, original diff, locations/inventory/unchanged source and same outside Review. Observe
subsequent default reading after recovery/selection through existing supported actions; do not invent a healthy
comparison Retry control. Preserve active defaults, generic live Review, explicit refinement/run selection,
malformed-query refusal and independent CI/coverage. Reject M itself shallow: derived equality without
complete claim evidence cannot establish completion. Extend canonical fixtures with explicit installed-skill
location for the Codex native + CLI completion arrangement; omitted callers keep their current layout.

Retain one Behavior boundary: authoritative result selection and its fallback/default-state proof form one
cohesive loop. Completed slices/proof remain. No numeric exception or resplit is needed; safe stopping point is
the original story complete under one completed-result rule, followed by full affected Intent and traced gates.

## Consumer trace and verification gates

Original inspected production/test consumers remain in [source review](source-review.md#original-consumer-inspection).

For each implementation diff run the installed `consumer-trace.mjs` with `--base HEAD` and terms for the old
current-tree fallback, revision notice, Show latest, and changed helper exports. Follow listed helpers to
enclosing journeys; disposition each consumer as run, reused, or excluded with evidence. Use a single
sufficient suite run rather than repeating its covered cases.

Focused development checks for remaining slice 4:

- New completion-provenance/fallback journeys plus `intent-story-becomes-done.spec.ts`, both Review-mode cases,
  ordinary live/explicit-run Review and backend completion/refusal consumers selected by the actual trace.
- `npm run typecheck:dashboard`; coordinator `npm run format` and the check-only staged lint/typecheck hook.
- Final `npm run test:dashboard -- tests/intent --workers=1` (or supported prelaunch concurrency) and any
  additional unexcluded consumers; retained proof is reused only at unchanged boundaries.

**Local gate.** Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long runs in **caffeinate -s -i**. On battery,
plug in or keep the lid open under **caffeinate -i** and inspect the sleep log.
Before expensive proof inspect this host's load/memory and competing work and
choose supported concurrency without reducing coverage. Follow
[the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every failing/flaky test and published CI, including attribution to base,
preserving another active repair owner's work, and bounded human exceptions.
Use MakeMe for domain data, controlled clocks/events rather than sleeps, the
default timeout, and no test.slow() or suite/file/group/hook timeout overrides.

## Decisive premises and retained observations

Original preparation's real historical read, planning-only refresh and saved-coverage observations at
`c7e41e9e4abdd957e3b1117a1bba13d27749d1e6` remain in [source review](source-review.md#original-preparation-observations).
Accepted slice 1/2 proof remains valid for its retired-workspace and project-reading boundaries.

| Premise / consuming operation | Observation in this owned checkout | Result / remainder |
| --- | --- | --- |
| A readable retained Done workspace defeats historical Intent despite published history | At `fa740eda`, `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-retained-workspace-probe.spec.ts --workers=1`, strict default reporter, session71973 terminalb484ec exit0. Real CLI Trunk completion, retained launch/workspace, later trunk and MakeMe local test edit; scratch spec `/tmp/seed283-retained-workspace-probe.spec.ts`, all scratch edits reverted. AC load13.8, memory80%, one worker under sleep guard. | Ordinary Review returned `snapshot` and local diff; Done Intent also returned mutable `snapshot`, then showed no locations and its historical-source gap despite recoverable completion. This observed defect requires slice 3, not a new story. No product correction is proved yet. |

Slice 4 preparation at db8ca9099, owned checkout, 2026-11-09, strict default reporter, AC/one worker:

- `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-completion-provenance-probe.spec.ts --grep 'currently borrows an older refinement' --workers=1` passed82624/terminala6551f: real native refinement then real CLI completion without execution capture; actual Done response/tree and rendered source gap belong to older refinement despite completed settings/test bytes.
- The same file without grep in93808/cf4186 passed its other two whole tests: real saved common-.git repository, canonical Done at M/absent at base, existing deliveredCompletion derives exact M; later C shallow makes configured publishedStoryReview unavailable while actual captured HTTP answer and retained derivation still recover M. Aggregate exit1 was only the repaired browser fixture host-path mismatch, never claimed green.
- Scratch was removed/restored exactly before this rewrite. [Probe report](/tmp/seed283-completion-provenance-probe-report.md) retains literal operations, all failed prefixes/repairs, cleanup and boundaries. Cold two-launch setup timeout was replaced by equivalent real native-refinement + CLI completion; .claude/.agents fixture discovery and mistaken older-settings observation were repaired. No timeout/response fabrication or product edit; load22.05/free64%, competing owners preserved. Remedy/end-to-end shallow source proof belongs to slice 4.

## Story obligations

### G1. Observe the historical rename diff after later trunk changes
Reported: slice 1 — "Independent acceptance inspection found inventory/CI assertions for renamed Done files, but no observation of their original diff after later trunk changes or equality with Review changes."
Story clause: "Retain deleted and renamed story files and their original diffs, with the existing location-selection and outside-location explanation."
Disposition: proved by slice 1: intent-summary-story-comparison-renamed.spec.ts, original rename diff in both story-only states equals Review changes after a later trunk rename; focused nine-case terminal pass.

### G2. Observe available saved coverage when historical source is unavailable
Reported: slice 1 — "Coordinator inspection found that the shallow-history journey reads the coverage absence message, while saved-report tests have available historical source; neither observes an available saved report through the missing-history state."
Story clause: "Each evidence source remains independently useful when another is unavailable."
Disposition: proved by slice 1: intent-story-completed-source.spec.ts, shallow history keeps no historical browser and renders the exact saved report; default-reporter focused and refactor terminal passes.

### G3. Settle recurring owning-merge source and Proof failures
Reported: slice 1 — "The later one-worker full Intent run failed the owning-merge original-diff assertion while it was still reading and timed out the unchanged-file journey at Proof; a prior passing run does not settle these failures."
Story clause: "Its test browser uses the baseline-to-landed-result changes and the test-source locations, inventory, and unchanged-file source at landing."
Disposition: proved by slice 2: strict full Intent gate on fea15e65 plus restored label changes, session35088 terminal36296c exit0; repaired owning-merge diff, exact landed-source request and Proof observations all pass.


### G4. Keep readable retained Done workspaces historical in Intent
Reported: slice 3 — "Retrospective traced a catalogued Done story with a readable retained workspace to mutable snapshot comparison and unavailable historical source despite recoverable published completion or captured landing; a real Trunk completion browser probe confirmed the source gap."
Story clause: "Its test browser uses the baseline-to-landed-result changes and the test-source locations, inventory, and unchanged-file source at landing."
Disposition: proved by slice 3: retained-workspace, captured source/diff, held Review modes, shallow-history and fallback/refusal observations; post-refactor15567 and full Intent30807 terminal9e33e1 exit0.
### G5. Reset obsolete automatic run selection when selected Intent becomes Done
Reported: slice 3 — "Read-only implementation review traced Active-to-Done Intent for the same identity: an obsolete automatic retained-run selection survives historical mode change and masks the recovered published comparison with an unavailable explicit-run answer."
Story clause: "Use the Done story's published comparison and recorded evidence across CI comparison, Changed tests, and Intent coverage."
Disposition: proved by slice 3: intent-story-becomes-done.spec.ts observes actual published fallback shown as the same selected Done story, original diff and no obsolete explicit-run request; focused92754/refactor15567 and full30807 exit0.

### G6. Choose completed history rather than another retained run
Reported: slice 4 — "Retrospective traced generic retained-run preference to an earlier valid refinement or execution capture instead of the published Done result; a real browser probe confirmed the earlier refinement answer and wrong-source settings gap despite available completed history."
Story clause: "Its test browser uses the baseline-to-landed-result changes and the test-source locations, inventory, and unchanged-file source at landing."
Disposition: proved by slice 4: published completion outranks earlier refinement/execution, validated capture requires complete exact-Done evidence; source/diff, held mode/default state and refusal observations in completion-provenance-proof.md; shared-fetch repair and final full Intent30720/5a0087 exit0.

## Current decisions and preparation review

- G4/G5 remain proved; G6 owns authoritative completion selection, validated capture fallback and default state.
- Story source comes from its established published result; diff/CI retain distinct provenance. Project label follows accepted locations with existing update/failure/retry and independent reading scope.
- Missing history is an explained gap, never current source or empty changes; preserve active meanings/recovery.
