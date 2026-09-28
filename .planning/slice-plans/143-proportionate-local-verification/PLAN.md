# Keep planned local verification proportionate to the change

## Source and authority

- **Identity:** SEED-053#proportionate-local-verification.
- **Source:** [story](../../seeds/SEED-053-native-guidance-acceptance.md#proportionate-local-verification),
  refined on 2026-09-28 with Terry's decisions: keep first priority, narrow
  scope to one slice-planning rule, and add no new readiness criterion.
- **Authority:** Terry asked for refinement and then a slice plan. This plan is
  planning only. It grants no Take, implementation, or publication.
- **Preparation workspace:** `.worktrees/prep-proportionate-verification`
  (branch `claude/prep-proportionate-verification`), announced as agent
  Mana-chan at `7c7e0a0e`.

## Outcome and boundaries

Agents executing a slice plan run local checks chosen for the affected behavior
and this project's explicit local requirements. A hosted CI list alone no longer
becomes an unconditional pre-commit gate. Slice planning then agrees with
execution wrap-up's existing rule, "Do not run full CI before commit unless
explicitly required."

Preserved promises and constraints: explicit local requirements stay required;
meaningful proof is not removed to save cost; hosted CI remains the backstop
after publication, with its failures owned. Edit only
`src/skills/dough-slice-planning/`, never installed copies. Follow ADR 0006's
executing-agent audience.

Excluded: a new readiness criterion, execution-time behavior, CI
configuration, test optimization, verification tiers, rewriting existing
plans, and rerunning the Codex control. That rerun stays with
[plan 141 slice 2](../141-codex-native-guidance-acceptance/PLAN.md) on a
corrected release under separate paid-run authority.

## Existing solutions (PFE)

- `src/skills/dough-execute-plan/references/wrap-up.md:86` (section
  `#accept-proof`) already states the execution rule. Link to it rather than
  restating it.
- `src/skills/dough-story-refinement/references/executable-proof.md:14,26-28`
  already chooses "the smallest sufficient proof" and says "do not require every
  suite". It owns proof selection; the new rule points local proof there.
- The gap is in `src/skills/dough-slice-planning/SKILL.md:67`. It says to
  resolve "required verification, refactoring, commit, and review gates" from
  the project, without saying that hosted CI configuration is not by itself a
  local requirement. The rule belongs next to that bullet in "Resolve execution
  context". No North Star topic or ADR governs this choice.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Slice planning contains no local-versus-hosted distinction | `grep -n -i "full CI\|full suite\|hosted\|ci.yml" src/skills/dough-slice-planning` | No matches; line 67 is the only gate wording. |
| Execution already owns the principle at a linkable section | `awk 'NR<=86 && /^#/' src/skills/dough-execute-plan/references/wrap-up.md` | Line 86 sits under `## Accept proof`. |
| No automated test asserts the edited prose | `grep -rl "required verification\|slice-planning/SKILL" tests scripts src` (sh/mjs) | Only `compare-payload.sh`, `self-installation-baseline.sh` and `update-adds-new-payload-skill.sh`, which use the path in payload fixtures and do not read its text. `scripts/lint.mjs` does not lint Markdown. |
| A source-only edit leaves the repository's installed copies valid | `/opt/homebrew/bin/bash scripts/check-self-installation.sh` at `7c7e0a0e` | Exit 0; the checker ignores source-only development. It is not part of CI. |
| This repository has no every-change local full-suite mandate | `AGENTS.md` and `README.md` searched for test/verification requirements | Only the representative behavior review and story-owned install/update checks; hosted `ci.yml` runs lint, `npm run test`, dashboard typecheck, and sharded dashboard tests. |

## Key examples and proof

| Example (from the story) | Proof |
| --- | --- |
| Narrow folder-reference change; CI runs broad checks; no local mandate → focused reader/navigation proof only | Behavior review walk of the edited rule (slice 1) |
| Project guidance mandates a local full suite → the plan keeps and cites it | Same walk |
| A changed fixture loaded by distributed consumers → the broader `npm test` is added with the consumers named as the reason | Same walk |
| Test commands documented only in hosted CI → used to find commands, not as a blanket mandate | Same walk |

## Slices

### 1. Planning resolves local verification from affected behavior and explicit local requirements
Type: Behavior
Status: planned
Proof: The maintainer behavior review in `AGENTS.md` walks the four examples
above through the edited `dough-slice-planning` guidance, and each one reaches
its required result. Both new links resolve to existing headings. The same
guidance's line 67 bullet and the linked wrap-up and proof sections read
consistently. `scripts/check-self-installation.sh` still exits 0.

Behavior: a planner resolving execution context in a project whose hosted CI
lists broad checks, for a change with narrow affected behavior → writes the
plan's verification → selects focused proof under
`executable-proof.md`, keeps and cites any local requirement the project states,
and gives any broader local check its reason in the plan. Hosted CI checks are
not listed as unconditional local gates.

Draft rule, placed after the "Resolve execution context" list. Execution
finalizes the wording under ADR 0006:

> Treat a verification gate as a local requirement only when this project's
> guidance states it for local work. Hosted CI configuration shows which checks
> exist and run after publication, where their failures are owned; it does not
> by itself make each check a local gate for every change. Choose local proof
> for the affected behavior under
> [own executable proof](../dough-story-refinement/references/executable-proof.md),
> and state the reason for any broader local check in the plan, such as a
> changed fixture that distributed consumers load. Execution applies the same
> distinction when it
> [accepts proof](../dough-execute-plan/references/wrap-up.md#accept-proof).

Local verification for this slice follows the rule it adds. The affected
behavior is guidance prose that no test reads, so the behavior review and the
self-installation check are the local proof. Hosted CI runs its usual checks
after publication.

## Current decisions

- One Behavior slice: the rule, its links, and its review form one proof loop.
  Splitting wording from review would deliver nothing observable.
- The slice adds no readiness criterion. If the corrected release still fails
  plan 141's control, reconsider one then, as a separate decision.
- A release and the Codex control rerun follow separately. The rerun needs its
  own paid-run authority and belongs to plan 141.
