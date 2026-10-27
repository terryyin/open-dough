# Dashboard published Git data

Part of the [dashboard technology recommendation](dashboard-tech-stack.md).
Its proposed status, date, and first-story qualifications apply to this page.

## Obtaining published Git data with minimal runtime

Implement **one** host adapter for the actual origin once identified. Do not
build a provider plugin system. If it is GitHub, its REST APIs can list
[branches](https://docs.github.com/en/rest/branches/branches), read
[trees](https://docs.github.com/en/rest/git/trees), and inspect
[commits/history](https://docs.github.com/en/rest/commits/commits). This is a
concrete feasible route, not evidence that the observed project uses GitHub.

Resolve trunk and the relevant remote refs to commit IDs before reading their
files. Read each ref's records at that pinned revision. Discover supported story
homes as well as backlog links, including relevant branch-only records; do not
limit discovery to Taken entries. Reconcile by recorded identity with provenance.
Read Story Branch Mode progress from its recorded remote execution branch, and
Trunk Mode progress from trunk. Do not overlay every branch copy of the backlog
onto trunk or infer ownership from a branch naming convention. The exact
cross-ref authority rules remain a domain decision.

Multiple refs are not an atomic global snapshot. Report the resolved revision
set and observation time. If a ref disappears or required content becomes
unavailable during a read, report that scope as incomplete rather than silently
substituting the latest trunk content. Branch removal, file deletion, and
unreachability do not independently prove story completion. History can recover
published evidence after cleanup only while the relevant commits remain
available from origin; Git hosting is not a guarantee of permanent access to
deleted, unreachable branch history.

Follow pagination and detect truncated tree responses. Traverse the relevant
subtrees when necessary. Bound requests, file sizes, history exploration, and
timeouts; expose an incomplete view if limits prevent a complete read. Read
history where a requested fact needs it, not every commit on every refresh.
Check the published revision on a paced schedule while the page is visible, use
conditional requests when supported, and show explicit rate-limit/error states
rather than polling tightly. GitHub documents
[conditional requests and rate-limit handling](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

The Node adapter should expose a small read endpoint for this fixed project and
serve the built UI, using transient memory only. No arbitrary repository URL,
general proxy endpoint, clone scanning, or Git subprocess is needed for the
host-API route. If the actual origin lacks suitable APIs, reassess a disposable
bare fetch of that origin as the specific fallback. That would be a rebuildable
Git cache, never a developer checkout or separate project-state authority, and
is not part of the recommended initial host-API runtime.

For public GitHub data, direct browser access is technically possible through
its documented [CORS support](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests).
Public access can be unauthenticated, but request volume and host limits still
matter. Choose that smaller deployment only after verifying access and the
actual record volume; it should not require a token pasted into the UI.

For private access, keep a narrowly scoped read credential in the reader's
runtime environment. Never include it in browser JavaScript, responses, logs,
or browser storage. Vite explicitly exposes `VITE_` variables to client code;
they cannot hold secrets. [Vite environment documentation](https://vite.dev/guide/env-and-mode)
For a single-user local launch, bind the reader to loopback and read origin over
the network. For hosted private use, place it behind an existing access boundary
that protects both UI and data endpoint; otherwise a server-held token merely
turns private Git data into a public API. Hosting/access must be resolved before
that deployment, without building an account or authentication platform here.

Start with no persistent cache. Optional browser preferences may store filters
or display choices. An optional snapshot cache must be disposable, validated,
versioned, tied to repository/revision, and visibly stale until refreshed. It
must not become the only home of assignment or progress. Avoid persisting
private source content by default. Clearing browser storage or restarting the
reader must lose no authoritative project state.
