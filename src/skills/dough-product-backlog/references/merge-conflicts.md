# Resolve product backlog merge conflicts

Within the calling workflow's authorization, resolve compatible backlog changes
without asking for confirmation.

1. Before replacing conflict markers or staging the backlog, read its three Git
   versions: ancestor, current side, and incoming side (available in unmerged
   index stages 1, 2, and 3). Identify the actual branches/commits; during Story
   Branch integration, distinguish the integration target from the execution tip;
   during a Trunk Mode publication rebase, distinguish fetched trunk from the
   unpublished suffix. Git ours/theirs labels during rebase do not name intent.
   Compare each side with the ancestor and retain a brief per-identity account of
   changed membership, links, or ordering in the working context. Include sibling
   work, not just the story being wrapped up. Match work items by their recorded
   identity under [work item identity](identity.md), including known
   story-to-plan links; a shared seed ID is insufficient, and a side that only
   relinked a renamed or moved canonical home changed its navigation, not its
   identity.
   Consult affected history or canonical homes only if identity or intent is
   unclear. Use history when cleanup deleted a needed canonical home; missing
   artifacts alone do not prove completion.
2. Combine compatible changes from both sides. Apply identical changes once.
   An unchanged entry does not override the other side's take or removal.
   For example, taking A and removing completed B yields A in **Taken** and B
   absent. Different changes to the same work require compatible intentions;
   neither removal nor a later lifecycle state automatically wins.
   For concurrent closures, ancestor **Taken** = [A, B], target = [B], and
   execution tip = [A] must resolve to an empty **Taken**: each side removed one
   item and left the other unchanged. Preserving unrelated sibling work during
   branch-local cleanup does not authorize restoring a sibling removed on the
   target. Do not choose an entire side or union the surviving entries.
3. Preserve unrelated titles, links, direction text, and queue order. Retain
   compatible explicit reprioritization; taking or removing work does not
   reprioritize the remaining queue. An entry that only shifts position behind
   work a side took or removed keeps its priority; a reprioritization is a
   change to an entry's place among the entries around it.
4. In **Taken**, retain surviving existing entries in order, then append new
   entries while preserving each side's addition order. Unless the project
   supplies a convention, interleave concurrent additions by repeatedly choosing
   the lexically smallest established identity among the next entries from each
   side, emitting each identity once. Do not use this rule for queue priority.
5. If identity, incompatible changes, or competing order remains unresolved,
   preserve the conflict and ask the human for the specific missing decision.
   For example, one side removing B while the other side gives B a different
   place in the queue requires a decision: removing work and reprioritizing it
   are different intentions, and neither wins because available context does
   not establish which one applies.
6. Before completing the merge or continuing the rebase/cherry-pick, inspect the
   staged backlog against the per-identity changes from step 1. Verify both sides'
   intended changes are represented, each active identity appears once across
   both lists, every compatible removal stays absent, and references remain
   coherent. Correct a failed check before continuing. Retain both section headings
   even when empty. Report both sides' resolved transitions briefly, including sibling removals, and
   continue the calling workflow; backlog-only resolution needs no implementation
   test run.
