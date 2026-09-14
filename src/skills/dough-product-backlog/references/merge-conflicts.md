# Resolve product backlog merge conflicts

Use this procedure when an already-authorized Git operation conflicts in this
project's product backlog. Resolve clear independent changes without asking for
confirmation. This procedure does not authorize starting a merge, rebase,
cherry-pick, execution, or closure.

## Recover the intended changes

Read the backlog's common ancestor and both versions supplied by the current
Git operation, including entries outside the conflict markers. Compare each
version with that ancestor; do not infer intent from the markers alone or assume
that Git's `ours` always means the story branch during a rebase.

Match entries using this project's established story or correction identity.
A seed ID alone does not identify a story when a seed contains several stories.
Treat an established story-to-plan link change as the same work. Use available
execution context or affected history to resolve missing identity or intent;
read canonical homes only when needed. Do not recreate deleted plans or stories
merely to resolve the backlog.

## Combine changes

Apply each side's changes relative to the ancestor, preserving compatible
changes from the other side:

- Combine independent takes, completed-item removals, and other unambiguous
  edits to different entries. Preserve an unchanged entry unless the other side
  intentionally changes or removes it. An unchanged copy does not undo a take
  or resurrect removed work.
- Apply the same change to the same work once. If both sides change that work
  differently, use the available evidence to establish whether the intentions
  are compatible. Do not assume that removal or a later lifecycle state wins.
- Preserve unrelated titles, links, direction text, and queue order. A take or
  removal does not reprioritize the remaining queue. Preserve compatible
  explicit reprioritization; do not infer a new priority to make the text merge.
- Preserve the order of surviving ancestor entries in **Taken**, then append
  newly taken entries. Preserve each side's relative order among those additions.
  Where their interleaving is unspecified, choose by established identity in
  lexical order among the next eligible entries. Follow an explicit project
  convention instead when supplied. This tie-break does not set queue priority.

For example, if one side takes queued story A while the other removes completed
story B, put A in **Taken** and omit B. If both independently take A, retain one
entry. If one removes B while the other explicitly returns B to the queue,
resolve the incompatible intentions before choosing its state.

Do not resolve by taking an entire side or blindly combining conflicting lines.
If identity, competing order, or incompatible edits cannot be resolved from
available evidence, name the affected entries and missing decision, preserve
the unresolved Git state, and ask the human. Unambiguous changes to other
entries need no new product decision.

## Verify and return

Check the resulting backlog against both sets of intended changes: each active
identity appears once across **Taken** and **Backlog list**, removed work stays
absent, surviving references are coherent, and unrelated content and order are
preserved. Retain both section headings even when empty and remove all conflict
markers from the resolved file. Inspect the resolution diff; do not rerun
implementation tests solely for a backlog text resolution.

Return to the calling workflow for staging, remaining conflicts, verification,
and continuation of the authorized Git operation. Report the combined
transitions briefly; a resolved backlog alone does not mean integration is done.
