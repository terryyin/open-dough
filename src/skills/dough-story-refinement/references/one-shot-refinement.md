# One-shot refinement

One-shot refinement refines one story queued in the **Backlog list** without
publishing a Preparing assignment. It works in an owned workspace at fetched
trunk, records the story's preparation facts there, and stops with the
committed result retained for review. Use it only when the developer or parent
instruction explicitly selects one-shot (`--one-shot` or a clear equivalent)
for refining that story; never infer it from apparent smallness. Without that
selection, refine under
[Announce the preparation assignment](preparation-assignment.md#announce-the-preparation-assignment).

An instruction that carries an established preparation continues it under
[established preparation](established-preparation.md), even when it also
names one-shot.

## Start without an assignment

Resolve the paths and target under
[Select or reuse the workspace](preparation-workspace.md#select-or-reuse-the-workspace),
then, before the first record write, run:

```text
node <installed>/scripts/preparation-assignment.mjs start --one-shot \
  [--integration <integration checkout>] \
  [--repository <owned worktree or common Git directory>] \
  --workspace <owned workspace> [--branch <new workspace branch>] \
  --identity <queued story identity> --remote <remote> --target <trunk branch>
```

`<installed>` is this project's installed `dough-story-refinement` skill
directory. Supply `--integration`, `--repository`, and `--branch` as
[Announce the preparation assignment](preparation-assignment.md#announce-the-preparation-assignment)
describes. The start needs no publication authority: it fetches the target,
checks how fetched trunk holds the story, and selects or creates the owned
workspace at fetched trunk. It publishes nothing: no commit, push, agent
profile, or backlog change.

Act on the receipt's `status`:

- `prepared`: the workspace is ready at `startingRevision`; retain it with
  `workspace`, `branch`, and `created`. `refresh` reports the integration
  checkout's safe refresh, as for an announcement. Begin refining.
- `source-refused`: fetched trunk shows the story Taken or held by an agent
  profile (execution or preparation). Report its `error` and leave the story
  to that holder.
- `workspace-assigned`: the workspace holds a published preparation
  assignment. For this story, continue that assignment by running `start`
  without `--one-shot`; otherwise end the other assignment first.
- `not-queued`, `workspace-selection-failed`, and `invalid-request` stop as
  they do for an announcement. `invalid-request` also names `--default-main`
  or `--auto-land`, which one-shot refinement does not support.

A recorded `not-ready` assessment does not stop the start: refinement may be
what repairs it.

## Refine, record, and commit

Refine under [planning scope and lifecycle](planning.md) in the workspace.
After the seed records goal, scope, and key examples, apply
[record preparation facts](../../dough-product-backlog/references/record-preparation.md),
including its readiness assessment once you have reviewed the story. Record
only what is true: refined alone is not ready, and an unselected approach is
a blocking reason.

Commit the seed and its recorded facts with plain `git commit` in the
workspace: the start named no agent.

## Stop for review

Report the workspace path and branch, the retained `startingRevision`, the
result commit, the recorded refinement, approach, and assessment, and any
unresolved decisions. Say that remote trunk still lists the story in the
**Backlog list** with no Preparing assignment, so others cannot see this
refinement until it lands. Leave the workspace and its branch in place:
nothing is pushed or retired, and the story is neither Taken nor completed.

A later session that names the retained workspace continues there without
running `start` again.

## Land or discard on request

The retained result follows
[Decide what happens to the written result](preparation-disposition.md#decide-what-happens-to-the-written-result).
An explicit keep lands it under
[Keep and publish the retained result](preparation-disposition.md#keep-and-publish-the-retained-result)
with no assignment release to stage. The story stays queued with the facts
the recorder wrote. Then close the workspace under
[Close or retain the workspace](preparation-workspace.md#close-or-retain-the-workspace).
