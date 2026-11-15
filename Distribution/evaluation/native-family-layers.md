# Native family layers

A native family separates fixture, run, observe and assess responsibilities in
`Distribution/evaluation/cases/<family>/`. Shared execution, stream reading,
supervision, retention and comparison machinery belongs in `src/`. Automated
checks and rejected cases belong in `tests/<feature>/`, with private helpers in
that feature's `support/`; operational entries never load check-only helpers.
Keep each layer in its own file unless the family has too little to fill one
(execution-worktree-prep keeps
prompt, install, launch and retention together in
`execution-worktree-prep-native-run.sh`):

- fixture builds the project, remote and mailbox state; it never judges.
- run drives the host or substitute, retains the attempt, and writes the
  evidence identity; it never extracts fields.
- observe turns state and stream into `observations.txt` fields; it never
  judges.
- assess judges `observations.txt` and declares `# assessor-signal:` lines
  (`//` in JavaScript); it never reads live state.
- counterexamples state rejected cases through
  `native_assessor_counterexamples`; they never build fixtures.
- shared helpers hold what several families need and no family journey.

Reuse these `src/` owners before writing a copy:

- `native-observation.sh`: `native_observation_field FILE KEY` reads a field
  value's first word and `native_observation_value FILE KEY` its whole value;
  `native_harness_inspected PATTERN FILE...` prints true or false.
- `native-completion-observation.sh`: `native_completion_measure` and the
  call, await, stop, shutdown and control-order helpers for one
  complete-revision call.
- `native-response-field.sh`: writes and reads the indented `response` field.
- `native-harness-observation.sh`: the node call wrapper and log the closure
  and completion fixtures observe from outside the project.
- `Distribution/evaluation/src/native-host-stream.sh`: host-neutral views of a Claude, Codex or Cursor
  stream; match no host event shapes yourself.
- `product-backlog-native-evidence.sh`: `product_backlog_native_cleanup`
  keeps failing evidence and prints `PRESERVED:`.

Canonical repository, installation and MakeMe builders remain in
[`Distribution/tests/`](../tests/README.md#test-data-architecture). Evaluation
fixtures use those builders rather than copying them. The counterexample
helper and its guard are test-only (see [Rejected cases](#rejected-cases)).

Current operational families, each `<family>-native-<layer>` in `cases/`:

- git-publication: `-fixture`, `-run`, `-evidence`, `-assess` with startup,
  candidate and one-shot assessors; counterexamples live in `tests/git-publication/support/`.
- story-branch-closure and trunk-closure: `-fixture`, `-observe`, `-assess`,
  `-run`, under `cases/closure/`; trunk-closure's fixture also sources `-arming`.
- ci-completion: `-fixture`, `-observe`, `-assess`, `-run`, under `cases/ci-completion/`.
- delivery-evidence (selection, claims, consumers, gaps, aggregate, nostore,
  deferred, original, terminal, release, drift, scheduling, amended): shared
  `delivery-evidence-native-run.sh`, with the cases and their scenarios
  registered once in `delivery-evidence-native-cases.sh`; each case has
  `-scenario-content`, `-observe` and `-assess`. Default check bodies and
  counterexamples live in `tests/delivery-evidence/support/`. Amended's scenario content
  sources each delivered stage's product from `-product-content`. Scheduling exercises a
  stylesheet change (`-stylesheet-content`, with the rendering modules and
  tests in `-library-content`) whose extraction invalidates a whole-suite run,
  as planless work and as slice 1 of an executable plan: its product commands
  log each run's kind and product-state identity (`-proof-logger`). Controlled checks
  replay proof sequences through them, and
  `tests/delivery-evidence/proof-scheduling-native.sh` runs rejected cases and
  substitute-host runs without credentials. The corresponding `cases/` entry runs one paid `--native HOST`
  session per scenario (`--scenario NAME` selects one).
  Compare [scheduling inputs and historical limits](../tests/git-publication/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) before a paid run.
  Aggregate/no-store implementation and deferred-caller acceptance journeys retain actual command/results
  and final product state for explicit review; their automated assessment remains
  pending and cannot certify native behavior from prose.
- execution-worktree-prep: `-fixture.mjs`, `-run.sh`, `-observe.mjs`,
  `-assess.mjs`, `-flat.mjs` (observation JSON as `key: value` lines), and
  counterexamples under `tests/git-publication/support/`.
- product-backlog: only `product-backlog-native-evidence.sh` is shared; its
  guard, use and take cases stay separate.
- native-comparison ([native comparison cases](comparison.md)): each
  case under `Distribution/evaluation/cases/comparison/<case>/` keeps its fixture
  and observer in `case.bash` and its assessor in `assess.bash`, with rejected
  cases in `tests/native-comparison/`. Shared `src/native-comparison-` modules: `-run` and `-retain` (one journey), `-pair`,
  `-pair-observe` and `-verdict` (a pair, its
  observer and judge), `-basis` and `-basis-verdict` (a pair's Git basis and
  recovery judge), `-preflight` and `-catalog`. Test-only `-verdict-counterexamples` and
  `-pair-fixture` live in `tests/native-comparison/support/`;
  `tests/native-harness/support/native-agent-paused-supplier.sh` is the substitute host.

Rules for a new family:

- Keep the `# assessor-signal:` lines in the assess file:
  `native_assessor_counterexamples` reads signals from the file it is given,
  and `assessor-identity` names that file.
- List every file the family sources in its evidence-identity list. No check
  enforces completeness, so an unlisted file silently leaves retained
  evidence unattributed.
- Field names and order in `observations.txt` are the contract the replay
  corpus reads; change them only with the corpus.
- Closure, delivery-evidence, git-publication and execution-worktree-prep
  follow this. Exceptions: delivery-evidence keeps its own whole-line reader
  `delivery_evidence_obs_get` beside `native_observation_field`;
  ci-completion has no identity of its own (git-publication evidence writes
  it); the claims and consumers delivery-evidence observers have no free check.

## Rejected cases

Every rejected case of a native assessor goes through
`Distribution/evaluation/tests/native-harness/support/native-assessor-counterexample.sh`: a passing observation of
that assessor with one declared signal changed.
`Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` fails any other rejected case in
`tests/`, naming its file and line.

A change that widens what an assessor accepts adds, in the same change,
paraphrased failure reports on the newly admitted side as rejected cases.
Bad outputs recorded from paid runs and reviews stay as rejected cases.
