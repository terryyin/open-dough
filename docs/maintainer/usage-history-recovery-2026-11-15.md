# Native usage recovery on 2026-11-15

This is the recovery investigation and eventual machine-local receipt for
[SEED-358](../../.planning/seeds/SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history).
The [stored record and report definitions](../../dashboard/USAGE-HISTORY.md)
apply. Counts describe retained local evidence, not provider-wide accounting.
No prompts or transcript bodies are reproduced here.

Recovery is unfinished: no real usage snapshot has been published. The active
plan now owns bounded persistence in slice 6 and the successful repeated machine
recovery/report in slice 7; the observations below are diagnostic evidence, not
a completed import.

## Reproduction and runtime

The cutoff is `2026-09-16T00:00:00+08:00`, midnight Asia/Singapore,
which is `2026-09-15T16:00:00Z`. Native roots are `~/.codex/sessions`,
`~/.codex/archived_sessions`, and `~/.claude/projects`. The production roster
contains Open Dough (`terryyin/open-dough`), Doughnut
(`nerds-odd-e/doughnut`), Pygardon (`terryyin/pygardon`), Terry Talks
(`terryyin/terry-talks`), Lizard (`terryyin/lizard`), and hidden Clipboard
(`terryyin/clipboard`). All six are included.

From the story checkout, with Node 24.21.0:

```sh
caffeinate -s -i node dashboard/server/importUsageHistory.ts import \
  --since '2026-09-16T00:00:00+08:00'
node dashboard/server/importUsageHistory.ts read
```

The existing machine store is `~/.open-dough/dashboard/launch-history/usage.json`.
The importer uses its existing document lock and durable atomic replacement,
while the dashboard remains running. Native evidence is read only. No native
session, provider request, scheduler, or workflow write is involved.

Before the corpus run, the actual CLI fixtures passed under the default quiet
reporter, including older-root/in-window-worker accounting, tilde checkout
resolution, unknown/unassigned/excluded populations, undated tasks, replay, and
fresh-process persisted reads. Dashboard typecheck, the project configuration
boundary, and credential-free native evidence identity checks also passed.

The Mac was on AC power at 100% charge, with 65% memory free and 151 GiB disk
available. One serial streaming importer ran under `caffeinate -s -i`; no other
owned proof was active at launch. An unrelated CPU-bound Claude test and the
running dashboard were left untouched. A preliminary scan was interrupted
before persistence to tighten window labeling; its terminal SIGINT receipt is
retained separately and is not counted as a successful recovery.

Exact reports, runtime records, source manifests, fresh stored reads and replay
reconciliation are retained below the machine store at
`import-reports/2026-11-15/`. These contain normalized metadata and measurements,
never raw transcript content. The runtime records include the software HEAD,
exact command, source fingerprint, roster, roots, and start/end boundaries.
The source fingerprint hashes the sorted path and SHA-256 manifest of all
`dashboard/server` and `dashboard/src` TypeScript, `package-lock.json`, and
`.node-version`, so it identifies the uncommitted candidate as well as HEAD.
The native evidence files are streamed during a live interval, rather than frozen as an
atomic snapshot; new native evidence may legitimately appear on the repeat.

## Scaling defect found during recovery

The first completed attempt failed before persistence after 16 minutes
8.681 seconds, ending in `SIGABRT` with JavaScript heap exhaustion. The default
Node heap limit was 4,496,293,888 bytes; observed RSS reached about 4.17 GiB,
while system memory remained available. No `usage.json` was created. Its
runtime, stderr, zero-byte report and source manifest remain as `failed-first-*`
and `failed-source-manifest.json`; this attempt is not a recovery result.

A bounded numeric read of one already-cited Claude transcript found 1,513 rows,
704 lineage nodes, and 249 assistant rows. Walking their parent chains visited
85,256 source references, with 668 on the longest response chain. These are
row/lineage counts, not unique billable requests. The probe found no branching
parents or repeated UUID sources in that sample. It retained only file metadata
and counts in `lineage-probe.json`.

The importer now traverses ancestry iteratively, detects cycles, and visits each
node once per resolution. Intermediate links cite their native files; exact
response, task-boundary and worker-join rows remain traceable. Associations
carry task-join evidence rather than every descriptive/activity source already
held on the task. This also prevents multiple requests with one timestamp from
multiplying the task's last-activity sources into every response. The original
same-time, 1,500-response actual-CLI regression failed under a 128 MiB heap and
passes after both corrections, with exact request/token totals, native root UUID,
response and boundary sources, and a fresh persisted read. The live retry uses
the normal Node heap limit; it was not increased to conceal the defect.

The corrected candidate then failed before persistence after 6 minutes 59.760
seconds with `Invalid string length`. A read-only census deliberately suppressed
all persistence. It found 2,475 tasks,513,618 observations (640,765 measurements),
513,618 associations and12,272 gaps. Compact values alone total about 1.4 GB:
11,320,655 task characters,978,160,558 observation characters,432,936,435
association characters and2,636,673 gap characters. The largest observation is
15,690 bytes; the limit is aggregate serialization rather than one giant fact.
V8's 536,870,888-character string limit makes compact whole-document JSON
insufficient. `census.json` and its exact runtime/source manifest retain these
counts locally. Bounded physical snapshots and streamed export preserve the
same logical facts; the next slices must prove them before claiming recovery.
