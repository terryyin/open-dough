# Verify native agents publish Taken before queued work begins

Status: planned.

Identity: `SEED-008#accept-queued-start-native-behavior`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#accept-queued-start-native-behavior).
On 2026-09-23 Terry confirmed reliable shared state as the most important next
milestone for a useful dashboard and requested slice planning and refinement.
This request authorizes preparation, not native execution or product changes.

## Goal and scope

The maintainer can judge whether the installed startup behavior makes agents in
Codex, Cursor, and Claude Code confirm an owned Taken claim on remote trunk
before project setup and the first implementation change. Refusal must stop
unsafe starts; resume must retain ownership without a duplicate Take. Preserve
selected source and unrelated local work. Both Trunk Mode and Story Branch Mode
remain covered, with justified evidence reuse rather than a host/scenario matrix.

Accept the startup implementation introduced at
`1a63c0c5045703006af621f785e81cf6301873d3` as carried by the actual candidate
chosen for execution. The superseded-runner correction was delivered at
`6f5d0ef` and closed at `f520217` while this plan was being prepared. Its plan
and completion evidence are recoverable at
`d10131b:.planning/quick/081-retire-legacy-claim-runner/PLAN.md`.
Assess its effect on the chosen candidate before the final acceptance judgment;
removing the duplicate runner does not automatically invalidate native behavior
proof. Final acceptance must identify the intended resulting candidate and
justify applicability to it.

No new startup feature, general agent-competence test, host mode, dashboard UI,
ownership naming, CI automation, later publication caller migration, local
checkout coordination, release/version change, or broad test-framework cleanup.
The fixture's first implementation change is sufficient; full feature delivery
and wrap-up are outside this acceptance. Real product failures route to a bounded
correction, preserving evidence and leaving the affected acceptance pending.
Only concrete assessment gaps may change the existing runner/fixture here.

## Existing solutions and decisions

Follow Accepted [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
review reusable evidence first, assess native behavior independently per affected
requirement and host, bound retries, and finish acceptance before releasing the
affected behavior. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
distinguishes the selected source candidate from a released installed revision;
this work creates no release or exception. The existing
[North Star remote-publication topic](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
keeps shared claim publication, local refresh, and CI coverage separate. ADR 0009
remains Proposed. No new architectural decision or North Star topic is needed.

PFE assessment: reuse the maintained publication-native journey, not the ADR
discovery harness, dashboard fixtures, or a direct command invocation as a
replacement for native behavior. Those alternatives own different promises.

| Responsibility | Existing owner and use |
| --- | --- |
| Installed startup and caller | `src/skills/dough-execute-plan/scripts/execution-start.mjs` and the skill's Take queued work section. Observe actual invocation and subsequent agent behavior. |
| Native launch and retention | `tests/git-publication-native.sh`, `tests/support/git-publication-native-{host,run,evidence}.sh`; select an explicit startup case and retain trace, version, candidate, and observations. The no-case host defaults run other publication journeys and are unsuitable here. |
| Real preconditions and observations | `tests/support/git-publication-native-startup-fixture.sh`; queued source, bare origin, pending human work, and setup markers. Ordinary startup does not pre-create the claim. Rival/resume fixtures intentionally establish prior claims and prove only the resumed decision. |
| Verdict and counterexamples | `tests/support/git-publication-native-startup-assess.sh`, `git-publication-native-counterexamples.sh`, and the default credential-free runner. Extend these only for the gaps assigned below. |
| Mechanical contracts | Actual CLI process tests `src/skills/dough-execute-plan/scripts/workspace-publication-startup-{race,recovery}.test.mjs` plus payload/caller checks. Reuse applicable results; these cannot establish native adoption. |

Historical accepted observations and gaps are recoverable from
`ce77380fa796b04e70d1d9973f930ce54f5bacb2:.planning/quick/080-publish-startup-claims/PLAN.md`
(slice 1 execution evidence and slice 2 accepted proof) and the source story.
Those summaries guide recovery; they are not substitute transcripts or blanket
acceptance. Recover available decisive artifacts from their recorded locations
or Git. If a required observation cannot be recovered or justified, obtain fresh
proof rather than upgrading the summary into a pass.

## Shared proof discipline

At execution entry, identify the candidate revision and any relevant uncommitted
changes, actual installed payload, native runtime/version, adapter, prompt,
fixture, and assessor. Use a stable candidate for selected runs. Review changes
since historical proof by affected requirement; unrelated edits do not require
rerunning accepted cases. Reconcile later candidate changes before final judgment.

For each slice record compact requirement/host judgments in this plan: fresh
pass, justified reuse with decisive evidence, or unresolved with a reason. Give
the literal command, inspected setup/observation locations, candidate/runtime,
and actual result. Store original active artifacts under this plan's `evidence/`
using the existing runner. Do not copy whole transcripts into the plan or add a
parallel evidence registry. Integration proof and skill behavior stay distinct.
Preserve active evidence until assessment and eventual wrap-up; ADR 0005 owns
its later deletion with Git recovery.

Fresh prompts state the user's task and authority without giving the expected
command sequence. Inspect complete native command/use traces and independent
remote/local observations. Self-report, exit zero, static checks, another
host's success, or quota refusal are insufficient. Check that claim ownership is
current, not merely that an old publisher trailer appears somewhere in history.

Commands below run from the eventual owned execution checkout, using Bash 4+
as required by the repository. The existing native runner defaults to a
900-second deadline and 15-second termination grace; these are per-run bounds,
not slice estimates. Attempt each selected unresolved case once, inspect the
result, and retry only after a diagnosed cause or changed access condition.
Do not poll quotas or rerun until green. A host access failure stops that host's
dependent proof; independent evidence review or available-host work may continue.
Missing host proof never completes its slice or the story.

## Ordered slices

### 1. Confirm ordinary startup publishes the shared claim before work

Type: Behavior
Status: planned

Behavior: prepared queued work and authorized workspace/remote, with unrelated
local edits -> a fresh agent follows installed guidance in either supported
mode -> remote trunk confirms its owned Taken claim before setup and the first
implementation change; local work survives even when checkout refresh is deferred.

Review Cursor ordinary Story Branch evidence for reuse. Resolve the Codex
ordinary-startup gap and the tightened Claude ordinary-startup gap. The recorded
Codex run published and ran setup but delegation failed (`no thread with id`);
it is partial evidence, not a completed startup-to-first-change observation.
The earlier Claude pass and later API-limit result need assessment against the
current setup-order requirement. Do not add full implementation completion as
an acceptance condition or silently waive a missing first-change observation.

Proof: use `publication/startup-trunk` and `publication/startup-story-branch`.
Inspect installed invocation, remote Taken membership/provenance, remote target,
setup and command markers, first implementation tool action, and exact human
and selected-source preservation. Story Branch's claim must be on trunk, not
only its execution branch. Reuse matching mechanical proof for safe/deferred
local refresh; do not equate a deferred refresh with failed remote publication.

Concrete assessment gap: current `first-edit-after-claim` and setup order rely
on final file mtimes. An early edit/setup followed by a later rewrite can pass
that check. Combine the native tool trace and authoritative claim receipt with
remote state; when ordering is not decisive, leave it unresolved. Add the
smallest observation/assessor improvement only if needed for a reliable verdict,
with an early-edit-then-rewrite counterexample. No generic event framework.

Selected commands, unless the exact requirement is covered by justified reuse:

```sh
bash tests/git-publication-native.sh --native codex --case publication/startup-trunk --results-dir .planning/quick/082-accept-queued-start-native/evidence
bash tests/git-publication-native.sh --native claude --case publication/startup-story-branch --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

Only if Cursor reuse is insufficient, select its `publication/startup-story-branch`
case through the same command. Run `bash tests/git-publication-native.sh` after
any observation/assessor change; its substitute passes prove assessment logic,
not native behavior. No native or mechanical command is recorded as run here.

Safe stopping point: each host's ordinary-startup obligation is accepted or its
exact gap remains visible. Mark this slice done only when all its requirements
have passing native evidence or justified reuse. Other startup promises remain
owned by slices 2 and 3; ordinary startup alone does not complete acceptance.

### 2. Confirm unsafe startup stops before setup or implementation

Type: Behavior
Status: planned

Behavior: selected source differs from its published preparation, or a rival
already owns the queued story -> native startup returns the appropriate refusal
-> no setup or implementation begins, no unauthorized claim replaces the rival,
and selected source and human content remain unchanged.

These are two reasons the same startup continuation is denied; keep one refusal
rule with separate observations. Reuse the Claude selected-source refusal and
Codex same-story rival results only where recovered evidence is sufficient.
Assess coverage on every affected host without inferring Cursor's refusal
behavior from another host or its ordinary-startup pass alone.

Proof: inspect refusal/conflict tool receipts, trace order, remote history and
current ownership, unchanged source/human bytes, and absent setup/feature.
The rival fixture plants a real rival claim before the native session, so it
proves refusal on resume, not simultaneous native claim racing. Retain actual
CLI-process race proof for the latter mechanical contract.

Concrete assessment gap: the selected-source branch currently rejects feature
creation but does not assert setup absence. Add that assertion and a setup-after-
refusal counterexample in the existing assessor suite. Check both marker and
trace evidence; absence of a feature alone is insufficient. Inspect each setup
and command marker separately: the current combined `setup-exists` is false
when only one exists and therefore cannot prove neither ran. Preserve that
distinction in the smallest observation change and its counterexample.

Run the credential-free assessor/counterexample command after that change:

```sh
bash tests/git-publication-native.sh
```

For an uncovered host/requirement, use the existing explicit case (substitute
only the host identified by the evidence review):

```sh
bash tests/git-publication-native.sh --native claude --case publication/startup-selected-source --results-dir .planning/quick/082-accept-queued-start-native/evidence
bash tests/git-publication-native.sh --native codex --case publication/startup-claim-race --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

These are conditional fresh commands, not a mandate to rerun the recorded
passes. Preserve and assess native failures before routing an actual product
defect to correction; never weaken the intended refusal to obtain a pass.

Safe stopping point: every affected host has a justified unsafe-start verdict
and local preservation proof. Claim refusal can be accepted independently of
the remaining successful-resume obligation; incomplete proof stays pending.

### 3. Confirm interrupted startup resumes the existing claim once

Type: Behavior
Status: planned

Behavior: this execution's claim was already accepted, and an independent writer
advanced remote trunk -> a native agent resumes from retained workspace and
publisher/candidate identity -> current owned Taken is confirmed through remote
history, no second Take is made, and setup/implementation continue only afterward.

Reassess Codex retained-claim resume for reuse and resolve Claude resume, whose
recorded attempt hit the weekly limit before the command ran. Assess Cursor's
resume coverage explicitly and run it only for an unresolved host-specific gap.
The pre-created accepted claim is the interruption precondition; do not claim
that the resumed agent established ordinary initial publication.

Proof: inspect installed resumed receipt, current remote membership/ownership,
retained candidate ancestry and unchanged unrelated work, then setup and first
implementation action. Inspect claim commits and native calls to establish no
second Take or redundant claim publication. Overall remote HEAD need not remain
unchanged if the fixture's authorized implementation later publishes.

Concrete assessment gap: the native resume verdict currently checks containment
and ownership but does not explicitly count claim commits. Use independent Git
claim history and the native trace. Retain the fixture when needed with existing
`GIT_PUBLICATION_KEEP=1`, inspect its reported paths, and preserve only required
evidence before cleaning up that owned fixture. If reliable repeatable judgment
needs it, extend the existing observer/assessor and add a duplicate-claim
counterexample; one Taken row or one matched command alone is insufficient.

```sh
GIT_PUBLICATION_KEEP=1 bash tests/git-publication-native.sh --native claude --case publication/startup-resume --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

Use the same selected case with Codex or Cursor only when reuse cannot cover
their obligation. Run `bash tests/git-publication-native.sh` after changing its
observation/assessment logic. Reuse real CLI recovery evidence for the shared
mechanism; it does not replace host-native continuation evidence.

Safe stopping point: resumed ownership and non-duplication have an accepted
judgment on every affected host. Reconcile the three slices' judgments against
the final candidate and report acceptance only when none remain unresolved.
This final reconciliation is the story's completion check, not another slice.

## Proof ownership and execution gates

| Source promise | Owning slice and decisive boundary |
| --- | --- |
| Installed native adoption, both modes, remote trunk before setup/first change | 1: ordinary native trace plus independent remote and timing evidence. |
| Selected-source/rival refusal before work | 2: refused native continuation, no setup/edit, and preserved remote ownership. |
| Resume without another Take | 3: native continuation plus current ownership, ancestry, and claim-commit inspection. |
| Preserve human work and selected source | All three: before/after bytes and observed native actions in their respective journey. |
| Remote success separate from local refresh | 1, retained by 3: receipt/state plus matching safe/deferred-refresh mechanical proof. |
| Requirement-specific evidence on all hosts, truthful missing proof | Each owning slice records its host judgments; 3 closes the combined assessment. |

When execution is separately authorized, use the installed execution workflow's
workspace/claim, independent post-change refactor, proof review, selective format,
commit and delivery/CI gates. Native fixtures use disposable repositories and
installed candidate skills; do not update this repository's managed installed
copies by hand. Existing `npm ci` and tool dependencies apply in the execution
checkout if needed. Focus tests on changed boundaries; broaden only for an actual
affected caller or required execution/CI gate. Product behavior fixes are not
silently absorbed into this acceptance-only scope.

Three bounded Behavior slices, with no standalone evidence-inventory or harness
infrastructure slice. No project numeric slice target or hard limit was supplied.
Native latency and availability are execution risks; the bounded run policy
does not promise completion within one deadline. Reassess scope before pursuing
a new harness architecture, host integration repair, or repeated failed attempts.

## Slice-plan refinement review

Retain three slices. Fresh startup establishes a new shared claim; unsafe startup
denies continuation; resume recognizes an existing claim without duplicating it.
Each has its own observable verdict and safe pause. Source differences and rival
ownership are examples of the same denied continuation, so splitting slice 2 by
refusal reason would fragment one rule. Splitting by host would repeat the same
behavior and encourage unnecessary runs. Evidence review and the few concrete
assessor corrections stay with the behavior they prove, rather than becoming
standalone inventory or infrastructure slices.

Refinement tightened slice 2 to inspect individual setup/command markers rather
than accepting a false combined marker as proof that neither ran. It also keeps
first-edit ordering in slice 1 and duplicate-claim inspection in slice 3 explicit;
these gaps are assigned work with known proof boundaries, not unplanned gates.
No slices were replaced, split, or consolidated. Result: three Behavior slices,
no sizing exception or resplit recommendation, and no product-scope question.

Candidate selection/reuse applies to all slices. After that common context is
established, a host outage need not prevent independent observations for another
slice; preserve each incomplete verdict and do not mark it done. The earlier
quota event is an execution risk to recheck, not evidence that access is still
unavailable today. Final acceptance still requires all host obligations and the
intended candidate. No remaining slice-specific planning blocker was identified;
the plan is ready for execution when separately authorized, without claiming
native access or acceptance. Record readiness against this reviewed content.

## Preparation

Session-created preparation worktree:
`/Users/terryyin/git/open-dough-worktrees/082-accept-queued-start-native`, branch
`codex/082-accept-queued-start-native`, starting revision
`b6ea5af87ebd6ec23b8c3d5cccfe6aa0919e7aa5`.
Originating/integration checkout: `/Users/terryyin/git/open-dough`.
Project publication target for a later explicit keep: `origin/refs/heads/main`.
Terry subsequently authorized committing all this preparation, merging to main,
and removing this session's temporary worktree and branch. This keep decision
does not authorize native acceptance execution.
The established `.planning/quick/NNN-name/PLAN.md` allocation had 081 as its
highest entry; 082 was checked absent immediately before creation.

The story remains queued. This preparation has run no native acceptance and
claims no new product proof. Publication confirmation and resource cleanup are
reported by the preparation session after the remote contains the candidate.
