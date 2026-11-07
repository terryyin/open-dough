# Repository authoring and host observations

Moved from DearDough during local findings maintenance on 2026-11-01.
The complete original source is recoverable at
`ae6479d3558b2e660e99d5b4839f0b6b064e7df5:DearDough.md`.
Original execution provenance and uncertainty are preserved below.

The Markdown whitespace and optional-prop errors were caught by sound delivery
checks and repaired before publication. DD-374 concerns a coordinator brief
that weakened this repository’s failure policy despite the shared delegation
rule preserving it. DD-365 concerns the host’s approval classifier. These
observations establish no uncovered published-skill repair. No new local story
is selected; completed repairs, Taken work and direction remain intact.

<a id="dd-363"></a>

## DD-363 — Coordinator source-review hard-breaks fail fresh delivery

Coordinator-authored `source-review.md` used Markdown hard-break trailing spaces
that the fresh-delivery preparation refused; selective `npm run format` does not
cover Markdown, so the defect reached the first guarded delivery.

### Occurrences

- Execution: SEED-157#check-stalled-delegated-verification; plan and source-review recoverable at before-cleanup `e8e841c8e15d23db9f8d9e4d86923d134294992b` (`.planning/slice-plans/363-check-stalled-delegated-verification/`); first related implementation commit `cd30010f9044cf703596a58e98a494e610cc6f2d`
  - Timestamp: unknown (2026-10-28; first fresh-delivery attempt before accepted `cd30010` at 16:19:23+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `3bd97cc2-93e0-4e61-bca4-b477e0d7b5f4` — after writing/updating `source-review.md` and running `npm run format`, first `execution-increment-delivery.mjs fresh` failed; repair removed trailing hard-break spaces on the Launch/Input/Reviewer header lines; retry published `cd30010`. Distinct from ODF-329 (implementer ESLint under a lint-forbidden delegation brief).
  - Observed effect: one refused fresh-delivery attempt and a mechanical coordinator repair before the accepted publish.
  - Inference: qualified one-off. Coordinator Markdown artifacts need a pre-delivery whitespace check or must avoid hard-break trailing spaces; format alone does not cover them.

<a id="dd-365"></a>

## DD-365 — Commit-specific preparation approval repeats after safe reconciliation

Approval named one preparation commit, then a metadata-only rebase changed its
SHA while retaining the reviewed story, plan and backlog link. Automatic
approval review required another human approval before publication.

### Occurrences

- Execution: SEED-164#dashboard-ci-time; first implementation `7eda0986bafe78cbf6088df514bb6b088edf9333`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: execution conversation; approval of preparation `3c5f3ded`, reconciliation onto another chat's metadata as `aeff46decceb5fef150962b5ce72db259d866382`, then explicit approval of preparation-only changes and safe reconciliation. Seed/plan bytes and the sole backlog plan-link edit were checked unchanged before publication.
  - Observed effect: publication paused for a second human approval although the reviewed preparation change was unchanged.
  - Inference: qualified one-off; requesting approval for the concrete change scope plus safe reconciliation can avoid a SHA-only authorization becoming stale. This differs from ODF-262's permission-only UI probes.

<a id="dd-370"></a>

## DD-370 — New Markdown docs with trailing blank EOF fail staged whitespace

Post-change refactor extracted new maintainer timing Markdown files that ended
with an extra blank line. Selective format does not rewrite that Markdown
whitespace, so the first guarded fresh delivery failed at `git diff --check`
(`new blank line at EOF`) after the plan status mutation.

### Occurrences

- Execution: SEED-180#optimize-dashboard-touch-viewport-tests; plan 413; first related implementation `483f66b483a9046e0c790bc12bcc57489aa2a503`
  - Timestamp: 2026-10-30T14:11:00+08:00 (approx.; first slice-6 fresh delivery refused before accepted `2f800b3f`)
  - Tool: Cursor
  - Open Dough release: 0.3.76
  - Evidence: fresh `preparation-failed` / `operation: "staged whitespace"` naming `docs/maintainer/dashboard-installed-start-fixture-timings.md:83` and `docs/maintainer/dashboard-touch-family-timings.md:73`; repair stripped trailing blank EOF; retry published `2f800b3f`. Distinct from DD-363 (hard-break trailing spaces on source-review lines). Code renumbered from colliding DD-369 at trunk merge.
  - Observed effect: one refused preparation after status mutation; mechanical EOF fix and second guarded delivery succeeded
  - Inference: new Markdown created under the file-size split needs an EOF whitespace check before staging; format alone does not catch it

<a id="dd-371"></a>

## DD-371 — Delivery typecheck first catches exactOptionalPropertyTypes after green proof

Focused Playwright proof and post-change refactor returned green, yet the
first slice-2 delivery/commit failed on TypeScript
`exactOptionalPropertyTypes` when an optional prop was passed as an explicit
`undefined` instead of omitted. A one-line conditional spread fixed it; retry
published. Local code was DD-370 on the story branch; renumbered to DD-371 at
trunk merge where DD-370 already named the Markdown EOF finding.

### Occurrences

- Execution: SEED-189#expand-dashboard-diff-context / plan 416 / first related implementation `5c73925b9dcdffd763c20f5b81c5d1aa45413757`
  - Timestamp: unknown (2026-10-30; after green slice-2 proof/refactor and before tip `c9ada8b1` 15:13:13+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.78
  - Evidence: coordinator transcript `1cd76bae-22c3-404c-b849-2df63d24fb85` L56–L58 — “Fixing the TypeScript exactOptionalPropertyTypes error that blocked the commit, then retrying delivery”; edited `dashboard/src/StoryReviewFileDiff.tsx` from `textProblem={…}` (could be `undefined`) to conditional `{...(cond ? { textProblem } : {})}`; republished as `c9ada8b1`. Distinct from ODF-329 (ESLint/formatter under a lint-forbidden brief).
  - Observed effect: one failed delivery attempt and one coordinator type fix before successful publish; no product behavior change beyond satisfying the typecheck gate.
  - Inference: qualified one-off that delivery/commit typecheck was the first gate for this optional-prop shape after green journey proof. Implementer/refactor briefs that forbid independent lint/typecheck leave that class of defect to the delivery hook; no claim that a earlier read-only `tsc` would have been cheaper than the observed retry.

<a id="dd-374"></a>

## DD-374 — Delegation brief softened the project's failing-test policy to "fix or report"

The coordinator's implementation brief told the agent that a locally failing or
flaky test was "a defect to fix or report". This project's policy is to fix
such tests so local and CI results match, even when the failure predates the
change. The agent reported an intermittent regression-suite failure that was
already on trunk and left it unfixed, so the coordinator had to send it back
for a second round.

### Occurrences

- Execution: SEED-192#open-development-intent-frame; first implementation `9913a6d40006e3de9980ab8d97e0e2f3197b5f0d`
  - Timestamp: 2026-10-31 (Asia/Singapore; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.79
  - Evidence: slice 1 implementation return listed `sessions-sidebar-navigation-cases.spec.ts` "a story on no card…" as failing 1 in 4 on clean `22eb4b3e` and "did not fix it". A coordinator follow-up then found the cause (a reveal-count test race with keep-in-view after a Side panel press) and fixed it (`revealsAtClick`, 8 of 8 passing repeated); see `72ce39b109d5352b43dd093c68b9257b564a1bdc:.planning/slice-plans/424-development-intent-frame/PLAN.md` Current decisions.
  - Observed effect: one extra delegation round (about 5 minutes, 9 tool uses). The fix landed in the same increment.
  - Inference: the coordinator's wording, not the shared guidance, caused this; delegation already says a discovered failure keeps the project's failure policy. Pass the project's policy verbatim instead of paraphrasing it.

**Response (2026-11-01):** SEED-208#trustworthy-ci-completion slice 1
(`482b644e90076052a2f36b9df7977b6f46ce7e89`, story branch
`claude/finish-every-execution-with-trustworthy-ci-and-n`) puts the policy in
AGENTS.md "Failing and flaky tests", which every host reads, with "Do not
paraphrase it as 'fix or report'". `delegation.md` "Give the agent" now
carries the project's policy by link or verbatim. The reusable wording is
unreleased; the project policy takes effect when the story reaches main.
**Delivered, awaiting observation in later delegation briefs; not resolved.**

**Adoption (2026-11-03 review):** the AGENTS.md policy reached `main` in merge
`bc72a379b` (2026-11-01T11:05+08:00), and the `delegation.md` wording ships
from `v0.3.80` and is installed in this repository's `.agents/skills/`. No
later delegation brief has been inspected against it; a brief that meets a
failing or flaky test and carries the policy by link or verbatim satisfies the
observation. Open.

<a id="dd-378"></a>

DD-378 (planning treats pre-existing failures as exclusions from completion)
was retired on 2026-11-07 after `SEED-229#reduce-remote-sessions-traffic`
(`e49035d31:.planning/slice-plans/462-reduce-remote-sessions-traffic/PLAN.md`)
satisfied its observation criterion; see
[review history](project-findings-history.md#dd-378).
