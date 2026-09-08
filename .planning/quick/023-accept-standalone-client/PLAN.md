# Accept one standalone client candidate

**Source:** [SEED-007 Story 3](../../seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow).
**Status:** In progress 2026-09-08 against candidate
`6682816a2385d96066883b5e4dc073b28e4b3d4f`. Slice 1 done. Native Codex,
Cursor, and Claude Code verdicts remain. No acceptance claimed.

## Goal and scope

Give the maintainer an evidence-backed acceptance decision for one standalone
client candidate on Codex, Cursor, and Claude Code. Review saved proof first;
run only missing representative integration and skill behavior checks. A single
update→fresh-use journey can cover several requirements on one tool.

Use the borrowed Donut `slice-planning` skill and its planning/decomposition
rules. Keep this plan in Open Dough; do not install or distribute the borrowed skill.
[Accepted ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires per-tool proof or justified reuse, shared behavior cases, and bounded
native runs. [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) preserves
human decision ownership. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
forbids automatic version choice; this plan does not publish.
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update.md) remains
Proposed. No conflict or ADR exception is needed.

Excluded: updater implementation, new test infrastructure, a full scenario
matrix, release/self-adoption, Donut changes, and reconciliation of old plans.
No Structure slice is needed: existing runners and evidence records suffice.

## Entry condition and current decisions

- **2026-09-08 owner decision:** Parking ended when SEED-001 Story 7 named the
  candidate below. Do not run [Quick 019](../019-standalone-client-update/PLAN.md)
  as written. Public `v0.2.1` is not the candidate. Publication waits for this
  plan's acceptance.
- The reconsidered [updater story](../../seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update)
  supplied the candidate revision, promised behavior, and completed cheap
  checks. Do not infer that Quick 019's old plan is that contract.
- Candidate: **`6682816a2385d96066883b5e4dc073b28e4b3d4f`**. Promised contract:
  remembered `SOURCE`/`VERSION`; ordinary no-URL update from the recorded
  source with baseline compare; unverifiable refusal; equal/newer verified
  skip; force complete latest; legacy supplied-source `--force` bootstrap.
  Naming this candidate does not authorize implementing missing updater
  behavior here. Fixture suitability and ordinary update→fresh-use remain this
  plan's job. Native leaves stay unexecuted.
- Before launch, compare the chosen runner's actual setup and prompts with that
  contract. The existing `delivery/updated-use` path uses inspected bootstrap and
  a newer tagged fixture. It must not be credited as proof of a different ordinary
  updater contract merely because both end with the same payload. Record fixture
  changes relative to the candidate and the scope they prove. If the existing
  path cannot prove the required behavior, record the gap and revise the affected
  leaf before execution; do not build a general runner or silently narrow acceptance.
- **2026-09-08 fixture review:** `dough-adr-awareness` bytes match Quick 014
  (`ff023b773bf9c5fc5f0f7cf09259df2b96044d28de93f24820820457cc62cd4e`). Working
  tree product files match candidate `6682816`. Deterministic delivery already
  applies ordinary no-URL `apply` from recorded `SOURCE`. Selected native
  `delivery/updated-use` previously interpolated `${delivery_source_url}` into
  the update prompt; slice 1 retargeted that existing selected prompt only.
  Host `--native` full-path wrappers (including legacy refusal) stay out of
  that leaf. Inspected bootstrap remains supplied-source `--force` and is not
  credited as ordinary update. Quick 014 does not prove the new update contract.
- Start with [Quick 014 evidence](../014-prove-codex-adr-use/EVIDENCE.md) for native
  loading, ADR behavior, and preservation. Follow its delivery-evidence links only
  for requirements still needing review. Compare guidance, native paths/adapters,
  helpers, fixtures, and runtime conditions; record reasons for reuse per tool.
- Separate integration claims from each skill's own behavior. Shared cases are
  defined once. Select an extra native case only for a named unresolved risk,
  including automatic application where promised. Do not prescribe clear/conflict,
  force, refusal, or edited-equal runs on every tool.
- Record decisions and decisive evidence here; retain raw attempts with the
  existing runner under `evidence/` beside this plan. Preserve original failures
  and assessments; add review judgments with reasons. Do not retry until green.

## Outside-in proof

For each tool, one acceptance review answers whether its affected discovery,
invocation/application, installation/update/coexistence, and intended behavior
requirements have sufficient evidence. A passing journey must show a real
transition, the resulting installed skill loaded in a fresh native session,
useful ADR-guided behavior with the source unavailable, and preserved unrelated
guidance, adopter context, and other native roots. Payload checks alone do not
prove the journey; self-report, expected words, or exit 0 do not prove native use.

Unchanged applicable proof → document reuse and omit that run. Missing update
proof → select the combined journey and credit every requirement it actually
proves. Failed update or unsupported loading claim → preserve evidence and leave
that requirement pending. Review uncertain prose against the shared expectations
in [tests/README.md](../../../tests/README.md); leave unresolved results inconclusive.

## Ordered slices

### 1. Selected delivery/updated-use exercises ordinary no-URL update
Type: Structure
Status: done
Proof: Selected `delivery/updated-use` update prompt omits the source URL.
Focused cheap checks: `tests/native-delivery-updated-use.sh` and
`tests/native-delivery-updated-use-adapters.sh`. Listing/README describe
ordinary no-URL update from recorded `SOURCE` after inspected bootstrap.
Deterministic no-argument delivery wrappers stay green. Do not add a runner.

Internal change: retarget only
`tests/support/dough-adr-awareness-updated-use.sh` so the installed updater
must use recorded `SOURCE`. Align inventory/README identities for that
selected case. Inspected bootstrap remains supplied-source `--force` and is
not credited as ordinary update. Host `--native` full-path wrapper prompts
stay unchanged. Enables slice 2.

### 2. Establish the Codex candidate verdict
Type: Behavior
Status: planned — after slice 1
Proof: Codex evidence row below links decisive observations or justified reuse
for each affected claim, with remaining gaps explicitly pending.

Behavior: Given the named candidate and saved Codex evidence → review
applicability and run only uncovered checks → the maintainer has a supported
Codex verdict. Use `tests/dough-adr-awareness-codex-delivery-to-use.sh
--native --case delivery/updated-use --results-dir
.planning/quick/023-accept-standalone-client/evidence --deadline 300 --grace 15`
for the missing ordinary update→fresh-use journey. Include review, retained
evidence, and fixture cleanup in this single proof loop; no duplicate
installed-use run when the journey already proves it.

### 3. Establish the Cursor candidate verdict
Type: Behavior
Status: planned — after slice 1
Proof: Cursor evidence row links its own native observations or justified reuse;
Codex success supplies no Cursor proof.

Behavior: Given the same candidate and saved Cursor evidence → apply the shared
expectations and run only uncovered Cursor checks → the maintainer has a supported
Cursor verdict. Use `tests/dough-adr-awareness-cursor-delivery-to-use.sh` with the
same selected `delivery/updated-use` options for a missing combined journey.
Retain and review the attempt and its cleanup within this proof loop.

### 4. Establish the Claude Code candidate verdict
Type: Behavior
Status: planned — after slice 1
Proof: Claude Code evidence row links its own native observations or justified
reuse; another tool's success supplies no Claude Code proof.

Behavior: Given the same candidate and saved Claude Code evidence → apply the
shared expectations and run only uncovered Claude Code checks → the maintainer
has a supported Claude Code verdict. Use
`tests/dough-adr-awareness-claude-delivery-to-use.sh` with the same selected
options. Retain and review the attempt and its cleanup within this proof loop.

### 5. Record whether the candidate is accepted
Type: Behavior
Status: planned — depends on the three tool reviews
Proof: Story status and the evidence table agree; every affected requirement has
proof or is visibly pending, and the acceptance identifies the tested candidate.

Behavior: Given the three tool verdicts → review their coverage and candidate
identity → the maintainer receives one accepted-or-pending decision with reasons.
Update Story 3 and backlog readiness accordingly. Keep integration and skill
behavior coverage distinct. Before release, the release story must compare its
candidate with these tested inputs and reopen only invalidated requirements;
this slice does not publish or claim future release acceptance.

## Evidence and promise ownership

| Owner | Platform | Integration: discovery, invocation/application, install/update/coexistence | Skill behavior | Verdict |
| --- | --- | --- | --- | --- |
| Slice 1 | Shared selected fixture | Cheap proof that native updated-use invokes ordinary no-URL update. | n/a | Done |
| Slice 2 | Codex | Pending candidate-specific review; Quick 014 is a starting point. Update journey required. | Pending candidate-specific review. | Pending |
| Slice 3 | Cursor | Pending candidate-specific review; Quick 014 is a starting point. Update journey required. | Pending candidate-specific review. | Pending |
| Slice 4 | Claude Code | Pending candidate-specific review; Quick 014 is a starting point. Update journey required. | Pending candidate-specific review. | Pending |
| Slice 5 | Overall | Confirm coverage and candidate identity from the three rows. | Confirm shared cases resolve the candidate's behavioral risks. | Pending |

## Sizing and readiness

Target approximately five minutes of active work per leaf. Slice 1 is cheap
fixture alignment. One focused native journey can exceed five minutes in
external runtime; that is a stated exception rather than a reason to split
update from fresh use. For a selected journey, use the existing
`--native --case delivery/updated-use --results-dir <plan-directory>/evidence
--deadline 300 --grace 15` options (deadline applies per stage). Retain a timeout
as nonpassing, not an automatic reason to retry. Reassess after five minutes of
active work; stop at ten if work has not converged, preserving evidence. If review
selects an independently useful additional behavior check, add only that named
leaf in this plan before running it.

Native slices 2–4 execute only after slice 1. Slice 5 is a short evidence review.

## Learnings

The combined runner already exists. Its inspected-bootstrap fixture is not
blanket proof of the reconsidered ordinary updater contract. No product or
runner change, native run, or new evidence was produced during planning.

2026-09-08 execute-plan: slice 1 was blocked. At that stop, `dough-update` still
required a supplied URL and recorded only `VERSION`. HEAD `9857d85` / `VERSION`
`0.2.1` was not the Story 7 contract. Doughnut CI observation is unavailable in
this repo (`pendingCi: unobserved`).

2026-09-08 implementation handoff: candidate
`6682816a2385d96066883b5e4dc073b28e4b3d4f` named by Quick 024. Fixture
suitability and ordinary update→fresh-use remain this plan's job.

2026-09-08 resume: execute-plan refined slices 1–5 in place. Selected native
update still supplied a URL, so it could not prove ordinary no-URL update.
Slice 1 retargeted that selected prompt and the cheap journey substitute to
apply from recorded SOURCE. Quick 014 skill SHA still matches; it does not
prove the updater contract.
