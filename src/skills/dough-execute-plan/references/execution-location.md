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

After the selected checkout exists, prepare it as part of the same setup
lifecycle as worktree creation so this project's ordinary commands are usable
there before implementation delegation. The same readiness rule applies when
caller-selected current-branch work newly supplies an unprepared checkout.
Resolve the required setup from this project's checked-in conventions and
locked dependency metadata, not from an Open Dough configuration key. When
those sources establish a deterministic locked install, perform it in the
selected checkout without rewriting lockfiles. A committed lockfile with
contributor or CI convention for `npm ci` is one such case; do not require
npm, or treat a lockfile's presence as an Open Dough recognizer, for a
project that uses different tooling. Then run an applicable project command
from that checkout. Do not infer availability from the presence or absence
of `node_modules` or a similar local directory. Do not copy or symlink
mutable installation from another checkout, and do not treat parent-directory
resolution as the contract. Keep mutable installed dependencies, generated
output, and project-local caches in the selected checkout. Supported
package-manager download or artifact caches may remain machine-level.

Creation, this preparation, and the command check are one setup lifecycle.
Execution may cross the implementation boundary only when the command
succeeds from the selected checkout. A missing, ambiguous, or failed
required preparation stops before implementation delegation, formatting,
proof commands, or CI-readiness claims. Preserve the checkout and report
its path, the command selected or the missing convention, and the failure
needed for recovery. Host facilities may establish or invoke the same
project-owned outcome; they do not define a separate preparation policy.

[Runtime setup](runtime-setup.md) remains the owner of checkout-bound CI
observer runtime only. Do not arm observation as part of this gate, and do
not make CI setup the owner of development dependencies.

After that setup succeeds and before delegation, retain one execution identity in
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
does not push the execution branch. That rule's exclusive-turn and target
cleanliness checks apply only to shared-target mutation — any operation that
advances the authorized target branch's ref, including a same-command SHA
push issued from the execution worktree — and not to execution-checkout
commits, proof, or formatting, which stay ungated. Which checkout's shell
issues that push does not change the mutation target: the target branch's
ref and the integration checkout that tracks it are still gated, so the
inspection and fast-forward named in
[publish the candidate](trunk-publication.md#publish-the-candidate) still
apply and are not satisfied by a push alone. Pass identity/location
explicitly to agents and host adapters.

Resolve checkout-bound installed runtime from the selected execution checkout
and use it as working directory. Arm only after the project-command readiness
gate above has passed. Before arming, apply
[runtime setup](runtime-setup.md) identity and stop rules; the initially loaded
skill's copy is not a fallback. CI source is the authorized target branch;
edits and repair stay in this checkout.
