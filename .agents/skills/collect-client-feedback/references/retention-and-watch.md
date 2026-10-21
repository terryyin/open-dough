# Retention and watch

Load when assessing a response or shortening a source. This is the shared-feedback
cycle's cleanup policy; it does not authorize cancelling live product work.

Retain consequential one-offs, uncertain relationships, unknown execution releases,
and unresolved reports. Remove only exact duplicate narrative after preserving
all distinct evidence at its authoritative owner. A confirmed low-value candidate
has negligible observed harm and no worthwhile response: successful practices
misfiled as problems or obsolete administrative noise can qualify. Frequency alone
never justifies removal. Keep a concise pruning reason in the maintenance commit
or report, recoverable in Git; add no permanent noise archive and claim no fix.

Before removing any active/watch/source entry, resolve its identity and former
aliases across the maintained set. Preserve local-only facets, unrelated same-number
codes and live queued/Taken links. Cleanup authority does not cancel work; retain
an entry with unfinished links unless the developer separately authorizes that
product decision or its recorded completion can be established.

For a claimed fix verify the actual mechanism, implementation change, first
containing tagged release, and relevant adoption/execution release or modified
guidance. A changelog claim alone proves none of those. Keep unreleased responses,
unknown versions and unverified corrections active with their missing evidence.
A prior report on older guidance does not establish post-fix recurrence.

A released response may move into the watch list with its identity, source
mappings and retained evidence when relevant use of the response is verified.
Record the earliest verified relevant-use date as **Watch start**, release and
adoption/execution locator, **Review after** seven calendar days later, and
**Last assessed** with actual source coverage and limits. Do not backdate from
file age or release date. Unknown start stays unknown; elapsed time without
relevant use is unexercised. Preserve supplied timestamp/timezone precision.

When the review finishes, update the watch list's opening review line
(`Reviewed <date> (<timezone>): coverage and limits`) and, directly below the
list's heading, write or replace its one due block:

````markdown
```json dough-feedback-review
{"schemaVersion":1,"reviewed":"2026-10-21","reviewAfter":"2026-10-28"}
```
````

`reviewed` is the review's local date. `reviewAfter` is seven calendar days
later, or the earliest pending **Review after** date when that is sooner; a
pending date is one later than `reviewed`, since dates on or before it were due
in this review. The dashboard reads this block to start the next due review, so
keep exactly one, with both dates as `YYYY-MM-DD` and `reviewAfter` not before
`reviewed`. A partial review still records its date; an interrupted one that
leaves the watch list unwritten leaves the block unchanged.

Retire only after seven calendar days, verified relevant use of corrected guidance,
review of the whole selected maintained source set, and no supported recurrence
or unresolved consequential contrary report. Missing sources cannot satisfy that
coverage. Retirement removes the eligible identity's active/watch/source entries
and obsolete finding-only references, while preserving unrelated evidence, product
knowledge and Git recovery. This retention decision never proves impossibility
of recurrence. Retain uncertain candidates rather than treating a partial initial
review as a successful watch.

Keep retirement and pruning reasons in the recoverable maintenance commit or
report. Leave no retired finding stubs, summaries or obsolete finding-only
references in the maintained catalog, watch list or source logs.

A supported same-mechanism failure resurfaces actionable evidence and the failed
response. Follow reconciliation's continuity/correction rules, preserving unknowns;
a genuine correction followed by reintroduction can need a new linked identity.
A later corrective release begins its own watch upon verified use, inheriting no
age from a failed response. Repeated reports of the same execution add no failure.
