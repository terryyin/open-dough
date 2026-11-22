# Source review for SEED-413#speed-intent-ci-status-frame-and-timing-history

Replaced on 2026-11-22 after Terry amended the story's Evaluation speed clause
(Slice 3). The coordinator (Claude Code, agent Tsukasa-chan) launched a fresh
general-purpose reviewer with no conversation inheritance. Its only input was
the amended story section (split note, Correction first, Goal, Scope, Key
examples, Evaluation) and the seed's "Acceptance shared by the eight
stories"; it was told to read nothing else and change nothing. The launch
input and returned commitments are in this execution's Claude Code session,
in that reviewer's launch and final report. Observations from the first
review (P01, P05, P06) carry across by matching text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The page's story notes, CI follow-up and review-state reads are required members of the typed page entry; production and every case supply them through that entry, none as an optional member, context default or defaulted parameter. (Correction first, Scope, Evaluation, Shared acceptance 2) | slice 1 | observed: dashboard/src/pageReads.tsx PageReads requires storyNotes, ciFollowUp and reviewStates, supplied by authenticatedPageReads; hooks in storyNotes.ts/storyReviewStates.ts throw outside the page and no longer fetch; dashboard/frontend-tests/test-harness/unread-page-reads.spec.ts rejects every unsupplied member without fetch; typecheck, full frontend group (472 tests), intent+sessions rerun after cleanup (141), and 8 E2E notes/CI follow-up/review-state journeys passed on 2026-11-22. Full-app legacy specs: G1. |
| P02 | The 7 CI status and cue-contrast files render through the production `PageFrame`, a production Board/Intent component extracted from `ConfiguredDashboardContent`, and their owning Intent composition, using MakeMe inputs. (Correction first, Scope, Shared acceptance 2 and 3) | slice 3 | observed: intent-ci-status-{freshness,execution-time,sort} mount through intent-ci-page-mount.ts mountIntentCiPage (production PageFrame + BoardOrIntent); intent-ci-cues-dark-contrast opens the Done story Summary on the real page; homepage/kept/side-panel from slice 2; s3-focused-5 and s3-pairB/pairC runs 15/15 passed on 2026-11-22. |
| P03 | No test file among those 7 re-creates the page frame, a composition or provider stacks, calls private pipeline or evidence functions, or hand-builds hook state. (Scope, Evaluation, Shared acceptance 2) | slice 3 | observed: Production import counts: dark-contrast 9 to 0, intent-ci-status-fixtures.ts 14 to 6 (types and a stylesheet), side-panel 2 to 0; mountIntentCiEvidence, hand-built judged/shownRunOf and measuredHistoryOf removed (makeMe.aCiHistoryAnswer.pleaseMeasured()); slice-3-report.md in this checkout evidence. |
| P04 | The corrected 7-file status selection stays within about 2 seconds of its recorded speed at two workers. (Evaluation, amended 22 November 2026) | slice 3 | observed: s3-pairC-summary.txt (2026-11-22, --workers 2, load 15-22): base 14,898/14,047/14,917 ms vs corrected 16,146/15,755/17,792 ms; median delta +1.7 s, within the accepted 2 seconds; the third pair is load noise. |
| P05 | Opening a Taken story's final report from its card, or toggling the card, judges that branch's CI status on the real page frame. (Key examples, Goal) | slice 2 | observed: dashboard/frontend-tests/intent/intent-ci-status-side-panel.spec.ts mounts production PageFrame and BoardOrIntent through intent-ci-page-mount.ts; opening a final report and toggling a card heading select the story (data-selected-story) and ci.judges sees that branch, main when none; s2-focused-3 passed on 2026-11-22. |
| P06 | In that CI status case, every page read is answered with typed replies, and the case records no outside `fetch` or `WebSocket` call. (Key examples) | slice 2 | observed: Same side-panel case: recordOutsideCalls records every global fetch and WebSocket and ends with expect(outsideCalls).toEqual([]); every reply comes from typed reads, others reject through pageReadsSupplying; s2-focused-3 and full frontend group s2-frontend-full-1 passed on 2026-11-22. |
| P07 | When a collected history read fails, the selected scope keeps its last history and its live proof, offers Retry, and recovers, proven against the actual reader and its typed collaborator. (Key examples, Goal, Shared acceptance 1) | slice 7 |  |
| P08 | Recovery and retry never borrow history from a different project, endpoint or scope key. (Key examples) | slice 7 |  |
| P09 | Done wall-time history states missing, pending, outside-retention and zero-base baselines accurately. (Key examples) | slice 4 |  |
| P10 | Done wall-time history resolves stand-in builds. (Key examples) | slice 4 |  |
| P11 | Collected scope timing keeps case units and file units distinct. (Key examples, Goal) | slice 8 |  |
| P12 | Collected scope timing explains absent, partial and interrupted segments. (Key examples, Goal) | slice 8 |  |
| P13 | Collected scope timing preserves keyboard order and narrow-viewport marks. (Key examples, Shared acceptance 4) | slice 8 |  |
| P14 | Project and Done timing reads keep boundaries separate from live Proof. (Scope) | slice 4 |  |
| P15 | Collected Project and Done timing history can be checked across the homepage, location, folder and file, including provenance and source identity. (Goal) | slice 8 |  |
| P16 | Every one of the 31 legacy cases across the 19 owned timing-history files, and the 3 refreshed Project CI wall-time specs, has a traceable disposition; each retired case's distinct assertions map to a new owner or a named existing equivalent before deletion. (Evaluation, Scope, Shared acceptance 4) | slice 8 |  |
| P17 | The owned history cases and the 3 refreshed Project CI wall-time specs run on plain Vitest with no `createRoot`, React `act` or `IS_REACT_ACT_ENVIRONMENT` wrapping, rendering and acting directly and waiting on the observed result. (Evaluation, Scope, Shared acceptance 1 and 3) | slice 8 |  |
| P18 | A history `test-support` module, or other spent support, is removed once its last consumer moves, so the shared test-support surface shrinks. (Evaluation, Shared acceptance 3) | slice 8 |  |
| P19 | Before/after measurement at two workers records elapsed time including preparation, case counts by engine and destination, remaining slow cases and promoted E2E runtime; each engine's selection runs explicitly, noisy results use paired runs, and the report gives the actual time and remaining cost. (Evaluation, Shared acceptance 5) | slice 8 |  |
| P20 | Fewer cases are maintained, and the report explains why repeated cases were consolidated or kept, auditing loop-generated and table-driven cases first. (Evaluation, Shared acceptance 4) | slice 8 |  |
| P21 | Coverage is kept wherever a distinction is the proof (exact wording, accessibility, viewport and input distinctions, races, error/retry boundaries), and distinct risks needing separate setup or diagnosis stay separately named. (Evaluation, Shared acceptance 4) | slice 8 |  |
| P22 | History proof gives faster feedback than the legacy proof as soon as its slices land. (Evaluation, Shared acceptance 4) | slice 8 |  |

Unnumbered context, as returned: split provenance; Slices 1–3 sequencing; the
2-second allowance as the accepted reason and baseline; owned file scope and
refreshing the 3 wall-time mounts when their owner changes; deferrals to the
attempt/Summary and source-browsing stories; test-layer guidance; backend and
E2E ownership; guidance links and colocated page objects; the import-list
warning sign; consolidation techniques; final-story campaign measures; the
separately owned recovery/late-styling and renamed-diff corrections and
SEED-341 coordination.
