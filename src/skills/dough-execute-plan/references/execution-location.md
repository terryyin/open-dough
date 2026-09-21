# Choose the execution location

Planned and planless work default to Story Branch Mode: one execution branch and
Git worktree for the selected work. Explicit `--trunk` uses Trunk Mode: still
one retained local execution branch and worktree, with claim and increment
publication as in [trunk publication](trunk-publication.md). Explicit caller selection uses the
current branch instead. Establish any queue claim first under
[Take queued work](../SKILL.md#take-queued-work), which commits it locally on
the integration branch, then, for Story Branch and Trunk Mode, publishes it per
[trunk publication](trunk-publication.md#publish-a-queue-claim). Only after
that publication is confirmed do Story Branch and Trunk modes create their
branch/worktree from the published revision before delegation; caller-selected
current-branch work continues from that same committed revision, which is
never published. When no claim applies, including authorized contextual
planless work, use verified current HEAD and create no story, plan, or queue
entry; still create the local execution workspace from that HEAD unless the caller selected the current
branch. Resolve names and safe location from project conventions and ordinary
host Git facilities. Missing conventions, unsafe location, or creation failure
stops setup; preserve and report the claim and created resources. Use no
parallel registry, configuration format, or worktree manager.

After successful setup and before delegation, retain one execution identity in
the existing plan when one exists, and in the conversation:

- originating checkout and resolved integration branch, where the claim was
  recorded if any;
- execution checkout and branch for implementation and delivery;
- integration checkout and branch for later integration or publication, and the
  authorized remote target, defaulting the branch to `main` only when neither
  caller nor project supplies one;
- selected mode;
- retained published revisions when Trunk Mode has published any — this
  execution's review attribution in the existing plan or conversation, not a
  second ledger — and the unpublished candidate SHA after a rewrite onto
  newer trunk. [Trunk publication](trunk-publication.md) updates those fields;
  do not invent another ledger.

Caller-selected current-branch work records that checkout/branch for both
locations and creates no worktree. It is incompatible with Trunk Mode;
contradictory selection stops before setup.

On resume, verify retained identity against actual branch, HEAD ancestry, mode,
retained published revisions, unpublished candidate SHA, and worktree state;
**Taken** alone supplies no location. Reuse a matching execution checkout.
Rewritten unpublished identities follow
[interrupted publication](trunk-publication.md#resume-an-interrupted-publication).
Missing, ambiguous, contradictory, unsafe, or partial identity/setup requires
an exact recovery decision: preserve resources rather than guessing, nesting
worktrees, or switching branches.

Run delegation, refactoring, generation, formatting, staging, commits, pushes,
and CI repair from the selected execution location. Story Branch Mode pushes
its execution branch to the authorized destination. Trunk Mode publishes each
verified increment through [trunk publication](trunk-publication.md) and
does not push the execution branch. That rule uses
[publish the candidate](publish-the-candidate.md) from the owned workspace.
[Maintain the default checkout](maintain-default-checkout.md) applies when
that checkout is mutated. Pass identity/location explicitly to agents and
host adapters.

Resolve checkout-bound installed runtime from the selected execution checkout
and use it as working directory. Before arming, apply
[runtime setup](runtime-setup.md) identity and stop rules; the initially loaded
skill's copy is not a fallback. CI source is the authorized target branch;
edits and repair stay in this checkout.
