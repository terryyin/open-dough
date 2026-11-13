# Bounded history-read prototype for joint proof

SEED-324#close-landed-ci-repeat-check-gaps, darren-chan, owns this existing
uncommitted candidate. Terry explicitly approved bounded immutable completion/
claim-history read optimization on 2026-11-13; the
[canonical source](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)
and plan retain that approval. It preserves functional facts, mutable reads, errors,
abort behavior and all acceptance bounds. No transport redesign is authorized.
The project's [failure policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this composition and its proof.

The supplier full run begun 06:09 reports adapter polls seeing zero rebuild
requests or accepted-with-no-later-attempt explanations, plus scope evidence
failures. That is a reason to assess this existing cost candidate, not a
diagnosis that it causes or fixes those failures. The exact adapter fixture
repair is already composed and independently refactored by SEED-332.

## Offered candidate and ownership

The SEED-324 owner offers the exact six-path product-history prototype for
joint composition and bounded proof, under the approval above. Preserve its
provenance and darren-chan credit. This reuses the existing repair, rather than
creating a competing implementation or modifying this execution's checkout.

Patch: `/tmp/seed324-history-read-prototype.patch`, SHA-256
`1ecedb47776b9e87c3844e9ad4b50245d2f4fdd43533019b1489af2365bcae02`.
Its tracked comparison base is `7348487b92dd963babcf946e3dc163ae0f3e2d0a`.
Hash and read-only `git apply --check` against the supplier's current checkout
were verified again at this offer. No patch was applied there and no recipient
acknowledgment exists yet. Keep the running full command under its owner; any
composition begins only after that command is quiescent, without edits during
proof or source-checkout/index changes.

Three product paths: `dashboard/server/publishedStoryHistory.ts`,
`storyCompletionEndpoints.ts`, `storyCompletedCommits.ts`. Three proof paths:
`dashboard/backend-tests/intent/published-story-history.spec.ts`,
`published-story-history-semantics.spec.ts`, and shared
`dashboard/backend-tests/support/publishedStoryHistoryFixture.ts`.

One recovery shares one existing history reader. Successful full-object reads
reuse a Promise keyed by argv and stdin; mutable revision names and worktree
configuration remain live. Rejections/missing objects are evicted, aborted
calls bypass warm reuse, and initially shallow/unproven graphs keep walking
Git rather than caching incomplete lists. No cross-request/global cache,
endpoint answer, query selection, public domain/wire representation or source
of truth is added. ADR 0002 and current Accepted ADR 0008 remain compatible.

## Existing discriminating proof and limits

`/tmp/seed324-history-graph-follow-up.md` is the authoritative current report;
it supersedes earlier shallow/negative caching descriptions. Seven maintained
real-Git cases prove native query reuse and correct facts, stdin/key and reader
isolation, mutable refs/config, retryable missing/restored objects, warm/active
abort, negative ancestry after deepening, and all four successful graph walks
before/after real shallow deepening. The regressions failed on the preceding
prototype, then passed. Setup uses MakeMe facts and actual Git acquisition,
not supplied history answers. All formatted previews are at most 250 lines.

The current 12-case command passed (5.1s):

```sh
PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard -- backend-tests/intent/published-story-history.spec.ts backend-tests/intent/published-story-history-semantics.spec.ts backend-tests/intent/ci-comparison-published-endpoints.spec.ts backend-tests/intent/ci-comparison-history-integration.spec.ts --workers=2 --reporter=list
```

The final assertion-only graph probe-budget check passed again (one case,
5.6s total); production and all other assertions were unchanged. Dashboard
typecheck passed. Logs and exact setup/observations are in the report. The
681-row consumer trace is `/tmp/seed324-history-graph-consumer-trace.txt` with
dispositions `/tmp/seed324-history-graph-consumer-dispositions.md`; earlier
actual completed-Review/capture/raw-history consumer evidence remains retained.
No flaky retry, skip, sleep or timeout relaxation was used.

Native duplicate-query reductions are established, but the earlier measured
refresh runs still timed out at 30s under natural load 36.84–37.76, before the
supplier's transport/fixture changes. That result stays failed. The graph
correctness guard also postdates that timing, so those earlier counts are not
current runtime acceptance. This candidate has no current whole-family or
qualifying load credit and has not had its required independent refactor.

## Receiving proof

Inspect whether the failing paths actually reach repeated history recovery;
reuse only the supported cost explanation. On a quiescent combined candidate,
renew the seven history cases plus endpoint/real acquisition integration and
the affected complete adapter family. Preserve all ledger, first/restarted
card and explicit collection observations. Compare actual read cost when
judging whether to retain this candidate; do not infer that a quieter pass
settles the full/load failure. Include the new product/proof paths in the
independent whole-product refactor before publication, with current consumer
trace and changed observation locations.

SEED-332 retains its transport/default, runtime-fixture, full/load/CI receiving
gates. SEED-324 retains G1–G6 and its required three complete current family
passes plus final load profile. Report the actual combined result or a
supported no-change conclusion to this same owner. Neither adoption nor this
offer marks either execution complete or authorizes another scope expansion.
