# Settle purpose, scope, and behavior during refinement

## Source and authority

- **Identity:** SEED-057#settle-purpose-scope-and-behavior
- **Source:** [refined story](../../seeds/SEED-057-composable-story-refinement-styles.md#settle-purpose-scope-and-behavior),
  including Goal, Scope, proposed agent instructions, and Key examples.
- **Authority:** Terry requested a slice plan on 2026-09-30. Planning only;
  this plan grants no implementation, Take, promotion, release, or publication.
- **Preparation:** Owned workspace `.worktrees/refine-settle-purpose-scope-behavior`
  (branch `claude/refine-settle-purpose-scope-behavior`, from `origin/main`
  `a034278e`). No Preparing assignment was announced: publishing was not
  authorized.

## Goal and scope

A developer can select `--challenge` and `--clarify` when invoking
`dough-story-refinement`, alone, together, and with the delivered `--explore` and
`--borrow`. Challenge tests whether the proposed capability achieves its purpose
and reports the strongest consequential doubt. Clarify settles the smallest
sufficient scope with concrete examples that distinguish competing
interpretations, without manufacturing rejection constraints or trimming value
the purpose needs. Together, Challenge's doubts feed Clarify's scope decision in
one refinement; disagreements go to the developer.

Preserve default refinement, human ownership of goal and scope, and honest
reporting when the purpose holds or the story is already minimal. Investigation,
stress testing, both focus options, dashboard controls, preferences, and custom
options remain owned by later stories. These deferrals are not rejection
constraints.

## Direction and existing solutions

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation, current need), [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(authoritative behavioral home, executing-agent audience), and
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md);
behavior review follows [AGENTS.md](../../../AGENTS.md). No installed managed
copy is edited by hand.

**PFE outcome:** Reuse. The previous increment delivered the single definition
`src/skills/dough-story-refinement/references/refinement-options.json` (command
identity, `default`, `selection`, and an `options` array) and the `SKILL.md`
paragraph that loads it whenever options are requested. Add two entries to that
array and, only if behavior review shows it necessary, adjust the `selection`
text. No new parser, registry, second instruction list, loader, or install
declaration is needed. No ADR conflict or North Star topic is implicated.

## Decisive premises observed during planning

Observations on 2026-09-30 in the owned workspace:

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The definition holds only Explore and Borrow, and options are an array | Both slices | Read `refinement-options.json` | Confirmed; entries append with no schema change. |
| `SKILL.md` loads the definition for any requested option ("options such as `--explore`") | Both slices | Read `src/skills/dough-story-refinement/SKILL.md` | Confirmed; no loader change. |
| The definition file is already shipped, so no new declaration is needed | Payload proof | `grep -n refinement-options install.sh` → line 128 | Confirmed. |
| `default` and `selection` do not conflict with an explicit `--clarify` | Slice 2 | Read both strings | `default` says default refinement adds no mandatory exercises; Clarify is an explicit emphasis, so slice 2 must state that difference in its entry rather than restating the default. |
| Focused payload checks pass on unchanged source | Payload proof | `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh` → exit 0 | Confirmed; use that PATH (system Bash 3.2 is refused). |
| Next plan number | Placement | `git ls-tree -r origin/main .planning/slice-plans` and local listing; max 181, 182 absent | 182 chosen. |

No premise depends on a paid, credentialed, or state-changing observation.

## Outside-in proof

The stable boundary is a developer invoking refinement with the options on a
selected story and the executing agent producing useful refinement. Use
representative-use review under AGENTS.md with a scratch project whose paths
are supplied independently of the skill source, and prompts that do not supply
the expected doubt, interpretations, or scope. Judge substance, not headings or
option announcements. Retain the candidate content, invocation, inputs,
decisive observation, and result in this plan during execution.
Native host discovery and paid runs are not part of this plan.

| Promise | Owner | Observable review or check |
| --- | --- | --- |
| Challenge reports a consequential purpose-level doubt and leaves the decision with the developer | Slice 1 | Oversized "manage agent sessions from the dashboard" story with `--challenge`; inspect a doubt that the wording could be met without reaching the purpose, and no automatic rewrite or split. |
| Challenge does not invent doubt | Slice 1 | A story with a sound purpose; expect a brief statement that the purpose holds and ordinary continuation. |
| Default remains straightforward | Slices 1 and 2 | A clear story with no options: JSON not required, no challenge or clarification exercise. |
| Clarify separates interpretations with distinguishing examples and settles the smallest sufficient scope | Slice 2 | Same oversized story with `--clarify`; inspect interpretations (viewing, starting, stopping) resolved by examples, non-chosen ones recorded as deferred promises. |
| Clarify does not manufacture rejection constraints | Slice 2 | A three-example story whose rule handles a fourth; expect no rejection, and an open question only if intent matters. |
| Combined use feeds Challenge's doubts into Clarify's scope; Clarify never trims value the purpose needs | Slice 2 | Both options on the same story; inspect the doubt shaping the scope and examples that would fail an implementation missing the purpose. Disagreement is exposed as a trade-off. |
| Composition with Explore and Borrow challenges the recommended direction without adding passes | Slice 2 | `--explore --challenge --clarify`; inspect that the recommended direction is what is challenged and clarified. |
| Already-minimal story is reported as such | Slice 2 | Clear, minimal story with `--clarify`; expect "no change" and no fabricated narrowing. |
| One authoritative definition ships | Both | Run the three focused payload checks below. |

```sh
env PATH="/opt/homebrew/bin:$PATH" npm test -- \
  tests/payload-declaration-links.sh \
  tests/install-public-payload.sh \
  tests/story-payload-update.sh
```

These prove the declared dependency and payload, not reasoning. Do not add
exact-wording tests, a model-evaluation framework, or dashboard tests. Each
slice follows the established
[proof acceptance, post-change refactoring, and delivery contract](../../../src/skills/dough-execute-plan/references/wrap-up.md);
no full-suite local gate is added.

## Slices

### 1. Challenge the purpose during refinement
Type: Behavior
Status: done
Proof: Challenge-only representative uses (consequential doubt; sound-purpose
case), plus the no-option preservation check; observe the single definition
being read; pass the three focused payload checks.

Behavior: Given a selected story whose proposed capability could satisfy its
wording without achieving its purpose, invoking refinement with `--challenge`
names the assumptions, reports the strongest consequential doubt with its
reason, and discusses any goal or scope change with the developer instead of
adopting it. When the purpose holds, it says so briefly and refinement
continues.

Add the Challenge entry to `refinement-options.json`, starting from the seed's
proposed instruction and revising the wording where observed use justifies it.
Touch `selection` only if a sentence is needed for Challenge to work with
Explore and Borrow.

Safe stopping point: Challenge works independently of Clarify and later options.
If use yields only generic objections, correct this bounded wording before slice 2.

### 2. Clarify scope and behavior, alone and combined
Type: Behavior
Status: done
Proof: Clarify-only (interpretations; no manufactured rejection; already-minimal
story), combined Challenge + Clarify, and Explore + Challenge + Clarify uses;
reuse still-valid slice 1 proof and rerun only changed obligations and the
focused payload checks.

Behavior: Given an oversized story with competing interpretations, invoking
`--clarify` settles the smallest scope that delivers the purpose using
pre-condition → trigger → result examples that distinguish the interpretations,
records non-chosen interpretations as deferred promises, and rejects only on an
independent requirement. With `--challenge` as well, the doubts shape that scope
within one refinement; with Explore or Borrow, the recommended direction is what
is challenged and clarified.

Add the Clarify entry and the composition sentence in `selection` needed to feed
Challenge into Clarify and to keep Clarify distinct from default refinement.
Reuse shared refinement responsibilities from `planning.md` instead of restating
them, and add no combined-mode definition.

Safe stopping point: Both options work alone and together with the delivered
options; sibling actions, focuses, and dashboard exposure stay separately
deliverable.

## Current decisions and review

- Two Behavior slices, no Structure slice. The shared definition and loading
  already exist, so no preparatory change is needed.
- Composition belongs to slice 2 because it needs both techniques to observe;
  a composition-only slice would fragment one proof loop.
- Flag order carries no meaning, as already defined in `selection`. This keeps
  the earlier reversible planning assumption; an explicit request for ordered
  passes would realign the story and plan.
- No numeric slice target or hard limit was supplied. Each slice owns one
  technique, its representative review, and its payload check.
- Construction review found no remaining slice-boundary, cumulative-design,
  proof-ownership, or sizing concern needing a plan-refinement pass. This is a
  limited planning finding, not evidence the wording has passed behavior review.
- One representation is kept: two entries added to one array, with no
  competing instruction list and no Accepted-ADR conflict observed.

## Learnings

- Slice 1 accepted proof (2026-09-30): the `--challenge` entry was added to
  `refinement-options.json`; `selection` and `default` are unchanged. Reasoning
  walkthroughs on scratch stories (oversized "manage agent sessions" story →
  purpose-level doubt about noticing waiting sessions, no rewrite or split;
  sound-purpose CSV-export story → brief "purpose holds"; no-option story →
  JSON not read, default unchanged) passed. Focused payload checks exited 0:
  `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh`.
  Limit: walkthroughs are reasoning, not a live-model run; the only guard
  against a minor invented doubt is the entry's consequence rule.
- The Challenge entry already says a recommended direction is challenged instead
  of adding a pass, so slice 2 needs no Explore/Borrow sentence for Challenge;
  it still owns the Clarify entry and the Challenge-feeds-Clarify composition.
- Slice 2 accepted proof (2026-09-30): the `--clarify` entry was added and
  `selection` gained the Clarify-versus-default distinction, the
  Challenge-feeds-Clarify composition, and one shared recommended-direction
  sentence (the refactor pass moved it out of both entries so it has one home).
  Reasoning walkthroughs passed: sessions story with `--clarify` (viewing,
  starting, stopping separated; non-chosen become deferred promises), three-example
  story (no rejection manufactured), already-minimal story ("no change"),
  Challenge + Clarify (doubt shapes scope; disagreement exposed), Explore +
  Challenge + Clarify (no extra pass), and no options (default unchanged).
  Focused payload checks exited 0 after the refactor:
  `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh`.
  Limit: walkthroughs are reasoning, not live-model runs.
