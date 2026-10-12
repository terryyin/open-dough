# Gated runtime slice design and decisive proof

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

### 3. Retain enrollment and recoverable ownership transfer for both origins
Result: installed standalone enrollment without a dashboard server and dashboard
enrollment retain the same session binding/subscription model, including
pending-native claims and an explicit inactive/held coverage state. Runtime
lifetime, staged transfer and support outside worktrees are established.

Proof: real installed enrollment entry → private runtime → machine state/status,
with no browser/Vite for standalone. Concurrent dev/production/standalone entry
yields one fenced owner. Replay enrollment, pending binding, wrong child,
stale generation, unread evidence, incompatible installed version and crash
at transfer stages retain identity/evidence or a named hold. The retained launcher
restarts a killed owner; missing launcher/reboot is recovered on next entry,
with the interrupted interval named. Verify complete installed dependency graph
and run support after removing the originating fixture worktree.

Stage transfer from legacy registrations/events, verify exact old-worker shutdown,
then commit new ownership; an uncertain transfer never creates another observer.
Use an isolated provider/native fixture to prove this sequence here. Production
activation is deliberately withheld until slice 10 has accepted publication,
delivery, execution/wrap-up completion, target-preserving repair and retirement
paths for that native form. Until then its one existing
observer, safe-boundary delivery and completion remain in force; inactive new
enrollment claims no replacement coverage and makes no provider requests.
Test failure arriving during this interval reaches the existing owner once.
Slice 10 atomically activates replacement and removes this interim gate.

Generalize retained native session storage once, without fabricated launch
requests or a second session registry. Active obligations pin necessary records.

Request-owner obligations owned here (G12, G22): a newer install's
consumer replaces an older request owner through the generation claim and the
stored hold carries over; an older consumer meeting a newer owner gets a named
failure and asks nothing; G21
unanswered-greeting recovery is owned by independent slice 1. Decide and prove
how a subscription whose session used another login is observed.

### 4. Register exact accepted publications durably and recover lost receipts
Result: claim, increment, repair, execution record, closure and integration
receipts enter the same registration operation with explicit publication ID,
target/full SHA and retained sequence. Dashboard and standalone use identical
managed-delivery/resume machinery.

Proof: real installed publisher with local Git origin and runtime receiver;
fault before/after push acceptance, durable registration, and acknowledgment.
Retry recovers without second push/registration/observer. Delayed registration,
nonalphabetic SHA order, rebase, another writer advancing target, multiple
targets and same SHA in two subscriptions preserve exact owner evidence.
A known retained start identity admits a pre-native claim with delivery pending
binding; unknown execution identity or unauthorized target refuses with a gap.
Test accepted claim before native ID → exact binding → owned failure delivery;
failed/unconfirmed launch, deletion and lost early acknowledgment retain their
proper evidence without another claim/push.
Restart discovers older unresolved failures, not merely the newest startup run.

Retain recoverable accepted evidence outside removable worktrees. Receipt
vocabulary and registration rules have one runtime/guidance home; do not add
standalone/dashboard publication recipes.

### 5. Deliver Claude failures with durable acceptance and uncertainty
Result: one registered failure reaches the original verified Claude session,
active or idle, using slice 2's proved route. Pending/success creates no input.

Proof: installed supervisor → shared delivery intent → synthetic native adapter
→ session/card/status facts. Inject crash before call, after native acceptance
and before local receipt, rejection and ambiguous history. Confirmed tokens
are not resent; uncertainty reconciles or stays visible without blind retry.
Busy/idle/exit races never fork, double-send or overwrite developer input.
Native acceptance remains separately required. Durable revocation before dispatch prevents a new send; revoke-during-send
preserves accepted or uncertain evidence without promising recall. Neither path
starts a replacement session or blindly retries revoked delivery.

Extract one host delivery port and runtime dispatch/intent state machine;
reuse existing native helpers only where their acceptance/readiness contracts
fit. Accepted input, handled failure and repaired publication remain distinct.

### 6. Deliver Codex failures through the same dispatch model
Result: verified Codex native thread receives failure under its actual thread
ID and enrolled continuation endpoint, preserving fork/coordinator isolation.

Proof: synthetic App Server fixture exercises real adapter requests, returned
turn ID and retained-history reconciliation; active-turn strategy follows slice
2 evidence. Uncertain input resumes reconciliation without starting another
turn, missing endpoint is a gap, and two forks cannot consume one another's
failure. Same shared intent/dispatch/dedup tests as slice 5, no second model.
Native fixture proves the in-scope standalone route before acceptance.

### 7. Deliver Cursor failures without replacing the owning conversation
Result: verified Cursor conversation/runner route receives failure safely
under its original ID and originating coordinator boundary.

Proof: native transport fixture plus separate actual-host evidence from slice
2. Already-held terminal, unsent developer input, busy/idle transition, runner
exit, waiting on input and uncertain typed acceptance preserve ownership and
produce explicit accepted/refused/uncertain results. No Recover replacement
fallback, permissive mode change or delivery into a child. Reuse the shared
port/dispatch; native transport is the only host difference.

### 8. End execution and wrap-up turns with an explicit nonblocking boundary
Result: after its acknowledged publication fence, dashboard or standalone
execution/review handoff and wrap-up return while CI remains pending. Build and
prove these paths under the inactive enrollment gate; production cutover remains
with slice 10, after target repair and retirement are complete.
No `complete-revision`, AI polling, host probe/stream or success
input remains on replaced paths, including Trunk Mode `finish`. Old in-flight
completion handles cannot be left waiting on a retired mailbox.

Proof: installed completion operation with a controlled pending provider must
return before its release, leave runtime alive and keep owned resources. Then
failure wakes through the corresponding verified adapter. Tests vary execution
versus closure, verdict-before-report, report-before-verdict, old report after
new repair, old owned failure plus newer green, missing registration, ignored-only
pending basis and cancellation/incomplete. Stale boundaries cannot settle newer
work. Disposition/linked repair is required where the earlier failure persists.
Interleave begin-repair/new-generation reservation with final success and
retirement admission; active repair blocks stale settlement before it publishes.

One runtime fence decision serves dashboard completion, standalone status and
wrap-up. Completion with attention stays open; completion without CI obligations
keeps its existing behavior. Canonical lifecycle/handling instructions stay in
`ci-monitor.md`; completion mechanics and execute-plan/wrap-up/host references
link there rather than duplicate no-wait or failure-handling rules. Remove
`--external-ci` as a fourth session-policy choice and old waiting recipes for
these paths. Guidance behavior review follows repository `AGENTS.md`.

### 9. Preserve target coverage and repair a final integration failure
Result: Story Branch wrap-up observes unsettled branch publications and its
accepted trunk integration independently. A post-turn trunk failure is repaired
in owned work and published/integrated to the original authorized trunk target,
then registers a new closure boundary. Trunk Mode uses the same model.

Proof: real installed Story Branch/Trunk Mode closure with local origin,
controlled CI and native fixture: late branch failure, trunk failure after
execution branch restoration, unrelated later trunk advance, lost integration
receipt and crash during repair publication. Neither branch green nor fetched
newer tip can satisfy trunk closure. Recovery uses the owner's accepted
integration evidence and existing history-preserving publication semantics.
No new merge/repair authority or repair workspace is invented.

### 10. Retire only resources authorized by a settled wrap-up closure
Result: current closure success with covered obligations resolved invokes the
installed retirement operation quietly. Execution handoff alone retains the
worktree; manual Done/stop, missing evidence and attention retain resources.
With all lifecycle paths accepted, atomically activate replacement for each
proved native form under slice 3's transfer protocol. Remove the inactive gate
and old watcher/wait paths together; no existing execution can be left with a
wrap-up path that cannot consume its monitoring records.

Proof: real installed retirement against fixture worktree/local and remote
execution branch. Pending/failed/unobserved/uncertain closure and earlier
undisposed failure retain all three. Settled authorized closure removes them;
dirty/foreign/default/unique-work holds stay named. Crash between removal steps
recovers from retained management context without republishing or waking the
agent. Automatic Done and retirement result remain separate projections.
At cutover, interleave failure, old in-flight completion, execution handoff and
wrap-up entry: each obligation retains one owner, failures remain attributable,
and old completion handles terminate through the replacement contract.

Change `trunk-closure.mjs`'s unresolved-receipt retirement path for the new
background contract; positive settlement is required. Reuse containment and
creation checks exactly once. `finish` already keeps the worktree and branch
unless the receipt is a `success` with confirmed shutdown; keep that gate and
its journey in `trunk-closure-completion-gate.test.mjs` green.

### 11. Recover the whole lifecycle without duplicate monitoring or requests
Result: runtime, dashboard and native restarts, cancellation, manual Done and
record deletion preserve truthful monitoring/delivery/completion facts with
one owner and coordinated requests.

Proof: fault journey from enrollment → real publication → agent turn end →
server/runtime loss → offline CI failure → recovered native delivery → repair
→ closure → retirement. Exercise writes interrupted at every durable boundary,
unreadable state, expired budget, stale lease, reordered/replayed events and
deleted recipient. Separate subscribers sharing acquisition keep their facts;
last removal/dormancy stops upstream polling. Dashboard/browser shutdown has
no effect on standalone obligations. Missing worktree/session remains a gap.

Compare equivalent old/new synthetic workloads: same publications, pending
and completed attempts, polling window, diagnostic demand and simultaneous
sessions. Count HTTP operations; migrated old watchers contribute zero and
identical demand is acquired once. Any increase must be explained by required
coverage/diagnostics rather than duplicated observers or hidden CLI requests.
Verify cooldown/recovery/concurrency jointly with dashboard traffic and preserve
existing dashboard reader behavior. Finish payload/reference and representative
install/update/coexistence checks for shared dependencies; no per-tool copies.
Required final native acceptance stays in the linked acceptance home and must
finish before release, independently of deterministic implementation completion.
