# Slice 4 formatted invoice-example consumer trace

Effect: accounting, exact history and fixed invoice sequencing move to cohesive
helpers; live/replayed/history spawn evidence shares one sender-identity rule.
The native CLI and independent final assertions remain. Seven original test
bodies are distributed by responsibility without changed setup or expected facts.
Installed subject pins, authority, caps and blocked-wait behavior are unchanged.

Produced by the installed script across the whole checkout:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . \
  --path Distribution/tests/support/blocked-execution-workflow-observation.mjs \
  --path Distribution/tests/support/blocked-execution-invoice-accounting.mjs \
  --path Distribution/tests/support/blocked-execution-invoice-history.mjs \
  --path Distribution/tests/support/blocked-execution-invoice-journey.mjs \
  --path Distribution/tests/blocked-execution-workflow-native.mjs \
  --path Distribution/tests/blocked-execution-workflow-native.test.mjs \
  --path Distribution/tests/blocked-execution-invoice-accounting.test.mjs \
  --path Distribution/tests/blocked-execution-invoice-admission.test.mjs \
  --term responseAccounting --term captureInvoiceAccounting \
  --term readInvoiceHistory --term runInvoiceJourney \
  --term initialJudgment --term observedCheck \
  --term observeOwnedEvent --term spawnedThreads
```

Whole checkout at `0bc39b172c9a`, including untracked files; 6,423 non-ignored
files searched. The eight named changed files were excluded by the script and
inspected directly below. Every externally located consumer:

| Located consumer | Disposition |
| --- | --- |
| `slice4-assessment.md` | excluded: nonexecuting evidence record; historical single-file passes are retained and current three-file proof is named. |
| `slice4-refactor.md` | excluded: nonexecuting maintainer review; current raw/formatted counts and relocated proof are recorded. |
| This consumer-trace record | excluded: generated evidence, no native behavior. |

Production, test, support/stand-in and journey/feature kinds had no external
matches. Old-reference search confirms `responseAccounting` callers import its
new accounting home; removed `initialJudgment`/`observedCheck` methods have no
remaining source callers. Invoice predicates now live with their one journey.
Earlier repair trace/code consumers are still part of the changed set, so their
current direct dispositions follow rather than disappearing from review:

| Direct consumer / seam | Disposition and focused proof |
| --- | --- |
| Native entry -> `runInvoiceJourney` and observer | run: syntax passed. Initial accepted identity remains persisted before subsequent reads; final available history, settings, report, local proof, revision and one-continuation assertions remain in the entry. Actual native outcome is pending. |
| Observer -> `captureInvoiceAccounting` | run: aggregate controlled case through `observation.accounting()` plus syntax. Same output shape, all admitted IDs, unknown counters, lower bounds and observer-owned ceilings remain. |
| Accounting test -> `responseAccounting` | run: parser counterexample retains exact wire deduplication, ancestor/cumulative exclusion, missing/partial/malformed semantics. |
| Observer -> `readInvoiceHistory` | run: startup case through `observation.history()` plus syntax; complete matching session metadata precedes full RPC, native identity/workspace and ownership updates remain. |
| Observer live/replay/history -> `spawnedThreads` | run: both admission cases retain exact thread/sender, recursive grandchild closure, foreign exclusion, idempotency and exact cleanup. Live transport outcome stays native-pending. |
| Existing ownership/project helpers | reused: source and protocol unchanged. Startup/refusal/disconnect/admission tests renew consumers; accepted preservation-mutation and installer/inventory evidence remain applicable. |
| All three test files | run: maintained focused runner passed all seven original cases; source comparison confirmed each original test body and both stronger interrupt-method assertions unchanged. |

Current maintained command:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- \
  Distribution/tests/blocked-execution-workflow-native.test.mjs \
  Distribution/tests/blocked-execution-invoice-accounting.test.mjs \
  Distribution/tests/blocked-execution-invoice-admission.test.mjs
```

Concrete setup/assertion locations before root's next formatting pass:

- `blocked-execution-workflow-native.test.mjs:10`: actual future-file event and
  incomplete/complete session metadata; no early RPC, persisted accepted ID,
  direct exact-turn interruption and later full history.
- Same file `:116`: matching terminal event precedes refused interrupt RPC;
  both known turns retain terminal evidence and remaining cleanup continues.
- Same file `:153`: disconnect settles the wait as unconfirmed, preserves both
  nonterminal identities/recovery and prevents a second dead-route interrupt.
- `blocked-execution-invoice-accounting.test.mjs:9`: exact own-response records,
  duplicate/foreign/cumulative examples, missing/partial and malformed input.
- Same file `:40`: admitted child without path/usage keeps requests unknown;
  actual exact child log restores two requests and 75 observed total tokens.
- `blocked-execution-invoice-admission.test.mjs:10`: earlier child turns replay,
  unrelated turns stay excluded, missing admitted evidence remains unknown.
- Same file `:71`: retained child spawn recursively admits the grandchild before
  history is available; own turn and missing usage remain observable; foreign /
  copied-ancestor evidence is excluded, admission repeats safely, one exact
  grandchild interrupt and terminal evidence settle cleanup. Both admission
  interrupt callbacks retain `method === "turn/interrupt"` assertions.

No uncovered structural consumers. Native workflow/comparison/attention and
actual descendant delivery remain required unobserved boundaries owned by
`slice4_native` after root release. These controlled tests provide no native
model outcome, supplier report or CI receipt. Earlier two/six/seven-case passes
and failed baseline cost remain in the assessment/refactor historical record.

## After-yield protocol and notification correction

Renewed installed trace:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . \
  --path Distribution/tests/support/blocked-execution-workflow-observation.mjs \
  --path Distribution/tests/support/blocked-execution-invoice-journey.mjs \
  --path Distribution/tests/blocked-execution-workflow-native.mjs \
  --term handleNotification --term observeOwnedEvent --term runInvoiceJourney \
  --term initial-yield-boundary.json --term nativeNotices --term noticeCounts \
  --term 'initial native turn must end normally before supplier events'
```

Full output: `/tmp/seed345-slice4-after-yield-trace.md`. Scope: 6,457 non-ignored
tracked/untracked files at `0bc39b172c9a`; three named changed sources were
inspected directly. No production, support/stand-in or journey/feature consumer
was located outside those sources.

| Located consumer | Disposition |
| --- | --- |
| `blocked-execution-invoice-accounting.test.mjs` | run: new real handler regression failed three versus one history queries, then observes notice suppression, retained child evidence, actual terminal wake and global error propagation. Original accounting assertions remain. |
| `blocked-execution-invoice-admission.test.mjs` | run: both exact child/recursive descendant cases pass unchanged. |
| `blocked-execution-workflow-native.test.mjs` | run: startup/cleanup cases pass; actual future-file observation is primed before atomic final replacement, without demanding an event per partial write. |
| `slice4-assessment.md`, `slice4-refactor.md`, this trace | excluded: nonexecuting maintenance evidence, updated with new prospective scope and explicit failed-run attribution. |

All eight cases passed direct `node --test` and the maintained focused npm wrapper
over those three test paths. Five changed source/test syntax checks passed.
Unchanged project, ownership and payload installer proof remains applicable.
Journey wait predicates now read retained events/records only; history/discovery
occurs at meaningful milestones/final/cleanup. Actual initial-completion-before-
first-producer timestamps and complete native caller outcomes remain uncovered
until an explicitly authorized run. No fake journey fixture supplies scheduling
proof; no paid work ran in this repair.

## Accepted-proof representation and artifact protection

Installed trace output: `/tmp/seed345-slice4-proof-contract-trace.md`, whole
checkout at `0bc39b172c9a`, 6,493 non-ignored files. Literal command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . \
  --path Distribution/tests/support/blocked-execution-workflow-project.mjs \
  --path Distribution/tests/support/blocked-execution-invoice-journey.mjs \
  --path Distribution/tests/blocked-execution-workflow-native.mjs \
  --term acceptedProofArtifact --term acceptedProofReview \
  --term accepted-proof-retention-review.json \
  --term 'preserved caller accepted proof artifact' \
  --term assertPreservedInvoiceWork --term workflowAssignment --term prepareWorkflowProject
```

Every located consumer: baseline bundle `record.json` is excluded as historical
source/hash index, not executable production despite its path-kind hint; assessment,
refactor and this trace are excluded nonexecuting evidence. No test/support/journey
consumer was located outside the three directly inspected changed files.
The entry still calls the same preservation/report helper; it now records original
proof path/hash and explicit pending semantic acceptance. The journey captures
actual nonempty held proof without an inline schema. New hash enforcement is
observed through real managed-project setup: altered accepted result bytes reject,
original/restored bytes pass. The eight existing cases and three changed-source
syntax checks pass. Assignment and core fixture bytes match the archived source.
Actual retained proof semantics must be reviewed after the next authorized native
case; no fixture or generic resolver supplies that outcome, and no comparative
acceptance follows from a technical pass.

Independent closure removed only the unused `observeOwnedEvent` child-array
return formerly consumed by live hydration. The same installed trace was rerun;
all six listed consumers retain the dispositions above. The focused maintained
runner passed all eight cases again and observer syntax passed. Other setup,
assertions and accepted syntax/installer/ownership proof are reused unchanged.
No native timestamp, model outcome or comparative proof is supplied by this edit.

## SEED346 reuse, acceptance-only entry and private retention

Installed whole-checkout trace: `/tmp/seed345-slice4-acceptance-trace.md`,6482
non-ignored tracked/untracked files at0bc with incoming55da active merge.
Changed paths supplied: native entry, invoice journey/history, new invoice session
test and native acceptance guide. Literal effect terms: `retainFinalInvoiceSessions`,
`codexSessionSettings`, `runInvoiceJourney`, `manualRescues`, `native baseline`,
`native candidate`. All externally located consumers are disposed here:

| Consumer | Disposition |
| --- | --- |
| `support/native-codex-session.mjs` | reused directly, unchanged: explicit-root final saved settings/ancestry reader. New final consumer and original reader unit passed. |
| `support/native-codex-session.test.mjs` | run: original saved turn settings/direct+nested worker proof, no native calls. |
| `support/blocked-execution-workflow-observation.mjs` | run: unchanged live history import, startup/ownership/accounting/admission/notice cases passed; final reader never owns live cleanup. |
| `developer-observation-guidance.test.mjs` | excluded: literal native-baseline comment matches; this invoice entry changes no shared refinement contract. |
| Three installed/source `dough-story-refinement/.../executable-proof.md` copies | excluded: generic retained-baseline guidance, no dependency on removed CLI modes. |
| `docs/maintainer/findings/ODF-280.md`, `ODF-324.md` | excluded: historical native-baseline vocabulary, no executable consumer. |
| Baseline `record.json`, assessment, refactor and this trace | excluded from execution: curated historical sources/hashes/outcome/limits; removed mode remains a historical command only. |

Direct entry/journey consumers now accept resume/attention only, remove baseline
manual evidence and pair/gain fields, retain same assignment/fixture/installer,
after-yield held receipt, negative fingerprints, one qualifier/replay, recovery,
proof/settings/revision/publication and exact ownership guards. Guide points paired
evaluation to NativeCompare; its explicit-wake CLI qualification is no daemon
callback proof. No shared comparison adapter/runner or production source changed.

MakeMe selected the new `blocked-execution-invoice-session.test.mjs` path before
editing (true; pageObjects=false). Explicit native saved records prove exact owned
private copies/settings/worker IDs, excluded unadmitted records and private payload
fields, then active-turn refusal before copy. Exact maintained proof (exit0):

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test --   Distribution/tests/blocked-execution-workflow-native.test.mjs   Distribution/tests/blocked-execution-invoice-accounting.test.mjs   Distribution/tests/blocked-execution-invoice-admission.test.mjs   Distribution/tests/blocked-execution-invoice-session.test.mjs   Distribution/tests/support/native-codex-session.test.mjs
```

Original8 + new final consumer + shared reader =10 cases. Also exit0:
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- Distribution/tests/native-comparison-paused-supplier.sh`.
That credential-free substitute check supplies no new native result. Four changed
JS syntax checks pass. Existing installer/project/accepted-proof mutation proof
is reused; actual held-proof semantics and native acceptance remain pending.

Retention-only consumers: native-probe/slice2/slice4 assessments and four bundle
indexes now explicitly identify PUBLIC compact views versus private exact raw
records.94 moved artifacts and all original/private indexes were hash-verified;
38 prior Slice1/2 raw files preserve original bytes privately. Their public
assessments retain native IDs/settings/commands/proof/acceptance/completion/replay
facts; source fixtures/traces remain.67 safe exact own usage rows plus frozen
source hashes/archive remain public. No typed reasoning/session/account content
was printed or relabeled as filtered raw evidence. No native/API/model call,
index mutation, formatter, hook lint or new comparative claim occurred.

Freshness settlement from coordinator: trunk
`5cb934e3d4491a0e747db69abbfdec8ea3bd9ec4` checked against baseline91f;
after merged55da only planning/backlog/profile changed. SEED346 correction621
plans runner-owned command/harness facts and unknown on incomplete, with no new
product change or required merge here. PFE choice stands; no subject substitution.
