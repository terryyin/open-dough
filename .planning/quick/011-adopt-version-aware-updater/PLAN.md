# Adopt and reuse released guidance in Open Dough

**Status: ready for direct execution.** Updated and slice-refined 2026-09-06;
all execution slices remain planned. No installation or native verification
was performed during planning.

## Source and recovered mapping

- [SEED-001, Story 5e](../../seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater):
  the selected, refined story; [publication](../../seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater)
  is complete.
- This same plan received the oversized Story 5's self-use leaves. Its original
  form is retained in Git history at 46b3185; no completed slices were present.
  Replace its provisional fragments here, without creating another plan.

| Previous mapping | Current owning slices | Preservation |
| --- | --- | --- |
| 37–39: adopt the real release in three tools | 1, 4, 7 | Same real-project release identity, payload/record, and coexistence outcome; use the observed missing-record path. |
| 40–42: reuse the released updater in three tools | 3, 6, 9 | Same fresh native discovery/invocation and current/no-write outcome. |
| Refined Story 5e: use installed ADR-awareness on real work | 2, 5, 8 | Explicit ownership for the story's ADR-use promise; not a new capability or fixture expansion. |

## Goal and scope

The maintainer adopts Open Dough's released guidance in this worktree and uses
it natively in Codex, Cursor, and Claude Code. Finish one platform's adoption,
ADR use, and current/no-write update before moving to the next, so useful self-use
is available at each completed platform boundary. Then move to
[Donut adoption and redundant ADR-awareness removal](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install).

- Target: /Users/terryyin/git/open-dough-adopt-released-guidance on
  codex/adopt-released-guidance. Capture its absolute path before fetching;
  preserve the separate main checkout and other worktrees.
- Source URL: https://github.com/terryyin/open-dough.git. Published baseline:
  v0.2.0, commit 676188a66504f7dc751e03311f9be5245757b24a. Resolve latest
  again at execution; do not request or hard-code this version.
- Use the existing updater and release flow. Per selected native root, the
  payload is dough-update/SKILL.md, dough-adr-awareness/SKILL.md,
  dough-adr-awareness/RECOGNITION.md, and dough-update/VERSION.
- Preserve source, ADRs/index, internal skills, the acceptance guard, unrelated
  project work, other native installations/records, and home guidance. Leave
  shared behavior and platform mappings unchanged.
- Retain completed general installation, version comparison, ADR behavior,
  failure/containment, and coexistence evidence while its inputs are unchanged.
  Add only the actual adoption and native reuse observations owned below.
- Exclude new installer or updater behavior, fresh-install fixtures, another
  release, artificial source improvements, migration machinery, broad regression
  reruns, new test infrastructure, automatic application adapters, and further
  extraction. Donut installation, equivalence/removal, caller repair, and
  architecture-triggered replacement proof belong to item two. Broader
  reconciliation, recurring update-time replacement, and inline changelog
  display do not delay that item.

## Execution context and current decisions

Read-only inspection at base d7d04e9fb4343d7e64dcf30dfc3c46eca66a7126 was
rechecked during planning. Each native root contains a dough-update/SKILL.md
that byte-matches the released source; all three lack its VERSION and both
ADR-awareness files. Source, installer/helpers, README, and installation guide
are unchanged from v0.2.0. This is static starting-state evidence.

The installed updater's step 6 and
[src/install/open-dough-release.sh](../../../src/install/open-dough-release.sh)
already handle an absent record: apply-unknown installs the full payload and
records the version. Invoke the installed updater normally; do not add --force
to the helper or write VERSION by hand. If the actual starting state changed,
use its existing comparison behavior and update the evidence. A genuinely older
updater that refuses the expanded payload uses only the documented, explicitly
authorized [manual bootstrap](../../../docs/installation-and-updates.md#legacy-bootstrap);
do not turn that contingency into a migration feature or mandatory extra slice.

[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
constrains numeric latest, immutable release identity, and no branch fallback.
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) and the
[local playbook/index](../../../docs/adrs/README.md) constrain ADR selection,
citations, and human authority. The index currently lists 0000 and 0003 Accepted,
and 0001 and 0002 Proposed. No new architectural decision is required.

Use fresh native sessions rooted at the target with normal available
permissions. Existing native examples in
[Codex](../../../tests/dough-adr-awareness-codex-delivery-to-use.sh),
[Cursor](../../../tests/dough-adr-awareness-cursor-delivery-to-use.sh), and
[Claude Code](../../../tests/dough-adr-awareness-claude-delivery-to-use.sh)
establish prior launch/discovery experience. Those scripts create disposable
sources and targets; running them is not this story's real-project proof.
Do not copy fixture permission-bypass flags into real-project invocations.
Record the actual tool version and session used. A launch/access failure leaves
its native observation pending; do not substitute a file read or another tool.

## Outside-in proof

Key examples refer to the four rows in the refined story, in order.

| Contract promise | Owning slices | Observable proof |
| --- | --- | --- |
| Example 1: adopt from the actual missing-record state | 1, 4, 7 | Native updater uses the supplied URL and inspected latest commit; full selected payload byte-matches it and VERSION records it. |
| Inspected-code execution, exact target/payload, truthful outcome, temporary cleanup | 1, 4, 7; 3, 6, 9 on recheck | Chronological native tool transcript identifies the pinned checkout, complete call-chain inspection, helper invocation, comparison outcome, verification, and removal of operation-owned temporary work. |
| Example 2: discover and use installed ADR-awareness | 2, 5, 8 | Fresh native session loads the selected installed skill and local index, cites relevant Accepted decisions for the actual next-story question, preserves human authority, and leaves repository files unchanged. |
| Example 3: current update makes no writes | 3, 6, 9 | Fresh native invocation selects the same recorded release; helper trace shows apply-skip-equal, no install entry, and unchanged payload/record bytes and modification metadata. |
| Example 4: coexistence and all preservation promises | Every slice | Before/after inventories, hashes, and native action transcript show only the selected adoption payload/record changed; all other guidance remains intact. |
| Independent native evidence and minimal shared adaptation | 1–9 | Each platform has its own adoption, ADR use, and no-op result; no source or adapter changes. Missing observations stay pending. |
| Bounded completion without unrelated prerequisites | 9 / story close | All nine observations are recorded and exclusions remain untouched; next selected work is backlog item two. |

### Shared proof procedure

**Adoption:** in a fresh native session invoke the installed dough-update with
the source URL and explicit target. Follow the skill's existing Git pin,
inspection, and apply sequence, including the helper dependencies listed in the
[shared installation guide](../../../docs/installation-and-updates.md).
Keep the inspected checkout until all three installed files and VERSION are
compared, then clean it on success or failure. Capture the actual tag, commit,
prior record or unknown, platform/root, all four resulting paths, and outcome.
For the observed baseline, three files are newly present per platform while
the existing updater retains the same bytes. Do not mistake an unchanged
updater file for a failed installation, or fabricate a text change to prove it.

**ADR use:** start a new native session after that platform's adoption. Invoke
dough-adr-awareness explicitly with: "Which current Accepted Open Dough
decisions constrain adopting released guidance and replacing Donut's original
ADR-awareness skill in the next backlog story? Assess only; do not implement
replacement or change decisions." Verify the transcript loads the selected
installed path, not src/skills or a sibling checkout. Expect local index use,
relevant 0000/0003 citations, Proposed records kept non-binding, human-owned
decisions/exceptions, and a successful explicit completion marker only when no
required context is unresolved. No template, artificial conflict, or Donut
repository survey is needed for this assessment.

**Current update:** start another fresh session and invoke dough-update with
the same source URL. Capture all four installed files' SHA-256 digests,
mtime_ns and ctime_ns immediately before/after. Use the existing
OPEN_DOUGH_TRACE hook with a fresh operation-owned temporary trace path, pass
it to the inspected helper, and verify apply-skip-equal for the selected
dough-update path, no install entry, and unchanged bytes/metadata. Keep the
chronological command transcript too; self-reported success or an empty Git
diff alone is insufficient. The helper trace and comparison behavior are
already exercised in [update-when-needed.sh](../../../tests/update-when-needed.sh).
If a newer release appeared, report the actual update and repeat only the
affected same-release check after adoption; do not mark an upgrade as a no-op.

For every proof, take the target inventory/hash snapshot before the native
action and before updating this plan with results. Include tracked and
untracked project guidance; a tracked-only diff misses newly installed files.
Compare source, internal skills/guard, ADRs, other native roots, and unrelated
files to that baseline. Native actions remain project-local; inspect the
transcript for other-worktree or home-guidance writes. Store trace/session
evidence outside the project and summarize only resume-useful evidence here.
Clean only operation-owned temporary paths and retain failure truthfully.
No product test or reusable harness is required for these unchanged-behavior
demonstrations.

## Ordered slices

All leaves are Behavior slices with one fresh native session and one proof
loop. Inspection, local snapshots, verification, evidence recording, and
temporary cleanup belong to the same leaf, not separate preparation slices.
Each can stop with a usable installation or recorded assessment and no red
test/source change. Execute them sequentially to keep coexistence observations
attributable.

### 1. Adopt the released guidance in Codex
Type: Behavior
Status: planned
Proof: Shared adoption procedure in native Codex, using .agents/skills/ and
$dough-update. Exact released payload/record and preservation verified.
Behavior: Codex has the current updater without a record or ADR-awareness →
invoke installed update from the source URL → its complete project-local
installation adopts the inspected latest release.

### 2. Apply installed ADR-awareness in Codex
Type: Behavior
Status: planned
Proof: Shared ADR-use procedure in a fresh Codex session, invoking
$dough-adr-awareness from .agents/skills/; local citations and no changes.
Behavior: Codex's release is adopted → assess the next-story ADR question with
the installed skill → receive a relevant, human-authority-preserving assessment.

### 3. Leave Codex's current installation unwritten
Type: Behavior
Status: planned
Proof: Shared current-update procedure in a fresh Codex session, invoking
$dough-update; selected helper trace and unchanged four-file metadata.
Behavior: Codex records the still-latest release → invoke installed update →
report current without an installer call or installed-file/record writes.

### 4. Adopt the released guidance in Cursor
Type: Behavior
Status: planned
Proof: Shared adoption procedure in native Cursor, using .cursor/skills/ and
/dough-update; exact payload/record, Codex, Claude, and unrelated guidance checked.
Behavior: Cursor has the current updater without a record or ADR-awareness →
invoke installed update from the source URL → its complete project-local
installation adopts the inspected latest release.

### 5. Apply installed ADR-awareness in Cursor
Type: Behavior
Status: planned
Proof: Shared ADR-use procedure in a fresh Cursor session, invoking
/dough-adr-awareness from .cursor/skills/; local citations and no changes.
Behavior: Cursor's release is adopted → assess the next-story ADR question with
the installed skill → receive a relevant, human-authority-preserving assessment.

### 6. Leave Cursor's current installation unwritten
Type: Behavior
Status: planned
Proof: Shared current-update procedure in a fresh Cursor session, invoking
/dough-update; selected helper trace and unchanged four-file metadata.
Behavior: Cursor records the still-latest release → invoke installed update →
report current without an installer call or installed-file/record writes.

### 7. Adopt the released guidance in Claude Code
Type: Behavior
Status: planned
Proof: Shared adoption procedure in native Claude Code, using .claude/skills/
and /dough-update; exact payload/record, other tools, and unrelated guidance checked.
Behavior: Claude Code has the current updater without a record or ADR-awareness →
invoke installed update from the source URL → its complete project-local
installation adopts the inspected latest release.

### 8. Apply installed ADR-awareness in Claude Code
Type: Behavior
Status: planned
Proof: Shared ADR-use procedure in a fresh Claude Code session, invoking
/dough-adr-awareness from .claude/skills/; local citations and no changes.
Behavior: Claude Code's release is adopted → assess the next-story ADR question
with the installed skill → receive a relevant, human-authority-preserving assessment.

### 9. Leave Claude Code's current installation unwritten
Type: Behavior
Status: planned
Proof: Shared current-update procedure in a fresh Claude Code session, invoking
/dough-update; selected helper trace and unchanged four-file metadata.
Behavior: Claude Code records the still-latest release → invoke installed update →
report current without an installer call or installed-file/record writes.

## Evidence and remaining work

| Platform | Retained native evidence, while inputs remain unchanged | Adoption / ADR use / no-op |
| --- | --- | --- |
| Codex | [Story 5a](../../seeds/SEED-001-install-and-update-open-dough.md#install-latest-release): native pinned installation; [5b](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed): version decisions; [Quick 007, 11–12](../007-generalize-project-guidance/PLAN.md): discovery/use/coexistence. | Pending / Pending / Pending (1–3). |
| Cursor | Story 5a: native pinned installation; 5b: version decisions; Quick 007, 14: discovery/use/coexistence. | Pending / Pending / Pending (4–6). |
| Claude Code | Story 5a: native pinned installation; 5b: version decisions; Quick 007, 16: discovery/use/coexistence. | Pending / Pending / Pending (7–9). |

For each completed leaf, replace Pending with the tool version/session,
source/tag/commit where relevant, selected paths and before/after record, actual
native outcome, and preservation/no-write observations. Reuse a completed leaf
unless a later change invalidates its inputs. File installation cannot close
the separate native-use entries.

## Slice refinement result and sizing

The recovered platform groups were Refine: each hid three native proof loops
and did not own the refined ADR-use promise. They are now nine explicit leaves,
grouped as a complete Codex journey followed by Cursor and Claude Code.
No Structure leaf is needed because the installed updater and proof hooks exist.

- Slices 1, 4, 7: Ready; about five minutes active work each, medium confidence,
  for one native update plus payload/preservation checks and cleanup.
- Slices 2, 5, 8: Ready; about three to five minutes active work each, medium
  confidence, for one native ADR assessment and read-only verification.
- Slices 3, 6, 9: Ready; about five minutes active work each, medium confidence,
  for one native same-release update and trace/metadata checks.

These are sizing hypotheses, not guarantees. One focused native run or Git/network
wait may exceed elapsed targets; record that external-wait exception and actual
time if it happens. At five minutes of active work, inspect lack of convergence;
at ten, stop and re-evaluate the affected leaf unless there is a stated focused
run/wait exception. Do not hide troubleshooting inside that exception. Concrete
failures may change remaining leaves; changes to the story outcome require story
review. Native access trouble does not justify a new infrastructure project.

Borrowed Donut's slice-planning and slice-plan-refinement skills and their
planning/decomposition rules at checkout
5e1534c093d9c0604ff96b4c46ec309eae5cf30f. Applied both to this existing plan;
no borrowed skill was installed or distributed. All contract promises have
owners, original mappings are preserved, and no completed evidence was discarded.
Planning is complete; execution and its nine native observations remain pending.
