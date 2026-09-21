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
branch — including a local fast-forward of that checkout during a
publication that still uses it — acquire exclusive local access through
available coordinator context and inspect the checkout. A clean directory
or Git lock file does not establish exclusivity; coordinate with a
declared owner or stop. Do not invent a merge queue, lock, or extra claim.

These checks gate shared default-checkout mutation. They do not gate
commits, proof, or formatting on a separate owned execution or preparation
workspace.

## Preserve pending local work

Unknown ownership, dirty or ambiguous checkout state, or unrelated
unpublished local commits stop local mutation of that checkout. Preserve
exact refs, worktrees, index, and staged/unstaged content; do not stash,
reset, unstage, revert, or silently include unrelated work in a refresh or
in a publication that mutates this checkout.

Report the competing writer or inspectable state. When the caller was
attempting publication through this checkout, leave the owned unpublished
suffix recoverable on its recorded branch or checkout and do not treat
publication as delivered.

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

Until a caller procedure requires opportunistic refresh, keep the current
external contract: apply [Establish access before local
mutation](#establish-access-before-local-mutation) and [Preserve pending
local work](#preserve-pending-local-work) whenever publication or another
local edit mutates this checkout. Do not treat a deferred refresh as
permission to skip those checks while the shared publisher still mutates
the checkout.
