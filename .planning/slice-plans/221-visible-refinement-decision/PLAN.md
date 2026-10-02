# Visible refinement decisions with concise guidance

**Identity:** SEED-056#state-refinement-decision
**Source:** [refined story](../../seeds/SEED-056-slice-planning-refinement-decision.md#state-refinement-decision).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and scope

A developer reading a slice-planning report sees whether refinement ran and,
when it did not, why. Every remaining concern named in the report becomes a
`not-ready` reason; accepted trade-offs remain distinct from unresolved blockers.

Change only “Resolve fixable plan concerns” and “Report concern evidence and
assess readiness” in `src/skills/dough-slice-planning/SKILL.md`. Prefer replacing
or shortening prose to appending instructions. Add minimal wording, preserving
both existing intentions and the two clarifications; a shorter skill is a plus.
No numeric word budget is imposed.

Exclude mandatory refinement, new gates or size limits, readiness/recorder
changes, other skills, installed copies, releases, and compliance measurement.

## Existing direction and observed premises

PFE choice: change the report guidance where planning already owns it; reuse
the shared preparation assessment and existing refinement handoff. No new
reference, representation, or architecture is needed. The existing North Star
has no topic requiring a change for this local wording outcome.
Follow [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for source-only authoring and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for concise instructions and one authoritative home per rule.

Observed before planning; these settle the approach, not the future edit:

- `sed -n '173,212p' src/skills/dough-slice-planning/SKILL.md`: planning already
  invokes refinement for fixable concerns, honors explicit deferral, and maps
  remaining concerns to `not-ready`. It lacks an explicit report of the
  refinement decision. Replace overlapping wording rather than duplicate it.
- `sed -n '55,94p' src/skills/dough-product-backlog/references/record-preparation.md`:
  the shared criteria already block readiness for remaining concerns. Reuse
  them; accepting a trade-off must not override them.
- `rg -n 'dough-slice-planning|Resolve fixable plan concerns|Report concern evidence|remaining concerns|accepted trade.off' src tests docs .github package.json`:
  the handoff and assessment have existing authoritative homes; installer and
  payload tests exercise delivery rather than this report's meaning.
- `wc -w src/skills/dough-slice-planning/SKILL.md`: 1,913 words at planning.
  Compare the final diff and count to assess concision; the count alone does
  not prove preserved intent.

## Ordered slices

### 1. A planning report makes its refinement decision and remaining concerns clear
Type: Behavior
Status: planned
Proof: Walk the refined seed's examples against the changed guidance under
[AGENTS.md's behavior review](../../../AGENTS.md#behavior-review), recording the
instruction that yields each result. Review the diff for minimal wording and
preserved context/authority; run `git diff --check` and repeat the word count.

Behavior: An agent finishes constructing and reviewing a plan → it reports
refinement ran, was unnecessary with a reason, or was explicitly deferred →
the developer can distinguish resolved issues, supported accepted trade-offs,
and remaining concerns, with every remaining concern recorded `not-ready`.

Replace overlapping prose in the two selected sections. Keep detailed readiness
criteria at their shared home, and keep refinement conditional. Permit equivalent
report wording rather than prescribe exact example strings. An accepted interim
trade-off names its replacement in the plan and remains subject to existing rules.

One review loop owns all promises: fixable concern/refinement ran; clean
plan/no pass needed; instructed deferral; a human-owned concern/`not-ready`;
permitted interim behavior/replacement named; a proof gap/relabeling cannot
permit `ready`; and minimal added wording with all original safeguards retained.
No runtime tests or per-host discovery rechecks are added for this conventional
wording change. The behavior review proves guidance sufficiency, not native
planner compliance; installation and native acceptance retain their own owners
under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).

## Current decisions and preparation review

One small slice keeps the report's decision and readiness meaning together;
splitting it would repeat the same guidance review without isolating useful risk.
The scope contains two local prose edits, their focused proof, and cleanup.
No numeric slice target or hard limit was supplied. Its safe stopping point is
the reviewed complete wording change, with no interim process behavior.

Refinement: not needed; this review identified no remaining concern about slice
boundaries, cumulative design, proof ownership, or sizing. Readiness is assessed
through the shared recorder after reviewing this plan and its source. It grants
neither Take, execution, nor publication authority.
