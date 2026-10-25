# Native family layers

A native family keeps six layers, each in its own file under `tests/support`
unless the family has too little to fill one (execution-worktree-prep keeps
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

Reuse before writing a copy:

- `native-observation.sh`: `native_observation_field FILE KEY` reads a field
  value; `native_harness_inspected PATTERN FILE...` prints true or false.
- `native-completion-observation.sh`: `native_completion_measure` and the
  call, await, stop, shutdown and control-order helpers for one
  complete-revision call.
- `native-response-field.sh`: writes and reads the indented `response` field.
- `native-assessor-counterexample.sh`, with its guard
  (see Rejected cases).
- `native-harness-observation.sh`: the node call wrapper and log the closure
  and completion fixtures observe from outside the project.
- `native-host-stream.sh`: host-neutral views of a Claude, Codex or Cursor
  stream; match no host event shapes yourself.
- `product-backlog-native-evidence.sh`: `product_backlog_native_cleanup`
  keeps failing evidence and prints `PRESERVED:`.

Current families, each `<family>-native-<layer>` in `tests/support`:

- git-publication: `-fixture`, `-run`, `-evidence`, `-assess` with startup,
  candidate and one-shot assessors, and several `-counterexamples` files.
- story-branch-closure and trunk-closure: `-fixture`, `-observe`, `-assess`,
  `-counterexamples`, `-run`; trunk-closure's fixture also sources `-arming`.
- ci-completion: `-fixture`, `-observe`, `-assess`, `-counterexamples`, `-run`.
- delivery-evidence (selection, claims, consumers, gaps, aggregate, nostore,
  deferred, original, terminal, release, drift, scheduling, amended): shared
  `delivery-evidence-native-run.sh`, with the cases and their scenarios
  registered once in `delivery-evidence-native-cases.sh`; each case has
  `-scenario-content`, `-observe` and `-assess`, with counterexamples inside
  the assessor file, and an optional `-checks`. Amended's scenario content
  sources each delivered stage's product from `-product-content`. Scheduling exercises a
  stylesheet change (`-stylesheet-content`, with the rendering modules and
  tests in `-library-content`) whose extraction invalidates a whole-suite run,
  as planless work and as slice 1 of an executable plan: its product commands
  log each run's kind and product-state identity (`-proof-logger`), `-checks`
  replays controlled proof sequences through them, and
  `tests/proof-scheduling-native.sh` runs those, the rejected cases and
  substitute-host runs without credentials, or one paid `--native HOST`
  session per scenario (`--scenario NAME` selects one).
  Compare [scheduling inputs and historical limits](native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) before a paid run.
  Aggregate/no-store implementation and deferred-caller acceptance journeys retain actual command/results
  and final product state for explicit review; their automated assessment remains
  pending and cannot certify native behavior from prose.
- execution-worktree-prep: `-fixture.mjs`, `-run.sh`, `-observe.mjs`,
  `-assess.mjs`, `-flat.mjs` (observation JSON as `key: value` lines), and
  `-cheap.sh` counterexamples.
- product-backlog: only `product-backlog-native-evidence.sh` is shared; its
  guard, use and take cases stay separate.

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
`tests/support/native-assessor-counterexample.sh`: a passing observation of
that assessor with one declared signal changed.
`tests/native-assessor-counterexample-guard.sh` fails any other rejected case in
`tests/`, naming its file and line.

A change that widens what an assessor accepts adds, in the same change,
paraphrased failure reports on the newly admitted side as rejected cases.
Bad outputs recorded from paid runs and reviews stay as rejected cases.
