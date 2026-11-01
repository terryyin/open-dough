# Record source-review observations through one supported operation

**Identity:** SEED-010#record-source-review-observations
**Source:** [selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#record-source-review-observations).
**Source review:** [source-only return](source-review.md)

## Goal and scope

Give the coordinator one supported recording path that settles a commitment's
slice allocation, observation, or linked Story obligation so the existing
`story-obligations` reader and `check` accept the result, without hand-built
cell escaping or putting an obligation id in Slice. Reuse current Commitments
and Story obligations shapes, readers, and refusal vocabulary. Do not change
acceptance policy, review depth, proof sufficiency, or review-ID stability
across changed source. Refuse unknown commitment ids and stale input with file
bytes left intact and no partial write.

## Existing solutions and decisions

PFE: `story-obligations.mjs` today exposes only `list` and `check`. Readers in
`story-obligation-source-review.mjs` and `story-obligation-reader.mjs` already
parse Commitments cells (including `\|` escapes), refuse obligation ids in
Slice as `malformed-commitment`, and validate Story obligations `Reported`
shapes. Test fixtures build tables by hand; no writer exists. Extend that same
CLI/module family with a record operation rather than a parallel authoring
script or Markdown-template skill. Guidance under
`story-obligations.md` must name the recording path beside `list`/`check`.
ADR 0006 keeps published guidance addressed to the executing agent; ADR 0003
keeps response delivery on the ordinary release path. No North Star or new ADR.

## Outside-in proof

Focused Node tests drive the recording operation against disposable plan and
`source-review.md` fixtures covering the story's key examples, then run the
unchanged `check` consumer. Discriminate: without the writer, recording is
unavailable and hand-shaped malformed rows still fail check; with it, escaped
observations, exclusion-via-obligation (G1 out of Slice, proper `Reported`),
observed allocations, single-row correction, and unknown/stale refusals hold.
Replay shapes from at least one retained ODF-391 observation-cell case and one
ODF-381 Slice/Reported case through the recording path. Preserve existing
obligation and source-review check suites. Local proof is those focused
families; full suite stays with ordinary hosted CI.

## Ordered slices

### 1. Record commitment observations and linked obligations through one path
Type: Behavior
Status: done
Proof: Accepted — `node --test src/skills/dough-execute-plan/scripts/story-obligations-source-review*.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs` (26 pass) and `node --test src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs` (59 pass). Write suite covers `|`/quotes (ODF-391), exclusion Slice/`Reported` (ODF-381), allocate+observe, single-row correction, unknown/stale intact bytes; guidance names `record`; prior source-review check suites preserved. Source review linked; commitments 1–13 observed; 14a/14b → G1 (wrap-up bookkeeping); 15 → G2 excluded.

Behavior: Given a plan that links a Commitments table, the coordinator records
an observation, slice allocation, or linked Story obligation for an identified
commitment through one supported `story-obligations` operation. The written
cells and any new or updated obligation entry match the shapes `check` already
accepts, including escaped `|` and quotes. An exclusion keeps the obligation id
out of Slice and uses the required `Reported: slice N — "…"` form. Correcting
one row leaves unrelated Commitments rows and obligations unchanged. Unknown
commitment ids or stale input refuse without rewriting either file. Existing
valid records remain readable; `list`/`check` semantics for already-valid
records stay as they are.

## Current decisions

- Origin/integration: `/Users/terryyin/git/open-dough`; preparation workspace:
  `/Users/terryyin/git/open-dough/.worktrees/record-source-review-observations-through-one-su`
  on `cursor/record-source-review-observations-through-one-su`.
- One Behavior slice owns the writer, its validation against existing readers,
  dual-file updates without partial writes, and guidance that points at it.
- Stale-input protection compares expected current file state (or equivalent
  compare-and-swap) before write; refuse rather than merge conflicting edits.
- Do not broaden into review-ID renumbering, acceptance-policy changes, or a
  second obligations grammar.

## Decisive premises

- CLI exposes only `list`/`check`: observed
  `node src/skills/dough-execute-plan/scripts/story-obligations.mjs` usage
  refusal naming those subcommands only (this checkout).
- Reader accepts `\|`-escaped observation cells and refuses obligation-in-Slice:
  observed via `readSourceReview` on escaped vs `| … | G1 | G1 |` inputs in this
  checkout; escaped row parsed, bad row `malformed-commitment`.

## Learnings and preparation review

Refinement was not needed: one proof loop covers the single authoring path and
all key examples; no independent second outcome or hidden preparation slice.
No remaining slice-specific concern.
Recording landed as `record` on the existing `story-obligations` CLI with digest
CAS and atomic dual-file replace; refactor split write/CLI modules under the
250-line limit and shared the exact source-review link helpers with the reader.

## Story obligations

### G1. Closure finding revision and release recording
Reported: slice 1 — "At closure, record the actual response revision and first containing release (or explicitly unreleased status) at both addressed findings"
Story clause: "This response changes authoring of those records, not acceptance policy, review depth, or whether a valid table proves the commitment's observed result."
Disposition: no user cost "A coordinator recording a planned-execution source review can retain commitments, slice allocations, and observations through one supported operation that the existing obligations reader accepts": Evaluation's closure recording of response revision and release at ODF-391 and ODF-381 is Story Wrap Up bookkeeping after the authoring operation ships, not a Commitments-table authoring result for this operation.
Commitment: 14a, 14b

### G2. Later ordinary use stays a separate observation
Reported: slice 1 — "later ordinary use remains a separate observation"
Story clause: "later ordinary use remains a separate observation"
Disposition: excluded "later ordinary use remains a separate observation"
Commitment: 15
