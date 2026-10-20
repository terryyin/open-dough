# Quiet execution and retrospective completion

**Source:** [SEED-145 — Keep retrospective and execution completion quiet and make required attention unmistakable](../../seeds/SEED-145-no-news-is-good-news.md#quiet-execution-and-retrospective).

**Identity:** SEED-145#quiet-execution-and-retrospective

## Goal and scope

A developer sees a prominent, actionable message when retrospective or planned
execution completion needs attention, and no routine success recap when all
applicable work and dispositions are settled. Cover standalone and automatic
retrospectives, planned execution with review or explicit skip, and their combined
handoff. Keep proof, findings, correction plans, product advice and completion
receipts in their existing homes.

Preserve explicit requests for details or review, human decision ownership,
missing-context stops, review preferences, execution-complete publication,
applicable CI/shutdown, dashboard receipt semantics and recovery. Quiet completion
does not start wrap-up or execute/adopt follow-ups. Story 4 owns automatic
wrap-up; no session-state redesign, new reporting registry, new CI lifecycle,
release or rollout belongs here. The wholly planless Execute Plan handoff is not
an additional delivery promise; standalone retrospective still supports its
existing planned, quick and quick-to-planned inputs.

## Architecture and reuse

Apply [maintainer guidance](../../../AGENTS.md) and Accepted
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Their index and in-file statuses agree; no exception or new ADR is needed.
The [North Star](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
already separates launch/session disposition from published story state. Follow
that direction without adding a topic.

PFE decision: extend the existing completion-attention judgment to these callers,
with each workflow retaining its operational and response ownership.

| Responsibility | Existing owner and planned use |
| --- | --- |
| Decide whether completion needs human attention | [Completion attention](../../../src/skills/dough-land/references/completion-attention.md) already distinguishes settled findings from unresolved choices, preserves requested details, and forbids treating silence as proof. Generalize its shared judgment and prominent attention form; keep closure-only retirement and final dashboard operations conditional on their owning workflow. |
| Review evidence and disposition | [Retrospective](../../../src/skills/dough-execution-retrospective/SKILL.md) owns review selection, attribution, correction planning, designated writer and process recording. Change its response contract, preserving those responsibilities and the return to an invoking execution. |
| Final execution handoff | [Finish or stop](../../../src/skills/dough-execute-plan/references/finish-or-stop.md) owns record publication and completion before final output. Replace mandatory success reporting with the shared judgment; aggregate review attention here. |
| CI evidence and shutdown | [Completion mechanics](../../../src/skills/dough-execute-plan/references/ci-completion-wait.md) owns receipts. Preserve the distinction between the accepted revision and validated integrated state. Scope its success-report wording so it cannot reintroduce a routine recap. |
| Dashboard reporting and session continuity | The existing attention-only handoff in `finish-or-stop.md`, `dashboard/server/reportingInstruction.ts`, and completion reporting already support exact messages, no submission on quiet handoff, and separate Land/Wrap Up closure. Reuse them; do not infer final Done from review, a banner, or silence. |

One rule governs the sequence: the current unresolved need determines attention,
not the existence of a finding or the last operation's success. Separate
standalone and invoked response owners reflect their actual lifecycle. No
Structure slice, report persistence layer, or duplicate disposition parser is
justified.

## Outside-in proof ownership

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Standalone review is quiet with no outstanding action; settled records create no reminder (examples 3, 4) | Slice 1 | Representative behavior walk compares no findings, recorded/settled findings, and a draft needing disposition. Current instructions choose quiet or a marked actionable response while preserving the allowed records. |
| Genuine findings, missing evidence and explicit detail/review requests remain visible (examples 4, 5, 8) | Slice 1 | Walk unresolved correction adoption, requested-but-unavailable process history, and requested detailed review; inspect issue, consequence, owner/action and links, and limited completion claims. |
| Automatic review returns immediately; duplicate reviews yield one current attention set (examples 4, 6) | Slice 1 returns; slice 2 consumes | Trace review return through execution completion. One unresolved item survives a later green CI result, appears once in the final handoff, and disappears only after an authorized disposition. |
| Planned completion and explicit review skip are quiet after all gates (examples 1, 2) | Slice 2 | Updated completion guidance/consumer checks preserve record → publication → completion operation ordering; revised assessor accepts silent/minimal success only with real completion observations and rejects missing review/shutdown. |
| Failed or incomplete work remains actionable and recoverable (example 5) | Slice 2 | Preserve failure/partial-review/observer cases; bad observations fail even with a success marker. Attention identifies the actual gap and required recovery without claiming successful completion. |
| Dashboard handoff reports attention exactly, makes no quiet submission, and does not close execution (example 7) | Slice 2 | Trace the taught reporting branch and existing dashboard caller to stored message/receipt and retained terminal. Reuse matching unchanged runtime proof; test any runtime change through its actual installed command and displayed consumer. |
| Cross-host behavior, evidence preservation, no automatic wrap-up or follow-up execution | Both slices | AGENTS behavior review of invocation, required context and useful outcome; linked native acceptance for affected behavior on Codex, Cursor and Claude Code, with integration reuse separately justified. |

## Ordered slices

### 1. Make retrospective results quiet or explicitly actionable
Type: Behavior
Status: done
Proof: Walk the selected retrospective through quiet, unresolved, limited and
requested-detail outcomes; focused guidance checks protect shared attention,
review ownership and evidence boundaries.

Behavior: Given an attributable execution and the selected reviews, completing
the retrospective produces no routine success/no-findings recap. An outstanding
choice, limitation or pending draft disposition produces a prominent actionable
message for standalone use, or an attention return to its invoking execution.

- Extend the existing shared attention rule rather than introducing a parallel
  rule in the retrospective. Keep closure-only operations from becoming
  retrospective duties merely because the rule is shared.
- Replace the retrospective's compulsory success report/banner and
  success-first attention appendix. Keep the exact recognizable
  `DEVELOPER ATTENTION REQUIRED` phrase; put actionable content first.
- Retain internal identity, provenance, manifest, judged proof, review limits,
  correction links, process findings, product advice and designated-writer
  handling. Do not create a report artifact or new persistent attention ledger.
  A standalone written draft needing disposition remains an action; a record
  already settled under existing authority does not.
- An automatic review returns directly to execution with enough evidence to
  continue, without another visible final report or confirmation. A repeated
  review contributes only current unresolved attention; passing CI cannot
  silently dispose of a finding.
- Review descriptions and linked references from the executing project's
  perspective, including skipped/unavailable reviews and explicit detail
  requests. Preserve current write and publication authority.
- Extend focused guidance checks beside the relevant skills. They check
  instruction contracts, not native behavior. Prefer meaningful requirements
  over fixed prose ordering; exact matching is appropriate for the attention
  marker. Keep Land/Wrap Up's settled-success controls green.

Focused checks: `PATH="/opt/homebrew/bin:$PATH" npm test --
src/skills/dough-land/scripts/completion-attention-guidance.test.mjs
src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`,
plus any new retrospective guidance file and affected existing consumers.
Update marker-specific assertions whose promised behavior changed while
preserving their review/completion ownership assertions.

Safe stopping point: Direct retrospectives have useful quiet/attention behavior.
Automatic reviews return current attention correctly, but execution's compulsory
success recap remains an explicit interim until slice 2; it is not the final
combined outcome or a releasable completed story.

Sizing: One response-selection and return-ownership loop, including focused
checks and cleanup. No numeric slice target or hard limit is supplied.

### 2. Finish planned execution with one attention-only handoff
Type: Behavior
Status: done
Proof: Updated handoff consumers and credential-free completion assessor controls
accept quiet success with valid evidence, reject false success, and preserve
actionable failures and the supplied dashboard handoff contract.

Behavior: Given delivered planned work and a completed or explicitly skipped
review, execution publishes its completion records and handles applicable
CI/shutdown receipts. It then stays quiet when settled or reports the current
attention once, preserving the workspace and separately authorized wrap-up.

- Apply the shared rule in both reviewed and skipped planned completion.
  Remove mandatory slice/proof/advice/CI success summaries and execution
  banners; keep the execution-complete record, advice/skip reasons, obligation
  check and records-only publication before the completion operation.
- Preserve partial-review recovery, requested-history limitations, failed
  delivery, failed/unconfirmed shutdown, and the explicitly selected background
  CI alternative. A pending/background receipt does not imply success; retain
  and report its unresolved state under existing ownership.
- Align successful integrated-state wording in completion mechanics: retain
  accepted and validated revisions as evidence, report them accurately when
  requested or needed for an action, and do not force a quiet success recap.
- Consume automatic review attention once after completion handling. Neither
  `Product advice: no change` nor a later successful check erases an unresolved
  issue. Keep explicit review stops and detail requests effective.
- Preserve dashboard context boundaries: no contact on direct use; completed
  attention and unfinished attention submit the exact marked message and await
  their matching receipt; quiet handoff submits nothing. Do not invoke wrap-up,
  retire execution resources or mark the session done from this handoff.
- Follow removed banners through completion-record guidance tests,
  CI-lifecycle guidance tests, the native completion observer/assessor,
  counterexample fixtures and evidence helpers. The current assessor requires
  one success marker: replace that proxy with the intended response check,
  retaining actual review order, completion call, CI and product-shutdown
  observations. Empty output alone never passes. Do not rewrite historical
  native transcripts to claim new behavior.
- Preserve the wholly planless handoff's existing separate authority and
  no-automatic-retrospective boundary. Touch its consumer assertions only if
  needed to keep the shared changes coherent; add no new quick-work journey.

Focused checks: `PATH="/opt/homebrew/bin:$PATH" npm test --
src/skills/dough-land/scripts/completion-attention-guidance.test.mjs
src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs
src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
tests/git-publication-native.sh tests/payload-declaration-links.sh`, plus new
focused behavior checks. The shell check's default is credential-free and
exercises real assessor/observer controls with substitutes; it is not native
agent acceptance. Inspect any changed reporting/runtime consumer and run its
complete focused suite; `dashboard/tests/agent-completion-execution.spec.ts`
currently observes installed reporting, stored receipt and terminal retention,
not the agent's decision to report. Do not claim it proves that choice.

Native acceptance handoff: Before implementation closure, link the changed
requirements to a separate native acceptance story under ADR 0005, reusing an
applicable active home or recording an unqueued candidate through the existing
story workflow. Cover installed standalone quiet review, actionable review,
automatic review plus quiet planned completion, skipped review, duplicate
attention with later green CI, and a required failure/missing-evidence stop.
Include direct versus supplied-dashboard reporting and evidence preservation.
Choose representative cases by unresolved risk, with evidence or justified
reuse for each affected requirement on each host. Existing publication and
installation evidence may cover unchanged mechanisms; old banner-bearing
transcripts do not prove the changed response. Do not start paid native sessions
implicitly. Functional implementation can finish with that linked acceptance
pending; affected release waits for acceptance or a human-owned exception.

Safe stopping point: Retrospective and planned execution share one complete
attention rule. Automatic closure remains independently deliverable in story 4.

Sizing: One final-response loop through existing review/record/CI/reporting
owners, including their consumers and focused controls. No new orchestration
framework or host adapter is implied.

## Current decisions

- Execution authorized by the 2026-10-20 `dough-execute-plan` invocation with
  the established start below. No release or rollout is authorized; no
  human-owned scope or ADR decision remains for this approach.
- Edit client guidance in `src/skills/`, not installed managed copies.
  Keep any newly required runtime dependency in the declared payload and verify
  its links; installation/update/coexistence add their own checks only if changed.
- Use the installed execution workflow's proof, independent refactoring, commit
  and delivery gates when execution is authorized. In this repository use the
  selective formatter before staging, check staged whitespace, and preserve
  the pre-commit hook's staged lint and conditional typecheck.
- Local proof follows [tests/README.md](../../../tests/README.md). Hosted CI
  alone adds no full-suite local gate. AGENTS' representative skill behavior
  review remains required and distinct from deterministic checks and native
  acceptance.

## Preparation observations

See [the retained preparation observations](preparation-observations.md) for
the baseline guidance tests, marker-dependent assessor counterexample and
native-evidence limits. These observations predate implementation.

## Learnings

Removing a success banner changes a test consumer outside the skill's own
guidance. Keep operational completion observations authoritative while changing
response expectations. Otherwise a correct quiet handoff would appear to fail,
or a visible banner could stand in for required evidence.

## Execution context and proof

[Execution identity, observer and accepted slice proof](execution-evidence.md)
remain part of this plan for continuation, retrospective and wrap-up.
Native behavior remains assigned to [SEED-053 acceptance](../../seeds/SEED-053-native-guidance-acceptance.md#quiet-dashboard-completion).

## Story obligations

### G1. Execution recap remains during retrospective-only increment
Reported: slice 1 — "Execute Plan still mandates its success recap until slice 2."
Story clause: "Remove successful slice summaries, no-findings reports, routine advice/no-change recaps, and success-only banners."
Disposition: proved by slice 2: [accepted guidance and assessor/observer controls](execution-evidence.md#slice-2); inspected reviewed/skipped completion, partial recovery and dashboard handoff paths preserve operational gates while removing mandatory recap/banner output.

### G2. Native behavior proof is separately tracked
Reported: slice 1 — "Native acceptance remains pending under ADR 0005; no native execution or cross-host behavioral proof claimed."
Story clause: "Native acceptance remains separately tracked under ADR 0005; release and rollout are not part of this implementation story."
Disposition: excluded "Native acceptance remains separately tracked under ADR 0005; release and rollout are not part of this implementation story."

### G3. Closure framing remains a native acceptance observation
Reported: slice 2 — "Closure automated pass cannot be claimed as full current attention-response acceptance."
Story clause: "Native acceptance remains separately tracked under ADR 0005; release and rollout are not part of this implementation story."
Disposition: excluded "Native acceptance remains separately tracked under ADR 0005; release and rollout are not part of this implementation story."
