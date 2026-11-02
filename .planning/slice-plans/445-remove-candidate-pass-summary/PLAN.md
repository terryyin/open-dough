# Remove the test optimization candidate pass summary

**Source:** [Remove the candidate pass summary](../../seeds/SEED-192-review-product-intent.md#remove-candidate-pass-summary)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-192#remove-candidate-pass-summary

## Goal and scope

Remove Latest pass from the source process, this project's candidate record,
and Intent's presentation. Keep finding sections, decisions, and evidence.
Do not add replacement metadata or edit installed managed skill copies.

## Outside-in proof and decisions

- The source format reference and profiling close instruction stop requiring a
  pass summary. Walk profiling, resolve-only, and empty-record examples.
- Existing Intent candidate journeys exercise populated and empty four-section
  records; retain one historical five-section fixture to prove rollout reading
  while omitting its summary from the UI. Missing and malformed states retain
  their existing behavior. Run all affected candidate journey and boundary specs.
- Existing parser and renderer own the format; remove their summary field and
  presentation rather than adding another representation or metadata.
- Source authoring follows ADR 0003 and ADR 0006; Intent remains a derived
  reader under ADR 0008. No architectural exception is needed.
- Failure policy: [AGENTS.md](../../../AGENTS.md#failing-and-flaky-tests), as
  written, applies to execution and every repair handoff.
- Local verification is focused candidate specs and dashboard typecheck; a full
  dashboard run is unnecessary for this format removal. CI remains owned.

## Execution context

Story Branch Mode; originating/integration checkout `/Users/terryyin/git/open-dough`.
Owned checkout `/Users/terryyin/git/open-dough-remove-candidate-pass-summary`,
branch `codex/remove-candidate-pass-summary`, created for this work from
`d9f70140a8ade624f89d4305d0c5ce9f74ee5a17`. Claim accepted on origin/main at
`4845300a6fe322763250a3b744f2d6896e1d1a7c`; ordinary delivery targets the
same-named remote execution branch. Claim CI is unobserved on trunk.

## Slices

### 1. Maintain and read candidates without a pass summary
Type: Behavior
Status: done
Proof: Candidate journey/boundary specs, dashboard typecheck, representative
source-guidance behavior review, consumer trace, and an independent refactor.

Behavior: An optimization pass maintains only findings; this project's candidate
file has the four finding sections, and Intent reads and displays those findings
without asking for or presenting a pass summary. Historical summaries may be
ignored when reading existing published records during rollout.

Accepted proof: `npm run test:dashboard -- intent-test-optimization-candidates
authenticated-read-intent-candidates` exited 0 with 13 tests in five files;
`npm run typecheck:dashboard` and `git diff --check` passed. Populated and empty
four-section setup lives in `dashboard/tests/intentCandidatesFixtures.ts`;
the candidate journeys observe preserved fields, links, case positions, and
empty/missing/malformed/unreadable states. The historical-record journey in
`intent-test-optimization-candidates.spec.ts` supplies an old leading summary
and observes retained finding headings/cost with no summary content.

Source behavior review: profiling writes remaining findings; resolve-only
preserves dispositions and creates nothing for a missing file; all-`None.`
remains explicit empty; wrap-up transfers unresolved findings without adding
metadata. `quick_validate.py src/skills/dough-test-optimization` passed.
Consumer trace: `/tmp/remove-candidate-pass-summary-consumer-trace.md`, base
`c8c382761e6d7c305e7c6becec72506744038f13`, with removed summary effect terms;
all 334 listed consumers have run/reused/excluded dispositions. Generic matches,
historical records and released installed skill copies do not consume this edit.
The initial new compatibility assertion omitted the retained title from the
heading expectation; correcting that assertion produced the passing focused run.

## Preparation review

Refinement was not needed: one cohesive format removal and its direct consumers.
No remaining slice-specific concern was identified.

## Story obligations
