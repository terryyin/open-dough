---
id: SEED-396
status: active
planted: 2026-11-17
planted_during: Terry asked to replace Distribution evaluation shell checks with fewer JavaScript tests at a higher entry point; refinement on 2026-11-17 kept them in shell and re-aimed the story at their entry and expressiveness
trigger_when: selected from the product backlog
scope: story
---

# SEED-396 — Evaluation shell checks enter at the command and state facts plainly

<a id="replace-evaluation-shell-checks"></a>

### Evaluation shell checks state each fact in one line at the family entry

**Identity:** SEED-396#replace-evaluation-shell-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/679-evaluation-checks-state-facts-plainly/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"193b1a667102e74319ae7c68eb5cf17e79cb77c845251df77005c9df6421064b","plan":"ea4ea8d7a9ac7e0e68f61e672862cc88b397044c0815a074b7efb1d28bcc7d41"}}
```

#### Goal

A maintainer changing native evaluation behavior reads and writes shell
checks that enter at the family command, or at a layer's own contract, and
state each expected fact in one line. One guideline in
`Distribution/evaluation` says where a check enters, what it leaves
untested, and which words it uses. The run-entry checks are the worked
example. The checks stay shell.

#### Why shell stays

The replacement with JavaScript was the starting request. Observation on
2026-11-17 turned it down:

- `npm run test:evaluation` schedules 58 shell jobs from 61 shell files
  outside `support/` (about 5,600 lines), backed by 72 `support/` files
  (about 7,200 lines), beside 16 `node --test` jobs.
- Many checks already run the real command as a process with a substitute
  host first on `PATH`: the comparison-baseline checks, the catalog check,
  the timeout check.
- The rejected-case checks source an assessor and call its function.
  Production composes its layers the same way, and
  [family layers](../../Distribution/evaluation/native-family-layers.md)
  defines "assess judges `observations.txt`" as that layer's contract. No
  assessor is a process, so that function is the highest entry there is.
  About 285 rejected cases, mostly row tables, go through
  `native_assessor_counterexamples`.
- A smaller group sources private helpers below any entry, such as
  `native-run-supervise.sh`, `native-comparison-verdict.sh`,
  `native-comparison-basis.sh` and `native-journey-state.sh`.
- CI's evaluation share took 201–204 s on the last three successful `main`
  runs, level with the other two shares. Run time is not a motive.

What the tree lacks is plain statement. The 61 checks hold 146 hand-written
`FAIL:` blocks, 344 `grep -q` assertions, 52 `mktemp` setups and 13 private
cleanup traps. `native-harness/native-run-timeout.sh` spends about 100 of
its 165 lines on `if … echo FAIL … cat … exit 1` around some 15 facts. The
rejected-case row tables show the form that works here: one line per case,
and the helper prints the evidence when it fails.

[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps
these checks deterministic, on real commands with controlled inputs and
counterexamples, and keeps paid host sessions on demand.
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps this tooling out of the installed payload, so the guideline and the
vocabulary live in `Distribution/evaluation`.

#### Scope

Required behavior:

- **Guideline.** `Distribution/evaluation/README.md` and
  [family layers](../../Distribution/evaluation/native-family-layers.md)
  state the rules for an evaluation check:
  - It enters at the family command with a substitute host, or at a layer
    contract the guide names: an assessor applied to an observation through
    the rejected-case helper.
  - It does not source a private `src/` helper to call its functions or read
    its globals.
  - It does not restate data or configuration. A catalog entry, a case
    list, a routing table or an input list lives in one place, the script
    that owns it. A check proves the rule that consumes the data, with data
    the check controls.
  - It states each expected fact through the shared expectation vocabulary.
  - Distinct behaviors stay distinct cases. Data-only variants of one
    behavior share a row table.
- **Expectation vocabulary.** One test-only helper under
  `tests/native-harness/support/` gives the run-entry checks words for: a
  scratch workspace that cleans itself up, running an entry with substitute
  hosts while keeping its status and output, and expecting a status, a
  record field, a line in a file, or an absent path. A failed expectation
  names the fact and prints the evidence it read. The helper has its own
  check, including that a failed expectation fails the job.
- **Worked example.** The run-entry checks use the vocabulary and keep every
  fact they assert today: `native-run-timeout.sh`,
  `native-run-watchdog-cleanup.sh`, `native-run-workspace-isolation.sh`,
  `native-result-retention.sh`, `native-runner-failures.sh` and
  `native-stream-completeness.sh` (about 1,000 lines).

Scope limits:

- The other families keep their current form. They adopt the vocabulary
  when next changed, under the guideline.
- No check is removed here.
- `cases/`, `src/`, `Distribution/tests` and the `node --test` files are
  unchanged.

Decided and not pursued:

- **JavaScript replacement.** See above.
- **Bach.** The neighbouring Doughnut project vendors the
  Bach framework (`scripts/test/vendor/bach.sh`, 763 lines). Bach replaces
  `PATH` with a read-only fake so that every external command becomes a
  printed dry-run line, and a test passes when the commands it would run
  match the commands its `-assert` function lists. These checks need the
  opposite: real `git`, real processes and deadlines, and substitute hosts
  placed on `PATH`. Under Bach each of those would be an `@real` exception
  and the substitute-host mechanism would not work. Of Doughnut's 24 script
  tests, 8 source Bach and the other 16 are plain functions on real state.
  What Bach offers beyond that is `@assert-equals` and named test
  functions; it has no word for a record field or for printing evidence,
  which is the redundancy found here. Not adopted.

#### Key examples

- **A fact in one line.** The timeout check's hung substitute host makes the
  context command return 124 → the check states the status, the
  `execution-status: timeout` record field and the absent `adopter`
  directory in one line each, with no hand-written `FAIL:` block.
- **A failed expectation shows its evidence.** The record says
  `execution-status: completed` where the check expects `timeout` → the job
  fails, names the field with the expected and actual values, and prints the
  record.
- **Same facts after the rewrite.** A fault that today fails a run-entry
  check, such as a retry after the deadline or an owned process left alive,
  still fails the rewritten check.
- **Data stays in one place.** A new check for catalog selection gives the
  command its own two-case catalog and proves that `--where` filters by
  trait. It does not list the shipped case names.
- **Entry, not helper.** A new check for a supervision outcome runs the
  context command with a substitute host. It does not source
  `native-run-supervise.sh`.

#### Evaluation

The six run-entry checks contain no hand-written `FAIL:` block and no
private scratch-cleanup trap, and each still fails on a break of a behavior
it covers. The evaluation guides state the entry, data and vocabulary rules
and no longer tell a new check to source `src/` helpers. On the next real
change to an evaluation check, judge whether the vocabulary made the check
shorter to write and its failure quicker to read.
