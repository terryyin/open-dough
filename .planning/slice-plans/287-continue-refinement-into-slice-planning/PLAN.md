# Refinement continues into slice planning unless a question or refine-only stops it

**Identity:** SEED-128#continue-refinement-to-slice-planning
**Source:** [refined story](../../seeds/SEED-128-automatic-preparation-handoffs.md#continue-refinement-to-slice-planning).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/continue-completed-refinement-into-slice-plannin`
on `claude/continue-completed-refinement-into-slice-plannin`, under the
preparation assignment for `aki-chan` (published `0955bf49`). Publication
target: `origin/main`; integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

A coordinator who starts story refinement, from the dashboard's Refinement
launch or a direct invocation, gets one preparation draft from that start: the
refined story and its slice plan with a recorded readiness assessment. The
refinement session itself continues into slice planning in the same owned
workspace, branch, and session once no coordinator question remains, instead of
reporting "Ready for slice planning" and waiting for a second start.

In scope, from the story:

- Continuing into slice planning is the refinement skill's normal ending for
  both ready outcomes, Ready for slice planning and Flawless. Slice planning
  runs as today: `start` returns `continued` on the existing Preparing
  assignment, the plan is written, slice-plan refinement runs when planning's
  own rule calls for it, readiness is recorded. The refinement outcome is
  reported before continuing; the final report is the planning report carrying
  the refinement outcome, plan path, assessment, and the pending draft and
  assignment as information.
- Two stops: a Needs human engagement outcome (planning waits until the
  coordinator answers in the same session and no question remains), and an
  explicit refine-only instruction on the invocation, which stops at the
  refinement result and reports slice planning in that workspace as the next
  step, as today. Missing-context and failure handling are unchanged.
- The refine-only instruction is the `--refine-only` entry ("Refine only") in
  `refinement-options.json`, offered by the dashboard's Refinement dialog
  without a dashboard change and passed as a flag on a direct invocation. An
  ordinary-language instruction not to plan counts the same. It composes with
  every inquiry option and focus.
- A refinement invocation authorizes slice planning of its story and no
  execution or publication. The combined draft stays uncommitted in the owned
  workspace with its assignment under the existing disposition. Refinement's
  wording that it "does not authorize planning" is replaced.
- With several stories refined together, planning continues for the story the
  invocation names; siblings end with their own refinement outcome.
- ADR 0007 (Proposed) says concisely, in text and diagram, that refinement
  flows into slice planning in the same owned workspace unless a coordinator
  question or an explicit refine-only instruction stops it. Its status is
  unchanged. ADR 0009 describes no step this story changes and is not edited.
- The refinement skill's guidance tests change with the guidance; the shipped
  options definition keeps satisfying the dashboard's definition schema.

Material exclusions, from the story:

- Automatic landing after planning and landing unpublished preparation before
  execution: the two sibling stories in the same seed.
- One-shot refinement keeps its journey (refine, commit, stop for review or
  `--auto-land`); no plan follows it.
- No dashboard slice-planning launch and no new option category; the offered
  list stays flat. No dashboard code or dashboard test changes.
- `dough-story-decomposition` keeps handing off to planning only on request:
  it writes unrefined candidates, and refinement is the step that continues.

## Published baseline and integration context

Origin was fetched at the start of planning (`dae1994a`). The highest
allocated plan is `286-dashboard-typecheck-commit-gate` (held locally; origin's
tree holds up to `283`, since `285` and `286` were wrapped up and removed), and
`287-continue-refinement-into-slice-planning` was free locally and on origin
immediately before this write. This workspace holds the refined seed
(uncommitted) and the announced assignment.

The North Star topic "A start establishes claim and workspace before the
session" (`.planning/NORTH-STAR.md`) governs the launch side: its Handoff row
says the host spells the skill invocation plus the installed established
handoff, and the invoked skill owns what follows. This plan changes only the
skill side and adds no North Star topic. Accepted ADRs 0002, 0005, and 0006
are cited in the seed's Architecture section; no conflict was found.

This worktree has no `node_modules`; Node here is 24.5.0 while
`.node-version` selects 24.21.0, so `node scripts/setup-native.mjs npm`
refuses. `node --test` files and the shell checks resolve tools from the
integration checkout's `node_modules` by directory walk-up and ran green here,
but the dashboard specs spawn `<worktree>/node_modules/.bin/vite`. Planning
observed them through a temporary symlink
(`ln -s /Users/terryyin/git/open-dough/node_modules node_modules`, removed
afterwards). Execution either installs per `tests/native-setup.md` or uses the
same temporary link for the dashboard proof and removes it before committing.
The runner needs Bash 5 first on `PATH` (`PATH="/opt/homebrew/bin:$PATH"`).

## Existing solutions and selected approach

PFE, within this repository's preparation skills:

- **Reuse** slice planning's own chaining shape: it already invokes slice-plan
  refinement by default and "honors an explicit instruction to leave
  refinement to a later step". The refinement skill gets the same shape for
  the next step. `--skip-retro` on execute-plan is the flag precedent for an
  explicit opt-out of a default continuation.
- **Reuse** the preparation assignment's continuation: `start` in the same
  workspace returns `continued` (observed this session) and the assignment's
  activity is `preparation` for refinement and planning alike, so the chain
  publishes nothing and the dashboard card keeps saying "Being prepared".
- **Reuse** `refinement-options.json` as the one place the dashboard reads a
  refinement launch's selectable flags: `dashboard/src/commandOptions.ts`
  offers `options` and `focuses` as one flat list, and
  `dashboard/tests/launchCardPage.ts` reads the shipped file, so the specs
  compare against whatever the file holds.
- **Reuse** the guidance-test pattern (`node --test` over `SKILL.md` sections
  through `tests/support/markdown-section.mjs`) that already pins this skill's
  outcome, established-preparation, and one-shot wording.
- **Change** `src/skills/dough-story-refinement/SKILL.md` (description,
  "Choose the workflow", "Refine and report", "Report the refinement outcome"),
  `src/skills/dough-story-refinement/references/refinement-options.json`,
  `src/skills/dough-story-refinement/references/one-shot-refinement.md` (one
  sentence), `src/skills/dough-slice-planning/SKILL.md` ("Stay within the
  triggering instruction"), `install.sh` (`managed_files`), and
  `docs/adrs/0007-software-development-lifecycles.md`.
- **Add** one reference, `src/skills/dough-story-refinement/references/preparation-journey.md`,
  the single home of the continuation rule, beside the workspace, assignment,
  and disposition references it composes with. The landing sibling extends it.
- **Not changed:** dashboard code and specs, `established-preparation.md` and
  `.mjs`, `preparation-assignment.mjs`, `dough-slice-plan-refinement`,
  `dough-story-decomposition`, ADR 0009.

## Outside-in proof

| Promise (story key example) | Owning slice | Observable proof |
| --- | --- | --- |
| A ready outcome with no refine-only option continues into slice planning in the same workspace; planning's `start` is `continued`; final report is planning's with the refinement outcome, plan path, assessment, pending draft and assignment; nothing committed or pushed | 1 | guidance tests: the refinement SKILL's outcome section and the journey reference state the continuation, same workspace/branch/session, `continued`, no second block or announcement, the report contents, and no commit, push, or execution; slice planning's SKILL links the journey as a planning-only continuation |
| Needs human engagement stops before planning; after the answer in the same session, refinement completes and continues | 1 | guidance tests: the journey reference names this stop and the resume |
| `--refine-only`, from the dashboard checkbox or the command line, with or without inquiry options, stops at the refinement result naming slice planning as the next step | 1 | guidance tests: the options file defines `--refine-only` ("Refine only") once in `options`, the SKILL and journey name it as the stop that composes with every option; dashboard specs `agent-launch-options.spec.ts` and `agent-launch-dialog-layout.spec.ts` pass on the shipped file (the dialog offers every shipped entry with label, summary, and flag) |
| Flawless continues into planning and the coordinator may still execute planless | 1 | guidance test: the journey reference says both ready outcomes continue and the skip-planning execution choice is unchanged |
| One-shot refinement keeps its journey; no plan follows | 1 | guidance test: `one-shot-refinement.md` says so; existing one-shot guidance tests stay green |
| Refinement authorizes planning, not execution or publication; the old "does not authorize planning" wording is gone | 1 | guidance test: the SKILL no longer matches that wording and states the new authority line |
| The new reference is installed with the skill | 1 | `tests/payload-declaration-links.sh` green with the reference declared in `install.sh` |
| ADR 0007 describes the combined journey and its explicit stop concisely, status unchanged | 2 | read-through of the Story Branch Mode text and diagram against the story scope; `## Decision` still says preparation grants no execution authority; Status line still `Proposed` |

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The dashboard offers a new `options` entry from the shipped file with no code change, and its specs stay green | slice 1's option entry and dashboard proof | Planning, 2026-10-10: appended a scratch `--refine-only` entry to `src/.../refinement-options.json` (9 flags), ran `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/agent-launch-dialog-layout.spec.ts` with the temporary `node_modules` link, reverted with `git checkout --` | 8 passed (7.0 s), including "the refinement dialog offers the installed definition's entries with label, summary and flag, and a changed definition shows with no code change" |
| Slice planning's `start` in the refinement workspace continues the same assignment | slice 1's "no second announcement" wording | This session: `preparation-assignment.mjs start` in this workspace for this story; `preparation-assignment-continuation.test.mjs` | receipt `status: "continued"`, same agent `aki-chan`, allocation `0955bf49`; 2 tests pass |
| The guidance tests are the only source consumers of the wording slice 1 replaces | slice 1's test updates | `grep -rn 'authorize planning\|requests execution planning\|Ready for slice planning\|execution-planning workflow' src docs tests dashboard` | Matches only in `dough-story-refinement/SKILL.md`, its `refinement-outcome-guidance.test.mjs` (pins `**Ready for slice planning**`, `explicit instruction to skip slice planning`, `without a question or approval request`), `dough-story-decomposition/SKILL.md` (kept), and a dashboard fixture message in `session-attribution.spec.ts` that is not skill text |
| An undeclared new reference fails the payload link check | slice 1's `install.sh` edit | Read `tests/payload-declaration-links.sh` (`FAIL: declared %s links to undeclared %s`); baseline run | Baseline exit 0 with the current declarations |
| The named proof commands run green here before the change | slice 1 | `bash scripts/test.sh` over the three refinement guidance tests and `tests/payload-declaration-links.sh` with Bash 5 first on `PATH` | exit 0 |
| Lint covers the options JSON (Prettier) and does not lint Markdown | slice 1's lint step | Read `scripts/lint.mjs`: `jsonFiles` join `prettierFiles`; no Markdown handling | JSON formatting is gated; Markdown is reviewed by reading |
| The assignment's activity does not distinguish refinement from planning | the "Being prepared" promise | Read `product-backlog-agent-profile.mjs` (`agentActivities = ["execution", "preparation"]`) | One activity, `preparation`; no card or profile change is needed |

The new guidance test file adds regex matches over Markdown and JSON, far
below one second; no timing step is needed (`tests/time-budget.md`).

## Ordered slices

### 1. Refinement continues into slice planning in the same workspace unless a coordinator question or `--refine-only` stops it
Type: Behavior
Status: planned
Proof: `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs src/skills/dough-story-refinement/scripts/established-preparation-guidance.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement-guidance.test.mjs tests/payload-declaration-links.sh`
and `npm run lint`; then, with this worktree's dependencies installed or
linked as the baseline section says,
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/agent-launch-dialog-layout.spec.ts`
(8 pass; the dialog offers nine entries including "Refine only"). The new
`preparation-journey-guidance.test.mjs` pins: the SKILL's "Refine and report"
or outcome section links `references/preparation-journey.md` and says a ready
outcome continues into slice planning; the journey reference names the same
workspace, branch, session, and assignment, `continued`, no second Established
preparation block or announcement, the two stops (open coordinator question;
explicit refine-only instruction, `--refine-only`), composition with every
option and focus, that both ready outcomes continue and the skip-planning
execution choice is unchanged, the story the invocation names when several are
refined, planning-only authority (no execution, no commit, no push), the final
report's contents, and that resuming after an answered question continues; the
options file defines `--refine-only` with label "Refine only" once, in
`options`; the slice-planning SKILL links the journey under "Stay within the
triggering instruction"; `one-shot-refinement.md` says no plan follows
one-shot; the SKILL no longer matches `does not authorize planning`. The
updated `refinement-outcome-guidance.test.mjs` keeps the three outcomes,
engagement, and recording pins and replaces the next-step pins with the
continuation and refine-only wording.

Behavior: refinement records goal, scope, key examples and `refined` for a
story with no open coordinator question, and the invocation carries no
refine-only instruction → the same session invokes slice planning for that
story in the same workspace and branch (planning's `start` is `continued`;
nothing is announced, created, committed, pushed, or executed) → the plan is
written, refined when planning calls for it, and assessed, and the final report
is the planning report carrying the refinement outcome, plan path, recorded
assessment, and the pending draft and Preparing assignment as information.
With `--refine-only` (or an equivalent instruction) → the session stops at the
refinement result and reports slice planning in that workspace as the next
step. With an open coordinator question → the report lists the expected
responses and no plan is written; the continuation runs once the question is
answered in the same session.

Changes:
- `src/skills/dough-story-refinement/references/preparation-journey.md` (new):
  the preparation journey (refinement, then slice planning, then slice-plan
  refinement as planning decides), its single stop rule, how the same session,
  workspace, branch, and assignment carry the established context (planning's
  `start` returns `continued`; no new block, no re-announcement), what the
  final report carries, that Flawless continues too, the named-story rule for
  several stories, and that the journey authorizes planning only: the draft
  stays under [preparation disposition](preparation-disposition.md) and
  landing stays a keep. Written for the executing agent, repository-relative
  links only.
- `src/skills/dough-story-refinement/SKILL.md`: description gains the
  continuation and `--refine-only`; "Choose the workflow" drops "does not
  authorize planning … hand off … when the user explicitly requests" for "A
  refinement invocation authorizes slice planning of its story under
  [preparation journey](references/preparation-journey.md); it authorizes no
  execution"; "Resolve required context" resolves the planning workflow for the
  continuation rather than "only for a requested handoff"; "Report the
  refinement outcome" keeps the three outcomes and, for a ready outcome,
  reports then continues under the journey unless refine-only was selected,
  in which case the next-step wording applies as today (slice planning in that
  workspace, or skip-planning execution for Flawless).
- `src/skills/dough-story-refinement/references/refinement-options.json`:
  `options` gains `{"flag": "--refine-only", "label": "Refine only",
  "summary": "Stop after recording the story; leave slice planning for a later
  step.", "instruction": …}` whose instruction says the refinement result is
  retained at that boundary and the report names slice planning as the next
  step; `selection` says it composes with every option and focus. Prettier
  formatting.
- `src/skills/dough-story-refinement/references/one-shot-refinement.md`: one
  sentence in its introduction that one-shot keeps this journey and no plan
  follows; link the preparation journey.
- `src/skills/dough-slice-planning/SKILL.md`, "Stay within the triggering
  instruction": a case for continuation from story refinement under the
  preparation journey: planning only, report the plan with the story's
  refinement outcome, no execution.
- `install.sh`: declare `dough-story-refinement/references/preparation-journey.md`
  in `managed_files` in its alphabetical place.
- Tests: new `src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs`;
  updated `refinement-outcome-guidance.test.mjs`. Existing
  `established-preparation-guidance.test.mjs` and
  `one-shot-refinement-guidance.test.mjs` stay green.

### 2. ADR 0007 describes the combined preparation journey and its explicit stop
Type: Behavior
Status: planned
Proof: read `docs/adrs/0007-software-development-lifecycles.md` against the
story scope: the Story Branch Mode steps say that refinement continues into
slice planning in the same owned workspace unless a coordinator question or an
explicit refine-only instruction stops it; the diagram's refinement node flows
into the planning node with that condition; the explicit-keep landing edge and
"preparation grants neither execution nor publication authority" are unchanged
(the landing sibling owns those); `**Status:** Proposed` is unchanged; the
"Revised" line records 2026-10-10 at Terry Yin's direction, as the existing
line does. `npm run lint` is unaffected (Markdown is not linted).

Behavior: a reader of ADR 0007 → reads Story Branch Mode → sees one
preparation journey from refinement through slice planning in one owned
workspace, its explicit stop, and that procedures live in the skills, in a
few added or changed lines rather than a new section.

Changes: `docs/adrs/0007-software-development-lifecycles.md` only: the
Story Branch Mode step that covers writing seeds, stories, and plans in an
owned workspace states the continuation and its stop with a link to the
preparation journey reference; the mermaid edge `B --> P` carries the
condition; the "Revised" line is updated. No index change in
`docs/adrs/README.md`.

## Current decisions

- The refine-only flag is an ordinary entry in `options`, not a new category:
  the dashboard offers it with no code change, and the list stays flat (story
  decision, observed in planning).
- The continuation rule has one home, `references/preparation-journey.md`
  under the refinement skill; slice planning links to it; the landing sibling
  extends the same file rather than adding a pair-specific policy.
- Both ready outcomes continue into planning; one-shot refinement does not
  (story decisions).
- No dashboard code changes: the assignment's activity already covers both
  activities and the specs read the shipped definition.
- Dashboard proof runs from this worktree with dependencies installed per
  `tests/native-setup.md` or the temporary `node_modules` link named above,
  removed before the commit.

## Learnings

None yet.
