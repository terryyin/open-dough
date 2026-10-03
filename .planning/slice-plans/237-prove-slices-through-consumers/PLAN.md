# Prove a slice through the consumers of what it changes

**Identity:** SEED-095#prove-slices-through-consumers
**Source:** [story](../../seeds/SEED-095-slice-proof-through-consumers.md#prove-slices-through-consumers);
findings [ODF-150](../../../docs/maintainer/finding-names.md#odf-150) and
[ODF-107](../../../docs/maintainer/finding-names.md#odf-107).

## Goal and scope

When a slice changes a shared operation, a visible message or value, a default,
or what a shared page renders, its proof is chosen from the consumers of that
change. The coordinator does not accept or publish a slice while a known
consumer is unrun.

The response is guidance only, in three released references under
`src/skills/`:

- `dough-story-refinement/references/executable-proof.md`: the proof rule
  shared by planning, implementation and acceptance;
- `dough-execute-plan/references/delegation.md`: what the coordinator hands
  the implementer and what the return must contain;
- `dough-execute-plan/references/wrap-up.md` (`## Accept proof`): what the
  coordinator checks before accepting.

Excluded, as the story defers: checks for tests that pass because a narrowed
default left them nothing to test, CI-only environment failures
([SEED-093](../../seeds/SEED-093-local-checks-agree-with-ci.md)), a full-suite
rule for every slice, per-project suite catalogs or test-impact tooling, and
any new script or skill. Installed copies under `.agents/skills/` and
`.claude/skills/` are not edited; they change only from a released payload.

Assumptions: all three files are already declared in `install.sh`'s
`managed_files`, so the edit is a Proposed change to released guidance under
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
needs no new declaration. Wording follows
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
written for the agent working in its own project, with no Open Dough
maintainer vocabulary and no project-specific paths from the retained cases.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Current guidance finds consumers only as callers of a changed operation, plus test-support callers | Slices 1, 2 | Read `executable-proof.md:20-30`, `delegation.md:126-128`, `wrap-up.md:35-43` | Confirmed: "affected production and relevant test-support call sites"; no rule for retired literals, defaults, or page-wide specs |
| Current guidance discourages wider local runs | Slices 1, 2 | `grep -rn -i -e "every suite" -e "broaden testing" -e "broader suites" src/skills` | `executable-proof.md:27` ("Do not require every suite"), `:61-62` ("Require broader suites only when this project's workflow or user requires them"), `delegation.md:41-42` ("broaden testing only when the slice, project workflow, or human requires it"), `wrap-up.md:42` ("do not require every suite or all callers"). No other skill or doc states it |
| No test asserts the wording of the three files | Proof of both slices | `grep -rl -e executable-proof -e accept-proof -e "test-support call" -e "every suite" -e "unaffected-suite" tests scripts` | No hits. Hits for `delegation.md` in `tests/` name other files (`wrap-up-closure-publication.md`) or native fixtures, not wording |
| The three files are declared payload, and declared links are checked by one cheap test | Proof of both slices | `grep -n` of the three paths in `install.sh`; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/payload-declaration-links.sh` | Declared at `install.sh:94`, `:136`, `:151`; the links test passes in under a second (exit 0, silent) |
| Markdown is not linted | Proof of both slices | Read `scripts/lint.mjs:100` | Prettier and ESLint cover script and JSON files only |
| The retained cases carry enough fact to replay | Replay proof | Read the ODF-150 and ODF-107 rows in `DearDough.md`, `../doughnut/DearDough.md`, `../pygardon/DearDough.md` | Each case names the change, the proof that was chosen, and the consumer that failed (see Key examples) |

## Key examples and proof

Each example replays a retained case. The proof for each is a **replay
review**: a fresh agent that did not write the change reads only the edited
references and the case facts below (not the retained finding or this plan's
expected answer), and states which consumers its proof selection or
acceptance would include. The example passes when that selection names the
consumer that failed in CI, through a rule it can cite. A reply that finds the
consumer only by luck or by the case's file names does not pass.

| # | Case facts given to the reviewer | Consumer the selection must include | Owner |
| --- | --- | --- | --- |
| 1 | Error text `pyannote.audio is required` reworded; the module's unit tests chosen as proof (Pygardon plan 190) | Any test matching the old text, here `test_diarize_audio_file_raises_when_pyannote_missing` | Slice 1 |
| 2 | Reduce changes from writing a suffixed `key 2` to appending a value; plan names backend tests only (Doughnut SEED-063) | End-to-end scenarios asserting the suffixed form, found by searching for the retired value | Slice 1 |
| 3 | `host: "cursor"` becomes offered; proof is the new start specs (Open Dough plan 210) | Specs still expecting the old refusal (HTTP 400) for that host | Slice 1 |
| 4 | An always-rendered `role="status"` line is added to the dashboard; four related specs named; the dashboard suite takes about a minute (Open Dough plan 172) | The dashboard suite, so page-wide specs counting status elements run | Slice 1 |
| 5 | App mount gains a generated-API call; two of three mock factories of that module updated (Pygardon plan 268) | Every mock factory of the changed module, including the browser spec's | Slice 1 |
| 6 | A shared verifier's caps default turns on (Pygardon plan 299) | Callers that do not override the default, with their modules and affected end-to-end features | Slice 1 |
| 7 | A return lists its consumers and leaves one found consumer unrun as "covered by CI" | The coordinator runs it or returns the slice; it does not accept or publish | Slice 2 |
| 8 | A private helper with no shared contract, text, default or rendered output is renamed | Focused proof only; no wider suite required | Slice 1 |
| 9 | A plan's proof says to run only the new specs because "the whole suite is CI's"; the slice makes every launch slower (Open Dough plan 178) | Delegation still requires the launch callers' suite when it is cheap; the plan's list is a minimum | Slice 2 |

Every slice also passes `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/payload-declaration-links.sh` (exit 0), and a reading of the edited
sections for ADR 0006 audience and for contradictions with the unchanged
sentences around them.

## Ordered slices

### 1. Proof selection reaches every kind of consumer
Type: Behavior
Status: done
Proof: replay review of examples 1–6 and 8 against `executable-proof.md`;
links test.

Accepted proof: links test exit 0. A fresh reviewer reading only
`executable-proof.md` and the case facts selected each required consumer by
quoting the new consumer paragraph: the retired-literal search (1, 2, 3),
whole-page specs plus the one-minute suite under the cheap-suite sentence (4),
every stand-in "not only those the edit touched" (5), callers not overriding
the default (6), and focused proof for the private rename (8).

Learnings for slice 2: case 6's end-to-end features were reached only through
the cheap-suite and actual-use sentences, and "focused-check time" is not
defined; the reviewer still applied it as intended. `wrap-up.md:37-43` still
says "do not require every suite or all callers" and limits acceptance to a
"shared operation or contract"; `delegation.md:41-42` still says "broaden
testing only when…", split across a line break, so a one-line grep misses it.

CI repair after slice 1 (run 37119610401): `ci-codex-completion.test.mjs`
asserted ESRCH for the stream's PID right after a confirmed shutdown. The
product counts a zombie or unwinding PID as dead, so the PID could still answer
on a loaded Linux runner. The test now asserts the product's liveness reader
instead; the fixture teardown already awaits the child's exit.

Behavior: an agent choosing proof for a change that rewords a message, retires
a value, changes a default, changes a shared contract's stand-ins, or renders
into a shared page → reads `executable-proof.md` → its selection includes the
tests that assert the retired literal or value, the callers relying on the
default, every stand-in of the contract, and, when the suite for the changed
surface fits within the slice's focused-check time, that whole suite. A change
with none of these keeps focused proof.

In `executable-proof.md`, widen the shared-operation paragraph (lines 20–30)
from call sites to the kinds of consumer the story lists, keeping the caller,
continuation and test-support rules and the "unrelated consumers excluded"
rule. Name the search as the selection for a retired literal or value. Replace
"Do not require every suite" and the closing "Require broader suites only
when…" sentence so that the changed surface's suite is required when it is
cheap, while every-suite runs stay unrequired. Keep one rule, not a list of
special cases per kind: a consumer is anything that observes what the change
alters.

### 2. Coordinator delegation, return and acceptance hold the consumer selection
Type: Behavior
Status: done
Proof: replay review of examples 7 and 9 against `delegation.md` and
`wrap-up.md`, with slice 1's rule; links test.

Accepted proof: links test exit 0. A fresh reviewer reading only the three
references refused to accept or publish a return leaving a found consumer
"covered by CI", quoting `wrap-up.md`'s stop (7). It required the launch suite
despite the plan's "the whole suite is CI's", quoting `delegation.md`'s
minimum rule with the suite sentence (9). It kept focused proof for a private
rename. The reviewer read "run that suite instead of a hand-picked list" as
possibly replacing consumers outside the suite, so `executable-proof.md` now
says the suite replaces hand-picking the consumers it contains and consumers
outside it still run. The refactor pass replaced "cheap" with the defining
"runs within the slice's focused-check time" in both references.

Behavior: a coordinator delegating a slice whose plan names a spec list →
the delegation states that the list is a minimum and that consumers the change
reaches, including the changed surface's cheap suite, are still required,
whatever the plan says about CI → the return names the kinds of change made,
the searches or suites used to find consumers (including retired literals
searched for), the consumers run, and any left unrun with its reason → at
acceptance the coordinator runs, or returns the slice for, any known consumer
still unrun, and does not accept or publish until then.

In `delegation.md`, replace "broaden testing only when…" (line 41) with the
minimum-list rule, and widen the consumer bullet of the targeted return
(lines 126–128). In `wrap-up.md`'s `## Accept proof`, widen the
shared-operation paragraph to slice 1's consumer kinds, replace "do not require
every suite or all callers" consistently with slice 1, and state the stop on an
unrun known consumer. Link to slice 1's rule rather than restating it.

## Completion

Wrap-up records the response and its first containing release on ODF-150 and
ODF-107 in `docs/maintainer/finding-names.md`, as the story's completion
requires.
