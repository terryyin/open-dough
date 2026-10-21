---
id: SEED-053
status: active
planted: 2026-09-28
planted_during: Maintainer request to regroup existing native acceptance by host
trigger_when: Completing the remaining Cursor native acceptance
scope: unknown
---

# SEED-053: Accept existing guidance natively on each host

## Why This Matters

Maintainers need host-specific evidence for premise-verification and one-shot guidance. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) says evidence from one host does not transfer to another. The Cursor one-shot result is recorded in [SEED-028](SEED-028-track-ad-hoc-work.md#story-decomposition). The Pygardon premise miss is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`.

## Stories

The Cursor acceptance story is closed. Its evidence remains recoverable from the commit before this cleanup. The shared cases below stay because later premise work still uses them.

<a id="quiet-dashboard-completion"></a>

### Accept quiet completion and retained dashboard attention messages

**Identity:** SEED-053#quiet-dashboard-completion
**Completed implementation:** [SEED-008's completion story](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration), [plan 220](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md).
Quiet wording and its response consumers also follow [SEED-145's completed story](https://github.com/terryyin/open-dough/blob/1ad488d7f3757d7a85f54f2277424f7c301ff1bb/.planning/seeds/SEED-145-no-news-is-good-news.md#quiet-land-and-wrap-up)
and [plan 331](https://github.com/terryyin/open-dough/blob/1ad488d7f3757d7a85f54f2277424f7c301ff1bb/.planning/slice-plans/331-quiet-land-and-wrap-up/PLAN.md).
Native cases must keep settled findings, authorized follow-up dispositions and
verified retirement quiet, while preserving actionable exceptions and requested
details. Their deterministic proof does not establish native compliance.
**Outcome:** Developers can rely on installed quiet completion and actionable
exceptions for Land/Wrap Up, standalone retrospective and planned execution on
Codex, Claude Code, and Cursor. This acceptance home
tracks missing native proof separately from functional implementation; it adds
no queue assignment or independent execution authority.

**Feasibility prerequisite:** One fresh bounded session per host using the
dashboard's existing native launch mode and input builder, a private installed
representative skill, and a disposable launch-scoped receiver. Inspect native
command use, received facts, and exact host/session association. Representative
shared coverage must also observe Claude reporting before session binding,
continuation context and reporting callability after removal. Failure blocks plan-220 dependents.

**Integration acceptance after implementation:** On every affected host, fresh
dashboard launch context reaches the installed operation, the receipt belongs
to that session, and durable receipt precedes local Done without stopping the
sending turn. Cover attention retention, retry, and retirement representatively;
reuse unchanged host integration only with matching mechanism evidence.

**Skill behavior acceptance:** Fresh native Land and Wrap Up use settles the
existing operations, gives no routine success recap, submits the same useful
attention text retained by the dashboard when needed, and reports unfinished
operations or unacknowledged delivery truthfully. Direct use needs no dashboard
connection. Shared integration success does not prove these skill behaviors.

**Completion criteria:** Require integration evidence on all three hosts and
representative Land/Wrap Up behavior evidence or justified reuse per requirement;
pending requirements cannot be called passed. Complete before affected release
under ADR 0005. The slice-1 fixture proves only feasibility; no prior evidence was
reusable for this new callback. Paid runs remain explicit, outside default tests/CI.

**Current state:** [Recovered slice-1 observations](https://github.com/terryyin/open-dough/blob/db75dac39cc8a1aae33e7e881d5c3363730f93c9/.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md#accepted-execution-evidence-2026-10-02)
retain accepted Codex reporting, same-session continuation and post-retirement callability,
and accepted Cursor reporting on its original session. Native fixture trust was resolved
interactively. Claude's later “Code from External” rejection stopped its path until the
user explicitly approved the reviewed initial reporting command and an exact fixture-only
Bash rule. Recovery then resumed the original stopped Claude session: real Bash result,
matching receipt before session binding, exact reconciliation, retained acknowledgment,
and normal native `end_turn` were inspected and accepted by the coordinator.
No global permission mode, broad allowance, unapproved phase, or alternate rejected route
was used. The three-host fixture evidence establishes mechanism feasibility only, including
representative early binding, continuation and post-retirement callability. Shipped integration
and actual quiet Land/Wrap Up skill behavior remain unproved on all three hosts; complete
that separate acceptance before affected release. Selected plan execution and subsequent
acceptance selection retain their own authority boundaries.

**Additional covered work:** [SEED-145's quiet retrospective and planned
execution story](https://github.com/terryyin/open-dough/blob/651df7b18c3d873e4e81a3080db3b65aeb7aa0c8/.planning/seeds/SEED-145-no-news-is-good-news.md#quiet-execution-and-retrospective),
[plan 332](https://github.com/terryyin/open-dough/blob/651df7b18c3d873e4e81a3080db3b65aeb7aa0c8/.planning/slice-plans/332-quiet-execution-and-retrospective/PLAN.md). Its
functional guidance and credential-free assessor checks do not prove native
response selection. This extension changes no backlog assignment and authorizes
no paid sessions, release or rollout.

**Retrospective and execution behavior cases:** Select fresh installed sessions
by unresolved risk. Use the existing
[execution-review journeys](../../tests/native-publication.md) for controlled
review/completion/CI ordering where they fit; inspect standalone and attention
semantics against the following expectations rather than adding another runner.

| Case | Required observed outcome |
| --- | --- |
| Standalone settled review | No routine recap for no findings or already settled records; preserved proof, process findings and authorized dispositions remain inspectable. |
| Standalone actionable review | A draft or unresolved correction/adoption choice starts with `DEVELOPER ATTENTION REQUIRED`, names consequence, action/owner and evidence links; an explicit detail or review request remains effective. |
| Explicit no-wrap-up control after review | The existing `execution-review` fixture expressly prohibits wrap-up. Review returns without a separate visible report; record and records-only publication precede the completion operation. Actual applicable CI and product shutdown succeed before a quiet/minimal response, with workspace retained for the requested stop. |
| Explicit review skip with no-wrap-up control | Records `Product advice: retrospective skipped`, completes observation/shutdown, and finishes quietly without an optional-skip warning, automatic review or violation of the fixture's explicit stop. |
| Duplicate attention followed by green CI | Overlapping reviews contribute one current issue after completion. A later successful check or no-change advice does not erase it; an evidenced authorized disposition can settle it. |
| Failure or missing evidence | A required failure, missing attribution/requested process history, or unconfirmed shutdown produces marked limitation and recovery action; partial review and needed resources survive, and no unsupported success is claimed. |
| Reporting boundary | Direct invocation makes no dashboard contact. Supplied context submits the exact marked attention text with completed/unfinished outcome and waits for its matching receipt; a quiet execution handoff submits nothing and leaves terminal/session continuation intact. |

Evidence distinguishes accepted publication from validated integrated state and
retains review limits, findings/correction records and receipts in existing homes.
Quiet output grants no wrap-up, retirement, follow-up execution or advice-adoption
authority; explicit no-wrap-up controls retain their requested stop. Continuation
is covered below. Empty response, a banner, host exit, static guidance assertions
and substitute processes prove none of these operations. Assess native meaning and actions.

**Reuse and outstanding proof:** The earlier three-host reporting feasibility
evidence above remains limited to its unchanged callback mechanism. Inspect its
current inputs and conditions before reusing it for shipped integration; it does
not establish review behavior or the agent's choice to report. Existing
installation/publication evidence may cover unchanged mechanisms with a recorded
matching basis. Old banner-bearing transcripts cannot prove changed quiet or
actionable responses and must not be rewritten.

The shared attention framing also applies to Land/Wrap Up refresh attention.
Their bounded response assessor checks quiet/minimal output and refresh action
semantics; its unmarked positive fixtures do not prove marker-first framing.
Inspect that framing in native acceptance rather than treating its automated
pass as full attention-response acceptance.

| Host | Shared integration | Changed retrospective/planned-execution behavior |
| --- | --- | --- |
| Codex | Prior feasibility only; shipped integration pending or justified reuse required | Pending |
| Claude Code | Prior feasibility only; shipped integration pending or justified reuse required | Pending |
| Cursor | Prior feasibility only; shipped integration pending or justified reuse required | Pending |

For each affected requirement on each host, record fresh evidence or justified reuse;
select representative cases without transferring host results or requiring every
scenario everywhere. Separate integration and skill behavior claims. Functional
implementation may close with acceptance pending; affected release waits for acceptance
or a human-owned ADR 0005 exception. Paid native runs remain explicitly invoked.

**Additional covered work — planned continuation:** The linked
[acceptance cases](SEED-053-native-guidance-acceptance/planned-continuation.md)
extend this home. All three hosts remain pending; assignment and ADR 0005 still apply.

<a id="guarded-local-delivery-prerequisites"></a>

### Accept guarded local preparation, commit and publication on each host

**Identity:** SEED-053#guarded-local-delivery-prerequisites
**Implementation:** [SEED-146](https://github.com/terryyin/open-dough/blob/60c164841e0ca9178a80702e595d3c0c6b826038/.planning/seeds/SEED-146-gate-local-delivery-prerequisites.md#gate-local-prerequisites-before-commit-and-delivery)
and [plan 331](https://github.com/terryyin/open-dough/blob/60c164841e0ca9178a80702e595d3c0c6b826038/.planning/slice-plans/331-gate-local-delivery-prerequisites/PLAN.md).
**For / outcome:** Developers using Codex, Cursor, or Claude Code can rely on
installed execution and owned-repair guidance selecting the guarded fresh path,
withholding dependent work after local failure, and retaining legitimate
already-published recovery. This is an unqueued acceptance candidate; it grants
no native-run, queue assignment, or implementation authority.

**Scope and evaluation:** Use installed guidance in a disposable repository
with project-resolved requirements, real Git/hooks and an authorized local bare
remote. Observe actual chosen commands, required inputs, HEAD/index and retained
edits, remote refs, and observer/registration evidence. Require:

- An installed required prerequisite fails (include a required plan/status
  mutation representatively): no dependent commit, publication, or new observer
  begins; filtering output does not enable downstream effects.
- A project hook refuses commit: retain the staged work and older HEAD, and
  withhold publication/observation for that failed attempt.
- Repair the prerequisite or hook and follow the same guarded journey through
  one successful commit, exact-receipt publication and authorized observation.
  Keep local-only/current-branch authority and owned-repair integration in the
  representative shared cases.
- Resume an already-published retained candidate, including a lost response and
  later remote tip representatively, without another commit or duplicate push;
  preserve candidate/base and the actual observer owner.

**Per-host evidence:** Native selection and follow-through remain pending on
Codex, Cursor, and Claude Code. Each host must supply integration evidence for
its installed command and coordinator/observer identity: retained yielded Codex
stream; Cursor's own tool/session; Claude Code's own Bash/session, including
explicit agent identity when applicable. Shared deterministic cases and evidence
from another host do not establish this choice. Record each required case's
fresh evidence or justify reuse with matching guidance, mechanism, environment,
and observed boundary; old publication evidence alone proves no new path choice.

**Release condition:** Functional SEED-146 implementation may close while this
acceptance remains pending. Under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
an affected release waits for these observations or an explicit human-owned
exception that preserves the pending requirements. Paid native sessions are
explicitly invoked only; add none to default tests or CI. No native session was
run or accepted while recording this candidate.

<a id="match-historical-replay-inputs"></a>

### Match native replay inputs to historical evidence

**Identity:** SEED-053#match-historical-replay-inputs

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/337-match-historical-replay-inputs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c3afb68f7009648b0accbaa3c0aa94d2af736f7a6b3db2ef729848026028e3a1","plan":"b610b8caa0f3ef83d02b975b24728f553810ec634c2e63d9c2ee76d9a49286f4"}}
```

**Goal:** Open Dough maintainers can tell before a paid native replay
whether the fixture preserves the knowledge and delegation conditions that made
the historical failure possible, so the resulting run can answer its intended
question. [DD-320](../../ProjectFindings.md#dd-320) records the extra paid run and
inconclusive replay that motivate this repository-owned response.

**Scope:** Compare the existing `delivery-evidence/scheduling` scenarios with
the retained plan-302 and plan-310 occurrences before selecting another paid
run. Make the comparison available in the maintained native-test documentation,
beside the existing launch instructions. Name the historical source and its
limits, scenario inputs, actor receiving each instruction, material differences,
and the question a later authorized run could answer. Inspect the generated
prompt, AGENTS.md, seed/plan and installed-guidance conditions together; a neutral
top-level prompt alone does not establish equivalent knowledge.

Keep `stylesheet-extraction` usable as a known-cost control and
`planned-extraction` as a qualified coordinator scenario. Neither currently
establishes a faithful delegated-implementer replay. Preserve that distinction
in scenario descriptions and interpretation of existing scheduling verdicts.
Do not force delegation or supply a preferred proof schedule to manufacture
reproduction. A small, evidence-linked manual comparison is sufficient; reuse
the existing harness, input checks and evidence homes without a new replay
framework or machine verdict for historical equivalence.

**Key examples:**

- Given plan 302's retained brief estimated the suite at “a few minutes”,
  selecting the quick fixture exposes its fourteen-minute instruction and
  new-stylesheet rule as introduced knowledge. Its observed no-suite refactor
  brief and implementation-time extraction explain why the first paid result
  cannot establish the historical scheduling boundary, even with final proof.
- Given plan 302 and plan 310 used delegated implementers, selecting the
  planned fixture shows that it selects one slice for a coordinator who may
  implement locally. Removing cost/layout hints does not reproduce delegation,
  plan 302's mistaken cost estimate, or plan 310's explicit whole-suite briefs.
  A refactor-agent call alone does not establish implementation delegation.
- Given only a retained summary or an unknown installed-guidance provenance,
  the comparison labels that context unknown and historical reachability
  inconclusive. It cites what is recoverable and states which conclusions a
  later run would leave unproved; it does not reconstruct missing instructions
  as historical fact.
- Given an intentional control or explicitly qualified scenario, the maintainer
  can see its useful question and limitations before launch. Credential-free
  fixture checks establish the actual inputs and preserve existing proof
  controls; they establish no agent behavior, successful historical replay,
  or savings. Native evidence remains limited to its observed host and conditions.

**Deferred promises and constraints:** No published-skill change, generic
replay system, new host integration, proof-scheduling remedy or forced historical
reproduction. Paid runs, release and rollout are outside this delivery; no paid
run enters default checks or CI. This comparison neither reopens ODF-249's
settled no-guidance-change disposition nor claims its historical defect resolved.
Missing context limits the claim rather than prohibiting an explicitly labelled
control. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs native evidence and host-specific reuse.

**Completion:** Update DD-320 at its canonical finding location with the actual
response revision, direct comparison evidence and any remaining native outcome
gap; queueing and fixture checks alone do not resolve the historical finding.
The response can be implemented with the native outcome still unobserved;
record those facts separately, retaining the qualified original occurrence.

## Shared premise-verification cases

These cases are the shared premise-verification setup. The guidance is delivered.
The Pygardon miss is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`.
Claude Code acceptance is recoverable at
`874f9a8:.planning/seeds/SEED-044-verify-planning-premises.md`.

**Reusable cases** (from plan 115 slice 2, recoverable at
`874f9a8:.planning/slice-plans/115-verify-planning-premises/PLAN.md`):

| Case | Revision | Pass when the written plan |
| --- | --- | --- |
| Doughnut "no test" | parent of `20efa7ec81`, seed from `20efa7ec81` | names `scripts/test/quality_changed.test` with a recorded observation instead of claiming the commit-gate script has no test |
| Pygardon seeding proof | parent of `b2ad7c394`, seed and backlog from `b2ad7c394` | proves the moved seeding with a feature that runs the seeding script, such as `live_strategies.feature`, not `strategy_verify.feature` alone |
| Open Dough control | parent of `e7107e5`, seed from `e7107e5` | records observations, reaches `ready`, and adds no probe slice, new approval or full-suite run beyond plan 111 |

**Setup per case:** A disposable clone with `origin` removed, checked out at
the pre-plan parent; restore the refined seed with its story state reset to
`refined`/`unselected`; run `install.sh --target <clone> --source <open-dough
checkout> --platform <host> --force`; then run the host's planning-only
invocation naming the story link, told not to implement, commit, push or
publish.

**Constraints:** Paid native runs are manually triggered only. Add none to
`npm test`, `scripts/test.sh`, CI, or a wrapper whose default calls a real
host. Each case runs once per guidance version, and claims stay limited to
the observed runs compared with a pre-change baseline on that host.

**Claude Code reference:** The baseline caught Pygardon but missed Doughnut.
After the change all three cases passed; the control's observations were
heavier than brief.

**Cursor premise evidence (2026-09-29):** guidance installed as Open Dough
`0.3.46` from source checkout `0901bbabd1b08ee49a0c843d19bbecf271ed0bf1`,
Cursor agent `2026.09.28-64d2043`. One planning-only run per case
(`cursor agent --print --force --trust --sandbox disabled`), told not to
implement, commit, push, or publish. Transcripts and written plans are under
`native-results/cursor-premise/`.

| Case | Verdict |
| --- | --- |
| Doughnut "no test" | **Pass.** Plan `043` names `scripts/test/quality_changed.test` and records that its fake `pnpm` sees unstaged files for format and only staged components for lint. It reaches `ready`. |
| Pygardon seeding proof | **Fail.** Plan `208` moves `gate_baseline_genome` under tests and proves that with pytest. It never names `live_strategies.feature` or `seed_named_genome_live_strategy_pair.py`, although that feature was in the checkout. The guidance change is recoverable at `24b5cbc1a821382d38b726d6079ac55e01635391:.planning/seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding`. |
| Open Dough control | **Pass, heavier than plan 111.** Plan `111` records five observed premises, reaches `ready`, and adds no probe slice, new approval, or full-suite run. Its proof also names dashboard Playwright specs that assert plan paths. |

## Shared one-shot cases

[Claude Code's accepted evidence](SEED-028-track-ad-hoc-work.md#story-decomposition)
covers `publication/one-shot-result`, `publication/one-shot-queued`,
`publication/admission-investigation` and `publication/one-shot-escalation`.
The [Cursor](#native-acceptance-cursor) story retains acceptance of these
cases on its own host.
ADR 0005 requires acceptance before ordinary release of affected behavior.
The [release history](../../CHANGELOG.md) records explicit maintainer exceptions
that shipped this behavior with native acceptance still pending; those
exceptions establish neither a pass nor closure of these requirements.

## Priority and regrouping

Keep the Cursor acceptance story in its backlog position; unrelated entries keep their order.

## Breadcrumbs

- Maintainer request on 2026-09-28: one existing acceptance story per host;
  preserve scope and approximately preserve priority.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Maintained CI background-delivery behavior and native acceptance](../../docs/maintainer/ci-background-delivery.md).
