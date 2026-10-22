# Reach every existing consumer of a changed behavior before publication

**Identity:** SEED-010#trace-changed-behavior-to-existing-consumers
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#trace-changed-behavior-to-existing-consumers)

## Goal and scope

Give the executing agent and the coordinator a consumer-trace record, produced
from an installed script's whole-checkout search, so that every existing test,
stand-in and journey that consumes a slice's changed behavior is named, with a
proof disposition, before the slice is accepted and published. The record is
the evidence form of the shared effect-to-consumer trace; the script performs
the mechanical search so its scope cannot be narrowed to a directory or to the
identifiers the agent already holds.

Included: the script `consumer-trace.mjs` under
`src/skills/dough-execute-plan/scripts/`, declared in `install.sh`, with its
node tests; the record's shape (changed effects; terms and scope searched;
located consumers by kind with a disposition; empty kinds named); the
delegation, acceptance and post-change-refactor guidance that require and
check the record, and the shared trace text that names it; and the replay of
the three recorded slices as retained observations in this plan.

Excluded, as the story defers: a mechanical gate in the publication path that
refuses an increment without a record file; term derivation beyond changed
paths and basenames, identifiers in changed hunks, changed modules' import
paths, removed literals and supplied terms (no route or render analysis); paid
native host runs, which stay manual; and the decline measurement, which
accrues at ODF-150 through later executions. The installed copies under
`.agents/skills/` and `.claude/skills/` change only through a release.

Assumptions: executing agents on every host can run `node` and `git` in the
checkout, as the other installed scripts already require; the Doughnut
checkout at `/Users/terryyin/git/doughnut` holds commit `07606012` for the
third replay (observed below); the story's boundary assumption holds that a
script-backed record is the non-wording response the selection asks for.

## Existing solutions and architectural direction

PFE across the installed skills found the trace rule and its evidence shape,
but no mechanical search:

- The trace rule lives in
  [own executable proof](../../../src/skills/dough-story-refinement/references/executable-proof.md)
  (effect first; changed files, selectors, helpers, literals and named proof
  are starting points, not bounds). Delegation's return contract
  (`delegation.md`, "the changed effect, its trace to consumers … the
  searches (including retired literals searched for) or suites used") and
  acceptance (`wrap-up.md`, "verify the handoff's applicable old-reference
  search terms and scope against the diff") already ask for the facts the
  record holds, in prose. This story gives those facts one shape and one
  producer; it adds no second rule.
- `dough-post-change-refactor/SKILL.md` already returns "old-reference search
  terms and scope, inspected consumers"; its return carries the same record.
- Installed scripts under `src/skills/dough-execute-plan/scripts/` are plain
  Node modules with `node --test` files beside them, scheduled by
  `tests/node-test-files` (`src/skills/*/scripts/*.test.mjs`) and shipped
  through the `managed_files` list in `install.sh`; `execution-increment-delivery.mjs`
  is the pattern for a command the guidance names with
  `node '<installed-execute-plan>/scripts/…'`.
- `git ls-files --cached --others --exclude-standard` and `git grep` give the
  whole-checkout file set and search without a second index; no search helper
  exists to reuse (`product-backlog-dependency-consumers.mjs` is backlog
  specific).
- No Accepted ADR constrains the choice; ADR 0006 keeps the script's output
  and guidance addressed to the executing agent in its task's project. No
  North Star topic is needed: the script is one installed tool under the
  existing skill, not a new shared boundary.

## Preparation observations and decisive premises

Observed on 2026-10-22 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/reach-every-existing-consumer-of-a-changed-behav`
at `ecacb0e3`, and read-only in `/Users/terryyin/git/doughnut`. No paid run,
native host or project write ran.

| Premise and consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| Replay B: the changed file's basename searched across the whole checkout at the shared-host slice's parent reaches the test that failed in CI. | `git grep -l "ci-monitor.md" 37eed762 -- 'src/**/*.test.mjs' 'tests'` | Lists eight test files under `src/skills/dough-execute-plan/scripts/`, including `shared-checkout-writers-guidance.test.mjs`, whose assertion at line 154 is the one CI `39555788657/1` failed; plus native fixtures and support scripts under `tests/`. Settled for the search; the repair ran those eight files. |
| Replay A: identifiers of the changed runner modules searched across test support at plan 334's first implementation reach the stand-in that failed in CI. | `git grep -l "cursorRunnerAddressFile\|runnerProtocol\|runnerClient" 79a1f1ec -- 'dashboard/tests/support'` | Lists eleven support files, including `cursorRunnerHeldReads.ts`, the stand-in repair `614b490e` changed. Settled for the search; slice 2's proof runs the script on `79a1f1ec~1` with the diff of `79a1f1ec`. |
| Replay C: the retired observation of the recall card, searched in the Doughnut E2E tree at the first implementation's parent, reaches the journeys the repair changed. | `git grep -n -i "ordinary recall" 07606012~1 -- e2e_test` in `/Users/terryyin/git/doughnut` | `daily_probe.feature` lines 26–48 and `step_definitions/daily_probe.ts:60`; the repair `e46d23de` changed `daily_probe`, `spaced_repetition` and `browse_answer_and_notes_while_recalling`. The step search reaches the first; the page-object methods the step uses (`recallPage.ts`, `recall.ts` steps `recallNotes`, `expectRecalling`) are the term that reaches the other two. Slice 1's proof runs the script there with those terms and records which features each term reaches. |
| The three guidance files this story edits have no automated assertion on their consumer-trace prose. | `grep -n -i "consumer\|trace"` over the five `src/skills/dough-execute-plan/scripts/*guidance*.test.mjs` and delivery tests that read `delegation.md` or `wrap-up.md` | No match. `executable-proof.md`, `delegation.md` and `wrap-up.md` are inputs to the native delivery-evidence identity hashes in `tests/support/delivery-evidence-native-evidence.sh`; those records are retained manual-run evidence, not CI assertions. Slice 3's record lists them as readers. |
| A new script ships only when declared. | `install.sh` `managed_files` lists each installed script path (86 `dough-execute-plan/scripts` entries); `tests/payload-declaration-links.sh` fails on an undeclared link target. | Settled: slice 1 declares the script and the guidance link to it. |

No premise needs a paid, credentialed or owner-held observation before
`ready`.

## Outside-in proof

Node tests beside the script build a temporary git repository holding each
consumer shape and assert the record's content; the literal replays run the
script against this repository's history and the local Doughnut checkout and
retain their records here. Guidance edits get the behavior review walk
AGENTS.md requires, with example 1 as the representative use, and the story's
own consumer-trace record for those edits, produced by the new script.

| Story example | Proof and owner |
| --- | --- |
| 1: readers of changed shared text across the whole checkout, no `tests/`-only result possible | Slice 1: fixture with a Markdown reader under a non-`tests` directory; replay B record at `37eed762~1` names the eight test files. |
| 3: supplied retired-observation and precondition terms reach journeys through steps and page objects | Slice 1: fixture with a `.feature`, a step definition and a page object; replay C record in Doughnut names `daily_probe` through the step and the other two features through the page-object methods, or records which the terms did not reach. |
| 4: a change nothing else observes keeps focused proof | Slice 1: fixture rename inside one file yields a record whose kinds are all empty. |
| 2: existing stand-ins of a changed contract found from the changed modules' identifiers and import paths | Slice 2: fixture with an untouched stand-in importing a changed module; replay A record at `79a1f1ec~1` with the diff of `79a1f1ec` names `cursorRunnerHeldReads.ts` under stand-ins. |
| 5: a return without the record is returned for the trace; a record with undispositioned consumers is not accepted | Slice 3: guidance test that the delegation return contract, acceptance and the shared trace name the record and the script; behavior review walk of acceptance with example 1 and with a return lacking the record. |

## Ordered slices

### 1. The trace script lists every reader of changed files and supplied terms across the whole checkout
Type: Behavior
Status: done
Proof: `node --test src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs` on a temporary repository with a production module, a test, a test-support file, a `.feature` with a step definition and page object, a Markdown file read by a test outside `tests/`, an ignored file and an untracked file; replay B as a literal run in a temporary worktree at `37eed762~1` with `--path src/skills/dough-execute-plan/references/ci-monitor.md`; replay C in `/Users/terryyin/git/doughnut` at `07606012~1` with `--term "ordinary recall" --term recallNotes --term expectRecalling`; `bash tests/payload-declaration-links.sh` and `bash tests/install-public-payload.sh` for the declaration.

Behavior: an agent in a checkout runs `node '<installed-execute-plan>/scripts/consumer-trace.mjs' --checkout <path> [--path <changed file>…] [--term <text>…]` → the script searches every tracked and untracked non-ignored file except the named changed files for each changed file's repository path and basename and for each supplied term, with fixed-string matching → it prints a Markdown record: the effect terms searched; the scope (`whole checkout at <revision>`, with the count of files searched); then, grouped by kind — production, test, test support or stand-in, journey or feature, guidance reader — each matching file with its first matching line, and `none found` for each empty kind; a disposition column left for the agent (`run`, `reused`, `excluded: <reason>`). Kind follows path and extension conventions (`.feature`, `step_definitions`, `pageObjects`, `e2e` → journey; `support`, `fixtures`, `helpers`, `stubs`, `fakes`, `mocks` → stand-in; `.test.`, `.spec.`, `_test`, `/tests?/` → test; `.md` → guidance reader; otherwise production); the kind is a hint for inspection, and every file appears exactly once. Exit 0 with matches, exit 0 with an all-empty record, exit 2 on a missing checkout, no `--path`/`--term`, or a `--path` outside the checkout. The script is declared in `install.sh`.

### 2. The trace script derives terms from the change itself: hunk identifiers, module import paths and removed literals
Type: Behavior
Status: done
Proof: the same node test file on the fixture, with a committed base and a working-tree change that adds a field to a shared contract module while an untouched stand-in imports that module and a test asserts a removed message literal; replay A as a literal run in a temporary worktree at `79a1f1ec~1` with the changes of `79a1f1ec` applied (`git diff 79a1f1ec~1 79a1f1ec -- dashboard | git apply`), `--base HEAD`, no supplied terms.

Behavior: the agent supplies `--base <revision>` (default: the working tree against `HEAD`, including untracked files) instead of, or in addition to, `--path` → the script reads the diff, takes every changed file as a `--path`, and adds derived terms: identifiers declared or exported in changed hunks (function, class, const, let, var, export, type and interface names and object keys on changed lines), each changed module's import path forms (the repository path without extension and its basename without extension, so `runnerPaths` finds `../../server/hosts/cursor/runnerPaths.ts`), and string literals of three or more characters on removed lines → the record lists each derived term under the effect terms with its origin (`declared in <file>`, `import path of <file>`, `removed from <file>:<line>`), and the located consumers follow slice 1's shape; a consumer found only through a derived term shows that term. Replay A's record names `cursorRunnerHeldReads.ts` under stand-ins through the import path or an identifier of `runnerPaths.ts`, `runnerClient.ts` or `runnerProtocol.ts`.

### 3. The record is the required trace evidence at delegation, acceptance and refactoring
Type: Behavior
Status: done
Proof: `node --test src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs` asserting that `delegation.md`'s return contract, `wrap-up.md`'s acceptance, `dough-post-change-refactor/SKILL.md`'s return and `executable-proof.md`'s trace paragraph each name the consumer-trace record and the installed script, and that acceptance names the two refusals (no record; a listed consumer without a disposition); a behavior review walk with example 1 and with example 5 recorded in the plan; the story's own record for these guidance edits produced by `consumer-trace.mjs --base <slice 2 commit>`, listing the guidance tests, the native delivery-evidence identity inputs and the installed-copy readers, with dispositions; `bash tests/payload-declaration-links.sh`.

Behavior: a coordinator delegates a slice whose change alters an operation, contract, message, value, default, rendered output or shared text → the delegation names the installed script and requires the consumer-trace record in the return, every listed consumer with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`, and the supplied effect terms for retired behavior and altered preconditions the diff cannot derive → the implementation return carries the record → acceptance compares the record's terms with the diff and the changed behavior, returns a slice without the record for the trace, does not accept a record with a listed consumer lacking a disposition or with an exclusion the effect reaches, and publishes only after the unexcluded consumers' proof ran or was reused; a record with every kind empty keeps the slice's focused proof. The post-change-refactor return carries the same record for its own edits. The shared trace text names the record as the evidence of the trace and the script as its producer, keeping the effect-first rule and the existing proof-selection rules unchanged.

## Current decisions

- Term derivation stays lexical: paths, basenames, hunk identifiers, import
  path forms, removed literals and supplied terms. The agent still supplies
  behavior terms the diff cannot carry (example 3); the record makes their
  absence visible to acceptance.
- Kinds are path and extension hints with one owner per file; projects get no
  configuration. A misclassified file is still listed, so the hint never
  hides a consumer.
- The replays are retained observations in this plan's learnings, with the
  literal commands and the files each record named; they are not permanent
  tests, because they need historical worktrees and another repository.
- The record is required by delegation and checked at acceptance; no script
  gate refuses publication (deferred by the story).

## Execution complete

Product advice: no priority change. The delivered response is the record and
script; whether owned consumer-miss CI failures decline is measured at ODF-150
through ordinary later executions, so wrap-up records ODF-150's next eligible
uses rather than resolving it. Watch record length: slice 3's own record listed
297 consumers, mostly installed `.agents/`/`.claude/` copies and readers matched
only through the `SKILL.md` basename, and needed scripted classification. If
later records stay that long, a follow-up story can group installed copies and
generic-basename-only matches so agents don't stop dispositioning rows.

## Learnings

- Slice 1 replay B (worktree at `37eed762~1` = `97e2c938`;
  `consumer-trace.mjs --checkout <dir> --path src/skills/dough-execute-plan/references/ci-monitor.md`,
  3636 files): under Test, the eight `src/skills/dough-execute-plan/scripts/`
  tests that read `ci-monitor.md`, including
  `shared-checkout-writers-guidance.test.mjs:112`; nine native fixtures and
  support scripts under stand-ins; 44 guidance readers, most of them installed
  `.agents/`/`.claude/` copies and planning or findings Markdown. A whole-checkout
  record is long; agents will mostly exclude installed copies and records.
- Slice 1 replay C (Doughnut worktree at `07606012~1` = `c10f6c2c`): with
  `--term "ordinary recall" --term recallNotes --term expectRecalling` the record
  reaches `daily_probe.feature` and `step_definitions/daily_probe.ts` directly,
  plus `pageObjects/recallPage.ts` and `step_definitions/recall.ts`, but not
  `spaced_repetition` or `browse_answer_and_notes_while_recalling`;
  `--term "no question loads"` matched nothing at that revision. A second run
  that adds the step phrases defined beside the matched methods in `recall.ts`
  (`I repeat more old`, `I should be recalling`, `I visit recall`,
  `I ask to do more recall`) lists all three features under journeys. The hop
  from a located step definition or page object to its step phrases stays an
  agent-supplied term (lexical derivation, story deferral); slice 3's guidance
  owns it (G1).
- Matching is case-insensitive fixed-string; kind precedence is journey, test
  file name, stand-in, test directory, `.md`, production (`consumerKind`).
- Slice 2 replay A (worktree at `79a1f1ec~1` with `git diff 79a1f1ec~1 79a1f1ec -- dashboard`
  applied, `--base HEAD`, no supplied terms; 3599 files, 115 terms, 35 too
  broad): `dashboard/tests/support/cursorRunnerHeldReads.ts` is listed under
  stand-ins through `runnerPaths`/`runnerClient` (import forms) and their `.ts`
  basenames, first line `11: } from "../../server/hosts/cursor/runnerPaths.ts";`;
  26 stand-ins, 18 in `dashboard/tests/support/`. Taking every declaration first
  gave about 2,300 listed files; derived declarations are therefore module-scope
  (unindented or `export`) plus object keys on any changed line, and a derived
  term found in more than max(20, 1% of searched files) is kept with its count
  and listed consumers are left to a supplied `--term` (G2). Changed paths,
  basenames and supplied terms are never suppressed.
- Slice 3 behavior review walk. Example 1: delegation.md "Give the agent"
  names `consumer-trace.mjs --checkout '<checkout>' --base <revision>`;
  executable-proof.md "Record the consumer trace" runs it with `--base HEAD`
  over the whole checkout, so replay B's eight `scripts/*.test.mjs` readers of
  `ci-monitor.md` are listed and a `tests/`-only record cannot arise; each gets
  `run`/`reused`/`excluded: <reason>`; the delegation return carries the record;
  wrap-up.md acceptance compares its terms with the diff and refuses a listed
  consumer without a disposition or an exclusion the effect reaches. Example 5:
  wrap-up.md "When the change alters … or shared text, return a slice without
  its consumer-trace record for the trace", and "Do not accept or publish until
  proof for the record's unexcluded consumers … ran or was reused". The
  acceptance trigger moved from "has consumers" to the effect-changing kinds,
  because without a record the coordinator cannot know whether consumers exist.
- Slice 3's own record (`--base 1f5178c7` plus retired-wording terms; 3689
  files, 297 consumers, saved outside the repository during execution): run —
  five guidance node tests, `tests/execution-payload-update.sh`,
  `payload-declaration-links.sh`, `native-stream-replay.sh`; excluded —
  installed copies (release only), `delivery-evidence-native-evidence.sh` and
  native-stream fixtures (paid manual native runs), unchanged-anchor links,
  planning records, `SKILL.md`-basename-only readers. Applying the G1 hop to
  the native-evidence support file reached `delivery-evidence-native-routing.sh`
  and `native-evidence-identity.sh`, which the first record did not list; both
  ran and passed. Most of a `SKILL.md` change's record is installed copies and
  other skills' `SKILL.md` readers.
- `tests/delivery-evidence-native-routing.sh`, `delivery-evidence-release.sh`
  and `native-stream-replay.sh` fail when PATH's `bash` is macOS 3.2, also at
  unchanged `1f5178c7`; with `/opt/homebrew/bin` first they pass.

## Story obligations

### G1. Step-definition hop to journeys is agent-supplied
Reported: slice 1 — "Replay C reaches `daily_probe` and `spaced_repetition` (the latter only indirectly, see below), but not `browse_answer_and_notes_while_recalling`."
Story clause: "the record lists the step definitions and page-object methods that observe the recall card and, through them, the recall features whose journeys reach that state"
Disposition: proved by slice 3: `executable-proof.md` "Record the consumer trace" requires adding a located step definition's or page object's step phrases as `--term` until journeys are listed (`consumer-trace-guidance.test.mjs` G1 test); replay C with those phrases lists `daily_probe`, `spaced_repetition` and `browse_answer_and_notes_while_recalling` (Learnings)

### G2. Too-broad derived terms list no consumers by themselves
Reported: slice 2 — "A derived term found in more than max(20, 1% of searched files) files is kept in the terms table with a note"
Story clause: "identifiers declared or exported in changed hunks together with the changed modules' import paths"
Disposition: proved by slice 3: the record keeps every too-broad derived term with its count (`consumer-trace-terms.test.mjs` too-broad test), `executable-proof.md` requires resupplying one that names the changed contract and `wrap-up.md` acceptance checks it (`consumer-trace-guidance.test.mjs` G2 and acceptance tests)

## Concern evidence

Slice-plan refinement was not needed: each slice has one outcome and one proof
loop; slice 2 extends slice 1's record with derived terms rather than a second
shape; slice 3 changes guidance only after the script it names exists. No
remaining slice-specific concern was identified.
