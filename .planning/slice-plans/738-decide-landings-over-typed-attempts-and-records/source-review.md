# Source-only review

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); supplied
only the story Goal, Scope, Scope limits, Key examples, Evaluation, and Effort
hypothesis for SEED-413#decide-landings-over-typed-attempts-and-records.
**Agent:** 2159edd7-0454-424a-97ec-740093b13139

## Unnumbered source context

- Scope limits / regression gate: about 30 more specs reach the same handler
  through a real dashboard server and stay as the adapter's regression gate;
  later backend families move onto this story's typed decision.
- Evaluation: counting `installedPublisher.ts`, `declaredPublisherBranch.ts`
  and `reportedIsolatedBranch.ts` lines and imports.
- Effort hypothesis: M, one plan.
- Identity and title as in the seed section.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Landing preparation and recording are provable from composed attempts and records. Goal: "Dashboard maintainers can prove landing preparation and recording from composed attempts and records." Scope: "so cases hand it MakeMe attempts and records instead of the stores under HOME." Key examples: prepared pair survives Done without HOME; unprepared comparison refused and second prepare answers first receipt as plain values; deleted reporting session refuses from composed values. | slice 6 | |
| 2 | `handleLanding` / `submitRetainedLanding` become a typed decision over submission, origin, operation, kept attempts and kept records, returning receipt or refusal plus next attempts and records. Scope: "Split `handleLanding` and `submitRetainedLanding` into a typed decision over the submission, origin, operation, kept attempts and kept records that returns the receipt or refusal and the next attempts and records" | slice 2 | |
| 3 | A landing adapter persists the decision's next attempts and records under the existing lock order. Scope: "and the adapter that persists them under the existing lock order." | slice 3 | |
| 4 | `verifyLanding` (Git comparison) remains inside that decision, over its typed repository. Scope: "The comparison check against Git (`verifyLanding`) stays in the decision over its typed repository." | slice 1 | observed: dashboard/server/launchLandingDecision.ts resolveLandingComparison→verifyLanding; launchLandingDecision.spec.ts |
| 5 | Ref pinning and follow-up receipt registration remain pre-save effects, as today. Scope: "Ref pinning and the follow-up receipt registration stay effects that run before any save, as today." | slice 3 | |
| 6 | Receipt ID and receipt time are inputs to the decision. Scope: "The receipt ID and receipt time become inputs." | slice 1 | observed: decideAttemptLanding(receiptId, receivedAt); resolveLandingComparison takes inputs; cases pass fixed receipt id/time |
| 7 | `branchLandingContext` takes reporting directory and record from its caller (not `machineDashboardPath` / `changeSessionRecord`). Scope: "Let `branchLandingContext` take its reporting directory and record from its caller instead of `machineDashboardPath` and `changeSessionRecord`." | slice 4 | |
| 8 | Landing request admission is a typed production function (route, method, origin, body → operation and submission, or refusal); `submitLanding` uses it; the `installedPublisher.ts` bridge delegates to it; publisher cases do not reimplement admission. Goal: "The installed publisher's cases reach the dashboard through production's own request admission, so no test code repeats it." Scope admission sentence. Key example: wrong origin or route refused by production admission in the publisher's bridge. | slice 5 | |
| 9 | The landing adapter takes attempt and record stores as an explicit collaborator. Scope: "Let the landing adapter take its attempt and record stores as an explicit collaborator, so cases hand it MakeMe attempts and records instead of the stores under HOME." | slice 3 | |
| 10 | MakeMe provides steps for a reporting attempt and for a record with a landing context. Scope: "Add MakeMe steps for a reporting attempt and a record with a landing context" | slice 6 | |
| 11 | `aReportedIsolatedBranch` no longer calls `replaceAttempts`. Scope: "and retire `aReportedIsolatedBranch`'s `replaceAttempts` call." | slice 6 | |
| 12 | The landing context file continues to be written by production `writeLandingContext` (installed publisher's real input). Scope: "The landing context file stays written by production `writeLandingContext`, because it is the installed publisher's real input." | slice 6 | |
| 13 | Only the named installed-publisher specs remain for retained comparison/retry; other former installed-publisher coverage moves onto the typed decision. Scope: "Keep a few installed-publisher cases whose topic is the publisher's retained comparison and retry. Move the rest to the typed decision. The installed-publisher specs are `declared-blank-launch-publication`, `declared-worktree-publication`, `ad-hoc-prepared-landing-done` and `ad-hoc-session-comparisons`." | slice 6 | |
| 14 | A deleted reporting-session record refuses a landing when decided from composed values. Key example: "A record of a deleted reporting session refuses a landing, decided from composed values." | slice 1 | observed: launchLandingDecision.spec.ts deleted reporting session case + scratch fail/restore |
| 15 | A prepared pair survives Done and is recorded at landing without the attempt store under HOME. Key example: "A prepared pair survives Done and is recorded at landing, without the attempt store under HOME." | slice 3 | |
| 16 | Recording a comparison that was never prepared is refused (as plain values). Key example: "Recording a comparison that was never prepared is refused, … as plain values." | slice 1 | observed: launchLandingDecision.spec.ts recording never-prepared comparison refused |
| 17 | A second prepare of the same delivery answers the first receipt (as plain values). Key example: "… and a second prepare of the same delivery answers the first receipt, as plain values." | slice 1 | observed: launchLandingDecision.spec.ts second prepare answers first receipt |
