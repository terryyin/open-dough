# Native host streams

Native checks read a Claude Code, Codex, or Cursor output stream only through
`tests/support/native-host-stream.mjs`. Its per-host adapters, in
`native-host-stream-adapters.mjs`, hold every host event shape. Shell callers
use `tests/support/native-host-stream.sh`, which keeps reader calls out of a
native harness's node-call log. The reader returns the started commands
(continuations joined, and split at command separators for matching),
outputs, the final response, and the stream status: complete, truncated,
missing, or unknown. `tests/native-stream-replay.sh` fails any shell or JS
file under `tests/` or `scripts/` that holds a host event literal outside the
reader and an exact list of shape writers
(`tests/support/native-stream-guard.mjs`), such as substitute agents and
counterexample stream builders.

`tests/fixtures/native-streams/<host>/<case…>/<attempt>/` holds real host
streams from accepted paid runs, gzipped. Each sits beside its retained
`record`, observations, and response, and a reviewed `expected` file. Replay
checks every stream's started commands, status, and response. It also cuts
each stream after its last started command, at a line found independently of
the reader. For a publication journey, the journey's stream fields
(`git-publication-native-stream-fields.mjs`) replace those fields in the
retained observations, and today's assessor reassesses them. An attempt whose
observations lack a field the assessor reads is `not-replayable`, naming the
field, and its schema is not rewritten. Expectations are reviewed, never
written by the reader; a `corrected:` line cites a harness fault where the
reader is right and the retained observation was wrong. Replay is not native
behavioral evidence
([ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md) §2);
[native publication](native-publication.md) describes adding an accepted run.
