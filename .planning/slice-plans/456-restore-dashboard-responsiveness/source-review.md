# Source review: SEED-225#restore-dashboard-responsiveness

Launch: 2026-11-03, fresh general-purpose agent without conversation inheritance,
spawned by the execution coordinator before accepting slice 1.
Input: only the story section's Goal, Scope (required behavior, preserved
behavior, restrictions, deferred promises, scope limits, boundary
assumptions), Baselines and targets, and Key examples, extracted verbatim from
`.planning/seeds/SEED-225-restore-dashboard-responsiveness.md`; no plan,
return, product or proof. Instruction: read no other file, change nothing,
return numbered commitments with sub-ids for listed compound items.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The user is "a developer working in the production dashboard, on this Mac or through the Tailscale proxy from another device" | slice 6 |  |
| 2 | The developer "keeps the Board, Intent, and the Sessions sidebar usable while the dashboard's own refreshes run" | slice 6 |  |
| 3 | "when a published read or the local service fails, keeps the last successful snapshot labelled with its revision and retrieval time" | slice 3 |  |
| 4 | The developer "recovers eligible reads without a reload" | slice 3 |  |
| 5 | The developer "can read evidence that locates the failure even after the production preview was replaced" | slice 2 |  |
| 6 | Business contribution: "a dashboard Terry can trust during the day instead of reloading it, and incidents that can be attributed and fixed instead of re-investigated from nothing" | slice 6 |  |
| 7 | **Incident evidence that outlives the process** | slice 2 |  |
| 7a | "Each failed upstream read the dashboard waited on" is recorded | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": three failed reads recorded and listed by the next server |
| 7b | "each stall the preview observes in itself above a stated threshold" is recorded | slice 2 |  |
| 7c | The record is "bounded" | slice 1 | observed: authenticated-read-incident-record-bounds.spec.ts "the incident record keeps its newest entries within its entry and byte bounds and counts what it dropped": entries and bytes pruned to bounds |
| 7d | The record is "sanitized" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": entries carry only sanitized fields; no marker, socket, token, root, raw text |
| 7e | The record is "owner-only" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": incidents/ 0700, entries.jsonl and record.json 0600 |
| 7f | The record is "machine-local" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": record under the test machine HOME's ~/.open-dough/dashboard/incidents |
| 7g | The record is one "that a preview replacement does not clear" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": server 2 on the same machine lists server 1's failures |
| 7h | A failed read's entry "names its category as a local failure, an upstream refusal, or unknown" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": failureCategory local, unknown, upstream |
| 7h.1 | Failed-read entry field: "the queue wait" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": queueWaitMs >= 0 on dispatched entries |
| 7h.2 | Failed-read entry field: "dispatch phase" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": dispatched false on local, true on unknown and upstream |
| 7h.3 | Failed-read entry field: "the owner identity it asked through" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": ownerPid and ownerGeneration equal owner.N.json |
| 7h.4 | Failed-read entry field: "the owner's reported version" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": ownerProtocol is the owner record's protocol |
| 7h.5 | Failed-read entry field: "the upstream status, rate-limit evidence, or their absence" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": status 403 on upstream, absent on local; rateLimit kept by the existing diagnostics spec "names a shared timeout, an unmarked 403, and a marked rate limit" |
| 7i.1 | Stall entry field: "the measured event-loop delay" | slice 2 |  |
| 7i.2 | Stall entry field: "the load average" | slice 2 |  |
| 7i.3 | Stall entry field: "the dashboard revision" | slice 2 |  |
| 7i.4 | Stall entry field: "the age of the process" | slice 2 |  |
| 7j | "Every entry carries wall-clock time so it aligns with the proxy error log" | slice 2 |  |
| 8 | **Evidence readable in place** | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": record.failures across processes |
| 8a | "The existing diagnostics read lists the retained record across processes" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": GET /__authenticated-read-diagnostics on server 2 lists server 1's entries |
| 8b | Listing is "newest first" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": at values sorted newest first |
| 8c | The read "says when the record began" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": record.startedAt no later than the earliest at |
| 8d | The read says "how many entries it dropped at its bound" | slice 1 | observed: authenticated-read-incident-record-bounds.spec.ts "the incident record keeps its newest entries within its entry and byte bounds and counts what it dropped": dropped equals pruned count across a restart |
| 9 | **Sessions stay cheap to refresh** | slice 5 |  |
| 9a | "A poll naming the revision the page holds is answered without re-serializing the retained history" | slice 5 |  |
| 9b | "the server re-observes only sources whose identity changed since the last observation" | slice 5 |  |
| 9c | "The regular answer carries the live overview the Board, the Sessions sidebar, and the open Session entries show" | slice 6 |  |
| 9d | "the historical remainder is read when a developer opens or acts on a retained session or expands the Recently done sessions section" | slice 6 |  |
| 9e | "A poll's work stays off the request path of other viewers" | slice 5 |  |
| 9f | Poll work stays "within the targets below" | slice 5 |  |
| 10 | **Repeatable baselines**: "A local replay with roughly 1,000 records and attempts" | slice 4 |  |
| 10a | The replay reports "startup" | slice 4 |  |
| 10b | The replay reports "an unchanged poll" | slice 4 |  |
| 10c | The replay reports "one active state change" | slice 4 |  |
| 10d | The replay reports "the latency of a concurrent trivial request" | slice 4 |  |
| 10e | Reported "before and after, so the targets below are measured, not asserted" | slice 6 |  |
| 11 | Preserved: "the last successful snapshot stays shown with its revision and retrieval time while a read fails" | slice 3 |  |
| 12 | Preserved: "the existing bounded visible-page recovery re-asks eligible reads without a reload once the owner is reachable again, including across an owner replacement" | slice 3 |  |
| 13 | Preserved on retained sessions (listed) | slice 6 |  |
| 13a | "historical reports" remain available | slice 6 |  |
| 13b | "reattachment" remains available | slice 6 |  |
| 13c | "Mark as done" remains available | slice 6 |  |
| 13d | "deletion" remains available | slice 6 |  |
| 13e | "fresh action-time checks on retained sessions" remain available | slice 6 |  |
| 14 | Preserved: "the eight-call cap ... unchanged" | slice 3 |  |
| 15 | Preserved: "the GitHub-directed cooldown are unchanged" | slice 3 |  |
| 16 | "The evidence record is readable only by this user" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": incidents/ 0700, files 0600 |
| 17 | The record "names no" (listed fields) | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": answer body and record files contain no secret |
| 17a | no "token" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no GH_TOKEN marker or owner token |
| 17b | no "credential" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no GH_TOKEN marker |
| 17c | no "socket path" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no socket path |
| 17d | no "repository path outside the configured project" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no owner root path |
| 17e | no "raw error text" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no forbidden, fatal:, dial text |
| 17f | Reason: "it sits beside credentials on a shared machine and the diagnostics contract already forbids those fields" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": restrictions observed as in 17a-17e |
| 18 | "The record is bounded in size and count" | slice 1 | observed: authenticated-read-incident-record-bounds.spec.ts "the incident record keeps its newest entries within its entry and byte bounds and counts what it dropped": entry bound 3 keeps 3 lines; byte bound keeps bytes within it |
| 19 | "its writing is asynchronous and sparse" | slice 2 |  |
| 19a | Reason: "it must not become the stall it measures or fill the disk" | slice 2 |  |
| 20 | "Recording and reading evidence make no GitHub request" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": server 2 made no gh call to read; recording reads no GitHub (incidentRecord.ts reads local files only) |
| 20a | Reason: "the allowance belongs to the launching person" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": no gh call while reading |
| 21 | Deferred (not rejected; "naturally supported behavior stays"): "Intent inventory shown independently of Proof, with proof read for the visible selection and fan-out bounded so Board and CI reads keep progressing, and a browser measurement of the 94-file journey" | slice 6 |  |
| 21a | That deferral is "Judged on this story's evidence of queue waits behind Intent reads" | slice 6 |  |
| 22 | Deferred: "Controlled request-owner handoff that preserves holds and in-flight ownership, mixed-version handoff tests, and serving the old preview until its replacement is ready" | slice 6 |  |
| 22a | That deferral is "Judged on this story's evidence of owner turnover and replacement gaps at incidents" | slice 6 |  |
| 23 | Deferred: "Proxy access logging, dial retry, and process supervision (alternative 3)" | slice 6 |  |
| 24 | Deferred: "Retained-answer cache scan changes, after event-loop delay is measured" | slice 6 |  |
| 25 | Scope limit: "no new metrics product or UI beyond the diagnostics read" | slice 6 |  |
| 26 | Scope limit: "no change to the Sessions sidebar's visible behavior beyond when history loads" | slice 6 |  |
| 27 | Scope limit: "no change to the request owner's protocol" | slice 3 |  |
| 28 | Boundary: "the SEED-118 cache-validation story stays separate and is not a prerequisite" | slice 6 |  |
| 29 | Boundary: "Published Git remains the authority for workflow facts and local evidence stays separate under ADR 0008" | slice 6 |  |
| 30 | "Plans, delegation briefs, and repair handoffs carry the project's Failing and flaky tests policy" | slice 1 | observed: PLAN.md Outside-in proof carries the policy link; slice 1 delegation brief carried it verbatim |
| 31 | Baseline context: "Production on 2026-11-03 with 1,023 records and 1,034 attempts; targets apply to the replay at that scale and to production" | slice 4 |  |
| 32 | Unchanged poll wall time: baseline "390–580 ms" → "at most 250 ms, bounded by one host listing (0.16–0.20 s for 1,176 Claude entries today)" | slice 5 |  |
| 33 | Unchanged poll event-loop time: baseline "about 130 ms" → "at most 20 ms" | slice 5 |  |
| 34 | Trivial request during a poll, p99: baseline "130 ms" → "at most 20 ms" | slice 5 |  |
| 35 | First full answer, cold: baseline "420 ms" → "at most 300 ms" | slice 6 |  |
| 36 | Regular answer size: baseline "9.67 MB" → "live overview only; history read on demand" | slice 6 |  |
| 37 | Failed reads retained across a preview replacement: baseline "none" → "all within the bound, newest first" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret" and authenticated-read-incident-record-bounds.spec.ts "the incident record keeps its newest entries within its entry and byte bounds and counts what it dropped": all retained failures within bounds, newest first |
| 38 | Stall entry for a self-observed stall: baseline "none" → "present with delay, load, revision, process age" | slice 2 |  |
| 39 | Example 1, Evidence survives replacement: preview retained three failed reads (one local, one upstream, one unknown) → watcher replaces the preview → "the diagnostics read on the new preview lists those three entries with their categories, queue waits, owner identities, and times, before any new failure" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": three categories listed on the new server before any new failure |
| 40 | Example 2, A stall is attributable: event loop "blocked for two seconds in a test" → "the next diagnostics read shows one stall entry with the measured delay, the load average, the dashboard revision, and the process age, with a time that can be aligned to a proxy error logged in the same second" | slice 2 |  |
| 41 | Example 3, A lost process reads as lost: "A preview is killed without ending its record" → next preview's diagnostics read "shows that record ending without a closing entry and labels it as process lost, not as a quiet period" | slice 2 |  |
| 42 | Example 4, Unchanged poll stays cheap: replay with ~1,000 records/attempts, no launch document or host listing changed → page polls with held revision → answer "unchanged" "within 250 ms of wall time and 20 ms of event-loop time", and "a trivial request sent during that poll is answered within 20 ms" | slice 5 |  |
| 43 | Example 5, Live overview, history on demand: 1,000 done records and five open sessions → page loads → regular answer "carries the five open sessions and the done sessions the Board's Recently done cards and the sidebar's collapsed section need" | slice 6 |  |
| 43a | Example 5 continued: "expanding Recently done sessions or opening a done session's report reads that history then, and the report shows as before" | slice 6 |  |
| 44 | Example 6, One state change, nothing else recomputed: replay changes one open session's native state → next poll "answers a new revision whose content differs from the previous answer only in that Session entry, within the unchanged-poll target plus that one session's observation" | slice 5 |  |
| 45 | Example 7, Recovery across owner replacement: page shows revision A with retrieval time; owner replaced while a read is queued before dispatch → "the read fails as local" | slice 3 |  |
| 45a | Example 7: "the snapshot stays shown labelled A with its time" | slice 3 |  |
| 45b | Example 7: "the failure is in the evidence record" | slice 3 |  |
| 45c | Example 7: "the page's existing recovery re-asks once the new owner answers, without a reload" | slice 3 |  |
| 45d | Example 7: "without ... a duplicate dispatch of an ambiguous post-dispatch loss" | slice 3 |  |
| 46 | Example 8, Evidence is safe: raw error "names the socket path and includes a token fragment" → "the recorded entry names the safe category and status only" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": upstream entry names failureCategory and status 403 only |
| 46a | Example 8: "the diagnostics read, and the file itself, contain neither" | slice 1 | observed: authenticated-read-incident-record.spec.ts "a replaced server lists the failures the earlier one retained, newest first, with their attribution and nothing secret": neither the answer nor any record file contains the socket path or marker |
