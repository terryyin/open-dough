# Keep admission coherent

## Source

**Identity:** SEED-028#admission-coherence

[Correction story](../../seeds/SEED-028-track-ad-hoc-work.md#admission-coherence).
A bounded retrospective correction of the completed execution of
`SEED-028#track-ad-hoc-work` under
its plan (recoverable at `41e65aa:.planning/quick/110-track-ad-hoc-work/PLAN.md`): claim `b55a409`,
attributable commits `4286761`, `6bd1ab3`, `bd38782`, `f17c877`, `91f054c` on
branch `claude/110-track-ad-hoc-work` (net diff `b55a409..91f054c`). That
story's promises stay as delivered; this correction adds no feature promise.
The retrospective authorized planning only; execution needs its own authority.

## Goal and scope

Developers coordinating admitted work see a Taken entry that links the plan
attached after admission, and maintainers can rely on admission's proof, tests
and guidance to describe the delivered behavior. One correction outcome, owned
by the findings below, each rechecked against `91f054c`.

### Current findings

- **F4A — attached plan never reaches Taken (regression).**
  `dough-product-backlog/SKILL.md` (File layout; Take queued work for execution)
  requires Taken planned stories, including on resume, to link their plan.
  A plan attached after admission is recorded only in the story state; ordinary
  continuation (`execution-source.mjs` `readPublishedExecutionSource`,
  `execution-start-source.mjs` `existingClaim`) returns `existing` and writes
  nothing, so the entry stays unlinked and `requireDistinctWork`'s
  plan-of-other check cannot see that plan. `takeEntry`'s resume already knows
  how to add only a missing plan link (`result: "linked"`), but no caller
  reaches it for this case. `workspace-publication-admission-continuation.test.mjs`
  asserts the receipt's `plan` but not the published entry.
- **F5 — admission reconciliation proof gap.** `execution-admission-source.mjs`
  has 63.8% branch coverage across the startup and admission suites (measured
  with `--experimental-test-coverage`, uncovered lines 105-108, 135-140, 153,
  162-163, 190-191, 211-212): replacing an already-published but unlisted
  story section after local fact recording; inserting a new story before an
  existing section; refusals for a plan edited differently on both sides, an
  identity mismatch, a home already listed under another identity, and a
  planless story given `--plan`.
- **F6 — test scope and overlap.** `closure-admitted-work.test.mjs` claims
  sibling preservation, but its fixture's `withoutStory` (and `rmSync`) removes
  the spent story, seed and plan itself, so that preservation is supplied by
  setup. The original slice 5 planned but dropped extending a native closure
  journey (no `tests/` change in `91f054c`), leaving wrap-up's changed judgment
  for an admitted no-change investigation without native evidence.
  `tests/support/product-backlog-correction-story.test.mjs` repeats take
  coverage: its take/resume steps repeat `product-backlog-take.test.mjs`
  "take moves queued work…" and "take on resume neither duplicates…", and its
  plan-homed case repeats "take claims a quick story and a correction…".
  `dashboard/tests/catalogProjectRecords.ts` lists a whole-document Taken home
  recording an anchored identity (`TAKEN-N#story`), a shape `add` now refuses.
- **F7 — stale or inconsistent guidance.** `dough-execute-plan/SKILL.md`
  (quick execution: progress and proof "in its story, when admitted") versus
  `references/wrap-up.md` ("in the conversation"); `dough-bug-fixing/SKILL.md`
  explained no-change "creates no execution workspace", wrong for an admitted
  investigation, whose admission created its owned workspace;
  `references/wrap-up.md` stale correction understanding names only the
  correction plan, while a new correction's Goal and Scope live in its story;
  the heading "Take queued work" (anchor `#take-queued-work`, linked from
  `admit-accepted-work.md`, `execution-location.md`, `oversized-slice.md`,
  `trunk-publication.md`, `preparation-disposition.md`,
  `preparation-workspace.md`) now also covers admission and continuation;
  `trunk-publication.md` "Publish a queue claim" likewise; and
  `execution-source.mjs`'s refusal "selected identity is not queued on fetched
  trunk" does not point unlisted accepted work to `--admit`.
- **F8 — duplicated, divergent preparation resolution (low impact).** The
  queued reader (`execution-source.mjs` `readPublishedExecutionSource`) and
  the admission reader (`execution-admission-source.mjs`
  `readAdmissionSource`) each resolve home, plan, `planTarget` and preparation.
  Their plan-target rules differ (`planHref !== entry.href` versus
  `planPath !== homePath` with `planIsCanonical`) and disagree for an anchored
  story whose declared plan is its own seed file. `regionOf` and `sectionOf`
  duplicate the "section or none" read. Admission's listing pre-checks
  re-implement `requireUnlistedWork`/`requireUnlistedHome`, which `admitEntry`
  applies again.

### Preserved promises and constraints

- One claim per work item: provenance stays the commit that moved the identity
  into Taken (`claimProvenance`); no second `Claim-Identity` commit, profile or
  story. Readiness is never recorded or implied by Take, resume, continuation
  or admission (`record-preparation.md#execution-and-resume`).
- Refused admission and refused continuation write nothing, create no
  workspace and keep every draft; stop statuses (`source-refused`,
  `source-conflict`, `conflict`) keep their meaning.
- Existing plan-homed corrections keep their identity and whole-document home.
- Installed copies under `.agents/skills/` and `.claude/skills/` are not
  hand-edited ([AGENTS.md](../../../AGENTS.md)). Skill text is written for the
  executing agent ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
- `dough-bug-fixing/SKILL.md` and `dough-story-wrap-up/SKILL.md` are at 250
  lines and `dough-execute-plan/SKILL.md` at 249: edits there must not grow
  them; move detail to references.
- Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one representation per fact, reuse cohesive owners) and
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) (native
  evidence or recorded justified reuse per affected tool). Keep
  [One admission path for accepted work](../../NORTH-STAR.md#one-admission-path-for-accepted-work)
  as the governing direction; this correction changes no ADR or topic.

### Excluded (pending human decisions or owned elsewhere)

Whole-seed readiness basis invalidating sibling stories (F1); continuation
ownership across sessions or publisher ID (F2); section-aware seed
reconciliation in the backlog domain (F9); `quick/` to `slice-plans/` fixture
renames and the `record-preparation.md` trunk conflict, owned by integration
at the reviewed story's wrap-up. Do not change these while executing this plan.

## Current decisions

- **F4A owner: preparation writes the link; continuation verifies it.** When
  `record-state` records `--approach planned --plan <p>` for an identity that
  its backlog (`--file`, default path) holds in **Taken** without a plan link,
  the same recorder write adds that link through `takeEntry`'s existing
  resume (`linked`), so the plan, story state and entry are published together
  by the preparation's ordinary keep. A Taken entry already linking a different
  plan is refused unchanged (takeEntry never repoints). Queued entries and
  unplanned approaches are untouched. Ordinary continuation stays write-free
  and now refuses (`source-refused`, nothing written) a published Taken
  planned story whose entry lacks the link its published preparation declares,
  naming the `record-state` remedy.
  Rationale: the backlog domain already owns the entry and the resume link;
  continuation publishing its own trunk commit would need a new publication
  from a story workspace that normally holds unpublished work, and would add a
  backlog-only commit outside the claim. Rejected alternative recorded here for
  review: continuation publishing a link-only commit through the claim
  publisher.
- **F8 plan-target rule:** a declared plan is the canonical home itself exactly
  when its project path equals the home path (`planIsCanonical`, no plan link);
  otherwise it is linked. Both readers use this one rule. It matches every
  existing case (whole-document plan-homed correction; anchored story with a
  separate plan). For an anchored story declaring its own seed file as its
  plan, queued startup now agrees with admission (canonical, no link) instead
  of linking the seed as a plan.
- **F8 listing checks:** admission keeps refusing listed work before any
  workspace exists, but by calling the backlog domain's `requireUnlistedWork`
  on fetched trunk's backlog and mapping its refusal to `source-refused`, not
  by a local re-implementation. The queued-work refusal keeps its "start it as
  queued work" guidance.
- **F7 wording:** admitted quick execution keeps its scope in its story and its
  progress and proof in the conversation; wrap-up and execute-plan say the same.
  Rename the execute-plan heading to "Take or admit work" (anchor
  `#take-or-admit-work`) and "Publish a queue claim" to "Publish a claim",
  updating every link and the wording test that asserts the old heading. The
  claim commit subject "Take queued work:" is data, not guidance, and stays.

## Outside-in proof and verification

Reuse the real-Git CLI fixtures with local bare remotes
(`workspace-publication-admission-fixtures.mjs`,
`workspace-publication-fixtures.mjs`), the real backlog CLI
(`tests/support/`), the closure fixtures, the dashboard published-origin
fixture, and the existing native publication harness. No production remote,
new storage, or new test framework. Do not widen module exports for tests.

Focused suites (existing unless marked):

- Startup and admission:
  `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission*.test.mjs`
- Admission branch coverage (measurement, not a gate threshold): the same
  command with
  `--experimental-test-coverage --test-coverage-include='**/execution-admission-source.mjs'`
  (baseline 63.83% branches).
- Backlog and story state: `node --test tests/support/*.test.mjs`
- Wrap-up: `node --test src/skills/dough-story-wrap-up/scripts/*.test.mjs`
- Guidance wording: `node --test src/skills/dough-execute-plan/scripts/*guidance*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`
- Dashboard: `npm run test:dashboard -- dashboard/tests/authenticated-project-overview.spec.ts dashboard/tests/taken-agent-profile.spec.ts`
- Native harness default (substitute) mode: `/opt/homebrew/bin/bash tests/git-publication-native.sh`

Run shell checks with a modern bash (`/opt/homebrew/bin/bash`); macOS system
bash masks `set -e` assertion failures. Each slice runs its focused commands
after edits and independent post-change refactoring, plus `git diff --check`.
Keep ordinary delivery, CI observation, retrospective and wrap-up gates.

## Ordered slices

### 1. Prove every admission reconciliation and refusal path
Type: Structure
Status: done
Accepted proof: startup and admission suite, 61 pass; coverage of
`execution-admission-source.mjs` lines 100%, branches 73.17% (from 63.83%).
Reconciliation cases live in `workspace-publication-admission-sections.test.mjs`
(split from the admission test for size); refusal rows (another identity,
listed under another identity, planless with `--plan`, plan edited on both
sides, new section before a trunk-absent section) in the refusal table. No
product defect found. Still-untaken branches include line 220's
`planIsCanonical` (plan-homed whole-document admission), relevant to slice 2.
Proof: new cases in `workspace-publication-admission.test.mjs` and the table
in `workspace-publication-admission-refusal.test.mjs`; startup and admission
suite green; coverage measurement shows lines 105-108, 135-140, 153, 162-163,
190-191 and 211-212 exercised.

Structure: removes the F5 test-suite weakness; product behavior unchanged.
Through the real startup CLI only:

- A story section already on trunk but unlisted, with facts recorded locally
  since, is admitted by replacing that section; sibling sections keep trunk's
  text (lines 135-140).
- A new story drafted before an existing section is inserted before that
  section on trunk (lines 105-108).
- Refusal rows, each asserting the stop status, message, unchanged remote tip,
  no workspace and intact drafts: plan edited differently on trunk and in the
  draft (`source-conflict`); home naming another identity; home already listed
  under another identity; a planless story started with `--plan`
  (`source-refused`).

If a case exposes a defect, stop and record it as a learning; fixing it is
outside this slice unless it is one of the listed findings.

Safe stop: admission behavior is fully characterized before slice 2 moves it.

### 2. Resolve published and admitted preparation through one reader
Type: Structure
Status: planned
Proof: startup and admission suite, including slice 1's cases and the legacy
plan-homed correction startup case, green and unchanged in assertions; one new
startup source case in `workspace-publication-startup-source-cases.mjs` for an
anchored story declaring its own seed as its plan, started queued and admitted,
reaching the same `plan` receipt (none).

Structure: removes F8's duplicated, divergent rules. One execute-plan startup
helper resolves home path, declared plan path, `planTarget` (the rule in
Current decisions) and preparation for both readers; one "section or none"
read replaces `regionOf`/`sectionOf`; admission's listing pre-check calls
`requireUnlistedWork`. Keep refusal statuses and messages the tests assert.
Stay within execute-plan startup modules; no backlog-domain behavior change.

Safe stop: identical externally observed startup and admission behavior, with
one resolution slice 3 can rely on.

### 3. Link a plan attached after admission to its Taken entry
Type: Behavior
Status: planned
Proof: extend `workspace-publication-admission-continuation.test.mjs`: after
the ready planned preparation is published through the real `record-state`,
remote trunk's Taken entry is `… ([plan](quick/N/PLAN.md))`, the entry stays in
place, provenance and `Claim-Identity` count are unchanged, and continuation
returns `existing` with the claim sha. Countercase in the same file: a
published Taken planned story without the link is refused by continuation
(`source-refused`, tip unchanged). Extend the record-state CLI owners
`tests/support/story-state.test.mjs` and `story-state-refusals.test.mjs` for:
Taken entry gains the link;
queued entry and planless/unselected records leave the backlog unchanged; a
Taken entry linking another plan is refused with home and backlog unchanged.
Run the startup and admission suite and `node --test tests/support/*.test.mjs`.

Behavior: an admitted story is Taken with approach unselected → preparation
records the planned approach with `record-state` and publishes it → trunk's
Taken entry links the plan, and ordinary continuation continues the one claim
without writing.

Update `record-preparation.md` (slice-planning row), the product-backlog
SKILL's Take section only if its wording must change (keep it no longer), and
`admit-accepted-work.md`'s continuation paragraph to state that the recorder
links the Taken entry and continuation refuses a missing link.

Safe stop: the Taken invariant holds for attached plans; existing admission,
queued take and plan-homed behavior unchanged.

### 4. Scope closure and correction-story tests to what they prove
Type: Structure
Status: done
Accepted proof: `node --test src/skills/dough-story-wrap-up/scripts/*.test.mjs`
(14 pass), `node --test tests/support/*.test.mjs` (180 pass), dashboard
overview and taken-profile specs (4 pass). Closure tests now assert only the
real `complete` CLI and closure publication; seed/plan deletions are the
fixture's scripted stand-in. Take/resume steps removed from the correction
story test are owned by `product-backlog-take.test.mjs`; its plan-as-work
refusal now runs against an already-taken backlog. The dashboard Taken fixture
is a plan-homed correction that `add` accepts.
Proof: `node --test src/skills/dough-story-wrap-up/scripts/*.test.mjs`,
`node --test tests/support/*.test.mjs`, and the dashboard command above green;
removed assertions each name their surviving owner in the commit message.

Structure: removes F6's test-suite weaknesses without changing product code.
Rename and re-scope `closure-admitted-work.test.mjs` tests (and fixture
comments) to what product code proves — real admission output, `complete`
removing the entry, published closure retaining another agent's claim,
profile, plan and trunk advances, idempotent repeat — and stop claiming
sibling preservation the fixture's `withoutStory`/`rmSync` supplies. In
`product-backlog-correction-story.test.mjs`, drop the take/resume steps and
the plan-homed take step already owned by `product-backlog-take.test.mjs`,
keeping the correction-specific assertions (story is the one entry, plan never
listed as work, plan keeps identity and evidence). Make
`catalogProjectRecords.ts`'s Taken fixture a shape `add` accepts (a
plan-homed correction recording its own plan-path identity, or an anchored
seed story), keeping what the overview spec asserts.

Safe stop: the suites prove the same promises with less duplication.

### 5. Show wrap-up closing an admitted no-change investigation natively
Type: Structure
Status: done
Accepted proof: default substitute mode passes, with the closure assessor
rejecting nine crafted overrides and the keep-seed and stale-force substitute
journeys. Fresh native Claude run (Claude Code 2.1.283, candidate `c700a61`
plus the harness) passed: wrap-up deleted seed N, ran `complete` (Taken entry
and profile removed), rebased onto the other agent's advance, pushed without
force; trunk diff only the backlog line, the profile and the seed. ADR 0005:
Claude has native evidence; Codex and Cursor are recorded as justified reuse
of the same wrap-up, trunk-publication and backlog `complete` sources, with
the credential-free substitute covering the runner and assessor for their
stream shapes; no live Codex or Cursor run exists.
Proof: new `publication/admission-closure` case in the existing admission
native harness (`tests/support/git-publication-native-admission*.sh`,
`git-publication-native-admission-observe.mjs`), with a substitute journey and
assessor counterexamples in default mode:
`/opt/homebrew/bin/bash tests/git-publication-native.sh`; then one fresh native
run, `/opt/homebrew/bin/bash tests/git-publication-native.sh --native claude --case publication/admission-closure`,
assessed on actual behavior: from an admitted unselected investigation with an
evidenced no-change conclusion, wrap-up publishes closure that removes the
Taken entry, profile and spent story (its whole new seed), makes no product
change, and leaves other trunk content.

Structure: removes the dropped native closure evidence from the original slice
5 (F6); wrap-up behavior is not changed by this slice. If the native run
contradicts the guidance, stop and record the evidence for a separate
decision. Record other hosts as reuse or explicit gaps under ADR 0005.

Safe stop: admitted no-change closure has native evidence or a recorded gap.

### 6. Make admission guidance and naming agree
Type: Behavior
Status: planned
Proof: guidance wording command above (updating the heading assertion in
`execution-increment-delivery.test.mjs`), the payload link check
`/opt/homebrew/bin/bash tests/payload-declaration-links.sh`, a new assertion of
the unlisted-identity refusal message in
`workspace-publication-startup-source-cases.mjs`,
and a behavior review (invocation, required context, useful outcome) for each
changed skill with one representative walk: an admitted bug investigation
ending no-change, and a correction whose story Goal went stale.

Behavior: an agent following execute-plan, bug fixing or wrap-up for admitted
work → reads one consistent account of where quick progress lives, what an
admitted no-change investigation already has, and what stale correction
understanding names → and a start for unlisted work is told to use `--admit`.

Apply the F7 wording decisions: align execute-plan SKILL and
`references/wrap-up.md`; correct bug fixing's explained no-change sentence;
make stale correction understanding identify the correction story's Goal or
Scope in its seed or the plan field (plan-homed corrections: the plan); rename
the two headings and update every link; change the unlisted-identity refusal
to name `--admit`. Keep the three SKILL.md files at or below their current
line counts.

Safe stop: guidance matches delivered behavior; installed copies still await a
released payload.

## Promise coverage

| Finding | Owner / decisive observation |
| --- | --- |
| F4A | 3: remote Taken entry links the attached plan; one claim; continuation refuses a missing link |
| F5 | 1: CLI cases for each listed path; coverage measurement |
| F6 | 4: re-scoped and deduplicated suites, accepted dashboard fixture; 5: native admitted no-change closure |
| F7 | 6: wording tests, link check, refusal message, behavior review |
| F8 | 2: one resolution, unchanged suite assertions, new edge case agreement |

## Plan review

Six slices, one proof loop each. Proof (1) precedes the refactor (2) it
protects, which precedes the behavior (3) that reads its single resolution.
Test-suite scope (4) and native evidence (5) are independent proof loops.
Guidance (6) comes last so it describes slice 3's delivered behavior. No
numeric slice target was supplied; size is judged by one coherent change with
focused proof. No speculative Structure, new publication path or lifecycle is
added.

## Learnings

Execution context: Story Branch Mode, workspace
`.worktrees/113-admission-coherence`, branch `claude/113-admission-coherence`;
claim `5a05150` accepted on `origin/main`.

- Slice 5 native run: the closure commit carried `Claim-Identity` and
  `Claim-Publisher` trailers, so trunk holds a second commit naming that
  identity as a claim. Provenance still reads the commit that moved the
  identity into Taken, but guidance may invite claim trailers on closure
  commits. Left for the retrospective; no guidance changed.
- Native admission fixtures install skills only in the originating checkout,
  so managed delivery in the execution worktree refuses ("CI runtime is
  missing") and native agents fall back to plain Git publication. Harness
  limitation, not product behavior.
- CI on `733fe46` failed at checkout on every job: `1b66466` (already on
  trunk) committed three local worktrees as gitlinks. Repaired in `56ae2aa`
  by removing them and ignoring `/.worktrees/`; trunk stays red until this
  branch integrates.
