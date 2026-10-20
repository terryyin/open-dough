# Finish preparation without routine attention

**Identity:** SEED-145#quiet-preparation-chain
**Source:** [Refined story](../../seeds/SEED-145-no-news-is-good-news.md#quiet-preparation-chain).

## Goal and scope

Story Refinement, Slice Planning and Slice-plan Refinement complete their
authorized preparation without routine success reports or acknowledgement tasks.
This includes their automatic chain and direct invocation, while explicit stops,
requested details and unresolved developer actions still get useful information.
Preserve the story, plan, proof judgments, readiness, assignment, publication and
recovery records and every existing authority boundary.

Execution/retrospective reporting, prominent attention styling and automatic
execution-to-wrap-up continuation remain with the sibling stories. No new
dashboard filter, protocol, state schema, installation mechanism or release
rollout is required. General Land/Wrap Up quiet closure belongs to story 1;
shared files alone impose no blocking dependency.

## Current decisions and existing solutions

- **PFE:** Change the existing preparation journey and its reporting callers.
  `src/skills/dough-story-refinement/references/preparation-journey.md` already
  owns continuation and final disposition; the three preparation skills link
  there. Reuse `dough-land/references/completion-attention.md` for settled
  closure and `dashboard-completion.md` for the existing final operation.
  Integrate story 1's current shared-rule changes when present; if they are
  absent, make only the shared adjustment needed for this preparation outcome.
  Do not create a second attention classifier or require story 1 to finish.
- Follow the response effect through all three `SKILL.md` files,
  refinement-options, one-shot refinement, preparation disposition/workspace,
  and the recorder's instruction to report its result. Replace conflicting
  routine reporting requirements at their owners, without changing record
  writes, assessment criteria, or unrelated callers' outcomes.
- Keep readiness and attention distinct. A resolved preparation still records
  its actual assessment. An early probe permitted by the readiness procedure
  can bound uncertainty without an immediate human response; an unresolved
  scope, constraint, resplit or authorization decision cannot be silently
  treated as settled. A retained/review result needs its next action even when
  its content is ready.
- Preserve parent-agent handoffs as information needed by the invoking workflow.
  Suppressing routine developer messages must not deprive a caller of the plan,
  evidence, result location or decision it needs to continue.
- The ordinary chain, one-shot refinement and same-session execution handoff
  keep their current destinations and authority. Quiet reporting never turns
  refine-only into planning, one-shot into the ordinary chain, a retained result
  into a keep, or preparation into execution.
- The old success phrases have consumers in `refinement-outcome-guidance`,
  `preparation-journey-guidance`, and `preparation-landing-guidance` tests.
  One-shot review's native assessor intentionally requires the retained result
  location (`tests/support/git-publication-native-one-shot-refinement.sh`).
  Keep that useful review evidence. The preparation-land observer checks actual
  publication and retirement, not a plan banner. Dashboard session attribution
  uses "Ready for slice planning" as sample message data; its ability to display
  arbitrary messages remains valid, so do not remove it as obsolete behavior.
- Use the representative invocation/context/outcome review in
  [AGENTS.md](../../../AGENTS.md#behavior-review). Under
  [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  deterministic guidance checks and transport substitutes are not native agent
  evidence. Review shared behavior for Codex, Cursor and Claude Code without
  inventing a per-tool discovery gate for this conventional guidance edit.
  Preserve applicable integration evidence; any actually invalidated native
  requirement stays explicit under its existing acceptance owner before release.
- Follow [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  for human decisions, [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for distinct domain facts and minimal machinery, and
  [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for one shared behavioral owner. Author only in `src/skills/` under
  [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
  The [North Star: agent launch](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  already separates local session Done from story state. No new topic or ADR is
  warranted; the Accepted index and relevant records agree, with no conflict.

## Decisive premises observed during preparation

Observations ran on 2026-10-20 in
`/Users/terryyin/git/open-dough/.worktrees/finish-the-chained-preparation-journey-silently`,
source base `24ed01a6fe906517e09f8a273bebc3da86409a9c`.
Scratch source edits, the disposable spec and its failed-run artifacts were
removed before writing this plan. These observations establish existing
mechanisms and affected consumers, not completion of the planned behavior.

| Premise and consuming operation | Observation and result |
| --- | --- |
| Current instructions demand the noise the story removes | The three focused guidance files in the command below passed 28 checks while requiring intermediate outcome reporting and the final landing report. Temporarily replace the intermediate reporting clause in `preparation-journey.md` with "in the same session, invoke" and run `node --test src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs`: 8 pass, 1 fails at "the journey continues both ready outcomes for the story the invocation names". Restoring the source leaves no implementation change. This proves the reporting instruction has a test consumer; it does not prove agent compliance. |
| Preparation landing, one-shot disposition and same-workspace execution handoff can be retained | The three mechanical files in the second command below passed all 6 checks. They reach installed start/release/recording, real local Git and retirement or execution-start as appropriate, preserving queue and assignment ownership. The landing test uses the Dough Land fixture's Git model; it does not run an agent or prove reporting prose. |
| Existing installed quiet reporting can finish a preparation while its story remains queued | A disposable `dashboard/tests/quiet-preparation-probe.spec.ts` reused `codexStart.ts` and `startOrigin.ts`. It launched workflow `refinement`, read `record.preparation.workspace`, changed only the fixture seed, ran installed `preparation-assignment.mjs release`, committed/pushed to the isolated bare origin, retired through installed `worktree-retirement.mjs`, and invoked the supplied reporting command with `--outcome completed`. The receipt was `recorded` with an empty message; stored `doneAt` equalled `receivedAt`; the backlog remained byte-identical and the preparation profile was gone. `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/quiet-preparation-probe.spec.ts --workers=1` passed. Native Codex transport was substituted; Git, receiver, receipt storage and installed commands were real local operations. |
| That observation distinguishes a receipt from local Done | Invert the `completedWithoutAttention(report)` guard in `dashboard/server/completionClosure.ts` and run the same disposable spec. It fails at the stored `doneAt` assertion (undefined), after receiving the matching receipt. Restore the guard and remove the disposable spec. No receiver change is needed for this story. |
| The shared Land reporting route is also usable in this checkout | `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-completion-quiet.spec.ts --grep 'Land retires' --workers=1` passed through fixture publication, retirement, installed reporting and Done. This execution-shaped fixture is supporting shared-boundary proof, not a substitute for the preparation-specific observation above. |

The first disposable preparation attempt read `record.start.workspace` and
stopped before the journey; preparation uses `record.preparation.workspace`.
The corrected run above reached the complete intended observation. Local
prerequisites were installed with `npm ci --ignore-scripts --no-audit --no-fund`;
the dashboard runner intentionally prints nothing for a passing run.

```sh
node --test \
  src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs \
  src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs \
  src/skills/dough-story-refinement/scripts/preparation-landing-guidance.test.mjs

node --test \
  src/skills/dough-story-refinement/scripts/preparation-assignment-land.test.mjs \
  src/skills/dough-story-refinement/scripts/preparation-handoff-execution.test.mjs \
  src/skills/dough-story-refinement/scripts/one-shot-refinement-auto-land.test.mjs
```

## Outside-in proof ownership

Slice 1 owns every promise below. The primary proof for this runtime guidance
change is a representative behavior walkthrough following the actual linked
instructions, with maintained checks for affected contracts.

| Promise | Observable proof |
| --- | --- |
| Quiet automatic preparation | Walk a clear established story through refinement, planning, an in-scope plan refinement and authorized landing. Inspect every reporting instruction reached: no ready announcement, no-concern report, plan recap, next-step recap, success banner or acknowledgement task survives. Refined facts, plan, assessment, release and publication still occur. |
| Quiet direct invocation and one-shot automatic landing | Walk direct planning and direct plan refinement to their existing disposition; separately walk one-shot auto-land to its own refinement-only landing. Each applies the same attention judgment and preserves its current continuation boundary. |
| Explicit stops and requested details stay useful | Walk refine-only, retain, no-publish, one-shot review and an explicit request for architecture/plan details. Check the result location, expected next action, actual Preparing/publication state and requested facts. No automatic keep, planning or execution crosses the selected stop. Preserve the retained-review assessor's useful-output check. |
| Real decisions and failures remain visible | Walk missing context, unresolved scope/constraint, a resplit recommendation, stopped recording, release conflict and failed publication. Each states the exact needed response, consequence and owner where known; the draft/assignment and accepted prior operations remain recoverable. Neither an open decision nor missing proof becomes quiet success. |
| Recorded facts survive quietness | Inspect the seed/plan and recorder calls independently of reporting. Review ready and not-ready outcomes under the existing criteria, including a permitted early probe. Record concerns where their owners require them; determine human attention from an outstanding response, not merely the badge. Check parent-agent returns still supply the caller's needed evidence. |
| Dashboard and direct completion keep their distinct contexts | Trace the final shared completion call: supplied context sends quiet `completed`, waits for its matching receipt and retries only reporting on failure; retained/stopped work sends exact actionable `unfinished` text. Direct use discovers no dashboard. Reuse the local receipt observations above while their boundary is unchanged. |
| Same-session execution remains separately authorized | Walk the existing handoff: an explicit execution instruction keeps its readiness/authority checks, same workspace, landing and Take, and receives no premature completion report. Without that instruction preparation neither Takes nor executes. |
| Shared source and real evidence remain authoritative | Review descriptions, headings, options and references for the executing project's perspective and all three hosts' shared meaning. No installed-copy edits or new host adapter. Keep native proof/reuse distinct from deterministic checks and review. |

## Ordered slices

### 1. Finish preparation quietly while preserving actionable boundaries
Type: Behavior
Status: done
Proof: The promise table above, representative review under AGENTS.md, and
focused checks for the affected guidance consumers.

Behavior: Given preparation authorized through a particular boundary, when its
judgments, records and disposition settle with no required human response, the
developer receives no routine success report or acknowledgement task. When a
decision, failure, explicit review stop or requested detail needs a response,
the same workflow gives the useful information and preserves its exact boundary.

Align the three entry points and linked reporting instructions around the
existing preparation journey and shared closure rule. Remove contradictory
routine reporting obligations together, including the recorder-result recap
where it would leak through the chain. Keep judgments, durable facts, required
caller returns and recovery intact. Recheck affected callers and tests before
editing; the paths above locate them, not a limit on coherent implementation.

After independent post-change refactoring, run the affected guidance suite:

```sh
node --test src/skills/dough-story-refinement/scripts/*guidance.test.mjs
```

Update assertions for the intended quiet/attention contract, allowing equivalent
phrasing and preserving authorization/recovery assertions. Confirm the changed
checks reject reintroducing routine reporting or suppressing a required review
response. Include `completion-attention-guidance.test.mjs` if the shared Land rule
changes; include other consumers revealed by the trace. Run the mechanical
preparation checks above if continuation/disposition instructions change their
contract; otherwise reuse the observed preserved behavior. Reuse the receipt
observation unless reporting arguments or its consuming code changes; in that
case repeat the relevant installed-reporting journey with the preparation shape.
Do not introduce a receiver change without contrary evidence and reassessment.

The checkout's [.githooks/pre-commit](../../../.githooks/pre-commit) requires staged
lint and dashboard typecheck when a script is staged; honor it. Hosted CI remains
owned by the ordinary execution workflow, rather than becoming a blanket local
suite requirement for prose. Run ordinary execution refactoring, delivery,
retrospective and closure gates when execution is separately authorized.
This preparation does not authorize implementation.

## Cumulative design and sizing

One rule distinguishes a required response from routine success across one
preparation journey. Splitting by skill, success/failure case or final banner
would leave contradictory reporting in an intermediate delivery. One Behavior
slice therefore owns the cohesive instruction change and its contract consumers;
no Structure slice or new architecture is needed. Its one proof loop is the
representative journey plus focused consumer checks. No numeric slice target or
hard limit was supplied.

Slice-plan refinement is not needed: no independent outcome, fragmented
boundary, unsupported design or unresolved proof premise remains. No remaining
slice-specific concern was found in this review.

Accepted proof (2026-10-20): `preparation-journey.md` now ends every
disposition under "Finish with only what needs a response", which applies
Dough Land's completion attention to the whole journey; the three skills,
one-shot refinement, refinement options, disposition and recorder text follow
it, and the `SLICE PLAN WRITTEN`/`SLICE PLAN REFINED` banners (no consumers)
are gone. `node --test src/skills/dough-story-refinement/scripts/*guidance.test.mjs src/skills/dough-land/scripts/completion-attention-guidance.test.mjs`
passed 60 (finish/attention assertions moved to
`preparation-finish-guidance.test.mjs`); 13 scratch mutations reintroducing
routine reporting or removing a required response each failed a named test.
The three mechanical preparation checks passed 6, and `npm test` passed
before refactoring. The dashboard receipt observation was reused: reporting
arguments and receiver code are unchanged. Agent compliance with the prose
remains covered only by the representative walkthrough, not native evidence.

## Learnings

The existing quiet completion protocol handles preparation without completing
the queued story. Current guidance tests actively preserve noisy reporting, so
changing only the final response would leave both intermediate instructions and
their assertions inconsistent. Keep the shared instructions and their affected
contract checks coherent, while retaining explicit review output.
