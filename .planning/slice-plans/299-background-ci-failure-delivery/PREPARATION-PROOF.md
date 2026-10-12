# Premises and proof ownership

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

## Premises, observations and open native proof

Evidence below was read in the preparation checkout at `030446f5`; inspections
locate reusable boundaries but do not establish new behavior. Native feasibility
is deliberately bounded by native slice 2; no native wakeup pass is claimed.

| Premise / consuming operation | Literal observation and consequence |
| --- | --- |
| GitHub request admission is delivered and shared | `main` at `ceac3b25`: `github-request-owner.test.mjs`, `github-request-login.test.mjs`, `github-request-owner-replacement.test.mjs` and `dashboard/tests/shared-request-owner.spec.ts` pass in `npm test` and the dashboard suite (trunk CI run 38143815776). The CI engine asks through `ci-github-actions.mjs`. Consumed by every slice that acquires CI evidence; not re-proved here. |
| Durable observer restart needs more than retained SHA files | Startup filtering drops older completed runs; tracked attempts and failure dedup are memory state; coverage filenames sort by SHA. Inspection rejects reuse of startup filtering as recovery or sorted filenames as publication order. Slice 4 reconciles exact outstanding registrations. |
| Existing publication resume/classification is a usable entry point | Current scripts retain accepted revision and inject acquisition/coverage. `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs` in this checkout → exit 0, four tests. Another target owner is not adopted; command-provider pending/success, opaque attempt retention and startup history behavior reach their fixtures. New supervision is owned by slices 3–4, not an inherited pass. |
| Native idle/busy delivery and standalone binding | Cheap presence/help checks found Claude 2.1.296 (`--bg`/`--resume`), Codex CLI 0.162.1 (App Server daemon/proxy and native listen transports), Cursor desktop 3.24.12 and agent CLI 2026.10.01-e373342 (`--resume`). These are candidate routes, not observed same-session delivery. Native slice 2 must establish exact recipient, accepted input and safe busy/idle handling for each promised mechanism before its dependent slice. |
| Installed runtime and state must survive worktree/dashboard removal | Reporting already retains installed entry support outside the checkout; that alone proves neither daemon lifetime nor split-brain fencing. Slice 3 owns new enrollment/lifetime fault proof; installation self-containment is included in its proof. |
| Final integration receipt must remain the owner's publication | `history-preserving-publication.mjs` returns to execution branch; already-accepted recovery can return fetched tip with null receipt. Slice 9 recovers the owned integration evidence and authorized trunk repair route rather than consuming that tip as completion. |

Cheap proof routes: existing dashboard specs ran from this owned checkout with
temporarily reused local dependencies, no native agents or real GitHub reads.
The default sandbox refused localhost listening; scoped test escalation and
removing conflicting `NO_COLOR` made the runner usable. Temporary dependency
symlink was removed. Paid native parts remain with explicit native-check authority.

## Proof ownership and acceptance

| Source promise / constraint | Decisive owner |
| --- | --- |
| Failed request owner recovers without a second allowance (G21) | 1 paused-owner/concurrent-consumer replacement journey; existing hold and child-reconciliation proofs |
| Dashboard and standalone end turns, wake exact session only for failure (examples 1–3) | 2 native feasibility, 3 enrollment, 5–7 delivery, 8 handoff; separate SEED-053 final native acceptance |
| Sole background owner, replacing legacy observers (constraint 1) | 3 staged fenced transfer/restart tests; 10 complete-lifecycle cutover; 11 watcher/request accounting |
| Exact accepted publication, durable/idempotent registration (2–3, example 5) | 4 real publisher and fault boundaries; 9 exact integration recovery |
| Late failure, disposition and stale-boundary protection (4, example 4) | 5 shared handling receipt, 8 completion races, 9 late target repair |
| No routine duplicate after acceptance; uncertainty retained (5, example 6) | 5 shared intent crash tests; 6–7 adapter acceptance evidence; native acceptance |
| Shared upstream throttling and acquisition, no cooldown bypass (6, example 7) | Delivered by plan 224; 11 comparative demand with migrated watchers |
| CI text/authority, applicability/incomplete/loss truth (7, example 9) | 4–5 attribution/guidance review, 8 negative completion cases, 11 explicit gaps |
| Closure-only safe retirement (8) | 10 installed operation and fault/hold journey |
| Manual lifecycle and independent subscriptions (example 8) | 5 dispatch revocation; 11 subscriber cancellation/deletion |
| Shared domain/source and installed dependency closure | Each slice's import/representation review; 3 installation/support survival; 8 guidance behavior review; 11 final integration |


Keep deterministic provider/native fixtures in CI; never count them as native
behavior evidence. Native requirements and representative cases are recorded
once in [SEED-053](../../seeds/SEED-053-native-guidance-acceptance.md#background-ci-failure-wakeup).
Paid sessions are manually selected under explicit authority. Native same-session
wakeup, safe busy delivery and send/receipt reconciliation are feasibility gates,
not assumptions that fake executables settle.

Focused checks during implementation: affected Node runtime/provider/ownership/
publication tests, `npm run test:dashboard -- <affected specs>`, and
`npm run typecheck:dashboard`. Broaden only for a newly affected consumer or
unresolved failure. Publication, slice-local refactoring and CI requirements
remain with the execution workflow when execution is authorized. Planning does
not arm observers, modify runtime/skills, Take the story or run paid sessions.
