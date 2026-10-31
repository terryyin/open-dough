# Existing changes in default main

Before a Default main start, the boundary reads the default checkout's
`git status` (staged, changed, deleted and untracked paths; never content).
The project row's Start session in Default main is such a start: its request
carries the unattached policy of the shared definition (workspace and landing,
no tracking), and one naming no policy runs in Default main and waits for
review. An Isolated workspace session is not asked, and leaves the default
checkout's changes as they are.
Unless the request names the fingerprint of what it now observes, nothing starts
and the dialog shows, in place of its choices, “Existing changes in default
main”, the changed paths and count, “Continuing includes these changes in this
session's result. When committed, all checkout changes are committed
together.”, and “Wait for review remains selected” or “Automatically land
remains selected; verified changes may land without another review.” The
heading takes the keyboard. Back (or Escape) returns to the choices and text as
they were, at Start; Continue with existing changes sends the same request with
the fingerprint and never changes the landing. The fingerprint hashes HEAD, the
status and each path's size and modification times, so content changed after
the warning asks again. It is a local comparison, not a kept confirmation, and
the record keeps no fingerprint. A clean checkout starts without a warning.

Owned by [Launch start](LAUNCH-START.md); story and Start session Default main
flows share this confirmation.
