# Native publication checks

`tests/git-publication-native.sh --native HOST --case CASE --results-dir DIR`
manually runs a selected publication journey through Codex, Cursor, or Claude
Code. Put Bash 5 first on PATH. Paid sessions are opt-in; the default wrapper
and `npm test` use credential-free substitutes and counterexamples.

Accepting a paid run of any family adds it to the replay corpus in
`tests/fixtures/native-streams`:
`node tests/support/native-stream-corpus-add.mjs <result-path>` takes the
retained attempt the run printed and adds it under its host and case
(`publication/<journey>`, `fresh-node`, `delivery-evidence/<case>/<scenario>`).
It refuses, naming what is missing, an attempt without a `record`, without
`observations.txt`, or with a stream that is missing or not complete; a record
naming no known host or no case; a publication case without a journey; and an
entry the corpus already holds. It gzips each stream, copies the retained
provenance, and writes a draft `expected`, printing a `review:` line wherever
the shared reader or today's verdict disagrees with the retained attempt.
Review the draft, add `corrected:` with the harness fault where the reader is
right, and delete its `# draft:` line; `tests/native-stream-replay.sh` then
replays the attempt.

The one-shot escalation case asks for a settings-key rename in an owned
workspace. The notes tool preserves extension settings and released values.
Released data holds different active and archive directories under the old
core key and the proposed new key. Renaming the core key exposes a collision:
either alias precedence loses a saved value or selects archived notes. The
maintainer owns the representation of both meanings; the fixture supplies no
admission instruction or migration prescription.

`git-publication-native-one-shot-escalation-fixture.test.mjs` establishes this
product premise through the generated project's setup and actual command,
including both alias precedences and a consumer fallback. The native trace
must independently establish one-shot startup, edits before discovering growth,
ordinary admission, and restoration of those edits uncommitted in the same
workspace. Safe admission before editing leaves that transition unproved.
The fixture permits publication and withholds planning; stopping after admission
for the product decision is valid. The state assessor and transcript together
establish the verdict, with unrelated human changes preserved.

The one-shot session-policy cases phrase each request as the direct
invocation would (`dough-execute-plan --one-shot --default-main`, `--auto-land`,
`dough-story-refinement <identity> --one-shot --auto-land`) and embed no
expected outcome. `publication/one-shot-default-main` works in the originating
checkout itself, which holds staged, unstaged and untracked edits over an
unpublished local commit; the result must commit all of it there with nothing
pushed. In `publication/one-shot-auto-land-blocked`, the fixture sets
`remote.origin.uploadpack` to a wrapper that publishes another developer's
prepared Take of the queued story on the first fetch after the workspace
branch gains a commit, so a native session and the substitute meet the
competing owner between start and landing. `publication/one-shot-established`
runs the installed one-shot start itself and hands the session the installed
`established-start.mjs` block after the skill invocation, as a dashboard
launch does; the session must not start again.

## Native family layers

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
  `-counterexamples`, `-run`.
- ci-completion: `-fixture`, `-observe`, `-assess`, `-counterexamples`, `-run`.
- delivery-evidence (selection, claims, consumers, gaps): shared
  `delivery-evidence-native-run.sh`; each case has `-scenario-content`,
  `-observe` and `-assess`, with counterexamples inside the assessor file.
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
