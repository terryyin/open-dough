# Check every Story Branch source for freshness without false stops

**Identity:** SEED-010#source-freshness-for-planless-and-reamended-work
**Source:** [Correction story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#source-freshness-for-planless-and-reamended-work)
**Provenance:** retrospective of SEED-010#refresh-human-amendments-before-completion
(plan 355, recoverable at
`a7a31a704c67bb36c9b77f1919ac63b77fcc445e:.planning/slice-plans/355-refresh-human-amendments-before-completion/PLAN.md`
with its story at `a7a31a704c67bb36c9b77f1919ac63b77fcc445e:.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#refresh-human-amendments-before-completion`),
reviewed commits `7be59004..ea8fa390` on
`claude/keep-human-amendments-visible-before-story-branc`: attributable
`7fb2bf98`, `8582e559`, `d92d301d`, `2b46202c`, `ea8fa390`; CI repairs
`aa926ce8`, `8d98af81`.

## Goal and scope

A Story Branch coordinator executing a quick story, a plan-homed correction
or context-only work passes the source-freshness gates with the right
comparison instead of stopping on an uncorrectable refusal, and a later trunk
amendment to text already absorbed reads as an amendment rather than a
conflict, with a route back to `unchanged` after the developer decides a
genuine conflict.

Included: the two findings below, in
`src/skills/dough-execute-plan/scripts/source-freshness*.mjs`,
`src/skills/dough-execute-plan/references/source-freshness.md` and the
deletion gate in `src/skills/dough-story-wrap-up/SKILL.md`, with their
credential-free tests.

Excluded: the original story's deferred promises stand (Trunk Mode,
unpublished amendments, other records, notification, semantic drift
detection, release or rollout); the remaining untested refusals
(`fetch-failed`, `trunk-absent`, `no-common-base`, `invalid-source-link`)
beyond the ones this correction touches; a recorded or retained base SHA; new
native rounds (see Current decisions).

Assumptions: the original story's, unchanged — the story section is
addressable by its anchor and the plan by the Taken entry's link; this
correction reads "the plan" as the Taken entry's plan link when there is one
and as the home itself when the home is a plan, and compares no plan when
neither exists. When a plan created during execution (a quick attempt
continued into planned work) is linked only on the branch, trunk never had it
to amend, so the source on trunk is the story section alone; when its link
reached trunk, it is the ordinary linked case.

## Current findings (verified at `ea8fa390`)

1. **The gates stop legitimate Story Branch work (high).**
   `source-freshness.mjs` `inspectSourceFreshness` refuses `no-plan-link`
   (exit 3) when the Taken entry on fetched trunk has no plan link. By design
   a quick story and a plan-homed correction are Taken with none
   (`product-backlog-take.mjs` `resolvePlan` comment; `execution-source.mjs`
   `selectedPreparation`: "a Taken entry never links" a canonical plan).
   Context-only planless work has no Taken entry, so the command answers
   `not-taken`. The gates are unconditional "In Story Branch Mode":
   `wrap-up.md` step 5 (every planned slice, including a plan-homed
   correction's), `finish-or-stop.md` Record execution completion (planned
   completion, same), and `dough-story-wrap-up/SKILL.md` Delete spent history
   (all closed work: quick, admitted, plan-homed, context-only).
   `source-freshness.md` says a refusal "accepts no boundary: correct the input
   … or stop under human judgment"; nothing is correctable, so these
   executions stop at the gate. `no-plan-link` has no test.
2. **A second amendment to absorbed text reads as a false conflict (medium).**
   The base is always `merge-base` (the Take). After an earlier amendment is
   absorbed, a second trunk amendment that appends after or rewords the
   absorbed lines overlaps the branch copy's difference from the Take, so
   `git merge-file` conflicts and the record reports `conflict`
   (`overlapping-edit`) although the branch never authored those lines. The
   reference's "Stop on a conflict" forbids resolving and says only "rerun
   `check`" after the developer decides, with no way for that decision to
   reach `unchanged` other than trunk alone changing. Plan 355's Learnings
   acknowledge it.

## Preserved promises and constraints

From the original story: never overwrite either copy silently (`absorb`
writes only clean applications and refuses a conflict, writing nothing);
write nothing to trunk; compare only the selected story section and the
active plan; conflicts are decided by a person; the done-slice rule (a trunk
change to a slice the branch marks done is a conflict); no second authority
store and no retained SHA; the default checkout is untouched; Trunk Mode is
excluded; exit codes 0/1/2/3 and the one-line JSON result keep their meaning;
the gates stay at the same three boundaries and before the obligations check,
the completion check and the deletion list.

## Preparation observations and decisive premises

Observed in this workspace on 2026-10-25 (Darwin arm64, `ea8fa390`, Node
24.21.0 per `.node-version`), with a scratch `node --test` file under
`/tmp/claude-scratch-357/` importing `source-freshness-test-fixtures.mjs`;
the workspace holds no scratch edit.

1. **Planless and plan-homed Taken work is refused.** In `takenStoryBranch`
   fixtures whose trunk backlog then held the Taken entry without a plan link
   (`[The story](seeds/SEED-900-freshness.md#story) — SEED-900#story`) and
   with a plan-homed link (`[Correction](slice-plans/001-story/PLAN.md) —
   SEED-900#story`), `check` exited 3 with
   `{"result":"refused","reason":"no-plan-link",…}` in both. Finding 1
   reproduced at the consuming operation.
2. **A plan-homed home is distinguishable from a seed story.**
   `readPlanSlices` on this repository's SEED-010 seed returned
   `uninterpretable` and on plan 355 `interpreted`; `sectionOf` with an
   anchorless href returns the whole document (`regionFor` with an empty
   anchor spans every line). Slice 1's plan-homed rule rests on these.
3. **The second amendment conflicts today and applies from the absorbed
   revision.** Same fixtures: trunk added "Promise two" to the story, the
   branch ran `absorb` and committed, then trunk (a) appended "Promise three"
   after it and (b) reworded it; for the plan, trunk added slice 3, the branch
   absorbed and committed, then trunk changed slice 3's Behavior line. All
   three `check` runs exited 2 with `overlapping-edit`. `git merge-file -p`
   of the same branch copy and trunk text with the first amendment's
   revision as base exited 0 in all three, and the plan application kept
   `Status: done` for slice 1 and carried "does C better.". Finding 2
   reproduced, and slice 2's base rule observed to discriminate.
4. **Context-only work has no Taken entry.** The existing test "work not
   Taken on fetched trunk or at the branch's base is refused" shows
   `not-taken` (exit 3); guidance scoping, not the command, decides whether
   the gate runs for such work.
5. **The conflict replay stays a conflict under slice 2's rule.** The
   `delivery-evidence/amended` `conflict` scenario rewrites a done slice in a
   single trunk revision after the Take; no trunk revision between the Take
   and trunk is contained in the branch copy, so the base stays the Take.
   Settled by the rule's construction; `tests/delivery-evidence-amended.sh`
   reruns it in slice 2.

No paid premise remains.

## Outside-in proof ownership

| Finding / promise | Owner | Observable result |
| --- | --- | --- |
| 1: quick story compares its section alone | 1 | `source-freshness.test.mjs`: a Taken entry without a plan link, trunk amends the story section → `amended` with only the story record, `absorb` writes only the seed; an untouched section → `unchanged` (exit 0); no `no-plan-link` refusal remains |
| 1: plan-homed correction compares its plan | 1 | Same file: a plan-homed Taken entry, trunk adds a slice → one `plan`-kind home record `amended` and absorbed; trunk rewrites a slice the branch marks done → `conflict` `done-slice`; origin trunk SHA unchanged |
| 1: a removed record still refuses | 1 | Same file: a linked plan present at the Take and removed on trunk still refuses `record-absent` |
| 1: gates fit the work | 1 | `source-freshness-guidance.test.mjs`: wrap-up's deletion gate names work with a Taken entry; the reference names the planless and plan-homed comparisons; existing gate-order tests stay green |
| 2: second amendment over an absorbed one | 2 | `source-freshness.test.mjs`: append-after and reword of an absorbed story line, and a change to an absorbed plan slice, → `amended`, `absorb`, rerun `unchanged`; the record names the revision it compared from |
| 2: route after a human decision | 2 | Same file: after a done-slice conflict, writing trunk's text into the branch copy as the developer decided (slice reopened, or kept done with trunk's text) → `unchanged`; the developer reverting trunk's change → `unchanged`; `source-freshness-guidance.test.mjs` pins the reference's after-decision route in Stop on a conflict |
| Preserved conflict and replay | 2 | Existing conflict cases unchanged; `tests/delivery-evidence-amended.sh` green |

Each slice runs its focused checks through
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh <paths>` (DD-330: env
and quiet-pass rule) and `tests/payload-declaration-links.sh` when declared
files or links change (`install.sh` `managed_files` declares a new script).
No whole-suite local gate is added; CI runs after publication.

## Ordered slices

### 1. The freshness gates check quick, plan-homed and context-only work instead of refusing it
Type: Behavior
Status: done
Proof: `src/skills/dough-execute-plan/scripts/source-freshness.test.mjs` quick-story and plan-homed cases and the kept `record-absent` refusal through `scripts/test.sh`; `source-freshness-guidance.test.mjs` with the deletion-gate scope and reference terms; `story-obligations-guidance.test.mjs`, `execution-completion-record-guidance.test.mjs`, `planned-completion-guidance.test.mjs` and `tests/payload-declaration-links.sh` green.

Behavior: Given a Story Branch workspace whose fetched trunk lists the
identity as Taken, when the coordinator runs `check` or `absorb` at a gate:
with a plan link, the comparison is today's (section and linked plan); with
none, the home is the only record — compared as the whole plan document with
the done rule when that document reads as a plan (`readPlanSlices`
`interpreted`; a plan-homed correction), otherwise as the selected story
section alone (a quick story, or one continued into planned work whose plan
link is only on the branch); a linked plan present at the
Take and absent on trunk still refuses `record-absent`. The `no-plan-link`
refusal is deleted. Guidance: `source-freshness.md` Run the check describes
the record set for each source and drops the missing-plan-link refusal
example; `dough-story-wrap-up/SKILL.md` Delete spent history runs the check
for selected work with a Taken entry (context-only work, having none, has
no story section or plan to compare). The delivery and completion gates keep
their text, since plan-homed corrections now pass them. Edit `src/skills/`
only; declare any new script in `install.sh`.

Accepted: `source-freshness.test.mjs` "a quick story's Taken entry without a
plan link compares its story section alone", "a plan-homed correction compares
its home as the plan, absorbing an added slice", "a plan-homed correction's done
slice rewritten on trunk is a conflict" and "a linked plan present at the Take
and removed on trunk is refused"; `source-freshness-guidance.test.mjs` "wrap-up
checks freshness before deleting spent history" and "the reference names the
records each source compares"; the gate-order guidance tests,
`read-budget-guidance.test.mjs`, `tests/payload-declaration-links.sh` and
`tests/delivery-evidence-amended.sh` green through `scripts/test.sh`.
Learning for slice 2: `read-budget-guidance.test.mjs` counts all of
`source-freshness.md` toward the "Before finishing or stopping" row (30000
bytes), now within about 10 bytes of the limit, so slice 2's guidance must free
bytes in that row or tighten the reference as it adds the base and the
after-decision route.

### 2. A later amendment over an absorbed one applies, and a decided conflict returns to unchanged
Type: Behavior
Status: done
Proof: `source-freshness.test.mjs` second-amendment cases for the story section and the plan, and the after-decision cases, through `scripts/test.sh`; existing conflict and amended cases unchanged; `source-freshness-guidance.test.mjs` pins the after-decision route; `tests/delivery-evidence-amended.sh` and `tests/payload-declaration-links.sh` green.

Behavior: Given a branch copy that already absorbed an earlier trunk
amendment, when trunk amends that record again and the coordinator runs
`check`, each record is compared from the newest trunk revision since the
Take (walking `git rev-list <take>..<trunk> -- <path>` newest first, the
Take last) whose record text the branch copy already contains (its clean
three-way application over the branch copy equals the branch copy); trunk's
newer change then applies as `amended`, and `absorb` and a rerun reach
`unchanged`. The record names the revision it compared from. A change that
overlaps the branch's own edits, or a done slice changed or removed, stays a
`conflict`. Guidance: `source-freshness.md` describes the base and, in Stop
on a conflict, the route after the developer's decision — when the decision
keeps trunk's text, write that text into the branch copy as part of the
increment (reopening a done slice under plan refinement when the decision
reopens it); when it keeps the branch's text, the developer changes trunk;
then rerun `check` from the stopped boundary and continue only on
`unchanged`. The coordinator still resolves nothing without that decision and
writes nothing to trunk. Edit `src/skills/` only.

Accepted: `source-freshness.test.mjs` "a trunk amendment that appends after an
absorbed story promise applies from the absorbed revision", "…that rewords…",
"a trunk change to an absorbed plan slice applies from the absorbed revision,
keeping the branch's done slices", "a done-slice conflict whose decision keeps
the done slice with trunk's text, written into the branch copy, is unchanged",
"…reopens the done slice…" and "a done-slice conflict whose decision reverts
trunk's change on trunk is unchanged", with the existing conflict cases
unedited; `source-freshness-guidance.test.mjs` "the reference names each
record's base and the route after a conflict decision";
`read-budget-guidance.test.mjs`, `tests/delivery-evidence-amended.sh` and
`tests/payload-declaration-links.sh` green. A baseline at `cc6d3979` failed the
second-amendment tests and passed the after-decision ones apart from `from`:
the after-decision route already reached `unchanged`, so its change is the
guidance and its regression proof.

## Current decisions

- The rule for a source without a plan link is decided here, within the
  original assumption, and needs no human decision: the plan is the Taken
  entry's link or, for a plan-homed correction, the home itself; a quick story
  has only its section; context-only work, never Taken, is outside the
  deletion gate because it has neither record to delete.
- Plan-homed detection reads the home document with `readPlanSlices`, not the
  link's anchor or a recorded approach, so a legacy plan-homed correction
  without a story-state block is detected too.
- The base per record is the newest contained trunk revision, computed from
  Git at each run; nothing is stored. The overall `base` field keeps naming
  the Take.
- Writing a developer-decided text into the branch copy applies a human
  decision, which the "conflicts are decided by a person" constraint permits;
  `absorb` itself never writes a conflict.
- No native rounds: the gate positions, prompts and agent-facing results are
  unchanged for the replayed shapes; the change turns a refusal or false
  conflict into an existing `unchanged`/`amended` result the replay family
  already covers natively. The after-decision route needs a developer's
  decision mid-run, which the controlled family does not model; this is a
  stated limit, not a claim.
- Guidance edits in `src/skills/` only; installed copies are not
  hand-synchronized (AGENTS.md).

## Plan concern review

Slice-plan refinement was not needed: slice 1 owns the record set per source
(command, deletion-gate scope and reference) and slice 2 owns the comparison
base and the after-decision route; each is one proof loop on the same test
file and neither depends on the other's result. This review identified no
remaining slice-specific concern.

## Story obligations

### G1. A plan linked only on the branch is not exercised directly
Reported: slice 1 — "A quick attempt continued into planned work, with its plan linked only on the branch, is not exercised directly."
Story clause: "passes the source-freshness gates with the right comparison instead of stopping on an uncorrectable refusal"
Disposition: proved by slice 1: `source-freshness.mjs` reads the Taken entry only on fetched trunk (`takenEntry(repository, trunkRevision, …)`), where a branch-only plan link is absent, so the command takes the same no-plan-link path that `source-freshness.test.mjs` "a quick story's Taken entry without a plan link compares its story section alone" observes (`unchanged`, then `amended` writing only the seed, rerun `unchanged`)

### G2. A plan-homed home absent at the Take is untested
Reported: slice 1 — "Plan-homed detection reads only the Take's home text, and there is no test where that text is absent at the Take."
Story clause: "passes the source-freshness gates with the right comparison instead of stopping on an uncorrectable refusal"
Disposition: no user cost "passes the source-freshness gates with the right comparison": the Take commit is the published claim whose start checks the published selected source, so the linked home exists at the Take; were it absent, the section path's `absent("story", …)` refuses `record-absent`, which is a true absent record rather than a false stop

### G3. Work without a Taken entry is scoped by guidance only
Reported: slice 1 — "Context-only scoping is guidance only; the existing `not-taken` refusal test stands unchanged."
Story clause: "A Story Branch coordinator executing a quick story, a plan-homed correction or context-only work passes the source-freshness gates"
Disposition: proved by slice 1: in Story Branch Mode context-only work is admitted with a Taken entry (`references/admit-accepted-work.md`) and takes the quick-story path observed in `source-freshness.test.mjs`; work without one is outside the Story Branch delivery and completion gates' claim and is excluded from the deletion gate, pinned in `source-freshness-guidance.test.mjs` "wrap-up checks freshness before deleting spent history" (`for selected work with a **Taken** entry`, `or for work without a Taken entry, delete:`)

### G4. No native agent run
Reported: slice 1 — "No native agent run, consistent with the plan's Current decisions."
Story clause: "passes the source-freshness gates with the right comparison"
Disposition: no user cost "passes the source-freshness gates with the right comparison": gate positions, prompts and result shapes are unchanged; the refusal becomes an existing `unchanged`/`amended`/`conflict` result, observed at the command's CLI boundary in `source-freshness.test.mjs`, and `tests/delivery-evidence-amended.sh` stays green

### G5. The after-decision route has no native observation
Reported: slice 2 — "No native agent run, per the plan's decision. The after-decision route is proved only at the command boundary; the controlled replay does not model a developer deciding mid-run."
Story clause: "with a route back to `unchanged` after the developer decides a genuine conflict"
Disposition: proved by slice 2: the route ends at the command, whose result the coordinator acts on; `source-freshness.test.mjs` "a done-slice conflict whose decision keeps the done slice with trunk's text, written into the branch copy, is unchanged", "…reopens the done slice with trunk's text…" and "a done-slice conflict whose decision reverts trunk's change on trunk is unchanged" observe `conflict` then `unchanged` (exit 0), and `source-freshness-guidance.test.mjs` "the reference names each record's base and the route after a conflict decision" pins the coordinator's instruction in Stop on a conflict

### G6. A record absent at an intermediate trunk revision is untested
Reported: slice 2 — "No test covers a record absent at an intermediate trunk revision. Such revisions are skipped by construction."
Story clause: "a later trunk amendment to text already absorbed reads as an amendment rather than a conflict"
Disposition: no user cost "a later trunk amendment to text already absorbed reads as an amendment rather than a conflict": `fromContainedBase` in `source-freshness.mjs` skips a revision whose record text is absent, so the walk continues to an older contained revision or the Take; the record's absence on trunk itself still refuses `record-absent` before comparison, and a skipped revision can only select an older base, which yields the Take's existing result rather than a silent write

### G7. Merge commits in the trunk walk are untested
Reported: slice 2 — "No test covers a merge commit touching the path inside `take..trunk`; `rev-list` history simplification applies there."
Story clause: "a later trunk amendment to text already absorbed reads as an amendment rather than a conflict"
Disposition: no user cost "a later trunk amendment to text already absorbed reads as an amendment rather than a conflict": `git rev-list <take>..<trunk> -- <path>` follows, through history simplification, the merge parent whose text of the path the merge kept, so an amendment whose text reached trunk is listed on whichever side it was authored; a revision the walk omits can only select an older base, giving the Take's existing `conflict` with a stop for the developer, never an overwrite (`absorb` still writes only clean applications)

### G8. The walk's cost is unmeasured
Reported: slice 2 — "Each run now does one extra merge per trunk revision of the record since the Take, until a contained one is found. I did not measure the cost, but it should be small for typical histories."
Story clause: "passes the source-freshness gates with the right comparison"
Disposition: no user cost "passes the source-freshness gates with the right comparison": the walk visits only trunk commits that changed the record's own path since the Take and stops at the first contained one; the whole `source-freshness.test.mjs` file, which runs it in every case, stays within the focused runner's quiet pass
