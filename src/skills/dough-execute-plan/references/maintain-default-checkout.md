# Maintain the default checkout

Owns default-checkout access, local preservation, and the independent
maintenance outcome for that checkout. Remote candidate acceptance is a
separate fact owned by [publish the candidate](publish-the-candidate.md).
Callers supply which checkout is the default or integration checkout and
when they need access, preservation, or a refresh attempt. This reference
does not publish, invent a merge queue or lock service, or replace a
caller's disposition, cleanup, or CI policy.

## Independent maintenance outcome

Successful remote publication and default-checkout maintenance are
independently reportable. A deferred or unfinished refresh does not erase
an accepted remote publication. A publication that never reached remote
acceptance leaves any outstanding maintenance obligation unchanged and
does not authorize treating the remote as updated.

When reporting, name the maintenance result separately from publication
acceptance: advanced, already current, deferred with the exact preserved
state, or stopped for unclear ownership.

## Establish access before local mutation

Before mutating the default checkout's working tree, index, or checked-out
branch — including a later refresh that advances that branch — acquire
exclusive local access through available coordinator context and inspect the
checkout. A clean directory or Git lock file does not establish exclusivity;
coordinate with a declared owner or stop. Do not invent a merge queue, lock,
or extra claim.

These checks gate shared default-checkout mutation. They do not gate
commits, proof, formatting, or a remote push from a separate owned
execution or preparation workspace. Publishing that workspace does not
acquire this checkout's access.

## Preserve pending local work

Unknown ownership, dirty or ambiguous checkout state, or unrelated
unpublished local commits stop local mutation of that checkout. Preserve
exact refs, worktrees, index, and staged/unstaged content; do not stash,
reset, unstage, revert, or silently include unrelated work in a refresh or
in a publication that mutates this checkout.

Report the competing writer or inspectable state. When the unpublished
suffix lives on this checkout, leave it recoverable and do not treat a
remote that lacks it as published. When the suffix lives in a separate
owned workspace, this preservation does not block that workspace's push.

Apply the same preservation after a rejected push that left an owned
suffix unpublished on this checkout: do not undo that locally integrated
suffix to clear the tree.

## Refresh ownership

This reference owns whether and how the default checkout may be advanced
toward fetched trunk. Callers invoke a refresh only when their own
procedure requests one (for example after an accepted trunk publication, or
before using this checkout's commit as a new task base). A new owned
workspace may start from fetched remote trunk without advancing the
default checkout.

Owned-workspace publication records this outcome by inspection and does not
refresh the checkout. Report **already current** when the checkout is clean
and its `HEAD` is the accepted remote revision. Report **deferred** when it
holds a pending human edit, staged or unstaged, or is otherwise not at that
revision; name the preserved `HEAD`, index, and working tree. Do not
fast-forward it while recording that result. A later procedure that requests
a refresh still applies [Establish access before local
mutation](#establish-access-before-local-mutation) and [Preserve pending
local work](#preserve-pending-local-work) before any local edit. Eligibility
for that refresh is not decided by the publication that just succeeded.
