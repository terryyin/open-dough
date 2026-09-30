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

## Rejected cases

Every rejected case of a native assessor goes through
`tests/support/native-assessor-counterexample.sh`: a passing observation of
that assessor with one declared signal changed.
`tests/native-assessor-counterexample-guard.sh` fails any other rejected case in
`tests/`, naming its file and line.

A change that widens what an assessor accepts adds, in the same change,
paraphrased failure reports on the newly admitted side as rejected cases.
Bad outputs recorded from paid runs and reviews stay as rejected cases.
