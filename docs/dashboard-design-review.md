# Dashboard design review

These criteria are part of the temporary [UX/UI North Star](dashboard-ux-ui-north-star.md)
and carry the same authority and scope.

## Focused review and revision

Review the first usable experience against these examples, using actual records
when available. These are design review criteria, not an executable slice plan:

- The first story opens connected Backlog and Taken stages. A reader can
  understand their relationship, read each entry and follow its source links.
  Normal scrolling or reflow is enough until a real navigation need appears.
- A published queue-to-Taken change places that one card correctly on successful
  refresh, with no duplicate or invented live status. Any animation clarifies
  this result and respects reduced motion. Failed refresh leaves membership intact.
- Keyboard, narrow-screen use, and browser page zoom preserve readable work and
  access to evidence and refresh. If zoom/focus is added, a reader can return
  to an overview without losing orientation.

As later stories add the relevant facts, also review:

- A reader locates a Taken story, explains its intended outcome, identifies the
  recorded developer/mode, and reaches evidence for a completed slice.
- A story outside the backlog remains discoverable. Refinement and planning can
  differ independently; a planless story does not look broken.
- A Trunk Mode story and a Story Branch Mode story lead to the correct published
  sources. Missing assignment or branch metadata stays visibly unknown.
- A branch retrieval failure and an old but freshly retrieved commit communicate
  different situations. Neither produces an invented live status.
- Partial, conflicting, and empty evidence remain distinguishable. A reader
  understands the limits of the view without reconstructing Git history.
- Keyboard and narrow-screen use preserve the overview-to-detail path and source
  access. Decoration does not compete with story understanding.

Defer local worktree/lock activity, agent communication and takeover, feature
and structural views, and a recently finished stories view. Features would mean
maintained, test-protected external behavior; structure would map domain
organization to code. Neither is a one-to-one story mapping. A finished view
would first explore Git history rather than restore a maintained completion
list. Do not reserve disabled navigation or empty panes for these possibilities.

Revisit this guide during development when a real record, prototype review, or
user observation changes a design assumption. Update the relevant hypothesis
in place and record the reason briefly; avoid accumulating competing designs.
Keep firm requirements in the requirements document and durable architectural
constraints in human-owned ADRs. Retire or reduce this guide once its useful
direction is embodied in the product and maintained checks, or no longer helps
the next increment. It is not a permanent parallel specification.
