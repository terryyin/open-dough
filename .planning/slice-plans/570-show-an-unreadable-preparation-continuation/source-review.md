# Source-only review

**Launch:** Fresh general-purpose reviewer (`b0607fe0-58af-4ef5-a02c-cc67c3694963`), no conversation inheritance.
**Input:** SEED-292#show-an-unreadable-preparation-continuation Goal, Scope, Key examples, and Out of scope only. No plan, product, or proof.

## Reviewer return

### Commitments (from source only)

1. **Unreadable continue failure surfaces its own failure text on Intent Taken**
   Source: “A developer whose retained preparation cannot continue because the installed continue command failed without a readable JSON result sees that command's own failure text on the Intent Taken card, so they can tell a crashed command from an ownership refusal.”

2. **Trigger / when this applies**
   Source: “When Intent continues a kept preparation and `preparation-assignment.mjs continue` exits without a JSON result Intent can read, the card's refusal detail is that failure text, including an exception message the command printed.”

3. **Safety wording preserved on every failed continuation**
   Source: “Required restriction: the existing safety wording stays on every failed continuation — the start was kept, and assignment ownership remains unverified — so an unreadable failure is never treated as permission to announce again.”

4. **Structured stop keeps its `error` as detail in the same refusal shape**
   Source: “A continuation that already returns a structured stop keeps that stop's `error` as the detail inside the same refusal shape.”

### Key examples (journey / qualification; not extra rejection rules)

**E1.** Given a kept preparation start, when continue throws before printing JSON and Intent resumes it, the Taken card names that thrown message and still says the start was kept and ownership remains unverified. It does not replace the thrown message with "The installed command could not verify continuation."

**E2.** Given continue returns the structured stop whose error is that the local allocation and published ownership could not be verified, the card shows that error as its detail inside the same kept-start / ownership-unverified refusal.

### Exclusions (out of scope)

**X1.** Changing when a continuation may announce.
**X2.** Releasing a lost workspace.
**X3.** The Cursor runner story.
**X4.** Inventing failure text when the command produced none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Unreadable continue failure surfaces its own failure text on Intent Taken | slice 1 | observed: agent-launch-preparation-continuation-refusal.spec.ts printed-failure: explanation contains printedFailure; preparationResult continuationDetail/refusal |
| 2 | When Intent continues a kept preparation and preparation-assignment.mjs continue exits without a JSON result Intent can read, the card's refusal detail is that failure text, including an exception message the command printed | slice 1 | observed: continuation-refusal journey + readPreparationResult/continuationDetail unit: refusal detail is printed failure text including exception message |
| 3 | The existing safety wording stays on every failed continuation — the start was kept, and assignment ownership remains unverified — so an unreadable failure is never treated as permission to announce again | slice 1 | observed: continuation-refusal E1 and interrupted-precommit E2: The start was kept + assignment ownership remains unverified |
| 4 | A continuation that already returns a structured stop keeps that stop's error as the detail inside the same refusal shape | slice 1 | observed: interrupted-precommit resume: structured ownership-verification error as detail; continuationDetail unit for stopped.error |
| E1 | Given a kept preparation start, when continue throws before printing JSON and Intent resumes it, the Taken card names that thrown message and still says the start was kept and ownership remains unverified; it does not replace the thrown message with "The installed command could not verify continuation." | slice 1 | observed: agent-launch-preparation-continuation-refusal.spec.ts printed-failure resume: names thrown message + safety; excludes generic verify sentence |
| E2 | Given continue returns the structured stop whose error is that the local allocation and published ownership could not be verified, the card shows that error as its detail inside the same kept-start / ownership-unverified refusal | slice 1 | observed: agent-launch-preparation-resume.spec.ts interrupted precommit resume: local allocation/published ownership error + safety; excludes generic |
