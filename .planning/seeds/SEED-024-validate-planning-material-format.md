---
id: SEED-024
status: active
planted: 2026-09-23
planted_during: Product backlog capture requested by the maintainer
trigger_when: Planning materials can be written or changed without an automatic structural check
scope: medium
---

# SEED-024: Keep planning materials structurally valid

## Why This Matters

For developers and agents using Open Dough, malformed product backlogs, seeds,
and executable plans should be caught before later workflow steps have to
interpret them. Today, those materials can look plausible while violating the
format Open Dough relies on for navigation, identity, lifecycle state, or
automation. The resulting failure appears later and farther from the edit that
caused it, making both diagnosis and safe recovery harder.

The desired effect is a fast, actionable check of the planning-material
contract. A hook is a likely delivery mechanism because it can run at the point
of change, but it is a solution candidate rather than the story's goal.

## Alternatives and Decision

- **Manual review:** Keep relying on skill instructions and reviewers. This
  remains necessary for meaning and product judgment, but it is needlessly
  expensive and inconsistent for deterministic structural rules.
- **Explicit lint command or CI check:** Provide one validator that a developer
  or pipeline invokes. This is the strongest simpler alternative and may be the
  first useful increment, but it permits feedback only after a separate action
  or publication.
- **Automatic hook:** Invoke the same validator from an appropriate supported
  workflow hook so invalid material is reported close to the write. Refinement
  should select the hook boundary only after establishing which hosts and file
  operations can enforce it reliably.

Select one shared validation behavior with an explicit invocation surface and
automatic invocation where the supported host can enforce it safely. Do not
duplicate the planning-format rules independently in each hook or host adapter.

## Story Decomposition

<a id="validate-planning-material-format"></a>

### 1. Catch malformed planning materials at the point of change

**Identity:** SEED-024#validate-planning-material-format
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"7befcaaa102bb52b2b9dd3038effb3840c233f34a941bede8c582d58941a637c"}}
```

**Status:** Captured and queued on 2026-09-23; not refined or planned.

- **For / why:** A developer or agent changing an Open Dough product backlog,
  seed, or executable plan receives immediate, actionable feedback when the
  material does not satisfy the structural contract expected by later Open
  Dough workflows.
- **Evaluation:** Representative valid backlog, seed, and plan documents pass.
  Representative violations of required sections, stable identity and links,
  supported metadata, or unambiguous list/heading structure fail with the file,
  location when available, and violated rule. The same validator can be run
  explicitly and is invoked automatically at the selected safe workflow
  boundary. An automatic check never silently rewrites product meaning or
  rejects a valid document merely because optional prose differs.
- **Value / learning:** Moves deterministic failures to the edit that introduced
  them and reveals which parts of the current Markdown conventions are stable
  enough to enforce mechanically. It also tests whether a hook can protect the
  shared contract consistently without making normal planning brittle.
- **Effort hypothesis:** M — the parser and diagnostics are bounded, but
  confidence is moderate because backlog, seed, and plan contracts currently
  span several lifecycle skills and automatic hook capabilities differ by host.
- **Depends on:** none. Reuse existing backlog, canonical-home, and preparation
  readers as the owners of their formats; add only diagnostics or missing
  deterministic checks. Startup already consumes their necessary structural
  checks and does not wait for this story. The validator invokes no Take,
  publication, or CI lifecycle and creates no second grammar or generalized
  schema system.
- **Boundary:** Read-only structural feedback. No automatic repair, semantic
  readiness judgment, lifecycle orchestration, or generic hook framework.
- **Safe stopping point:** An explicit validator covers the three material
  types with useful diagnostics. If safe automatic invocation proves
  host-specific or unreliable, the explicit command and CI integration retain
  value while hook coverage remains a separately reviewable extension.

## Ordering and Scope Reduction

This single story follows the current dashboard and worktree-direction cluster
because it does not directly advance that near-future product direction. It
precedes lower-priority process defaults and architectural follow-ups because
all later planning work benefits from earlier structural feedback.

Start with high-confidence structural invariants shared by the current
workflows. Drop auto-fixing, prose-quality judgments, semantic completeness,
and speculative normalization first. A lint result may point to the owning
guidance, but it does not replace refinement or human review.

## Open Decisions

- Which existing rules are stable, deterministic format requirements versus
  guidance that still requires human judgment?
- Which automatic boundary can report failures safely across supported hosts,
  and should any host initially use only the explicit command or CI check?

## When to Surface

After the currently queued dashboard and worktree-direction stories, or sooner
if a malformed backlog, seed, or plan causes a workflow failure.

## Breadcrumbs

- `.planning/PRODUCT-BACKLOG.md`
- `.planning/seeds/`
- `.planning/slice-plans/*/PLAN.md` and other canonical executable-plan homes
- `src/skills/dough-product-backlog/`
- `src/skills/dough-story-decomposition/`
- `src/skills/dough-story-refinement/`
- `src/skills/dough-slice-planning/`
- Existing host-hook delivery under `src/skills/dough-execute-plan/`
