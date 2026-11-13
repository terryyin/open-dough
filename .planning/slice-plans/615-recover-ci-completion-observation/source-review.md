# Source-only review

**Launch:** Fresh general-purpose reviewer (no conversation inheritance), Cursor Task,
2026-11-13. Inputs: Goal, Scope (required behavior, required restrictions, scope
limits), Key examples 1–7, Architecture, and Completion evidence from
`SEED-343#recover-ci-completion-observation` only. No plan, product, or proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a coordinator’s execution observer ends (by its eight-hour budget or otherwise) before the final accepted SHA has a completion receipt, that coordinator runs one managed recovery that the expiry notice and the execution and wrap-up guidance name. | slice 3 |  |
| 2 | That recovery re-establishes this coordinator’s observation of that SHA on its authorized target. | slice 3 |  |
| 3 | That recovery ends in the ordinary completion receipt that wrap-up’s retirement gate checks: effective evidence and confirmed shutdown on success; retained resources otherwise. | slice 3 |  |
| 4 | Nobody polls an exact SHA by hand; an ignored-only closure (e.g. Pygardon’s merge landing `a5ceb3881`) reaches its applicable basis instead of waiting for a run that never starts. | slice 4 |  |
| 5 | This removes the closure stall behind ODF-259, ODF-298 and ODF-334. | slice 6 |  |
| 6 | A budget-expiry `CI_MONITOR_UNAVAILABLE` says that the budget expired. | slice 2 |  |
| 7 | Budget expiry is distinct from a transport loss such as Doughnut’s HTTP 502 or TLS handshake timeout (ODF-121). | slice 2 |  |
| 8.1 | Guidance at every completion point names the one managed recovery for an ended observer: execution/review handoff | slice 3 |  |
| 8.2 | Guidance at every completion point names the one managed recovery for an ended observer: Trunk Mode `finish` | slice 5 |  |
| 8.3 | Guidance at every completion point names the one managed recovery for an ended observer: Story Branch integration | slice 4 |  |
| 9 | Receipts and reports keep the two causes (budget expiry vs transport loss) distinguishable. | slice 2 |  |
| 10 | The recovery covers the already accepted SHA on its authorized target only. | slice 3 |  |
| 11 | The recovery finishes through the existing completion operation and its `CI_OBSERVER` receipt, with no second receipt format. | slice 3 |  |
| 12 | Success carries the effective evidence and `shutdown: confirmed`. | slice 3 |  |
| 13 | A failure, pending evidence, or unresolved evidence keeps the observer, worktree and branch for diagnosis, repair or a later bounded resume. | slice 3 |  |
| 14 | The ended observer’s records stay readable and unchanged. | slice 3 |  |
| 15 | The ended observer’s expiry event stays readable and unchanged. | slice 3 |  |
| 16 | Unread failure evidence stays readable and unchanged. | slice 3 |  |
| 17 | The original publication receipts stay readable and unchanged. | slice 3 |  |
| 18 | A failure the ended observer delivered is still owned and still needs repair. | slice 3 |  |
| 19 | A later green does not settle that owned failure. | slice 3 |  |
| 20 | The recovery keeps the completion operation’s foreground bound. | slice 3 |  |
| 21 | The recovery keeps the sixty-minute overall deadline. | slice 3 |  |
| 22 | That overall deadline is recorded at the first completion start for the accepted SHA on its target. | slice 3 |  |
| 23 | That overall deadline is carried into the recovered observation. | slice 3 |  |
| 24 | That overall deadline is never renewed by recovery, resume or repetition. | slice 3 |  |
| 25 | Repeating the recovery, or rerunning it after an interruption, leaves one owned live observation for the accepted SHA. | slice 3 |  |
| 26 | Repeating the recovery, or rerunning it after an interruption, leaves one receipt for the accepted SHA. | slice 3 |  |
| 27 | Reuse the exact-attempt rules. | slice 4 |  |
| 28 | Reuse the `not_required` rules. | slice 4 |  |
| 29 | With no exact attempt, the effective evidence is the nearest attempted ancestor reachable through either parent whose tree difference to the accepted SHA is ignored-only. | slice 4 |  |
| 30 | That effective evidence is never the first parent by default. | slice 4 |  |
| 31 | That effective evidence is never the target’s newest attempt by default. | slice 4 |  |
| 32 | An applicable failed or pending attempt keeps its actual state. | slice 4 |  |
| 33 | Missing or ambiguous evidence stays unresolved. | slice 4 |  |
| 34 | Integrated-state completion rules keep their current meaning. | slice 4 |  |
| 35 | Actionable-failure rules keep their current meaning. | slice 4 |  |
| 36 | The same recovery and receipt semantics hold for GitHub Actions with a matching path filter. | slice 4 |  |
| 37 | The same recovery and receipt semantics hold for a configured command adapter. | slice 4 |  |
| 38 | The command adapter supplies the applicable ancestor’s attempt, including a story-side ancestor outside the target branch’s own attempts, through its existing adapter boundary. | slice 4 |  |
| 39 | Recovery never registers or completes a newer tip. | slice 3 |  |
| 40 | Recovery never registers or completes another writer’s revision. | slice 3 |  |
| 41 | Recovery never registers or completes an unpublished candidate. | slice 3 |  |
| 42 | Recovery never registers or completes another target. | slice 3 |  |
| 43 | Recovery never uses another coordinator’s observer. | slice 3 |  |
| 44 | Completion evidence must describe this execution’s accepted publication. | slice 3 |  |
| 45 | An unresolved receipt never grants retirement. | slice 5 |  |
| 46 | Wrap-up’s existing gate requires success with confirmed shutdown. | slice 5 |  |
| 47 | No change to the eight-hour budget. |  | X1 |
| 48 | No renewal of observation at each slice publication. |  | X1 |
| 49 | Mid-story expiry already reattaches at the next delivery; this story’s completion recovery closes the remaining gap (qualification of scope, not a new mid-story behavior). |  | X2 |
| 50 | No retry policy for transient transport errors (ODF-121). |  | X3 |
| 51 | An observer that ended by transport loss may use the same recovery at completion (allowed alternative), but this story verifies the budget-expiry path. |  | X4 |
| 52 | `completion_expired` stays closed as it is today. |  | X5 |
| 53 | No new read-only effective-verdict command unless the recovery design needs another caller to read the verdict. |  | X6 |
| 54 | Any such entry point exposes the same calculation (conditional on 53). |  | X6 |
| 55 | Pygardon’s production release admission stays in its own owner. |  | X7 |
| 56 | No paid native host runs; fixtures substitute both providers. |  | X8 |
| 57 | There is one recovery and effective-evidence owner. | slice 3 |  |
| 58 | Start from the existing `deliver` / `finish` continuation, the CI mailbox completion operation and the shared applicability classifier. | slice 3 |  |
| 59 | Execution handoff, Trunk Mode closure and Story Branch integration all reach that same owner. | slice 5 |  |
| 60 | Provider-specific acquisition stays at the existing GitHub Actions and command adapter boundary (ADR 0006, one authoritative home per rule). | slice 4 |  |
| 61 | Record the delivered recovery, its containing release, and this story’s GitHub Actions and command-adapter proof outcomes at ODF-259. | reporting |  |
| 62 | Link the relevant outcome from ODF-298 (closure continuation). | reporting |  |
| 63 | Link the relevant outcome from ODF-334 (exact-SHA polling). | reporting |  |
| 64 | Example 1 — Story Branch handoff on GitHub Actions: recovery after budget expiry yields success receipt for `S` with confirmed shutdown; ended mailbox unchanged. | slice 3 |  |
| 65 | Example 2 — Pygardon-shaped merge on command adapter: `not_required` basis `B`, never `M`, never wait for `L`. | slice 4 |  |
| 66 | Example 3 — Same shape on GitHub Actions with matching `paths-ignore` → same receipt semantics as example 2. | slice 4 |  |
| 67 | Example 4a — Applicable failure: `B` failed → failure, shutdown retained, worktree and branch kept. | slice 4 |  |
| 68 | Example 4b — Applicable pending: `B` running → pending; resume keeps first completion deadline. | slice 4 |  |
| 69 | Example 5 — Unresolved evidence: no ancestor or adapter cannot list history → unresolved receipt; resources retained. | slice 4 |  |
| 70 | Example 6 — Repeat and interruption: one live observation and one receipt; deadline is the first recorded. | slice 3 |  |
| 71 | Example 7 — Cause stays visible: TLS timeout → transport loss; budget expiry → budget expiry; in event and recovery receipt. | slice 2 |  |
