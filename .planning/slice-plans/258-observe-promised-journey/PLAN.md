# Observe decisive planning premises through the full promised journey

**Identity:** SEED-108#observe-promised-journey
**Source:** [story](../../seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey)
in SEED-108, selected follow-up for ODF-074, ODF-110, and ODF-190.
**Prepared:** 2026-10-06. Planning only, in the story's established workspace
(branch `claude/observe-decisive-planning-premises-through-the-f`, agent
ruuf-chan).

## Goal and boundaries

Slice planning calls a decisive behavior or proof-route premise settled only
when its recorded observation reached the promised operation in the checkout
the plan names and recorded that operation's result, and the shared readiness
judgment treats anything less as a specific missing observation. The story's
five key examples are the evaluation: examples 1, 2, 3, and 5 each change the
plan on decisive evidence or retain a specific missing observation with its
decision owner; example 4 proceeds to `ready`.

Included scope: the planning observation rule in
`src/skills/dough-slice-planning/SKILL.md` “Write the plan”; the readiness
criteria in `src/skills/dough-product-backlog/references/record-preparation.md`
“Assess readiness at preparation completion”; the response records on the
three findings in `docs/maintainer/finding-names.md` and the Open Dough
entries in `DearDough.md`.

Material exclusions (from the story): which tests an implementer runs inside
a slice (ODF-150, delivered by SEED-095), CI-observer transport, concurrency
scheduling, product implementation fixes anywhere, a mechanical recorder check
of observation results, and reassessing plans already recorded `ready`.
Also outside this repository: the Pygardon and Doughnut `DearDough.md` entries
that cite the same findings; the catalog links to them stay as they are.

Assumptions: the installed copies under `.agents/skills/` and
`.claude/skills/` are not hand-synchronized (AGENTS.md); the first containing
release is pending until a later `release-version`, so the records say so.

## Direction and PFE

- **Revise in place, one source each.** The observation rule already lives in
  one place, slice planning's “Write the plan” (`src/skills/dough-slice-planning/SKILL.md`
  lines 118–162), and the readiness rule in one place,
  `record-preparation.md` “Criteria” (lines 70–93). Story refinement's
  Flawless outcome and slice-plan refinement reuse both by link
  (`dough-story-refinement/SKILL.md` line 88; `dough-slice-plan-refinement/SKILL.md`
  lines 50 and 109), so they need no edit. No second copy, reference file, or
  checklist is added.
- **Keep the existing grammar.** The current text already has “decisive
  premise”, “the operation that consumes its result”, “the literal observation
  that reaches it”, “presence, not settling”, and the probe-slice rule. The
  change sharpens what settles (the operation's recorded result), adds the
  three premise kinds' observations (consumer from effect, proof by
  discrimination, route by executing its unpaid prefix in the named checkout),
  and replaces the moved-function paragraph (lines 140–152), whose reading-only
  settlement is example 4's presence case, with the result-based rule.
- **Executing-agent audience** ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)):
  the guidance names the planning agent's workspace as “the preparation's owned
  workspace” and the checkout the plan names; it does not mention findings,
  releases, or this repository.
- **Consumer vocabulary** stays aligned with execution's
  [accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md)
  (“consumers”, “unaffected-suite or unused-consumer exclusion”), which owns
  implementation-time proof selection and is untouched.
- **Finding records** follow the catalog's own delivered-unreleased form
  (ODF-107 at `finding-names.md` lines 85–88): Follow-up “delivered,
  unreleased”, Response / limit naming the response commits and “first
  containing release pending”, verified with `git tag --contains`.

No Accepted ADR conflicts. No North Star topic is needed.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The observation rule has one source (slice 1 edits one file) | `grep -rl "decisive premise" src/skills` → `dough-story-refinement/SKILL.md` (link only, line 88), `dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs`, `dough-product-backlog/references/record-preparation.md` (criteria, links to `#write-the-plan`), `dough-slice-planning/SKILL.md` (the definition). `grep -rn "presence, not settling\|is presence" src/skills` → slice planning line 133 only. |
| The readiness rule has one source (slice 2 edits one file) | `record-preparation.md` lines 70–93 hold the criteria table and blocking reasons; `dough-slice-plan-refinement/SKILL.md` lines 50 and 109 and slice planning's report section link to `#assess-readiness-at-preparation-completion` without restating the criteria. |
| Tests pin anchors and phrases these edits must keep, not the wording they change | `refinement-outcome-guidance.test.mjs` lines 39–46 match the refinement SKILL's outcome section for `dough-slice-planning/SKILL.md#write-the-plan` and “no decisive premise”; `one-shot-guidance.test.mjs` lines 55–67 match `record-preparation.md` “### Accepted work and context-only quick execution” only. No test reads slice planning's SKILL.md (`grep -rl "dough-slice-planning" src --include='*.test.mjs'` → the two files above, link assertions only). Keep the `## Write the plan` heading, the phrase “decisive premise”, and the criteria heading. |
| The walkthrough inputs exist as recorded (slices 1–2) | Pygardon `DearDough.md` line 24 (plan 313: test green with the cancel replaced by `pass`, loop teardown cancels leftovers); Open Dough `DearDough.md` “ODF-110 — A removal premise swept client names…” (plan 248: `server/sessionResultResponse.ts` branch, `sessionAdmission.ts` exception, `story-panel-replacement.spec.ts` fixture); Doughnut `DearDough.md` “ODF-110 — A plan's proof for a CLI key example…” (plan 004: no token route) and ODF-190 row for plan 008 (`scripts/isolated-cypress-spec-selection.mjs` refuses live specs in linked worktrees); Open Dough `DearDough.md` ODF-110 row for plan 254 (17 files naming `expectSettledPage`; `openStoryStagesJourney().settled` holds the read). |
| The catalog's delivered-unreleased form (slice 3) | `finding-names.md` lines 85–88 (ODF-107): “**Follow-up:** delivered, unreleased: SEED-095#… ” and “**Response / limit:** Delivered on main, first containing release pending: …”, with a dated “Release verification” line using `git tag --contains`. ODF-074/110/190 currently read “queued, not resolved” (lines under `#odf-074`, `#odf-110`, `#odf-190`) and the five Open Dough `DearDough.md` entries carry the same “Follow-up: queued, not resolved” line. |
| Guidance changes are proved by behavior review, not a native host run | AGENTS.md “Behavior review” (walk one representative use: invocation context, required context, useful outcome); paid native runs are manual only in this repository. The story's Done when accepts naming an unrun native evaluation as unverified. |
| Markdown edits need no lint pass of their own | `scripts/lint.mjs` runs eslint/prettier over script and JSON files (lines 100–113) and shellcheck/shfmt; no markdown link checker in `tests/` (`ls tests \| grep -i link` → `payload-declaration-links.sh`, which checks payload declarations, not prose links). Links are checked by reading. |
| Next free plan number | `git ls-tree --name-only origin/main .planning/slice-plans/` → highest 257; sibling worktrees hold up to 257. Allocated 258. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| A premise is settled only by the promised operation's recorded result; presence results leave it open and name the unreached operation | 1 | Behavior review: examples 1–4 walked against the revised text |
| Consumer premises are observed from the behavior's effect, with the scratch-change-and-run as the smallest complete observation when a cheap suite exists | 1 | Example 2 walkthrough |
| Proof premises are settled by discrimination in a reverted scratch edit | 1 | Example 1 walkthrough |
| Route premises are settled by executing the unpaid prefix in the named checkout; a refused step names an available route or the owner's decision | 1 | Example 3 walkthrough |
| An inexpensive complete observation lets planning proceed | 1 | Example 4 walkthrough reaches `ready` |
| Scratch observations stay in the owned workspace, reverted before recording; paid/credentialed/owner-held steps stay probe slices or decisions | 1 | Text review against the story's preserved constraints |
| `ready` requires settled-by-result or probe-bounded premises; a presence result or out-of-checkout observation is a `not-ready` reason naming premise and operation | 2 | Example 5 walkthrough, both halves |
| Existing links and pinned phrases survive | 1, 2 | `npm test -- src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs`, with the selected Node and Bash 5 first on PATH |
| Each addressed finding records the response commits and release pending | 3 | Reading the eight entries; `git tag --contains <sha>` output recorded |

## Ordered slices

### 1. A premise is settled by the promised operation's result
Type: Behavior
Status: done
Accepted proof (2026-10-08): inspected the revised “Write the plan” result/consumer/proof/route/scratch paragraphs and walked seed examples 1–4: green without cancellation requires replacement proof; client grep requires server/fixture/HTTP consumers; refused selection/missing token route requires an available route or owner decision; a feature's scratch failure at its script step settles the moved-function premise. Invocation, required inputs, executing-agent audience, scratch reversion and human authority satisfy AGENTS.md behavior review. Refactor shortened equivalent wording in place to 250 lines; its fresh walkthrough preserves these outcomes. `PATH=/tmp/open-dough-node-24.21.0.B8hS2V/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm test -- src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs` passed; inspected “flawless is defined only by existing sizing, premise, and authority rules” assertions for the planning link and “no decisive premise”, whose setup reads refinement source rather than supplying planning behavior. `git diff --check` passed. Unchanged installation-path/declaration consumers are excluded; external example fixtures were not rerun and native Codex/Cursor/Claude behavior remains unverified.
Proof: Behavior review per AGENTS.md on the revised “Write the plan” section:
walk key examples 1 (Pygardon 313), 2 (Open Dough 248), 3 (Doughnut 004/008),
and 4 (moved function run through its feature) and show, for each, the one
reading of the text that yields the story's recorded result: examples 1–3
record the premise false or the route unavailable with the operation named,
and example 4 records the run and its failure as the observation. Confirm
the text names only the owned workspace for scratch edits, requires the
revert before the record write, and leaves paid, credentialed, owner-held,
and state-changing steps to probe slices or decisions. Then
`npm test -- src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs`
stays green (anchor `#write-the-plan` and “decisive premise” kept).

Behavior: A planning agent tracing a key example meets a premise about who
consumes a behavior, whether a named proof proves it, or whether a route can
run the example in the named checkout. It records the premise settled only
when its observation's result is the promised operation's outcome: the
example's result, or the proof's failure without the behavior. “Exists”,
“found”, “callers listed”, “step defined”, “server answered”, and “no commit
to the spec since” are presence results; the agent records them as open and
names the operation not yet reached. A consumer premise is observed from the
behavior's effect (its write site or response, each transformation, what
asserts or relies on the result), and, where a cheap local suite covers the
area, by one scratch application of the planned change in the owned
workspace, one run of the relevant tests, and a revert. A proof premise is
observed by the proof failing with the behavior disabled in a reverted
scratch edit. A route premise is observed by executing the route's unpaid,
side-effect-free prefix in the named checkout up to the first paid,
credentialed, or owner-held step; a refused or missing step makes the plan
name an available route or record the missing step and its decision owner as
an early probe slice or pre-Take decision.

Deliver together: the rewritten paragraphs at lines 118–162 of
`src/skills/dough-slice-planning/SKILL.md`, replacing the moved-function
paragraph with the result-based rule, keeping the probe-slice paragraph and
the “Do not inspect claims the approach does not depend on” and shared-system
sentences; one representative example per premise kind at most, phrased for
the executing agent.

### 2. Readiness names the unreached operation
Type: Behavior
Status: done
Accepted proof (2026-10-08): inspected `record-preparation.md` “Criteria” and its linked planning definition; example 5's helper grep and unobserved CI shard each yield `not-ready` with a reason naming the premise and unreached operation. Fresh result-bearing named-checkout observations allow `ready`; observed cheap parts plus a permitted paid-remainder probe also allow it, while missing cheap observations, outside-checkout substitutes and replay “not covered” remain blockers. `PATH=/tmp/open-dough-node-24.21.0.B8hS2V/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs` passed; inspected “record-preparation names both one-shot start locations without a claim”, whose setup reads the unchanged quick-execution section and asserts its start-location contract. This is compatibility proof; the walkthrough proves Criteria behavior. `git diff --check` passed. Refactor: none, already clean; both source files remain 250 lines. Native host behavior remains unverified.
Proof: Behavior review on the revised “Criteria” in
`record-preparation.md`: walk key example 5. A plan whose premise table
records “grep found the 17 files naming the helper; none holds the read” and
“live route: CI shard” with no observation yields `not-ready` with one
`--reason` per premise naming the unreached operation; the same plan with a
fresh result-bearing observation, or with the paid remainder as an early
probe slice that stops dependents, yields `ready` with no reason. Confirm
the “not covered” replay rule and “clear a premise-based reason only with a
fresh observation” survive, and that the text links to slice planning's
definitions instead of restating them. Then
`npm test -- src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs`
stays green.

Behavior: An agent recording readiness reads the plan's premise rows. Each
decisive premise is either settled by the promised operation's recorded
result in the named checkout, or bounded by an early probe slice whose
remaining step is paid, credentialed, owner-held, or state-changing. A
presence result, an observation made outside the checkout the plan names, or
a replay that lists part of the journey as not covered is a blocking reason
that names the premise and the unreached operation; the agent records
`not-ready` with those reasons and `ready` only when none remain.

Deliver together: the criteria table row for `ready`, the blocking-reason
paragraph, and the observation paragraph (lines 70–93), referring to slice
1's definitions by the existing `#write-the-plan` link.

### 3. The addressed findings record this response
Type: Behavior
Status: planned
Proof: Read the ODF-074, ODF-110, and ODF-190 entries in
`docs/maintainer/finding-names.md` and the five Open Dough `DearDough.md`
entries linked from them. Each Follow-up reads “delivered, unreleased:
SEED-108#observe-promised-journey” with the story link kept; each Response /
limit names slices 1 and 2's commits and “first containing release pending”
with the `git tag --contains <sha>` result (expected: none) and the date;
each keeps its prior failed responses, occurrence evidence, and the
“Delivery is not itself proof” watch note. No Pygardon or Doughnut log is
edited; the catalog keeps linking to them.

Behavior: A maintainer reviewing the catalog after this story lands sees,
for each of the three findings, the actual response commits, that the
containing release is pending, and that the watch starts with later use, and
sees the same on the Open Dough source entries.

Deliver together: the eight record edits and the dated verification line. Name story-branch delivery and pending main integration truthfully until wrap-up publishes the response on main.

## Current decisions

- Guidance is written for the executing agent; the story's own catalog
  vocabulary (findings, releases) stays out of the skill text.
- The scratch-change-and-run is named as the smallest complete observation
  only when the area has a cheap local suite; it is not a general planning
  gate, and it never runs in a default or shared checkout.
- The recorder is unchanged; the judgment is carried in `--reason` text.

## Execution context

- Established execution: `SEED-108#observe-promised-journey`, publisher
  `dashboard-territory.local-open-dough`, agent `chaifeng-chan`.
- Mode: story-branch. Originating and execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/observe-decisive-planning-premises-through-the-f`;
  branch `codex/observe-decisive-planning-premises-through-the-f`. Reused
  host-established linked worktree; no integration checkout supplied.
- Claim published on `origin/main`:
  `e21713d71fff100834ffe45e3764fe5f5759ff38`; starting revision
  `b5b7de82e903e42a6e5d2f11f67942ff6bd804d2`. Increment target:
  `origin/refs/heads/codex/observe-decisive-planning-premises-through-the-f`.
- Checkout setup: corrected to `tests/native-setup.md` on 2026-10-08:
  checksum-verified Node 24.21.0 in `/tmp/open-dough-node-24.21.0.B8hS2V/node-v24.21.0-darwin-arm64/bin`, followed by `/opt/homebrew/bin` for Bash 5, first on PATH.
  `npm_config_include=dev node scripts/setup-native.mjs npm`, then the `browser` and `check` stages succeeded without lockfile changes; the runner proof above passed.
- Replanning: retain the existing planning authority within this story;
  no numeric slice budget or exception supplied, so judge cohesive boundedness.
- Markdown has no formatter or generator in this project's lint contract;
  selective formatting is a no-op for these paths, with `git diff --check`
  checking whitespace. The staged check-only hook owns lint.
- CI source: GitHub Actions, verified `ci.yml`, observing the authorized story
  branch. Codex yielded stream cell `8`, session `69011`, mailbox
  `/tmp/dough-ci-501/watch-015bQN`, PID `98741`, coordinator `chaifeng-chan`,
  bound to the execution checkout above. Claim CI on trunk is unobserved;
  this branch observer covers subsequent managed deliveries.
- Accepted slice 1 revision on the increment target: `3d148f25a9a6cb308894dc72277b3ccd6faf6452`.

## Learnings

- Current repository proof uses `tests/README.md`'s runner rather than the plan's original direct Node commands; those commands are aligned above. Earlier direct green observations are superseded by runner proof.
- The plan counted three Open Dough source entries, but `rg -n 'SEED-108|observe-promised' DearDough.md` finds five; ODF-190 has no Open Dough source entry. Slice 3 now updates all five same-story occurrences and the three catalog entries within the original retained-source scope; external logs stay unchanged.
