# Source-only review

Fresh Codex general-purpose agent `/root/source_review` was launched with
`fork_turns: none`. Its only source was the Goal, Scope, Key examples,
Evaluation and Effort hypothesis of the linked SEED-413 story at
`e6cd3a3200b7a8b4f9a2092799efcdd5e6e81b5d`, supplied in the launch message.
The reviewer received no plan, product files, or expected gaps and was asked
to derive independently observable promises without reading or editing files.
The launch and numbered return are in this session’s collaboration log.

Composed Done records, real Git and no machine home are the proof conditions
for selection and witness/retry cases. Adapter lifecycle and race proof uses
an explicit store collaborator in place of the machine-store setup. Preserve
every replaced assertion and evaluate setup and timings under ADR 0010.
The sibling responsibilities and effort hypothesis remain scope context.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 01 | A typed decision over kept records, the project’s trunk ref and observed revision, the authorized head reader and manual inspection returns each delivery. For two composed Done branches merged in order, each delivery has its own base and merge at the published head. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts exact hand-merged ranges; checks both records, results and Git-derived pairs |
| 02 | The two-branch decision works without a kept store. Only the adapter saves the discovery to the live record. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts exact hand-merged ranges from composed records; dashboard/backend-tests/review/ad-hoc-manual-landing-revision-observation.spec.ts applies the discovery |
| 03 | The two-branch decision writes no delivery pins. Only the adapter keeps or releases delivery pins. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts exact hand-merged ranges assert no pins; dashboard/backend-tests/review/ad-hoc-manual-landing-revision-observation.spec.ts observes one real pin pair |
| 04 | Only Done records are eligible. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects an open launch before head read |
| 05 | Already-landed Done records are excluded. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects a Done launch with a delivery before head read |
| 06 | Eligibility requires a branch result matching the supplied record’s current `doneAt`, excluding missing and stale results. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects both missing and stale Done results before head read |
| 07 | Eligibility requires `manualDeliveryChecked: true`. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects a result without a manual-delivery check; scratch inversion caught |
| 08 | Eligibility requires a witnessed trunk revision. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects absent witnessed trunk revision before head read |
| 09 | A witnessed trunk revision equal to the observed revision is excluded. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects a witnessed revision equal to the observed revision before head read |
| 10 | Eligibility requires the target to match the project’s trunk ref. | slice 1 | observed: dashboard/backend-tests/review/observed-session-deliveries.spec.ts rejects another trunk ref before head read |
| 11 | An unmerged Done branch inspected with no delivery is skipped on a repeat check at the same revision by the process-lifetime decision owner. | slice 2 | observed: dashboard/backend-tests/review/observed-session-delivery-witnesses.spec.ts single real inspection after two observations at the same revision |
| 12 | A newly Done session is inspected and delivered on a repeat check at the same revision. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation.spec.ts newly Done case at unchanged head returns a landed review with newly-done.txt |
| 13 | An unreachable trunk head leaves the witness unchecked for retry. | slice 2 | observed: dashboard/backend-tests/review/observed-session-delivery-witnesses.spec.ts unavailable and rejected head cases retry both records at the same revision and keep independent remote progress |
| 14 | A thrown inspection leaves the affected witness unchecked for retry at the same revision. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-retry.spec.ts failed verification returns landing for retry.txt on same-revision retry; scratch catch mutation caught |
| 15 | A thrown inspection still lets an independent branch’s delivery settle. | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-manual-landing-observation-retry.spec.ts first pass settles independent.txt while retrying launch still reads branch-result |
| 16 | Advancing the observed revision resets checked witnesses and rechecks previously skipped branches. | slice 2 | observed: dashboard/backend-tests/review/observed-session-delivery-witnesses.spec.ts unmerged witness is inspected again at the real second published head |
| 17 | The typed decision owns each project’s last observed revision and checked witnesses independently. | slice 2 | observed: dashboard/backend-tests/review/observed-session-delivery-witnesses.spec.ts project isolation case inspects same witness separately and advancing one does not invalidate the other |
| 18 | The typed decision owns each project’s in-flight pass coalescing. | slice 2 | observed: dashboard/backend-tests/review/observed-session-delivery-witnesses.spec.ts held application case observes one read, inspection and apply across concurrent checks |
| 19 | The adapter saves a discovery for the matching kept live record, while it remains in retention. | slice 3 | |
| 20 | Deletion during inspection precludes pinning, saving or recreating the removed launch. | slice 3 | |
| 21 | Expiry during inspection precludes pinning, saving or recreating the expired launch. | slice 3 | |
| 22 | Different `launchedAt` prevents pinning and saving the discovery. | slice 3 | |
| 23 | Different `branchPinOwner` prevents pinning and saving the discovery. | slice 3 | |
| 24 | Different live branch result prevents pinning and saving the discovery, preserving newer Done state. | slice 3 | |
| 25 | A saving failure after pinning releases the unkept delivery pins. | slice 3 | |
| 26 | A save that loses releases the unkept delivery pins. | slice 3 | |
| 27 | Repeated or later adapter observations retain one delivery until removal. | slice 4 | |
| 28 | Repeated or later adapter observations retain one delivery pin pair until removal. | slice 4 | |
| 29 | Removal ends retention of the delivery pin pair. | slice 4 | |
| 30 | In the two-branch adapter race, the survivor’s delivery settles when the other launch is deleted or expires during inspection. | slice 3 | |
| 31 | In that same race, the survivor’s pins are kept. | slice 3 | |
| 32 | With origin offline after branch-result pinning, branch retirement, and a conflict-resolved hand merge, observation preserves the delivered comparison. | slice 4 | |
| 33 | In that same offline case, observation preserves the fixed branch-result comparison. | slice 4 | |
| 34 | In that same offline case, the delivered file diffs remain available. | slice 4 | |
| 35 | In that same offline case, the branch-result file diffs remain available. | slice 4 | |
| 36 | `observeProjectRevision` retains its contract for `performedRead.ts` and `performedRevisionCheck.ts`. | slice 4 | |
