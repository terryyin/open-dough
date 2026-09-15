# Customize execute-plan's CI watcher for a project's own CI server

## Source and authority

[SEED-011 Story 1](../../seeds/SEED-011-customize-project-ci-watcher.md#customize-project-ci-watcher).
Status: execution in progress; configuration location resolved; Slice 1
delivered. User request on 2026-09-15 authorizes execution. The story is Taken
in the product backlog.

## Execution identity

- Originating checkout: `/Users/terryyin/git/open-dough`, branch `main`; the
  queue claim is commit `1d54151`.
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/story-34`,
  branch `codex/034-custom-ci-watcher`, based on planning commit `8cddfdb`.
- Integration target: `main`.
- Authorized push destination: `origin`, execution branch
  `codex/034-custom-ci-watcher`.
- CI observer: Codex yielded cell `17`, stream session `79690`, mailbox
  `/tmp/dough-ci-501/watch-CxzbNe`, PID `38539`, coordinator `root`; repository
  `terryyin/open-dough`, branch `codex/034-custom-ci-watcher`, workflow selector
  `ci.yml`, display name `CI`, execution checkout as above. Stopped cleanly
  after Slice 1 with no unread evidence and `pendingCi: unobserved`.
- Current CI observer: Codex yielded cell `35`, stream session `55144`, mailbox
  `/tmp/dough-ci-501/watch-7eHXCN`, PID `64527`, coordinator `root`; repository,
  branch, workflow, and execution checkout unchanged. Stopped during the Slice
  2 CI repair with both recorded failures accounted for and `pendingCi:
  unobserved`.
- Current CI observer: Codex yielded cell `56`, stream session `15863`, mailbox
  `/tmp/dough-ci-501/watch-fuzCmU`, PID `49630`, coordinator `root`; repository,
  branch, workflow, and execution checkout unchanged.

## Goal and scope

Release public Open Dough support for a project CI command adapter and its
standalone manual. Verify asynchronous failure handoff, exact-revision coverage,
bounded local evidence, token-free observation, and the empty-config GitHub
Actions default through controlled command/process and applicable host proof.

The maintainer explicitly removed the real Pygardon repair loop from this story.
After release, the maintainer takes adoption, adapter authoring, and real-use
validation to Pygardon and returns findings as new Open Dough input. Neither
Pygardon access nor its log endpoint is a prerequisite for this release.

Exclude CI dispatch/retries, branch-policy changes, building Pygardon's server,
additional providers, multiple-check aggregation, webhooks, authentication
management, new notification transports, and advanced log analysis. These are
deferred promises, not reasons to reject naturally supported cases.

## Existing solutions and architectural context

PFE assessment (source inspected during planning):

- `src/skills/dough-execute-plan/scripts/watch-ci-execution.mjs` already owns
  bounded polling, tracked unfinished runs, startup history, attempt handling,
  and incremental failure events. Change this shared mechanism; do not add a
  separate watcher per provider.
- `ci-runs.mjs` and `ci-failures.mjs` embed `gh` commands, GitHub workflow/branch
  filtering, numeric attempt enumeration, and job diagnostics. Isolate those
  provider responsibilities without forcing Pygardon to impersonate GitHub.
- `watch-ci.mjs`, `ci-mailbox.mjs`, host hooks, and `ci-observer-stream.mjs`
  already provide process launch, delivery, ownership, and shutdown. Reuse them.
  Preserve installed-checkout binding and existing non-model delivery.
- `references/ci-monitor.md` owns repair; `runtime-setup.md` currently assumes
  authenticated `gh` and push-triggered Actions. Adapt provider-dependent setup
  and evidence reading there; do not duplicate the pause/stash/repair protocol.
- Run discovery alone cannot identify a pushed SHA with no run. The expected
  revision must come from successful execution delivery, independently of CI.
- `install.sh` and `src/install/open-dough-release-version.sh` declare the
  payload. Reuse their install/update path and existing preservation tests;
  do not introduce a second documentation installer.

Relevant Accepted ADRs (index and records inspected):

- [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): one
  project-owned configuration at `.planning/open-dough.json`, separate from
  managed content.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  early feedback and one coherent domain model. Use run/attempt identity, checked
  SHA, outcome, and diagnostic evidence throughout; provider translation belongs
  at acquisition, not in host hooks and repair orchestration.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  matching complete payload and immutable tag; maintainer selects the version.
- [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  locally available support, shared native layouts, preserved project settings.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic integration proof plus native evidence or justified reuse for
  affected Codex, Cursor, and Claude Code requirements. One host proves only
  that host's behavior. No automatic whole-matrix expansion.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one shared source addressing the executing project. The optional manual is
  shipped but not linked or loaded by skills, as explicitly requested.

No North Star location was found or new topic warranted. Existing structure and
accepted feedback/reuse principles suffice; this plan makes no new ADR decision.

## Decisions and dependencies

### Configuration location: resolved

On 2026-09-15, Terry Yin selected the established planning-directory convention:
one project-owned `.planning/open-dough.json`, shared across tools and separate
from managed content. ADR 0001 and ADR 0004 now record the same location. This
avoids competing files, invented search precedence, and migration work; absence
continues to select defaults. Slice 2 and dependent installation work may
proceed with this location.

### Small contract choices

Use `ciAdapter: []` as the empty/default setting and an argument array such as
`["python3", "scripts/dough-ci.py"]` for customization. Absence also defaults;
do not create a configuration file solely to materialize an empty default.
Launch directly, without shell interpolation, in the selected execution checkout.
Read configuration once per observer lifetime. These are planning choices;
revise them in place if inspected project conventions require a smaller fit.

Keep the adapter request/response as bounded JSON over a subprocess boundary,
using the existing Node runtime and cancellation/time bounds. Separate discovery
and diagnostic retrieval by operation so normal polls cannot return full logs.
Represent opaque run and attempt identities, exact SHA, pending/success/failure/
incomplete outcome, and optional URL/time. Keep GitHub's job detail and numbered
history in its provider; retain its current failure protection. Settle exact
field names and retained-attempt retrieval against the supplied requirements
and a controlled adapter example during Slice 2. No generic plugin protocol or version-negotiation system.

Use a finite 16 KiB UTF-8 diagnostic excerpt ceiling per failure event, with
explicit truncation/unavailability and bounded metadata. The adapter filters
locally; the shared boundary enforces the ceiling. This is a starting bound,
not a claim that arbitrary truncation always yields useful repair evidence.

Expected SHAs come from confirmed successful pushes in ordinary and repair
wrap-up. Use a small local record in the existing execution observer state;
record the pushed SHA, not a later moving HEAD. The same observer follows later
pushes. Failure to register a delivered revision is lost coverage, not success.
No new polling of an AI agent or automatic server trigger is involved.

### Release and later adoption

Use controlled adapters and local fixtures to prove Open Dough's contract.
No live Pygardon endpoint, response sample, checkout, log API, or repair trial is
required. Do not build a Pygardon-specific adapter in this story. The released
manual enables the maintainer to undertake that work in Pygardon afterward.

The maintainer's release version is needed for Slice 8. Publication remains an
execution action; this planning request does not itself authorize a release.

## Ordered slices

Each slice includes its focused proof and local cleanup. No numeric slice budget
was supplied; each has one outcome/proof loop, not an invented time estimate.
Do not deliver a deliberately failing intermediate state. Carry working
regression protection across all slices.

### 1. Separate CI acquisition while preserving GitHub observation

Type: Structure
Status: done

Change: Isolate provider-specific run discovery, attempt refresh/history, and
failure evidence from the shared observer. Immediately enables Slice 2.
Preserve current CLI, event behavior, GitHub selection, unfinished-run retention,
and prior failed-attempt protection. Add no unused provider framework.

Proof: Existing observer startup, coverage, and failure tests pass at the
`watchCiExecution` boundary, including failed prior attempts followed by success.
Run `node --test src/skills/dough-execute-plan/scripts/watch-ci-execution*.test.mjs`
and the existing `ci-client-configuration.test.mjs` test. Inspect the assertions
for preserved outputs, not just exit status.

Stopping point / sizing: GitHub behavior unchanged. One refactoring proof loop;
numeric GitHub history assumptions are the main structural uncertainty.

Accepted proof (2026-09-15):

- `node --test src/skills/dough-execute-plan/scripts/watch-ci-execution*.test.mjs`
  passed 17/17 at the public `watchCiExecution` boundary. The controlled GitHub
  responses in `watch-ci-execution-failures.test.mjs` supply the starting run
  and attempt states; its `reports a failed prior attempt after the latest
  attempt succeeds` assertion observes the preserved earlier failure event.
  The existing startup, coverage, and failure cases observe workflow/branch
  filtering, retained unfinished runs, history errors, cancellation, bounds,
  and event shapes through the same boundary.
- `node --test src/skills/dough-execute-plan/scripts/ci-client-configuration.test.mjs`
  passed 1/1. Its sole test supplies controlled GitHub results and observes the
  configured GitHub workflow selector/name, non-main branch selection, and
  deployment exclusion through `watchCiExecution`.
- The independent refactor kept those implementation and observation
  boundaries unchanged. `npm run format` completed successfully after
  installing the worktree's locked dependencies with `npm ci`; all touched
  Slice 1 files are at or below 250 lines.

### 2. Observe a project command's CI attempts

Type: Behavior
Status: done

Behavior: Given a configured command and one selected check, launching the
normal observer follows its attempts without an Actions workflow or `gh` setup.
Absent/empty customization retains GitHub. Pending and successful polls cause
no agent notification; distinct attempts remain distinguishable.

Proof: Extend the real CLI/process fixture boundary with an executable adapter
returning opaque identities and pending → success. Assert source selection,
repeated polling, quiet output, retained attempt identity, and that `gh` was not
invoked for the custom source. Check empty/absent configuration against the
existing GitHub fixture. Maintain necessary source/runtime payload declarations
with each introduced dependency so intermediate installations remain complete.

Stopping point / sizing: Usable custom observation, with coverage still limited
until Slice 3. One source-selection journey; use a controlled command example
to settle contract details without requiring Pygardon access.

Accepted proof (2026-09-15):

- `node --test src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs`
  passed 5/5. `projectFixture` supplies a temporary project configuration,
  executable adapter, and fake `gh`; the production CLI selects the adapter
  without invoking `gh`. The public watcher test rewrites configuration after
  the first call yet observes repeated discovery through the originally
  selected command, quiet pending-to-success events, discovery-only requests,
  exact SHA/outcome mapping, opaque identities, and collision-safe attempt keys.
  Empty and absent settings observe GitHub discovery with no adapter call.
- `node --test src/skills/dough-execute-plan/scripts/watch-ci-execution\*.test.mjs`
  passed 17/17 and
  `node --test src/skills/dough-execute-plan/scripts/ci-client-configuration.test.mjs`
  passed 1/1 at the unchanged GitHub observer boundary.
- `bash tests/execution-ci-runtime.sh` passed 71/71 across the maintained
  runtime, CLI/process, mailbox, and host lifecycle boundary.
  `bash tests/execution-payload-update.sh` passed for install, update,
  relocation, collision protection, forced restoration, and hook handling with
  the new runtime module declared in every payload list.
- The independent refactor removed an undocumented polling environment setting
  and reused the watcher's existing injected-sleep seam. The real CLI selection
  observation remains. `npm run format` completed successfully, and every
  touched Slice 2 file is at or below 250 lines.

Learning: run and attempt identifiers are opaque values, so shared attempt keys
use tuple serialization rather than delimiter concatenation. Later coverage,
diagnostic, and deduplication work must preserve that identity rule.

CI repair (2026-09-15): GitHub runs `34934932399` at `44995eb` and
`34935086435` at `afd7ffc` passed lint and the 71/71 execution runtime boundary,
then failed `tests/dough-update-guidance-payload.sh` because the newly managed
`ci-command-adapter.mjs` path was absent from the installation guide's complete
payload enumeration. The guide now names that path; the focused test passes.
At Terry Yin's direction, the same repair removes its obsolete recognition
transition note and legacy-bootstrap section while deferring the guide's
remaining over-250-line refactor. Slice 3 remains planned and was paused before
making changes, so this repair invalidated none of its proof.

### 3. Report the actual pushed revision's coverage

Type: Behavior
Status: done

Behavior: After successful execution delivery registers SHA A, the observer
reports A uncovered when only B has a CI result; it records A pending/success
only from an actual check of A. Later repair pushes extend the same execution.

Proof: A temporary Git repository and delivery fixture push A, register it through
the production delivery path, and offer B's green result. Observe uncovered A
without code-failure classification; then supply an A attempt and observe its
transition. Include a repair push C. Capture silent coverage state separately
from intervention events so success does not wake an agent. Do not have the
fixture prepopulate coverage as if the product had recorded the push.

Apply existing observation bounds to discovery delay. On shutdown, pending or
unchecked SHAs remain unproved. Changes must not add a synchronous CI wait to
routine push wrap-up. Lost push registration reports a coverage limitation.

Stopping point / sizing: Accurate revision coverage even without diagnostics.
One revision-coverage rule; connecting successful pushes to observer state is
this slice's main integration concern.

Accepted proof (2026-09-15):

- `ci-revision-coverage.test.mjs` creates a temporary repository and bare
  remote, pushes ordinary revision A and repair revision C before invoking the
  production `ci-mailbox.mjs register-push` command, and never prepopulates the
  coverage store. A green attempt for SHA B leaves A uncovered after the bounded
  three-poll discovery delay without producing `CI_FAILURE`; an exact pending
  then successful A attempt updates A while producing no success notification.
  The same observer tracks C, and shutdown reports its pending state as unproved.
- The focused watcher, adapter, mailbox, and revision journey passed 32/32 after
  the independent refactor and formatter. `bash tests/execution-ci-runtime.sh`
  passed 73/73, `bash tests/execution-payload-update.sh` passed, and
  `git diff --check` passed.
- Delivery guidance resolves the full SHA immediately before an ordinary or
  repair push and registers it only after confirmed push success. Registration
  failure is explicitly lost coverage; delivery still performs no synchronous
  CI wait. Persistent pending/success state stays in the mailbox coverage store,
  while the one bounded missing-attempt transition publishes
  `CI_COVERAGE_UNAVAILABLE`.
- The independent refactor consolidated revision outcome selection without
  changing the public boundary. Formatting exposed and the coordinator repaired
  one unused-fixture-parameter lint error and one 251-line expansion. Every
  touched implementation and test file is now at or below 250 lines.

Learning: expected-revision coverage must be registered from confirmed delivery;
run discovery alone cannot prove that a pushed revision was ever checked.

### 4. Deliver useful bounded failure evidence

Type: Behavior
Status: done

Behavior: A failed custom attempt yields its identity, SHA, and locally filtered
bounded diagnostic excerpt through the observer event path.

Proof: Use the CLI fixture with a large local log containing a known error among
noise. Assert the error survives filtering, the event stays within the excerpt
ceiling, raw logs never enter events, and truncation/unavailable detail is honest.
An adapter exceeding the response bound cannot bypass the shared limit. Repeated
observations of the same evidence do not redeliver it; a distinct failed attempt
still emits. Reuse the existing failure identity and queue behavior.

Stopping point / sizing: Actionable bounded events with no new log service.
One diagnostic-delivery loop; semantic usefulness is demonstrated for the chosen
failure, not promised for every possible log format.

Accepted proof (2026-09-15):

- `ci-command-adapter-failures.test.mjs` invokes the public watcher with a real
  executable adapter. Discovery returns a failed opaque attempt; the separate
  diagnostic operation filters thousands of noise lines locally and returns
  only error lines. The known semantic error remains at the start of the
  delivered excerpt.
- The shared boundary caps that excerpt at exactly 16,384 UTF-8 bytes and marks
  truncation. Undeclared raw-log fields and noise are absent from the serialized
  event. A repeated attempt emits once, while a distinct attempt emits a second
  event whose unavailable diagnostic remains explicit.
- The focused adapter and watcher proof passed 16/16 after formatting, the full
  maintained execution runtime passed 74/74, and `git diff --check` passed.
  The independent refactor found the design already cohesive; all touched files
  remain below 250 lines.

Learning: record a failed attempt as delivered only after its diagnostic result
has been validated and bounded. This retains retryability for a transient
diagnostic failure without redelivering evidence already handed off.

### 5. Report an unavailable custom observer honestly

Type: Behavior
Status: done

Behavior: An invalid result, unknown status, failed command, or unavailable
endpoint yields bounded observation-unavailable evidence under the existing
error policy, without success, silent GitHub fallback, or a code-repair claim.

Proof: Exercise the same process boundary with representative malformed output
and timeout/failure variants; observe the existing error bound and a single
coverage-loss delivery. Verify cancellation shuts down the adapter child and
observer without leaving a process running. Preserve a known CI failure when
only its logs become unavailable.

Stopping point / sizing: One observation-error rule and process lifecycle proof;
reuse existing timeout/cancellation mechanisms instead of new retry machinery.

Accepted proof (2026-09-15):

- The real adapter process boundary exercises invalid JSON, an unknown outcome,
  nonzero command exit, and timeout. Each condition retries three times under
  the existing observer policy, emits one reason bounded to 600 characters as
  `CI_MONITOR_UNAVAILABLE`, omits GitHub workflow identity, never invokes `gh`,
  and never becomes `CI_FAILURE`.
- A diagnostic endpoint failure follows one discovered failed attempt; later
  discovery returns no attempts, proving the known failure is retained rather
  than erased. After three diagnostic failures the observer emits that exact
  failed attempt with bounded `diagnostic.unavailable`, then separately reports
  observation loss.
- The cancellation case launches the real observer CLI and a blocking adapter,
  sends `SIGTERM`, observes a clean exit with no output, and verifies the adapter
  PID no longer exists. The focused adapter/watcher suite passed 29/29 after the
  independent naming refactor and formatter; the maintained runtime passed
  80/80 and `git diff --check` passed. All touched files remain below 250 lines.

Learning: a known failed attempt awaiting diagnostics must outlive later empty
discovery results, or a transient evidence outage can silently erase a real CI
failure.

### 6. Carry custom failure evidence into the existing repair workflow

Type: Behavior
Status: done

Behavior: A custom failure reaches the execution coordinator through its current
host bridge at a safe boundary with sufficient evidence for existing repair,
without GitHub-only diagnostic commands or duplicated repair orchestration.

Proof: Extend existing host/stream fixtures to pass the actual custom event
through launch, mailbox/stream, and delivery, preserving execution binding,
quiet routine observation, shutdown, and unread evidence. Walk updated setup
and repair guidance with custom evidence and the GitHub default. Assert bounded
excerpts survive transport and are treated as data. This deterministic slice
proves Open Dough's transport and guidance boundaries. Preserve existing repair
regression proof, including subsequent push registration from Slice 3. A real
Pygardon repair is outside acceptance.

Resolve affected native requirements with justified reusable evidence or the
smallest missing native check using a controlled source. Assess host delivery
and skill behavior separately; fixtures do not count as native use. Retain
applicable ADR 0005 gates without requiring a real external CI server.

Stopping point / sizing: Custom evidence uses the established lifecycle. One
notification journey; assess each changed host difference under ADR 0005,
reusing unchanged host evidence only with an explicit applicability reason.

Accepted proof (2026-09-15):

- A temporary project installs the real candidate skill and launches an actual
  custom adapter. Cursor and Claude hook processes attach, stay quiet before an
  event, deliver the failure once to the existing `ci-monitor` repair entry
  point, and remain quiet after acknowledgement. The Codex stream carries the
  same event and retains unread shutdown evidence.
- Every path preserves the exact failed SHA, opaque run/attempt identity, and a
  16 KiB truncated diagnostic containing adversarial instruction text as
  untrusted JSON data. GitHub workflow/job fields are absent. The adapter sees
  only `discover` then `diagnose`; a later repair SHA registers on the same
  observer, and shutdown reports the expected delivered/unread and unchecked
  coverage state.
- The focused host/guidance suite passed 5/5 after the independent fixture
  refactor and formatter. The maintained runtime passed 85/85, payload-update
  proof passed, and `git diff --check` passed. No production bridge change was
  needed; provider specificity is confined to setup, acquisition, and initial
  classification.
- ADR 0005 native applicability is satisfied by the deterministic candidate
  fixture across all three adapters, existing native evidence for the unchanged
  host mechanisms, and the smallest fresh Codex read-only walkthrough of the
  changed shared guidance. That walkthrough selected custom CI without GitHub
  prerequisites, treated the diagnostic as data, and used the one existing
  ancestry-aware repair and later-SHA registration flow. No additional native
  matrix is warranted for unchanged host-specific behavior.

Learning: the existing host lifecycle is provider-neutral; only setup,
acquisition, and the first evidence-classification step need provider-specific
knowledge.

### 7. Install a usable customization manual and preserve project choices

Type: Behavior
Status: done

Behavior: A project installing/updating the complete payload receives the small
adapter manual and working support while retaining its configured command.

Use `src/skills/dough-execute-plan/manuals/custom-ci.md`, installed under the
same skill-relative path in each managed root. Keep it out of `SKILL.md` and
runtime reference links. Document its location in installation documentation
for optional human discovery. Include configuration, a runnable minimal adapter
example, outcome/coverage meanings, filtering, and the diagnostic limit.

Proof: Extend `tests/execution-payload-update.sh` and
`tests/install-preserves-open-dough-json.sh` for fresh installation, ordinary
update, and forced managed replacement. Assert the complete runtime/manual and
preserved configuration in Codex/Cursor and Claude layouts. Run the example with
a fixture response to prove the instructions match the implemented contract;
walk its optional discovery without skill loading. Align both payload lists
and fixtures, keeping recognition/maintenance material out.

Stopping point / sizing: Complete installable candidate with usable instructions.
One install/update journey; no config migration, extra installer, or broad
coexistence campaign beyond affected existing checks.

Accepted proof (2026-09-15):

- Fresh Codex, Cursor, and Claude public-payload installation tests deliver
  `manuals/custom-ci.md` in both managed skill roots. Ordinary and forced update
  proof restores the managed manual while preserving `.planning/open-dough.json`
  exactly when present and preserving its absence when absent.
- The installed manual documents direct argv configuration, separate discovery
  and diagnosis requests, opaque attempt identity, exact-SHA outcomes and
  coverage, local filtering, bounded errors/cancellation, and the 16 KiB UTF-8
  diagnostic limit. Its marked example is extracted from the installed copy and
  executed against a fixture: it preserves `run/47` and `attempt:alpha`, removes
  setup/cleanup noise, retains the known error, and reports Unicode-aware
  truncation within the limit.
- Payload update, config preservation, guidance-payload, and all three fresh
  installation tests passed after formatting. Shellcheck and `git diff --check`
  passed. The independent refactor found the slice already cohesive; all touched
  files are at or below 250 lines except the installation guide under Terry
  Yin's previously authorized deferred size exception.
- The manual is not linked or loaded from `SKILL.md` or runtime references, and
  no recognition or maintainer-only material enters the released payload.

Learning: executing the example extracted from the installed manual turns its
adapter protocol into installation evidence instead of relying on prose alone.

### 8. Make the tested customization available in a release

Type: Behavior
Status: planned; maintainer version and release authority required

Behavior: A project can obtain the tested adapter support and manual from the
maintainer-selected immutable release through the ordinary updater.

Proof: Use the normal release-version workflow after applicable acceptance.
Verify complete payload, matching VERSION/CHANGELOG/tag, and released install or
update containing the manual and runtime while preserving project configuration.
Reuse candidate functional/native evidence only when its content and delivery
remain applicable. Do not hand-synchronize this repository's managed copies.

Stopping point / sizing: Released usable capability; no provider expansion or
new release system. One release/update proof loop with external release inputs.

## Verification, proof ownership, and delivery gates

| Story promise | Owning slice and observation |
| --- | --- |
| Preserve GitHub default and prior-attempt behavior | 1–2: regression outputs and empty/absent config |
| Configurable discovery and opaque run/attempt identities | 2: real command/CLI fixture |
| No AI polling or routine success wakeups | 2, 6: command/process and host delivery evidence |
| Exact-SHA coverage, pending, later repair revision | 3: controlled delivery-to-coverage journey |
| Bounded locally useful logs and duplicate handling | 4: known large-log failure and distinct attempt |
| Honest failure/coverage/diagnostic limitations | 3–5: missing SHA, invalid source, unavailable logs |
| Preserve asynchronous notification and repair | 6: transport/guidance and preserved repair regression proof |
| Standalone manual, no skill references, install/update preservation | 7: candidate install/update and manual example |
| Released complete runtime and manual | 8: immutable release and ordinary update |

Use `node --test` with each owning test file as it is added; record its literal
command and inspected setup/assertion locations with accepted proof. Relevant
existing broader checks are `bash tests/execution-ci-runtime.sh`,
`bash tests/execution-payload-update.sh`,
`bash tests/install-preserves-open-dough-json.sh`, and
`bash tests/install-ci-host-hooks.sh`. Run affected checks once their boundaries
change; do not repeat the entire suite for every slice. Apply `npm run lint`
and project-required delivery checks. No tests have been run or claimed passed
for this planning-only change beyond Markdown/link and diff checks.

On later authorized execution, resolve the checkout/branch, hook contract and
push destination through dough-execute-plan. Follow normal independent
post-change refactoring, selective formatting, commit/push, asynchronous CI
repair, retrospective, and story-wrap-up gates. Keep execution identity, accepted
proof, consequential decisions and learnings in this same plan. Preserve the
story and plan until ordinary wrap-up; do not create another integration plan.

## Cumulative assessment and remaining concerns

The sequence grows one model: a pushed revision has observable CI attempts and
bounded evidence; providers acquire that evidence, the shared observer tracks
it, existing host delivery reports actionable changes, and existing repair acts.
There is no per-provider observer, host-specific outcome model, or log service.
Slice 1 prepares only Slice 2; later slices extend the same current behavior.

- Slice 2 and dependent configuration/documentation wiring use the resolved
  `.planning/open-dough.json` location from ADR 0001 and ADR 0004.
- Slices 1–2: numeric GitHub attempt/history assumptions may require smaller
  adjustments. Exercise opaque identities through the controlled adapter
  before committing to exact protocol fields.
- Slice 3: existing run discovery cannot prove unchecked pushes; delivery
  registration must cover normal and repair pushes without creating a second
  execution lifecycle. This is the main new integration responsibility.
- Slice 6: affected native host proof needs an applicability assessment; use
  controlled sources for any missing checks, without external CI dependencies.
- Slice 8: publication depends on the maintainer's version and valid affected
  native evidence. Source completion alone does not satisfy released delivery.

These are slice-specific concerns, not execution authorization. No product code,
project adapter, CI service, installed guidance, or release was changed here.

Scope decision: the maintainer explicitly removed Pygardon adoption and its real
failure-to-repair trial. The plan now ends at release with eight slices. Later
Pygardon findings are new input rather than incomplete acceptance here.
