# Discover materially different alternatives during refinement

## Source and authority

- **Identity:** SEED-057#composable-refinement-styles
- **Source:** [first refined story](../../seeds/SEED-057-composable-story-refinement-styles.md#composable-refinement-styles),
  including Goal, Scope, Key examples, and proposed agent instructions.
- **Authority:** Terry requested a slice plan on 2026-09-30. Planning only;
  this plan grants no implementation, Take, promotion, release, or publication.
- **Preparation:** Continue the existing owned workspace and Preparing
  assignment. The original story identity is retained after decomposition.

## Goal and scope

A developer can select `--explore` and `--borrow` independently or together
when invoking `dough-story-refinement`, discover credible alternatives beyond
the first proposal, and converge on understood Goal, Scope, and Key examples.
Explore develops materially different approaches and compares them against the
same outcome and genuine constraints. Borrow transfers a mechanism from another
domain, explains the correspondence and a meaningful limitation, and treats it
as a candidate. Together they produce one coherent comparison, without favoring
an analogy merely because it is interesting.

Preserve straightforward refinement with no options, shared inquiry and evidence
responsibilities, human ownership of consequential goal/scope decisions, and a
useful continuation when no credible analogy is available. Include only the
definition, selection guidance, and supporting dependency needed for these two
options. The six remaining options, dashboard controls, preferences, custom
options, exclusivity machinery, and a general multi-command framework remain
owned by later stories. These deferrals are not rejection constraints.

**Planning assumption:** Flags select a combined intent; their order has no
meaning. An explicit ordinary-language instruction can request a sequence.
This is a stated, reversible planning choice, not a claimed human answer to the
earlier question. If Terry selects ordered passes, revise the composition
behavior and proof before implementing that path.

## Direction and existing solutions

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one representation and current-need scope,
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for an authoritative behavioral home and concise executing-agent instructions,
and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for proposed guidance, maintainer selection, and declared runtime dependencies.
Behavior review follows [AGENTS.md](../../../AGENTS.md) and
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
Do not edit installed managed copies by hand.

**PFE outcome:** Change the existing refinement skill; reuse
`references/planning.md` for the conversation, examples, constraints, and lifecycle.
Existing composable switches in `dough-execution-retrospective/SKILL.md` establish
that switches can be instructions to the skill rather than host-process flags.
They own unrelated retrospective choices, so their behavior is not an option
engine to transplant. The dashboard's `launchWorkflows` table already owns
workflow names and launch identity; it does not define refinement techniques.
No domain-equivalent command-option catalogue was found across `src`,
`dashboard`, `scripts`, `tests`, and `docs`.

**Selected solution:** Keep the two option definitions in one small,
agent-readable JSON reference under
`src/skills/dough-story-refinement/references/refinement-options.json`.
It owns the command identity, straightforward default, composable/order-independent
selection meaning, and each delivered option's flag, label, and instruction.
The skill links and loads this definition when options are requested and applies
the selected instructions inside the existing workflow. It must not repeat the
full instructions elsewhere. Use an ordinary data definition, without a new
runtime parser, registry, generic validator, or host-specific behavior copy.
The dashboard story can later consume this home and extend selection relations
when its journey actually requires them.

The existing Architectural North Star's remote-history and preparation-ownership
topics remain applicable to delivery. Its launch topics do not require dashboard
changes here. This feature-local definition needs no new North Star topic or ADR.

## Decisive premises observed during planning

Observations on 2026-09-30 in the owned preparation workspace:

| Premise | Observation | Result and implication |
| --- | --- | --- |
| Refinement already owns the required outputs and workflow boundaries | Read `src/skills/dough-story-refinement/SKILL.md` and `references/planning.md` | Reuse that workflow; no preparation, backlog, or lifecycle script changes are required. |
| Options can be interpreted within skill invocation | Read `dough-execution-retrospective/SKILL.md`, independent combinable switches and selection rules | Extend skill guidance; do not add vendor CLI flags or a separate command runner. |
| No existing refinement-option catalogue or behavioral assessor owns this result | `rg -n 'command.?options|option.?definitions|agentInstruction|exclusive|composable' src dashboard scripts tests docs`; search `--borrow`, `--explore`, and refinement callers | No matching catalogue or technique-use proof. Existing guidance tests inspect prose structure and explicitly distinguish it from native evidence. |
| A new reference is not automatically installed | Read `install.sh` `managed_files` and `src/install/open-dough-install-payload.sh` | Declare the new dependency with the selected skill revision; no hand synchronization of installed roots. |
| Existing proof reaches the declaration and physical payload | Read `tests/payload-declaration-links.sh`, `tests/install-public-payload.sh`, its `support/assert-public-payload-install.sh` caller, and `tests/story-payload-update.sh` | Link check follows declared Markdown dependencies; installer proof iterates declared files in both native roots; update proof exercises the real updater and shared collision protections. Reuse these checks. |
| The focused runner works with the installed supported shell | `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh` | Passed on unchanged product source. The first attempt resolved macOS Bash 3.2 and was refused; `/opt/homebrew/bin/bash` is installed Bash 5.3.20. Use that supported PATH for subsequent checks. |
| The next plan number must include concurrent published work | Fresh `git fetch origin`, then local plan listing and `git ls-tree -r --name-only origin/main .planning/slice-plans` | Published maximum is 179; local maximum is 178. Candidate 180 was absent immediately before writing. |

## Outside-in proof

The stable behavioral boundary is a developer invoking the refinement skill on
a selected story and the executing agent loading the candidate definition and
producing useful refinement. Use representative-use review under AGENTS.md,
with project context supplied independently of the skill source location.
The use prompt must not supply an expected analogy or alternative. Observe the
actual loaded candidate, selected options, useful reasoning, recommendation,
and resulting story understanding. Record the candidate revision/content,
invocation, relevant inputs, decisive observation, and review result in this
plan's retained proof during execution.

For a native run, establish the applicable installed candidate and tool before
claiming native evidence. Source-loaded authoring review is not installation or
host-discovery proof. A paid native run is not part of CI or planning; use the
existing manually triggered native workflow when selected. Reuse integration
evidence only for unchanged mechanisms, and record any outstanding native
requirements under ADR 0005 rather than infer another host's success.

| Promise | Owner | Observable review or check |
| --- | --- | --- |
| Explore yields materially different approaches, compares the same goal/constraints, and recommends a direction | Slice 1 | Refine the attention-dashboard example with `--explore`; inspect mechanisms and consequences, not headings or option announcements. Cosmetic dashboard layouts alone fail. |
| Default remains straightforward and extra techniques are optional | Slice 1; preservation in slice 2 | A clear selected story without flags converges on Goal, Scope, and Key examples without mandatory alternatives or analogy exercises. |
| Selection loads one authoritative definition and ships its dependency | Slice 1; extension in slice 2 | Observe the agent reading the referenced candidate definition; run the three focused payload checks below. Definition changes require no second handwritten instruction list. |
| Borrow independently transfers a mechanism with a useful correspondence and limit | Slice 2 | Refine the story of directing agent refinement with `--borrow`, without naming a camera or supplying the mechanism; judge the actual transfer. A visual resemblance or shared name alone fails. |
| Combined selection compares borrowed and other credible candidates fairly | Slice 2 | Run the same neutral story with both flags; inspect one coherent comparison and justified recommendation. Reverse flag order and judge the same selection meaning, not identical prose. |
| Explicit sequencing is honored without making flag order procedural | Slice 2 | Request both options with an ordinary-language instruction to explore alternatives before applying analogy; inspect that requested flow. |
| No credible analogy does not force invention or block useful refinement | Slice 2 | Provide a bounded evidence context in which no proposed transfer is defensible; inspect an honest limitation and continued clarification, not an asserted successful analogy. |
| Human-owned constraints and evidence boundaries survive either technique | Both slices | Supply a fixed desired outcome; distinguish proposals and hypotheses from observations, and require discussion before adopting a consequential change. |

Focused functional checks, through the required runner in `tests/README.md`:

```sh
env PATH="/opt/homebrew/bin:$PATH" npm test -- \
  tests/payload-declaration-links.sh \
  tests/install-public-payload.sh \
  tests/story-payload-update.sh
```

These checks prove dependency declaration and payload behavior, not AI reasoning.
They are warranted locally because this story adds a managed runtime dependency.
Do not add exact-wording tests, an automated creativity score, a new model-evaluation
framework, or dashboard tests for this change. Run any relevant formatting
through the project's existing selective delivery procedure.

When execution is separately authorized, each slice follows the existing
[proof acceptance, independent post-change refactoring, and delivery contract](../../../src/skills/dough-execute-plan/references/wrap-up.md).
Behavior review and focused checks precede delivery; retain CI ownership through
the established execution workflow. No full-suite local gate is added here.

## Slices

### 1. Explore alternatives through the existing refinement workflow
Type: Behavior
Status: done
Proof: Explore-only and no-option representative uses, including fixed-outcome
preservation and the cosmetic-alternative trap; observe loading of the single
definition; pass the three focused payload checks for the delivered dependency.

Behavior: Given a selected story anchored on a proposed solution, invoking
refinement with `--explore` develops credible, materially different approaches,
compares their contribution to the same goal and genuine constraints, recommends
a direction, and converges on understood Goal, Scope, and Key examples. With no
options, the existing straightforward workflow remains available.

Change the source skill to discover and apply selected option definitions from
the single JSON reference. Add only Explore initially and the selection/default
facts needed for this behavior; reuse the existing conversation and lifecycle
guidance. Review instruction wording against useful outcomes and required project
context before maintainer selection and declaration of the runtime dependency.
Keep the skill reference and dependency declaration coherent in the delivered
increment. No source reference may require an undeclared installed file.

Safe stopping point: Explore and the existing default work without Borrow,
dashboard controls, or any subsequent option. If actual use cannot load the
definition or produces only cosmetic alternatives, correct this bounded behavior
before adding Borrow; do not reinterpret a text check as successful use.

### 2. Borrow mechanisms independently and within exploration
Type: Behavior
Status: done
Proof: Borrow-only, combined, reversed-flag, and explicit-sequence representative
uses; inspect a credible transferred mechanism and consequential limit, fair
comparison, evidence/constraint preservation, and the no-defensible-transfer case.
Reuse still-valid Slice 1 proof; rerun only changed obligations and the focused
payload checks for the changed definition.

Behavior: Given a selected story whose goal could benefit from a mechanism in
another domain, invoking `--borrow` explains and adapts a credible mechanism,
makes its limit explicit, and treats it as a candidate. With Explore also
selected, borrowed and other credible options receive one goal-based comparison
and recommendation. If no transfer is defensible, the agent reports that limit
and continues supported refinement without fabricating a successful analogy.

Extend the same definition with Borrow and the composition instruction needed
to integrate it with Explore. Do not create a separate combined-mode definition
or duplicate shared constraints. Review the seed's proposed wording against the
representative uses, revise it where observations justify a clearer instruction,
and preserve the first slice's selection and default behavior.

Safe stopping point: Both options work independently and together, with their
evidence limits and human decision boundaries intact. Later actions, focus
options, and dashboard exposure remain separately deliverable.

## Current decisions and review

- Two Behavior slices; no independent Structure slice. Selection, loading,
  definition, and shipping support belong with the behavior they enable.
- Combining Borrow's independent use with its interaction with Explore preserves
  one proof loop: introducing the Borrow technique through the same workflow.
  A separate composition-only slice would fragment that delivery.
- No numerical slice target or hard limit was supplied. Each boundary owns one
  technique increment, its representative behavior review, and the necessary
  shipping proof. Revise wording within the same slice based on observed use;
  scope or composition changes realign the story and plan rather than grow a
  catalogue of special cases.
- Construction review found no remaining slice-boundary, cumulative-design,
  proof-ownership, or sizing concern requiring a separate plan-refinement pass.
  This is a limited planning finding, not evidence that the unimplemented
  techniques have passed their behavioral review.
- The two slices share one option representation and the established refinement
  workflow. No responsibility is relocated and no new product-wide direction is
  needed. There is no observed Accepted-ADR conflict.

## Learnings

### Slice 1 accepted proof (2026-09-30)

- **Candidate:** `src/skills/dough-story-refinement/references/refinement-options.json`
  (Explore only), a five-line loading paragraph in
  `src/skills/dough-story-refinement/SKILL.md`, and its `install.sh`
  `managed_files` entry.
- **Representative use (source-loaded, fresh agents, scratch project with paths
  supplied independently of the skill location, no expected alternatives given):**
  - `--explore` on the attention-dashboard story: agent read SKILL.md,
    planning.md, then the options JSON; alternatives differed in mechanism
    (filter on existing list, reason-grouped page, ranked list with badges,
    tiles, digest), compared on shared criteria, with a recommendation.
  - No options on a clear story: JSON not read; converged on Goal, Scope, Key
    examples with no alternatives exercise.
  - Fixed outcome supplied: JSON read; constraint held, a violating digest
    outcome exposed for the developer's decision; proposals and hypotheses
    distinguished; story unchanged.
- **Focused checks:** `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh` passed.
- **Not proved:** native host discovery or installation; one sample per use.
- **Learning:** a new file in an already-declared skill needs its own
  `managed_files` entry; the link check only follows `.md` links, so the JSON is
  covered by the installer proof.
- **For slice 2:** the JSON `default` restates SKILL.md's no-options sentence;
  decide whether to keep both when extending the definition.

### Slice 2 accepted proof (2026-09-30)

- **Candidate:** `--borrow` added to `refinement-options.json`, plus one
  `selection` sentence treating each borrowed mechanism as a candidate in
  Explore's single comparison, not favored as an analogy. `SKILL.md` and
  `install.sh` unchanged.
- **Representative use (source-loaded, fresh agents, scratch project outside
  the repo, JSON read in every run, no expected analogy supplied):**
  - `--borrow` alone on the neutral "directing agent refinement" story: the
    agent chose a camera mode dial from the story's problem, mapped roles,
    adapted it, and stated consequential limits (one position vs combinable
    options; independent settings vs conflicting instructions).
  - `--explore --borrow` and reversed: one comparison and recommendation each;
    borrowed candidates (mixing console, order ticket) folded in and not
    favored; same selection meaning, different prose.
  - Explicit sequence ("explore first, then apply an analogy"): honored; the
    analogy still entered the single comparison as an equal candidate.
  - No defensible transfer (one-word typo story): honest limitation, normal
    refinement continued, no invented analogy.
  - Fixed 7-day policy with both flags: constraint held, over-retention claim a
    hypothesis, open questions left to the human.
- **Focused checks:** the three payload tests passed (rerun by the coordinator).
- **Not proved:** native host discovery or installation; one sample per use;
  "consequential change discussed, not adopted" only weakly exercised with both
  flags (slice 1 covers it for Explore).
- **Learning:** one composition sentence in `selection` was enough; no combined
  definition needed. JSON `default` and SKILL.md's pointer sentence overlap and
  both were kept: the pointer works without loading the JSON.
