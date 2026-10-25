# Keep the source fresh on a story branch

In Story Branch Mode, the execution branch carries its own copy of the selected
story section and active plan from the Take, while the developer may amend
either on remote trunk. Before a slice is marked done, before the
execution-complete record, and before wrap-up's deletion, compare that copy with trunk so an amendment is
absorbed or left with the developer before work is accepted against a stale
source. Trunk Mode does not use this check.

## Run the check

Resolve `<installed-execute-plan>` to the installed execution skill directory,
`<execution checkout>` to the owned workspace, `<identity>` to the Taken work's
identity, and the authorized remote and trunk from the established publication
context. Run from the execution checkout:

```sh
node '<installed-execute-plan>/scripts/source-freshness.mjs' check --workspace '<execution checkout>' --identity '<identity>' --remote '<authorized remote>' --target-ref 'refs/heads/<trunk>'
```

It fetches the remote, takes the branch's fork from fetched trunk as the Take
base, and reads the Taken entry on fetched trunk for the records: with a plan
link, the story section and the linked plan; for a plan-homed correction, its
plan; otherwise the story section alone, as for a quick story or a plan linked
only on the branch. It compares each record at that base, on trunk, and in the
working tree, so an uncommitted plan edit for the current slice counts as the
branch copy. It prints one JSON line with the overall `result`, the
`trunkRevision` read, and each compared record with its `state`; the result is
the most severe state:

- `unchanged` (exit 0) — trunk has not changed either record since the Take,
  or the branch copy already contains trunk's change. Continue the boundary.
- `amended` (exit 1) — trunk changed a record and the change applies cleanly
  over the branch's own edits; the record carries the `change` and the
  `application`. Follow [Absorb an amendment](#absorb-an-amendment).
- `conflict` (exit 2) — trunk's change overlaps the branch's edits, or would
  change or remove a slice the branch marked `done`; the record carries its
  `reason`, `branchText` and `trunkText`, and for a done slice its `slices`.
  Follow
  [Stop on a conflict](#stop-on-a-conflict).

A refusal exits 3 with a `reason` and message, such as a failed fetch, an
identity not Taken on trunk or at the base, or an absent record. It accepts
no boundary: correct the input or publication context and rerun, or stop under
[human judgment](execution-decisions.md#stop-for-human-judgment) when it
cannot be corrected. Neither command commits, pushes, or writes to trunk.

## Absorb an amendment

1. Read every changed record's `change` against the copy you are working from.
2. Run the same command with `absorb` in place of `check`. It writes trunk's
   change into the amended records in the working tree, word for word, and exits 0
   with `written`; it writes nothing on `conflict`.
3. Include the written records in the current increment's owned paths, so its
   commit and publication carry them; wrap-up's deletion gate absorbs in a new
   increment.
4. Apply the amended source under [Accept proof](wrap-up.md#accept-proof) and
   [story obligations](story-obligations.md#record-format): a new or changed
   promise is a `return` for the current slice or `receiving slice N` for a
   named remaining slice; an amended exclusion settles its obligation with
   `excluded "<quote>"`; an added slice is remaining work under
   [plan refinement](../../dough-story-refinement/references/planning.md#refine-the-active-plan).
   When that reopens work after the `## Execution complete` record, remove the
   record and write it again under
   [Record execution completion](finish-or-stop.md#record-execution-completion)
   once the reopened work is done.
5. Rerun `check` until it reports `unchanged`, then continue the boundary.

## Stop on a conflict

Record `awaiting story review`, or `awaiting correction review` for a
correction, as for stale understanding in
[Deliver the change](wrap-up.md#deliver-the-change) step 5, naming the
conflicting record, its `branchText` and `trunkText`, and the `trunkRevision`.
Deliver nothing that depends on the conflicting text; delivered slices and
their accepted proof stay, and independent safe work is delivered under
[human judgment](execution-decisions.md#stop-for-human-judgment). Resolve
nothing yourself and write nothing to trunk. After the developer decides, rerun
`check` from the boundary that stopped.

## At wrap-up's deletion

On `amended` or `conflict`, wrap-up deletes nothing. Return to execution in
the same session: absorb and settle the amendment above, or stop on the
conflict, then re-enter wrap-up, which deletes only after `check` reports
`unchanged`.
