# Keep registered CI revisions truthfully observed

Status: in execution; Story Branch Mode; slices 1–2 delivered, slice 3 next.

## Source and outcome

Identity: SEED-004#keep-ci-observation-truthful

Source: [selected story](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#keep-ci-observation-truthful).
Terry accepted the bounded refinement and requested a slice plan, refined if
needed, on 2026-09-21. This authorizes planning, not implementation.

During active observation, the owning agent receives discovered CI failures for
registered revisions and learns when observation is lost. This bounded reliability
response supports parallel trunk execution; it is not a prerequisite for dashboard
detail. Preserve current backlog placement and near-future direction.

Evidence: [ODF-065](../../../docs/maintainer/finding-names.md#odf-065--dead-ci-workers-remain-reported-as-attached)
records dead-worker attachment reassurance; the missed revisions passed, and ENOSPC
as cause remains inference. [ODF-069](../../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results)
records a failed revision missed until manual investigation and another execution
with missing green verdicts. Discovery latency alone is not established as cause.

## Scope and current decisions

- Start with successfully established observation. Preserve one observer per
  repository/target/coordinator, exact registered revision ownership, asynchronous
  delivery, existing observation budgets, and existing failure-repair decisions.
- Report known loss at the next supported coordinator boundary. No interrupt or
  background-agent guarantee. A registration receipt or binding cannot establish
  worker health; a live PID alone cannot establish useful coverage.
- While observation remains active, an initial discovery gap must not prevent
  later discovery, verdict recording, or delivery. Distinguish pending discovery,
  actual failure, unavailable provider evidence, and terminated observation.
- At shutdown, report observed revision verdicts and unresolved revision identities
  through the existing coverage records/host report. No new report schema is
  prescribed. Preserve unread evidence, acknowledgment ordering, and other owners.
- Stop ends the observation promise. Do not wait for remote CI to finish. A normal
  stop with evidence differs from an unexpected end without terminal evidence.
- Diagnose a reproduced miss before choosing repair; do not widen polling limits
  or add retry machinery merely because the finding mentions three polls.

Deferred: automatic restart, stalled-but-alive detection, startup/runtime-path
discovery, unsupported workflows or new providers, deployment monitoring,
integration scheduling, dashboard CI displays, indefinite post-execution monitoring,
and synchronous CI waits. No release/version bump or installed managed-copy edits.
These exclusions do not prohibit a naturally general implementation.

## Existing solutions and architecture

PFE inspection at `e9829bc6088567742fefd2a726f6bbe7da9bc039` supports changing
existing owners rather than adding a monitor or duplicate state:

- `src/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs` owns registered
  revision coverage, worker identity, events, acknowledgment progress, and terminal
  evidence. `observeRevisionCoverage` already revisits uncovered rows and can
  replace them with verdicts. Keep this canonical representation.
- `ci-mailbox-worker-process.mjs` already checks process existence and exact
  worker command identity before termination. Assess reuse of its read-only
  identity checks for liveness; checking must not acquire termination behavior.
- `ci-host-hook.mjs` binds receipts to owners and delivers events. It currently
  emits attachment from the receipt without checking the worker. This is the
  detached observer's relevant coordinator interaction boundary.
- `references/ci-notify-codex.md` owns the yielded stream binding. Its normal
  end path currently stores `finished` when terminal evidence is absent; only
  thrown errors notify loss. Preserve its host-specific delivery and retained
  handles rather than transplanting detached-worker assumptions.
- `watch-ci-execution.mjs` owns repeated acquisition, failure delivery, and
  coverage observation. `ci-runs.mjs` owns GitHub startup selection, the bounded
  recent-run list, and retention of already-seen unfinished runs. Check these
  boundaries in diagnosis; their presence is not proof of the historical cause.
- `ci-revision-coverage.test.mjs` already exercises a delayed custom-adapter
  success through the worker and records. It does not establish late GitHub
  failure delivery to a host. Existing lifecycle tests sometimes inject an event
  directly, proving delivery only, not acquisition.
- Codex's documented-cell evaluator, configured Claude/Cursor lifecycle fixtures,
  and real mailbox process fixtures supply reusable observation boundaries.
  Dashboard readers and backlog scripts own different facts and need no changes.

Common rule: observation claims require evidence from the owned observer; later
evidence can refine a temporary gap until observation ends. Host differences
concern how that evidence reaches the coordinator, not separate coverage models.
No preparatory Structure slice or new framework is justified.

Follow [AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(small useful increments, one conceptual owner),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source/release distinction),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic behavior versus native evidence), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(shared runtime rule and minimal host adaptation).
Index and in-file statuses agree: 0000–0006 Accepted; 0007–0008 Proposed.
The [North Star](../../NORTH-STAR.md#shared-work-publication-with-replaceable-workspace-coordination)
separates publication from revision-specific CI coverage. This plan follows that
topic without changing it. No ADR conflict or new consequential direction identified.

## Proof strategy and execution gates

Use disposable processes, a local fake provider command, and the real observer /
host bindings. The provider supplies run responses only: never inject the expected
CI_FAILURE, coverage transition, or loss notification to prove their production.
Control poll advancement at the existing seam for bounded deterministic checks;
include a real-process boundary where process death is the behavior.

Inspect setup and assertions before extending fixtures. Reuse existing behavior
proof only for what it observes. A record changing is insufficient for a host
delivery promise. Observe coordinator-visible output, exact revision/owner, and
the final coverage records together. Poll timing in tests is not a new product
timeout. Kill only a verified fixture-owned worker; keep an unrelated fixture
observer alive as an isolation control.

Each slice owns focused red/green proof, required source guidance alignment, and
slice-local cleanup. Relevant commands below are execution commands, not claims
of runs performed during planning. Record actual setup/observation paths, literal
commands, candidate, results, and proof limits here when execution occurs.

Use normal execution proof acceptance, independent post-change refactoring,
descriptive imperative commits, delivery and asynchronous CI once authorized.
Edit runtime source under `src/skills/`; do not synchronize installed copies.
For any guidance change, perform AGENTS.md's invocation/context/useful-outcome
review. At story completion run `bash tests/execution-ci-runtime.sh` and
`git diff --check`. Existing CI owns `npm run lint` and `npm test` (Bash 4+).
If runtime dependency declarations change, also run existing
`bash tests/execution-payload-update.sh` and `bash tests/install-ci-host-hooks.sh`;
unchanged installer plumbing does not require a new installation story.

Native evidence: configured-hook replay and documented-cell evaluation are
deterministic integration proof, not native host acceptance. For each affected
Claude, Cursor, and Codex requirement, execution must assess recoverable native
evidence for reuse against the actual changed boundary. Where the host contract
is invalidated, obtain a bounded fresh native disposable journey observing the
notification at the coordinator; do not supply the expected answer in the prompt.
Use existing host interfaces and fixtures, not a new native runner framework.
Record candidate/runtime and observed output. A missing observation remains
pending and cannot become a release claim. If native acceptance must be deferred,
retain this plan's incomplete obligation or link an authorized acceptance story
under ADR 0005; implementation completion cannot silently waive it.

## Ordered slices

### 1. Expose a dead detached observer at the next coordinator interaction

Type: Behavior
Status: delivered

Delivered 2026-09-21. `mailboxWorkerLoss` (new, `ci-mailbox.mjs`) is a read-only
aggregator: it reuses `checkMailboxWorkerLiveness` (new, `ci-mailbox-worker-process.mjs`,
reusing the same PID+command identity rule as termination without ever signaling
a process) to detect a dead worker with no recorded terminal result, and records
loss via `recordLostTerminalResult` (generalized, `ci-mailbox-store.mjs`, now
takes a distinct `reason` and preserves `unproved` revisions). `ci-host-hook.mjs`
calls it from both the receipt-attachment path and the ordinary bindings-delivery
loop, so detection does not depend on a fresh push. A normal stop still leaves
`coverage.state: "ended"`, never `"lost"`.

Post-change refactor split the touched files at the project's 250-line limit and
collapsed test-setup duplication: `ci-mailbox-store.mjs` now delegates revision-coverage
functions to new `ci-mailbox-revision-coverage.mjs` and the atomic-write helper to
new `ci-mailbox-json-file.mjs` (public exports unchanged); the worker-loss tests and
Claude/Cursor host-adapter fixtures moved into new sibling files (`ci-mailbox-worker-loss.test.mjs`,
`ci-claude-lifecycle-test-fixtures.mjs`/`ci-claude-worker-loss-lifecycle.test.mjs`,
`ci-cursor-lifecycle-test-fixtures.mjs`/`ci-cursor-worker-loss-lifecycle.test.mjs`).
The focused command below is updated to the post-split file set; the same 21
behaviors it originally covered still pass under it.

Behavior: Given a successfully bound detached observer whose worker dies while
mailbox writes remain possible, the next ordinary owning coordinator interaction
reports lost observation rather than healthy attachment.

Change the existing mailbox/host boundary using verified worker identity and
existing event/coverage ownership. Check normal interactions as well as receipt
attachment so detection does not depend on another push. Distinguish an intentional
completed stop from an unexpected death. Do not signal, restart, guess the newest
mailbox, or consume another coordinator's evidence. Align applicable host guidance.

Proof: Start and bind a real disposable worker; register a revision; retain one
unread event; terminate that exact worker without a normal terminal result. Verify
receipt writes still succeed. Invoke the configured owning hook with an ordinary
interaction and observe loss, not reassuring attachment. Repeat with a new receipt;
it must not restore a healthy claim. On stop, unresolved revisions remain explicit
and the earlier unread event is preserved until its actual delivery. A different
coordinator must not consume it; an unrelated observer remains alive. A normally
stopped observer must not be mislabeled as unexpectedly dead. Exercise the shared
decision once and Claude/Cursor output/ownership differences through their adapters.

Focused command (post-refactor file set; extends the same real boundaries):
`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-launch.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-worker-loss.test.mjs src/skills/dough-execute-plan/scripts/ci-claude-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-claude-worker-loss-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-cursor-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-cursor-worker-loss-lifecycle.test.mjs`
Result: pass, 21/21 (independently rerun by the coordinator both before and after
refactor). Broader confirmation also rerun: `ci-mailbox.test.mjs`,
`ci-revision-coverage.test.mjs`, `ci-codex-lifecycle.test.mjs`,
`ci-codex-stop-lifecycle.test.mjs`, `ci-observer-stream.test.mjs`,
`ci-host-hook.test.mjs` (32/32), and `bash tests/execution-ci-runtime.sh` (114/114).
`git diff --check` clean.

Sizing: one loss-detection decision and real-process proof loop; medium confidence.
PID reuse/mismatched identity must yield uncertainty rather than reassure or kill
an unrelated process. Necessary factoring of existing identity checks belongs here.
Safe stopping point: detached-host loss is visible; stream loss and late verdicts
remain explicitly unfinished.

### 2. Report a Codex stream ending without terminal evidence as lost observation

Type: Behavior
Status: delivered

Delivered 2026-09-21. `references/ci-notify-codex.md`'s documented launch cell now
stores `status: 'lost'` and sends `CI_MONITOR_UNAVAILABLE` when the stream ends
without ever parsing a `CI_OBSERVER_RESULT` line, instead of defaulting to
`'finished'`. A real parsed terminal result keeps its previous meaning
(`stopped`/`finished`); the existing thrown-error path is unchanged. Proof
exercises both a synthetic-chunk cell evaluation and a real disposable process
exit (via the existing `completingFixture` lifecycle fixture bridged into the
documented cell), so a real OS exit — not only synthetic input — drives the
classification. Post-change refactor extracted the new real-process test and
its `bridgeCodexStream` helper into new `ci-codex-observation-loss-lifecycle.test.mjs`
(mirroring slice 1's `*-worker-loss-lifecycle.test.mjs` split precedent) to keep
`ci-codex-lifecycle.test.mjs` under the project's 250-line limit; that file is
otherwise unchanged from before this slice.

Focused command:
`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs src/skills/dough-execute-plan/scripts/ci-notify-codex-stop.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-observation-loss-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-stop-lifecycle.test.mjs`
Result: pass, 12/12 (independently rerun by the coordinator both before and
after refactor). Broader confirmation also rerun:
`bash tests/execution-ci-runtime.sh` (116/116). `git diff --check` clean.

Behavior: Given an established Codex observer stream, when the host observes its
exit without matching terminal evidence, the coordinator receives an unavailable
observation signal instead of a normal-finished claim.

Apply the same evidence rule in the existing documented host binding. Preserve
directory/PID/coordinator context needed for exact recovery, delivered events and
the existing no-wait/no-restart boundary. A normal terminal result retains its
actual meaning; missing or incomplete terminal output cannot establish closure.

Proof: Evaluate the actual documented launch cell with a receipt, a failure event,
and then a host session ending without a terminal record (no thrown tool error).
Observe the prior failure delivered and explicit loss notification with retained
observer identity. Contrast a matching normal terminal result and a tool-error
exit; do not label a valid stop as death or swallow the existing error notification.
Exercise a disposable stream process exit through the existing lifecycle fixture
so synthetic chunks alone are not the sole exit proof. Preserve independent
observers and nonblocking local shutdown behavior.

Focused command (post-refactor file set; extends the same real boundaries):
`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs src/skills/dough-execute-plan/scripts/ci-notify-codex-stop.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-observation-loss-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-stop-lifecycle.test.mjs`

Sizing: one stream-end classification and proof loop; medium confidence. Reuse
the existing documented-cell evaluator instead of rewriting the binding in tests.
Safe stopping point: both host delivery mechanisms report evidenced observation
loss; late-run delivery remains owned by slice 3.

### 3. Deliver a registered revision's late-discovered failure

Type: Behavior
Status: delivered

Delivered 2026-09-21. Diagnosis-first outcome, as the plan anticipated: the
existing GitHub-acquisition/coverage/host-delivery mechanism already retries an
uncovered revision and delivers a real later verdict — `observeRevisionCoverage`
unconditionally overwrites `"uncovered"` state when a matching run later
appears, `createGitHubRunAcquisition` includes any not-seen-at-startup run on
later polls, and `watchCiExecution` runs `observeCoverage`/`acquireFailure`
from the same per-poll result. No production behavior change was made; none
was warranted. A new faithful end-to-end test (`ci-revision-coverage-late-github-failure.test.mjs`,
controlling only the `gh` transport seam, driving the real functions) proves
this for the GitHub path specifically (previously proven only for a
custom-adapter and a single-poll GitHub gap): a 3-poll discovery gap, then a
run appearing `in_progress` then `failure`, delivers real `CI_FAILURE` to the
owning coordinator; an unresolved sibling revision stays `"uncovered"` at
shutdown without downgrading the delivered verdict; a second, differently-owned
revision's independent failure stays isolated to its own coordinator. One small
`references/ci-monitor.md` clarification was added: `CI_COVERAGE_UNAVAILABLE`
is a temporary discovery gap, not ended observation — confirm a revision's
actual final state from coverage/records at the observer's own stop, not from
an early `CI_COVERAGE_UNAVAILABLE` alone.

Remaining evidenced-but-unfixed boundary (explicitly out of this slice's scope,
per "No timing-policy exception assumed"): `ci-runs.mjs`'s bounded listing
(`--limit 20` ongoing / `--limit 100` startup) can still silently miss a run on
a busy/shared branch with enough concurrent pushes to push it out of that
window before it's ever seen — a plausible, distinct candidate cause for
ODF-069's historical misses (occurrence 1 was on a shared branch with
concurrent pushes), not reproduced or repaired here. See the ODF-065/ODF-069
response recording below.

Post-change refactor: collapsed a locally-reinvented GitHub run-response
builder into the existing shared `run()` in `watch-ci-test-fixtures.mjs`, and
split the new 289-line test file (over the 250-line limit) into
`ci-revision-coverage-late-github-failure.test.mjs` (192 lines, the single
proof scenario) and a new sibling `ci-revision-coverage-late-github-failure-test-fixtures.mjs`
(94 lines, the GitHub-transport fakes and polling helpers). The coordinator
additionally fixed one mechanical `prefer-const` lint finding the refactor
pass hadn't run `npm run lint` to catch (four cleanup-safety `let` bindings
assigned once but declared early so an early-registered `t.after` can guard
partially-failed setup) with a documented `eslint-disable-next-line`, matching
this codebase's existing single-line-disable-with-rationale convention;
retested after the fix.

Behavior: Given a registered revision absent during initial discovery, when its
run later becomes discoverable and fails while observation remains active, the
owning coordinator receives the actual failure and final coverage retains that
verdict for the exact revision.

First establish the missing boundary with controlled provider responses through
the existing GitHub acquisition, worker, and host-delivery path. Inspect available
ODF-069 evidence and distinguish provider selection, coverage update, event creation,
and host consumption. The custom-adapter late-success test is counterevidence to
the claim that uncovered rows are never retried. Check startup selection and
bounded listing only where evidence supports them; do not broaden provider scope.

Once a faithful failing case identifies a cause, repair its existing owner and
retain that regression through host delivery. If the faithful case already passes,
record exactly what it proves and investigate the remaining evidenced boundary;
do not manufacture a production change. If the historical miss cannot be explained
or reproduced within this boundary, preserve the proven cases and leave ODF-069
unresolved. Reassess this slice before another speculative repair or expansion.

Proof: Register revision A, present no matching run beyond the existing initial
discovery window, then expose its running and failed attempt. The observer remains
active throughout. Observe the temporary limitation followed by CI_FAILURE for A
at the owning host; inspect shutdown coverage/records to see failure, not stale
uncovered. Include another owner's revision as a negative ownership control.
In the same journey register B whose run never becomes available: shutdown reports
B unresolved without waiting for remote completion or downgrading A's verdict.
Retain the existing custom-adapter late-success proof and adapter delivery controls.
Do not synthesize the failure event or update the coverage record from the fixture.

Focused command (post-refactor file set):
`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-revision-coverage.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs src/skills/dough-execute-plan/scripts/watch-ci-execution-coverage.test.mjs src/skills/dough-execute-plan/scripts/watch-ci-execution-startup.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs`
Result: pass, 21/21 (independently rerun by the coordinator before refactor,
after refactor, and after the prefer-const fix). Broader confirmation also
rerun: `bash tests/execution-ci-runtime.sh` (117/117). `git diff --check` and
`npm run lint` clean.

Extend the existing host process fixture to carry the acquired event to the owner;
run any new test explicitly and through `tests/execution-ci-runtime.sh`. Reuse the
unchanged host-specific proofs from earlier slices where their boundaries match.
Align the shared CI guidance only where needed to distinguish temporary discovery
limits from ended observation.

Sizing: one late-verdict journey; lower confidence until a failing boundary is
identified. Diagnosis, repair, focused proof and cleanup belong to this slice, not
a speculative preparatory implementation slice. No timing-policy exception assumed.
Safe stopping point: the demonstrated verdict arrives or a specific observation
limitation remains; unresolved historical causation is not reported as fixed.

After the relevant proof, update ODF-065 and ODF-069 individually with their actual
response, implementation commits, recoverable story locator, and first containing
release or explicitly pending release. Do not mark both resolved merely because
one mechanism was repaired. Do not start an effectiveness watch from release date.
This is response recording, not an additional product behavior slice.

## Promise ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| Dead detached worker cannot remain reassuringly attached | 1: real worker death, ordinary hook output and repeated receipt |
| Stream exit without terminal evidence is not successful closure | 2: documented cell notification/state and real stream exit |
| Late-discovered failure reaches its owning coordinator | 3: provider responses through real worker to host output |
| Final coverage retains actual verdicts and unresolved identities | 1: dead-worker stop; 2: missing terminal limit; 3: failed A and unresolved B |
| Exact identity, unread evidence and unrelated observers survive | 1/2 isolation controls; 3 revision/owner control |
| Existing asynchronous execution and bounded shutdown remain | All slices: no remote completion wait, existing lifecycle controls |
| Native host behavior is supported or explicitly pending | Each affected slice: per-host evidence/reuse assessment under ADR 0005 |
| Findings accurately describe response and release status | Relevant slice completion and final per-finding evidence review |

## Plan refinement assessment

Reviewed on 2026-09-21 under Terry's explicit request to refine if needed.
The initial two-outcome outline combined two host death mechanisms. Separate the
detached-hook journey and Codex stream-end journey as slices 1 and 2; they have
different triggers and proof loops. Slice 3 remains one acquired late-verdict
journey, with final coverage an observation of that same verdict rather than a
separate reporting project. Result: three Behavior slices; no Structure slice.

Cumulative design remains one coverage representation and one evidence rule with
necessary host delivery adaptation. No watchdog service, duplicate ledger, generic
scheduler or per-error policy is introduced. Manual CI inspection remains a useful
diagnostic fallback but does not deliver the selected asynchronous outcome.

Slices 1 and 2 are cohesive, bounded proof loops. Slice 3 retains a concrete
diagnostic uncertainty: code already retries uncovered revisions, so the cause and
repair size cannot be honestly promised yet. Further speculative subdivision does
not resolve that uncertainty; its explicit diagnosis/reassessment boundary does.
No numeric target, hard limit, S/M/L definition or repeated-overrun threshold was
supplied; none is invented. No sizing exceptions or story resplit recommendation.
No completed slices were replaced. Execution has not begun and is not authorized
by this planning request. Do not treat this assessment as proof of behavior.

## CI repair disposition: slices 1 and 2's delivered SHAs

Recurred identically on slice 2's delivered SHA `1ab85d4` (run 35565673278,
attempt 1): same job (`test`), same step (`scripts/check-self-installation.sh`),
same zero-output-then-exit-1 signature. The diff between `8a7c770` and `1ab85d4`
(slice 2's actual change, `ci-notify-codex.md`/`ci-notify-codex*.test.mjs`) is
disjoint from slice 1's diff and, like slice 1, touches nothing this check reads
— reinforcing rather than weakening the disposition below: the same failure mode
recurring across two unrelated diffs on this branch points at the runner/branch
environment, not either commit's content. No further per-SHA investigation
repeated; same disposition applies. Not retried a second time for this SHA
given attempt 1's original evidence already covers this exact signature.

`8a7c770` (slice 1's delivered commit) reported `CI_FAILURE` on the `test` job,
step `scripts/check-self-installation.sh`, both on first discovery (run
35563951915 attempt 1) and on one targeted rerun (attempt 2) — same step, no
stdout from the script itself beyond "Running scripts/check-self-installation.sh"
before `Process completed with exit code 1`, meaning none of that script's own
explicit error messages (missing tag, materialize failure, record disagreement,
managed-payload mismatch) fired.

Disposition: CI infrastructure/environment, not a defect in this delivery.
Evidence: (1) `check-self-installation.sh` only compares each installed managed
copy (`.claude/skills`, `.agents/skills`) against the `v0.3.27` git-tagged
archive; slice 1 touched neither those installed copies nor `install.sh`. (2)
The exact failing commit, checked out fresh (both a plain local clone and a
matched `ubuntu:24.04` Docker container reproducing the runner's git 2.43,
mawk 1.3.4, GNU tar 1.35), passes this check cleanly. (3) The actual CI
checkout log confirms `v0.3.27` and all other tags were fetched normally. (4)
The immediately preceding CI run on the unchanged parent commit (`a81a305`)
passed the identical check. (5) The plan's own existing evidence (ODF-065)
already names ENOSPC as a suspected cause of this CI environment's flakiness;
zero-output abrupt termination here is consistent with a resource-related kill
rather than a normal assertion failure. No repair action taken; this is not a
defect this story's slices address. Continuing execution.

## Preparation and current state

Planning preparation checkout `/Users/terryyin/git/open-dough-ci-planning` (branch
`codex/plan-truthful-ci`) was merged onto main and removed on 2026-09-21, as
authorized. That preparation is closed; the following identity is execution's own.

Execution mode: Story Branch Mode.
Taken claim commit: `a81a305e90dcc56d7af894086b14aece7c7492e4` (backlog entry moved
to Taken and published to `origin/main` before workspace creation).
Execution checkout: `/Users/terryyin/.claude-worktrees/open-dough/068-truthful-ci-observation`,
branch `claude/068-truthful-ci-observation`, created from the published claim SHA above.
Integration checkout: `/Users/terryyin/git/open-dough`, branch `main`, remote
`git@github.com:terryyin/open-dough.git` — used for the Taken claim (already
published) and later story-wrap-up integration; not the per-slice push target.
Per-slice delivery push destination (Story Branch Mode): `origin`, branch
`claude/068-truthful-ci-observation` (the execution branch itself). It does not
merge into `main` here; that happens at story wrap-up.
CI observer: GitHub default (`ci.yml` / display name `CI`), repository
`terryyin/open-dough`, target branch `claude/068-truthful-ci-observation` (the
Story Branch Mode push destination, per "Own one observer"), directory
`/tmp/dough-ci-501/watch-r1Rzs7`, armed from the execution checkout above on
2026-09-21. An earlier observer armed against `main` in error was stopped
cleanly before any registration (`pendingCi: unobserved`, no coverage lost);
the Taken claim publication to `main` remains unobserved by this execution, as
expected for a Story Branch claim.
