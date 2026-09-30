# Shape an interaction within system constraints during refinement

## Source and authority

- **Identity:** SEED-057#shape-interaction-within-system-constraints
- **Source:** [refined story](../../seeds/SEED-057-composable-story-refinement-styles.md#shape-interaction-within-system-constraints),
  including Goal, Scope, proposed agent instructions, and Key examples.
- **Authority:** Terry requested a slice plan on 2026-09-30. Planning only;
  this plan grants no implementation, Take, promotion, release, or publication.
- **Preparation:** Owned workspace `.worktrees/shape-interaction-within-system-constraints`
  (branch `claude/shape-interaction-within-system-constraints`, from `origin/main`
  `2d975d5b`), with a published Preparing assignment held by `viktor-chan`.

## Goal and scope

A developer can select `--ux-ui` and `--architecture` when invoking
`dough-story-refinement`, alone, together, with default refinement when no action
is selected, and with each delivered action. A focus changes what refinement
examines, not which technique it applies, and adds no pass of its own. UX/UI
examines the user's side of the interaction; Architecture examines
responsibilities, qualities, and cited Accepted decisions, and surfaces and
stops on an actual Accepted-ADR conflict without authorizing an exception. Both
together present each interaction choice with its system consequences as one
trade-off. A focus needing developer-only input that was not supplied stops
that examination and asks. Nothing is invented when a focus finds nothing.

The definition must be identical whichever order this story and
[Investigate/Stress-test](../../seeds/SEED-057-composable-story-refinement-styles.md#resolve-uncertainty-and-expose-failure)
are delivered. Detailed per-focus design guidance, ADR drafting or exceptions,
dashboard controls, preferences, and custom options are deferred, not rejected.

## Direction and existing solutions

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md);
behavior review follows [AGENTS.md](../../../AGENTS.md). Installed managed
copies are not edited by hand.

**PFE outcome:** Reuse. The single definition
`src/skills/dough-story-refinement/references/refinement-options.json`, the
`SKILL.md` paragraph that loads it, and `dough-adr-awareness` (ADR use, citation,
conflict stop, missing-context stop, Proposed as non-binding) already exist.
Add the two focuses to that file only; the focus entries cite
`dough-adr-awareness` rather than restate it. No new parser, second instruction
list, loader, or install declaration.

**Order independence (planning decision).** Actions live in the `options` array
and the `selection` string, which Investigate/Stress-test also edit. Put the
focuses in their own top-level `focuses` array with their own composition rule
(`focusSelection`), so neither story edits the other's entries or string. A
consumer distinguishes a focus by the key it lives under, and the rule states
that a focus composes with any action or none. No action is named in the rule.
This is reversible if behavior review shows a marker inside `options` reads
better.

## Decisive premises observed during planning

Observed 2026-09-30 in the owned workspace:

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The definition holds four actions and is a single JSON file | All slices | `grep -c '"flag"'` on `refinement-options.json` → 4 (explore, borrow, challenge, clarify) | Confirmed; story 3's two entries are not yet delivered, so this plan cannot assume them. |
| `SKILL.md` loads the definition for any requested option | All slices | Read `SKILL.md` lines 55-57 ("options such as `--explore`") | Confirmed; slice 1 checks whether "options" plainly covers focuses and edits that one sentence only if review shows it does not. |
| The definition ships already | Payload proof | `grep -n refinement-options install.sh` → line 128 | Confirmed; no declaration change. |
| Focused payload checks pass on unchanged source | Payload proof | `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh` → exit 0 | Confirmed; use that PATH (system Bash 3.2 is refused). |
| Nothing in the repository parses the definition | Structure choice | `grep -rn "refinement-options"` across `install.sh`, `tests`, `src` → only the install.sh declaration and the SKILL.md link | Confirmed; a new top-level key breaks no consumer. |
| Accepted ADR 0002 and Proposed ADR 0008 exist as the story's examples assume | Slice 2 review | `docs/adrs/README.md` lists 0002 accepted, 0008 Proposed | Confirmed. |
| Next plan number | Placement | Local and `origin/main`: max 183 | 184 chosen. |

No premise depends on a paid, credentialed, or state-changing observation.

## Outside-in proof

The stable boundary is a developer invoking refinement with a focus on a selected
story and the executing agent examining the right concern. Use representative-use
review under AGENTS.md on a scratch project whose paths are supplied
independently of the skill source and whose contents the review prompt does not
disclose. The scratch project holds a small user journey story, a minimal ADR
store with one Accepted ADR (single representation of a fact) and one Proposed
ADR, and one story that proposes a second copy of that fact. Judge substance,
not headings or announcements. Retain the candidate content, invocation, inputs,
decisive observation, and result in this plan during execution. Native host
discovery and paid runs are not part of this plan.

| Promise | Owner | Observable review or check |
| --- | --- | --- |
| UX/UI examines the journey from the user's side and reports a promise-changing interaction choice, sketching only as needed | Slice 1 | Journey story with `--ux-ui`: inspect user task, steps, feedback/recovery and one reported choice; no layout, component, or technology chosen. |
| A focus adds no pass and needs no action; it works with default refinement and a delivered action | Slices 1-2 | `--ux-ui --clarify` yields examples of what the user sees and does; `--architecture` alone yields ordinary refinement plus the examination. |
| Nothing invented when nothing is consequential | Slices 1-2 | Script-only story with `--ux-ui`, and a story with no architectural concern with `--architecture`: brief statement, no UI or Architecture section. |
| Missing developer-only input stops that examination and asks | Slice 1 | Journey story naming no user, `--ux-ui`: expect a question about the user and continued refinement, no assumed user. |
| Architecture cites applicable Accepted ADRs; Proposed binds nothing | Slice 2 | `--architecture` on the journey story: 0002 cited, 0008 discussed, not treated as conflict. |
| An actual Accepted-ADR conflict is surfaced, that path stopped, and no exception offered | Slice 2 | Story proposing a second copy of the fact: expect the ADR and conflicting element named, path stopped, decision left to the developer. |
| Missing ADR context stops only the architecture examination | Slice 2 | Scratch project without an ADR store: expect the gap named, no claim the check completed, other refinement continues. |
| Both focuses give one trade-off with system consequences, favoring neither | Slice 3 | Journey story with both focuses: expect one trade-off per interaction choice (e.g. presets vs toggles), user effect and system consequence each, and a developer decision; an ADR-conflicting side still stops. |
| Focus composes with an action without a separate pass | Slice 3 | `--architecture --explore` compares alternatives on responsibilities; no extra architecture pass. |
| The definition is identical in either delivery order with story 3 | Slice 3 | Check below. |
| Default refinement is unchanged | Slices 1-3 | No options on a clear story: no examination, sections only when default refinement would add them. |
| One authoritative definition ships | All | Focused payload checks below. |

Order check (slice 3): parse the definition with `node`, assert no duplicate
`flag`, `focuses` present with both flags, and `focusSelection` naming no
action. Then apply a dummy appended action entry and a dummy `selection` edit to
the file both before and after the focus edit (or, when story 3 has landed, both
deliveries) and assert the merged files parse to the same object.

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

### 1. Examine an interaction from the user's side
Type: Behavior
Status: done
Proof: UX/UI-only uses (journey story; script-only story; story naming no user),
`--ux-ui --clarify`, and the no-option preservation check; observe the single
definition being read; pass the focused payload checks.

Behavior: Given a selected story with a user journey, invoking refinement with
`--ux-ui` examines the task, steps, feedback and recovery from the user's side,
reports the interaction choice that changes the promise, and describes or
sketches only what agreement needs. With no user-facing interaction it says so
and continues; with the user unidentified and unsupplied it asks and continues
other refinement. It works with default refinement and a delivered action.

Add the `focuses` array with the UX/UI entry and the `focusSelection` rule
(a focus selects what the selected actions, or default refinement when none,
examine; it adds no pass; it composes with any action or none; developer-only
input not supplied is asked for). Start from the seed's proposed instructions and
revise where observed use justifies it. Restate no action technique or shared
responsibility.

Safe stopping point: UX/UI works independently of Architecture and later
options; a wording miss is corrected here before slice 2.

### 2. Examine system consequences and stop on an ADR conflict
Type: Behavior
Status: done
Proof: Architecture-only uses (applicable Accepted ADR cited, Proposed
discussed only; conflicting proposal; no consequential concern; no ADR store),
`--architecture` without an action; reuse still-valid slice 1 proof and rerun
only changed obligations and the focused payload checks.

Behavior: Given a story adding or moving a responsibility, invoking refinement
with `--architecture` reports the consequences that change what it can promise or
how choices compare, citing the applicable Accepted ADRs through
`dough-adr-awareness`. An actual Accepted-ADR conflict is surfaced with the
ADR and conflicting element, that path stops, and no exception is authorized;
supported work continues. It records an Architecture section only for a
consequential concern, not an ADR proposal, and says so briefly when there is
none. Missing ADR context stops only that examination.

Add the Architecture entry to `focuses` without restating what
`dough-adr-awareness` owns.

Safe stopping point: both focuses work alone; combination and action
composition are reviewed next.

### 3. Frame one trade-off when both focuses are selected, in any delivery order
Type: Behavior
Status: done
Proof: Both-focus use on the journey story, `--architecture --explore`,
`--ux-ui --clarify` from slice 1, and the order check above; reuse still-valid
earlier proof and rerun the focused payload checks.

Behavior: Given a story whose interaction choice has architectural
consequences, invoking both focuses presents each such choice with its user
effect and system consequence as one trade-off for the developer's decision,
favoring neither, while an ADR-conflicting side still stops. A focus with an
action changes what that action examines and adds no pass. The definition is the
same whether Investigate/Stress-test land before or after this story.

Add only the combination sentence to `focusSelection` if slices 1-2 wording does
not already produce this behavior; otherwise add none and record that.

Safe stopping point: Focuses are complete and usable with default refinement and
any delivered actions.

## Current decisions and review

- Three Behavior slices, no Structure slice. The definition and loader exist;
  the `focuses` key is introduced by slice 1 for its first entry.
- Combination is its own slice because it needs both focuses to observe and owns
  the order-independence check; folding it into slice 2 would mix two outcomes.
- Focuses live under their own key with their own rule, so this story and story 3
  cannot collide on entries or the `selection` string, in either order.
- A missing developer-only input is asked for at that point, not assumed, per
  Terry's 2026-09-30 direction; other refinement continues.
- No numeric slice target or hard limit was supplied. Each slice owns one
  behavior, its representative review, and the payload check.
- Construction review found no remaining slice-boundary, cumulative-design,
  proof-ownership, or sizing concern needing a plan-refinement pass. This is a
  limited planning finding, not evidence the wording has passed behavior review.
- One representation is kept: no competing instruction list and no observed
  Accepted-ADR conflict.

## Learnings

- Slice 1 (2026-09-30): `refinement-options.json` now holds six actions
  (Investigate/Stress-test landed first), so the planning premise of four
  actions is stale; the separate `focuses` key and `focusSelection` rule kept
  order independence. `SKILL.md` needed no change.
- First review of a story naming no user read "ask... and stop that
  examination" as "continue on assumptions" and drew a layout. The rule now says
  to ask and not carry out that examination until supplied; the instruction adds
  "ask the developer when the story does not identify the user", "fold these
  into the ordinary Goal, Scope, and Key examples", and "describe in words".
- Accepted slice 1 proof (subagent representative reviews on a scratch project
  under the job tmp directory; no paid host run): `--ux-ui` on a journey story
  (user, steps, promise-changing choices, no layout or technology),
  `--ux-ui --clarify` (examples of what the user sees and does, no separate
  pass), `--ux-ui` on a no-user story (asked first, other refinement continued,
  no sketch), all on final wording; `--ux-ui` on a script-only story and
  no-option refinement on the journey story passed on the first-draft wording
  and were not rerun (later edits only add ask/fold/words). JSON parse and
  `env PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/story-payload-update.sh`
  passed on the final wording.
- Slice 2 (2026-09-30): the `--architecture` entry (about six sentences) cites
  `dough-adr-awareness` for ADR use, conflict stop, and missing-context stop.
  Accepted proof, on the first and final wording (subagent representative
  reviews on scratch projects with an Accepted single-representation ADR 0002
  and a Proposed ADR 0008; no paid host run): journey story cited 0002, discussed
  0008 as binding nothing, ordinary refinement plus a short Architecture note; a
  story proposing a second copy of the fact named 0002 and the element, stopped
  that path, authorized no exception, and continued supported work; a
  no-concern story said so with no Architecture section; a project without an
  ADR store named the gap, ran no examination, claimed no completed check, and
  continued other refinement. JSON parse and the focused payload checks passed.
  Observed and left unchanged: the conflict run listed owning an exception among
  the developer's choices (from `dough-adr-awareness`, not authorized by the
  run), and the no-concern run over-explained the ADR check. The scratch
  projects `arch`, `arch-conflict`, `arch-none`, `arch-noadr` under the job tmp
  directory are reusable for slice 3.
- Slice 3 (2026-09-30): the "otherwise add none" branch did not apply. With
  slices 1-2 wording, both focuses produced parallel UX/UI and Architecture
  sections and no trade-off. A first combination sentence ("present each choice
  as one trade-off") was read narrowly, framing about one choice. The accepted
  sentence in `focusSelection` forbids separate reports, says to list every
  interaction choice with architectural consequences once (user effect beside
  system consequence, favoring neither), folds the rest into ordinary Goal,
  Scope, and Key examples, and keeps the Accepted-ADR conflict stop. It names
  no action.
- Accepted slice 3 proof on the final wording (subagent representative reviews,
  no paid host run): `--ux-ui --architecture` on the journey story gave one
  table of four choices (effect on the customer / consequence for the system),
  no parallel report, a short Architecture note holding only the ADR citation;
  on the conflicting story the calendar-copy side stopped under ADR 0002 with no
  exception authorized; `--architecture --explore` gave one comparison with
  no extra architecture pass; `--ux-ui --clarify` composed without a separate
  pass. Order check (parse, no duplicate `flag`, both focus flags,
  `focusSelection` names no action, dummy action plus `selection` edit merge to
  the same object before and after the focus edit) passed, as did JSON parse
  and the focused payload command. Residual: one conflict-story run leaned toward
  one option once; variance in "favoring neither" was not measured with repeated
  runs. The no-option default was not separately rerun (the sentence is
  conditional on both focuses).
- CI: the delivered revisions failed only the nerds-roster count tests
  (`30 !== 26`), already failing on trunk before this branch and fixed on trunk
  by `910dff98`; not this execution's failure, no repair.

## Execution complete

Product advice: No new backlog work. Outcome review found the one options definition holds both focuses under `focuses` with one `focusSelection` rule that names no action, so delivery order with the other actions does not matter, and no competing representation exists. The queued dashboard story (SEED-061) can now offer the two focuses from that definition. One residual, judged by single subagent runs: "favoring neither" leaned once in a conflict-story run and was not measured over repeats; revisit only if a real refinement shows it.
