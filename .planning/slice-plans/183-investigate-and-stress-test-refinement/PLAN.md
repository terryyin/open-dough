# Resolve uncertainty and expose failure during refinement

## Source and authority

- **Identity:** SEED-057#resolve-uncertainty-and-expose-failure
- **Source:** [refined story](../../seeds/SEED-057-composable-story-refinement-styles.md#resolve-uncertainty-and-expose-failure),
  including Goal, Scope, proposed agent instructions, and Key examples.
- **Authority:** Terry requested a slice plan on 2026-09-30. Planning only;
  this plan grants no implementation, Take, promotion, release, or publication.
- **Preparation:** Owned workspace `.worktrees/resolve-uncertainty-and-expose-failure`
  (branch `claude/resolve-uncertainty-and-expose-failure`, from `origin/main`
  `043ccabd`), with a published Preparing assignment held by `terry-chan`.

## Goal and scope

A developer can select `--investigate` and `--stress-test` when invoking
`dough-story-refinement`, alone, together, and with the other delivered options.
Investigate separates sourced facts from hypotheses, settles material
hypotheses by safe local observation where one exists, never supplies an
unobtained result, and leaves unsettleable premises as open decisions.
Stress-test reports only failure, conflict, and recovery scenarios that change
what the story promises, as concrete examples; conflicts go to the developer and
no failure behavior is added to scope without agreement or purpose need.

Preserve default refinement, human ownership of goal and scope, and honest
reporting when the story rests on verified facts. Both focus options, exhaustive
catalogues, automatic scope expansion, research outside the project, dashboard
controls, preferences, and custom options remain out of this delivery. These
deferrals are not rejection constraints.

## Direction and existing solutions

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md);
behavior review follows [AGENTS.md](../../../AGENTS.md). No installed managed
copy is edited by hand.

**PFE outcome:** Reuse. The single definition
`src/skills/dough-story-refinement/references/refinement-options.json` (`default`,
`selection`, `options` array) and the `SKILL.md` paragraph that loads it for any
requested option already exist. Append two entries; adjust `selection` only if
behavior review shows a composition sentence is needed. No new parser, registry,
second instruction list, loader, or install declaration. No ADR conflict or
North Star topic is implicated.

## Decisive premises observed during planning

Observations on 2026-09-30 in the owned workspace:

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The definition is an array that accepts appended entries with no schema change | Both slices | Read `refinement-options.json`; `grep -c '"flag"'` on `origin/main` version → 2 | Confirmed (Explore, Borrow). |
| `SKILL.md` loads the definition for any requested option | Both slices | `grep -n option src/skills/dough-story-refinement/SKILL.md` → lines 55-57 ("options such as `--explore`") | Confirmed; no loader change. |
| The definition file is already shipped | Payload proof | `grep -n refinement-options install.sh` → line 128 | Confirmed; no new declaration. |
| Story 2 (Challenge/Clarify) is not delivered on trunk, so this plan cannot assume those entries | Slice 2 composition | Same count of 2 flags on `origin/main`; plan 182 still planned | Confirmed; slice 2 reviews composition with Challenge/Clarify only if they are present at execution, otherwise with Explore/Borrow. The two stories may land in either order. |
| Focused payload checks pass on unchanged source | Payload proof | `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh` → exit 0 | Confirmed; use that PATH (system Bash 3.2 is refused). |
| Next plan number | Placement | Local and `origin/main` listings: max 182, 183 absent | 183 chosen. |

No premise depends on a paid, credentialed, or state-changing observation.

## Outside-in proof

The stable boundary is a developer invoking refinement with the options on a
selected story and the executing agent producing useful refinement. Use
representative-use review under AGENTS.md with a scratch project whose paths are
supplied independently of the skill source and whose contents the review does not
disclose in the prompt. The scratch project must contain at least one fact the
story's assumption contradicts or confirms (for example a session record that
shows a waiting state for one host and not another) so an observation is
possible, and one premise only a paid or external run could settle. Judge
substance, not headings or option announcements. Retain the candidate content,
invocation, inputs, decisive observation, and result in this plan during
execution. Native host discovery and paid runs are not part of this plan.

| Promise | Owner | Observable review or check |
| --- | --- | --- |
| Investigate separates sourced facts from hypotheses and settles a material one by a real local observation | Slice 1 | Story assuming a waiting state exists for every host; with `--investigate`, inspect that the agent looked at the scratch records and reports one host as observed and the other as not, with sources. |
| Investigate never supplies an unobtained result | Slice 1 | A premise needing a paid run: expect it named with the observation that would settle it, recorded as open, and not answered by plausibility. |
| Investigate does not invent doubt | Slice 1 | Story resting on verified facts; expect a brief statement and ordinary continuation. |
| Default remains straightforward | Slices 1 and 2 | A clear story with no options: no investigation or stress exercise. |
| Stress-test reports only promise-changing scenarios, each as pre-condition → trigger → result | Slice 2 | Same story with `--stress-test`; inspect scenarios such as a session ending between refreshes or two developers responding to one session, and that a malformed record the natural rule already skips is not reported. |
| Conflicting expectations are exposed, not resolved | Slice 2 | Story with opposite stakeholder expectations for a repeated action; expect both shown with consequences and no recorded winner. |
| No scope added without agreement or purpose need | Slice 2 | After stress-testing, the seed/story text is unchanged until the developer decides; failure behaviors appear as proposals, deferred, or open. |
| Combined use investigates a plausibility-dependent failure before relying on it | Slice 2 | Both options on the story with a "host stops reporting after a crash" scenario; inspect that it is investigated first and becomes an example only if observable. |
| Composition with the other delivered options examines the recommended direction without adding passes | Slice 2 | `--explore --investigate --stress-test`, and, when present, `--challenge --clarify` added; inspect that the recommended or clarified direction is what is examined. |
| One authoritative definition ships | Both | Run the focused payload checks below. |

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

### 1. Investigate before relying on an assumption
Type: Behavior
Status: done
Proof: Investigate-only representative uses (observable hypothesis; paid-only
premise left open; verified-facts story) plus the no-option preservation check;
observe the single definition being read; pass the focused payload checks.

Behavior: Given a selected story whose goal rests on an unverified assumption,
invoking refinement with `--investigate` separates sourced facts from
hypotheses, makes a safe local observation for each material hypothesis when one
exists, reports what was observed and what remains hypothesis, and leaves a
premise no available observation can settle as an open decision. Goal and scope
change only through discussion. When the story rests on verified facts, it says
so and continues.

Add the Investigate entry to `refinement-options.json`, starting from the seed's
proposed instruction and revising the wording where observed use justifies it.
Do not restate the baseline evidence check or human ownership that `selection`
already applies in every mode.

Safe stopping point: Investigate works independently of Stress-test and later
options. If use yields a generic fact list without observations, correct this
bounded wording before slice 2.

### 2. Stress-test failure and recovery, alone and combined
Type: Behavior
Status: planned
Proof: Stress-test-only (promise-changing scenarios; conflicting expectations;
no scope added; nothing-to-report), combined Investigate + Stress-test, and
composition with Explore, plus Challenge/Clarify when present; reuse still-valid
slice 1 proof and rerun only changed obligations and the focused payload checks.

Behavior: Given a story with plausible failed outcomes, invoking `--stress-test`
reports only scenarios that change the promise, each as a concrete
pre-condition → trigger → result with the recovery it implies, exposes
conflicting expectations for the developer's decision, and records failure
behavior as a proposal, deferred promise, or open decision rather than expanding
scope. With `--investigate` as well, a scenario whose plausibility is itself
a hypothesis is investigated before it is relied on, within one refinement; with
other delivered options, the recommended or clarified direction is what is
examined.

Add the Stress-test entry and only the `selection` sentence needed for
Investigate's hypotheses to feed Stress-test. Reuse shared refinement
responsibilities from `planning.md` instead of restating them, and add no
combined-mode definition.

Safe stopping point: Both options work alone and together with the delivered
options; focus options and dashboard exposure stay separately deliverable.

## Current decisions and review

- Two Behavior slices, no Structure slice. The shared definition and loading
  already exist, so no preparatory change is needed.
- Composition belongs to slice 2 because it needs both techniques to observe;
  a composition-only slice would fragment one proof loop.
- Investigate may make safe, local, unpaid observations without asking, as the
  story records; paid or external observation is named and left to the developer.
- Story 2 may land before or after this one. If plan 182 edits `selection` first,
  slice 2 here adds its sentence beside it without duplicating; if this lands
  first, plan 182's composition sentence is added beside ours. Neither reopens the
  other's entries.
- No numeric slice target or hard limit was supplied. Each slice owns one
  technique, its representative review, and its payload check.
- Construction review found no remaining slice-boundary, cumulative-design,
  proof-ownership, or sizing concern needing a plan-refinement pass. This is a
  limited planning finding, not evidence the wording has passed behavior review.
- One representation is kept: two entries added to one array, with no
  competing instruction list and no Accepted-ADR conflict observed.

## Learnings

- Slice 1 accepted proof (2026-09-30): the `--investigate` entry was added to
  `refinement-options.json`; `selection` and `default` are unchanged. Hand walk on
  a scratch project (hostA records show `waiting_for_user`, hostB records only
  `running`/`exited`): hostA reported observed with its source, hostB reported as
  not observed in the held records with the live-run observation named and left
  open, no hostB claim written as fact; a verified-facts story got a one-line
  statement and ordinary continuation; no-option refinement is unchanged.
  Focused payload checks exited 0:
  `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh`.
  Limit: the walk applies the instruction by hand, not a live-model run.
- Slice 2 still owns the Stress-test entry and only the `selection` sentence
  that lets Investigate's hypotheses feed Stress-test.
