# Source review — SEED-230#guard-ci-proof-revision-and-trim-proof-specs

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); only the
correction Goal and Scope text from
`.planning/seeds/SEED-230-summarize-ci-proof-in-intent.md#guard-ci-proof-revision-and-trim-proof-specs`.
No plan, return, product, or proof supplied. Reviewer returned the numbered
commitments below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a maintainer changes Open Dough's CI or the CI status tab, the CI proof summary stays matched to the run Intent judges. | slice 1 | observed: dashboard/tests/intent-ci-proof.spec.ts and intent-ci-proof-reasons.spec.ts: summary still keyed to judged run/attempt/revision; Playwright set passed |
| 2 | There is a regression test for the pull-request revision. | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs: asserts workflow CI_PROOF_REVISION prefers github.event.pull_request.head.sha \|\| github.sha |
| 3 | Each Intent CI proof spec documents one behaviour. | slice 1 | observed: intent-ci-proof.spec.ts one browser refusal; reasons spec ciAdapter-only title; dashboard-ci-proof-parse.test.mjs owns query refusals |
| 4 | Each CI status judgment performs one read of the project's CI configuration. | slice 1 | observed: baseCiJudgment.ts sets ciAdapter from one configuration read; intentCiStatusRead.ts spreads judgment without readsCiThroughAdapter |
| 5 | This work is a retrospective correction of that story and adds no product promise. | slice 1 | observed: no new product surface; removed unreachable intentCiProofRead ci-adapter short-circuit; tab path unchanged |
| 6 | In scope: Open Dough's `ci.yml` revision expression and its declaration test. | slice 1 | observed: .github/workflows/ci.yml CI_PROOF_REVISION expression unchanged; declaration test guards it |
| 7 | In scope: the Intent CI proof specs and the `intent=ci-proof` query refusals. | slice 1 | observed: trimmed intent-ci-proof*.spec.ts; parseIntentCiProofRead refusals in dashboard-ci-proof-parse.test.mjs |
| 8 | In scope: how the CI status read learns that a project uses a `ciAdapter`. | slice 1 | observed: BaseCiJudgment.ciAdapter from judgeBranchCi; IntentCiStatusAnswer inherits via judgment spread |
| 9 | Visible tab behaviour stays as it is. | slice 1 | observed: intent-ci-proof-reasons.spec.ts ciAdapter reason without actions-* proof calls; status Playwright set passed |
| 10 | The summary contract stays as it is. | slice 1 | observed: reasons/proof specs still assert summary match, gap, unavailable reasons and same verdict |
