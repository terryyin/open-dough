---
id: SEED-267
status: active
planted: 2026-11-08
scope: story
---

# CI proof report size limits

<a id="preserve-large-ci-proof-reports"></a>

### Preserve large CI proof reports and surface size failures

**Identity:** SEED-267#preserve-large-ci-proof-reports

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/517-preserve-large-ci-proof-reports/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d0c8c7c99967004ce31284a6bcbfb45073b8666f6c74b3867c99890e6fffdf73","plan":"e41dad1f276c9ef597d5ebad26ff2779df6bf21104ed7b42301d36a75c24f993"}}
```

**Goal.** Developers reviewing CI proof in Intent can see complete reports
with file-level timings and immediately recognize when a size limit prevents
the proof from being read.

**Context.** The shared CI adapter runner caps every answer at 64 KiB of
stdout. Pygardon published proof reports of about 157 KiB with timings for
1,213 pytest files. Its adapter stripped the pytest breakdown to fit the cap
and returned the remaining report as a success, which the current guidance
invites: it says to add `--by-file` only while the summary stays well under
64 KiB. GitHub Actions proof already has a 1 MiB summary read limit
(`SUMMARY_READ_LIMIT_BYTES` in the collector contract), but an oversized
artifact shows as an unopenable or invalid summary without its size.

**Scope.**

- *One proof limit.* An adapter's `proof` answer is read up to the collector
  contract's existing 1 MiB summary read limit, the same limit GitHub Actions
  summaries already have, about six times Pygardon's report. Discover,
  diagnose and every other adapter answer keep 64 KiB, in the dashboard and
  the execution observer alike.
- *Size failure in Intent.* When a proof is over that limit, from either
  source, Intent shows it under the affected attempt's or run's Proof as an
  error, styled as an evidence problem rather than the quiet line of
  "published no CI proof summary". The line says the proof is too large,
  names the limit, and names the actual size when the reader knows it. The
  same wording reaches every place that shows why a build's proof cannot be
  used, such as the Story Branch comparison. Check again reads it anew.
- *Complete or nothing.* The adapter read stops as soon as the answer passes
  the limit. A failed or partial read is never displayed or remembered as
  proof; the existing rule that only a valid, matching summary is remembered
  stays.
- *Adapter guidance.* The guidance for writing an adapter's `proof` and
  publishing the summary says a successful answer carries the complete
  summary as the collector wrote it. When it is too large, the adapter still
  answers it whole, so Intent reports the size failure; it never trims
  entries or breakdowns and never substitutes `unavailable` for size. Add
  `--by-file` freely, within the 1 MiB proof limit. The "mind 64 KiB" advice
  is removed, and the per-call 64 KiB statement names the proof exception.
- *Scope limits.* No change to the proof summary schema, its collector, or
  how proof sources are chosen. Other unavailable reasons keep their current
  presentation. Pygardon's own adapter change to stop stripping belongs to
  that project, after it updates its Open Dough guidance.
- *Architecture.* The 1 MiB summary read limit has one owner, the collector
  contract, and both proof readers use it. The adapter runner takes its
  answer limit per operation instead of one fixed limit. A size failure is
  one proof-unavailability fact shared by both sources (limit, and size when
  known), so its presentation is written once. It keeps missing,
  unreadable and too-large evidence distinct from "no proof published"
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)).
  Remembered proof stays bounded at 256 entries per source, so the
  worst-case memory matches what GitHub Actions summaries already allow.
  Adapter guidance stays written for the agent working in that project
  ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).

**Key examples.**

1. An adapter answers a valid, matching 157 KiB summary carrying file
   breakdowns for 1,213 files → Intent shows its entries, totals and a
   selected entry's file figures, and Check again uses the remembered
   summary.
2. An adapter answers a summary that passes 1 MiB → the read stops at the
   limit; under Proof an error line says this attempt's CI proof is larger
   than the 1 MiB proof limit, distinct from "gave no CI proof summary"; no
   counts are shown and the verdict is unchanged.
3. A GitHub Actions run's summary file is 1.3 MiB → under Proof an error line
   says the run's CI proof summary is 1.3 MiB, larger than the 1 MiB proof
   limit.
4. An adapter's `discover` answer passes 64 KiB → it is rejected as today.
5. An adapter answers `{"unavailable": "no summary retained"}` → the quiet
   "gave no CI proof summary" line, unchanged.

**Alternatives considered.** Answering a file path instead of inline JSON
would lift the stdout limit but changes the adapter protocol and still needs
a size limit. Compressing the answer adds encoding work to every adapter for
a gain the 1 MiB limit already gives. An unbounded read was ruled out: the
dashboard must stay finite. Borrowed from HTTP's 413 Payload Too Large: the
receiver enforces its declared limit and the sender sends the whole payload
rather than truncating it, so the adapter needs no knowledge of the limit to
stay honest. The analogy breaks at Content-Length: stdout declares no size up
front, so an adapter answer's actual size is unknown when the read stops,
and only GitHub Actions summaries name it. Detecting a trimmed summary was
also considered: a stripped breakdown looks like a summary collected without
`--by-file`, so honesty rests on the guidance and on removing the reason to
trim.
