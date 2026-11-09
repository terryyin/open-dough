# Slice 3: recover and remember

Implementation base: `87433ea6f7f5f43e6486f4a5b6a525702165b092`.
Published: `7d42e9768243fde3c0a2583fb5a8c37eb7e26f57`; its accepted execution
branch receipt and reused observer registration are retained in
`/tmp/seed286-execution-20261109/slice3-delivery-repaired.log`.

## Boundary and assertion ownership

Repeated `performIntentCiComparisonRead` calls exercise the real final-answer
memory, with a per-test clear before/finally and counted external endpoint,
context, revision, run, proof and job operations. Seven cases prove whole/slot
recovery, no further acquisition for final answers, final timing reasons/gaps,
and fresh Taken, running and awaiting-later answers. No clock or TTL is needed.

`ciProofArtifactReader` and `ciAdapterProofReader` provide isolated reader
instances while production retains its default process singletons. Eighteen
cases replace only external listing/archive or command acquisition. Real
artifact choice, ZIP extraction, schema conversion, identity validation,
configuration and memory remain exercised. Valid proof is reused; unavailable,
invalid and mismatched evidence is retried with explicit acquisition counts.

The frontend harness mounts the real reading/place/scope/preference/evidence
providers and `IntentCiStatus`, using canonical MakeMe facts outside its bundle.
Seven cases exercise HTTP/whole-answer/proof recovery, repeated failures,
disabled Check again, proof rereads, Taken head changes and old-selection
cancellation. Each page, provider and static server is fresh. Only the immutable
production-component bundle is shared through the existing run-artifact owner;
its preparation and removal are owned by the runner. Cleanup releases all held
reads even after a body failure. Cancellation assertions observe exact browser
request failure events before checking current content.

The original retry/locations/Summary-file definitions were inventoried before
retirement: 44 retry assertion calls, 20 locations calls and 19 shared call
sites across the two Summary-file variants. Four duplicate retry journeys were
removed only after replacement proof. Both surviving real retry journeys keep
all 23 original assertion statements byte-identical. The detailed old assertion
to surviving observation map is retained in
`/tmp/seed286-execution-20261109/slice3-proof-map.md`, beside the AST inventory
and `slice3-retained-retry-assertions.json`.

Before measuring, the retained integrations were declared as:

- Real Git/GitHub acquisition → authenticated Check again → recovered Baseline,
  then final API reads without upstream requests; reselect remains exercised.
- Actual shallow claim history → unshallow → Check again recovery, preserving
  the explanation and absence of invented builds.
- Both whole-app locations held/failure journeys, including one header,
  historical completion revision, tab navigation, retry and no extra CI reads.
- Both existing Summary-file variants, including selecting Changed tests while
  comparison is held. Their remaining presentation migration belongs to slice 4.

## Accepted proof

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice3-family.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/slice3-family-artifacts.jsonl npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/intent/ci-proof-memory tests/intent/intent-ci-comparison-mounted tests/intent/intent-ci-comparison-retry.spec.ts tests/intent/intent-ci-comparison-locations.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts
```

Strict 72/72, ordinary two workers, default tracing/timeouts: runner 26,981 ms,
shell 27.41 s. Awake AC launch under `caffeinate -s -i`, load 2.57/3.00/4.32,
free memory 58%; after load 3.23/free 58%. One external typecheck was running
at launch; no other test process was observed then.

| Boundary | Cases | Per-test milliseconds |
| --- | ---: | ---: |
| Existing comparison rules | 33 | 0–5 |
| Repeated comparison memory | 7 | 1 |
| Artifact/adapter memory | 18 | 0–1 |
| Mounted lifecycle | 7 | 176–494 |
| Real raw-history acquisition | 1 | 932 |
| Retained UI connections | 6 | 4,329–8,269 |

Shared preparation was measured separately, each built once: component 609 ms,
app 685 ms, server 72 ms, story columns 634 ms, queued origin 1,119 ms. This
is the affected selection, not the final original-family aggregate comparison.

After the two stale cases gained explicit browser cancellation witnesses:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice3-mounted-final.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/slice3-mounted-final-artifact.jsonl npm run test:dashboard -- tests/intent/intent-ci-comparison-mounted
```

Strict 7/7 at 148–523 ms; runner 2,335 ms, wall 2.65 s; one shared component
build 461 ms. Earlier mounted stability passed 21/21 at 156–451 ms. Revised
stale cases passed 6/6 at 253–311 ms with actual cancellation witnesses in
`slice3-mounted-cancellation-stability.json`. No retries were used. The full
provider pilot itself passed at 444 ms under load 6.16 with external two- and
one-worker selections; its one shared build was 701 ms. Initial serialization
setup failure was repaired before that valid pilot.

Removing the GitHub valid-summary cache write produced the intended four versus
two acquisition assertion failure. Source was restored byte-exact, followed by
strict 25/25 at 0–4 ms in `slice3-memory-restored.json`; the applied control
and checksum are in `slice3-artifact-cache-fault-applied-control.log`.

Maintained default-reader proof and test inventory passed:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-ci-adapter-proof.test.mjs tests/support/dashboard-ci-proof-breakdown-read.test.mjs tests/support/dashboard-ci-proof-units-read.test.mjs
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-test-files.test.mjs
npm run typecheck:dashboard
git diff --check
```

The public adapter singleton reads real configuration and executes the actual
command adapter before validation. The retained GitHub retry exercises its
default acquisition singleton. Logs are `slice3-artifact-node-coherent.log`,
`slice3-shard-inventory.log` and `slice3-mounted-current-typecheck.log` beside
the proof records. Every new spec belongs to exactly one of twelve CI shards.

The 39-reader, 24-mounted, comparison-memory and retry-helper consumer traces
have no blank dispositions; their `slice3-*-consumer-trace*.md` records are in
the same outside-Git evidence directory. Independent refactoring reused the
shared `writeRevisionFiles` owner for adapter configuration materialization in
`backend-tests/support/ciProofMemory.ts`; its 35-consumer trace has no gaps.
Only the eight affected adapter cases were invalidated and rerun:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice3-refactor-adapter-memory.json npm run test:dashboard -- backend-tests/intent/ci-proof-memory-adapter.spec.ts backend-tests/intent/ci-proof-memory-adapter-gaps.spec.ts
```

Strict 8/8 at 1–4 ms, runner 873 ms, wall 1.23 s. Awake AC load
4.25/2.96/3.50, memory 58% free; no local test process, one external typecheck.
Typecheck and whitespace checks passed; all 38 changed files preview at most
250 formatted lines. Unchanged accepted proof remains valid. Source freshness
at main `0c32a933570e3a7f2362b526618e64e59139ae22` reports the selected story
and plan unchanged. The later repaired fresh preparation passed formatting and
the commit hook before the publication named above.

The first fresh preparation stopped before commit/publication because lint
forbids a conditional throw inside `finally`. The cleanup failure is now
retained and thrown after `finally`; held-read release order and original-body
failure preservation are unchanged. The independent refactorer accepted this
scoped repair against its existing 24-consumer trace. All seven mounted cases
then passed strictly at 169–430 ms, runner 2,395 ms, in
`slice3-cleanup-lint-repair.json`; the command was the mounted-only selection
above with that proof-record path. Awake AC load was 2.41/2.80/3.29, with no
competing test process. Other accepted proof remains valid.

G1 and final whole-family improvement,
loaded/CI portability and Refresh migration remain owned by slices 4 and 5.
