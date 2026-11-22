# Source review for SEED-413#speed-intent-ci-status-frame-and-timing-history

The coordinator (Claude Code, agent Tsukasa-chan) launched a fresh
general-purpose reviewer with no conversation inheritance on 2026-11-22. Its
only input was the seed story's split note, Correction first, Goal, Scope, Key
examples and Evaluation, plus the seed's "Acceptance shared by the eight
stories". It was told to read no files, run nothing and change nothing. The
launch input and returned commitments are in this execution's Claude Code
session, in the source-review subagent's launch and final report.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The story notes, CI follow-up and review-state reads go through the typed page entry as required members, not as optional members, context defaults or defaulted parameters. Both production and every case supply them that way. (Correction first, Scope, Evaluation, Shared acceptance 2) | slice 1 | observed: dashboard/src/pageReads.tsx PageReads requires storyNotes, ciFollowUp and reviewStates, supplied by authenticatedPageReads; hooks in storyNotes.ts/storyReviewStates.ts throw outside the page and no longer fetch; dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts rejects every unsupplied member without fetch; typecheck, full frontend group (472 tests), intent+sessions rerun after cleanup (141), and 8 E2E notes/CI follow-up/review-state journeys passed on 2026-11-22. Full-app legacy specs: G1. |
| P02 | The 7 CI status and cue-contrast files render through the production `PageFrame`, a production Board/Intent component extracted from `ConfiguredDashboardContent`, and their owning Intent composition, using MakeMe inputs. (Correction first, Scope; Slices 1–3 before any history move) | slice 3 | |
| P03 | No test file among those 7 files re-creates the page frame, a composition or a provider stack, calls private evidence or pipeline functions, or hand-builds hook state. (Scope, Evaluation, Shared acceptance 2) | slice 3 | |
| P04 | The corrected 7-file CI status selection keeps its recorded speed. (Evaluation) | slice 3 | |
| P05 | Opening a Taken story's final report from its card, or toggling the card, judges that branch's CI status on the real page frame. (Key examples, Goal) | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-side-panel.spec.ts mounts production PageFrame and BoardOrIntent through intent-ci-page-mount.ts; opening a final report and toggling a card heading select the story (data-selected-story) and ci.judges sees that branch, main when none; s2-focused-3 passed on 2026-11-22. |
| P06 | In that CI status journey, the case answers every page read with typed replies and records no outside `fetch` or `WebSocket` call. (Key examples) | slice 2 | observed: Same side-panel case: recordOutsideCalls records every global fetch and WebSocket and ends with expect(outsideCalls).toEqual([]); every reply comes from typed reads, others reject through pageReadsSupplying; s2-focused-3 and full frontend group s2-frontend-full-1 passed on 2026-11-22. |
| P07 | When a collected history read fails, the selected scope keeps its last history and its live proof, offers Retry, and recovers. (Key examples, Goal, Shared acceptance 1) | slice 7 | |
| P08 | During that failure and recovery, the scope never borrows history from a different project, endpoint or scope key. (Key examples, Goal) | slice 7 | |
| P09 | Done wall-time history accurately states missing, pending, outside-retention and zero-base baselines. (Key examples) | slice 4 | |
| P10 | Done wall-time history resolves stand-in builds. (Key examples) | slice 4 | |
| P11 | Collected scope timing keeps case units and file units distinct. (Key examples, Goal) | slice 8 | |
| P12 | Collected scope timing explains absent, partial and interrupted segments. (Key examples, Goal) | slice 8 | |
| P13 | Collected scope timing preserves keyboard order and narrow-viewport marks. (Key examples, Shared acceptance 4) | slice 8 | |
| P14 | Collected Project and Done timing history shows its provenance and source identity across the homepage, location, folder and file. (Goal) | slice 8 | |
| P15 | Project and Done timing reads keep boundaries separate from live Proof. (Scope) | slice 4 | |
| P16 | Each of the 31 legacy cases across the 19 owned timing-history specs, and each of the 3 refreshed Project CI wall-time specs, has a traceable disposition; each retired case's distinct assertions map to a new owner or a named existing equivalent before deletion. (Scope, Evaluation, Shared acceptance 4) | slice 8 | |
| P17 | Those owned and refreshed cases run on Vitest without `createRoot`, React `act` or `IS_REACT_ACT_ENVIRONMENT` wrapping. (Scope, Evaluation, Shared acceptance 1 and 3) | slice 8 | |
| P18 | When the owner of the existing Project CI history mounts (`intent-ci-wall-time-history{,-gaps,-evidence}`) changes, those mounts are refreshed to render the new owner. (Scope) | slice 5 | |
| P19 | Any history `test-support` module is removed once its last consumer moves. (Evaluation, Shared acceptance 3) | slice 8 | |
| P20 | A timing record compares before/after selections at two workers, with elapsed time including preparation, counts by engine and destination, and remaining slow cases; each engine's selection runs explicitly and promoted E2E runtime is included. (Evaluation, Shared acceptance 5) | slice 8 | |
| P21 | Maintained cases are fewer, and the report explains why repeated cases were consolidated or kept. (Evaluation, Shared acceptance 4) | slice 8 | |
| P22 | History proof gives faster feedback as soon as its slices land. (Evaluation, Goal) | slice 8 | |

Unnumbered context, as returned: split provenance; Slices 1–3 ordering as a
qualification on P01–P03; delivery deferrals to the attempt/Summary and source
browsing stories; shared proof-method guidance; case-reduction method guiding
P21; the campaign's one-minute target belongs to the final story; separate
owners of the recovery/late-styling and renamed-diff corrections, and SEED-341
coordination; the 7/19/31/3 counts as scope facts.
