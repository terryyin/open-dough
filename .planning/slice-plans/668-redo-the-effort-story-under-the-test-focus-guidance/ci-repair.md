# Owned CI correction

Source: [run 43869463784, attempt 1](https://github.com/terryyin/open-dough/actions/runs/43869463784),
the registered research revision's failed applicable basis `83cbf20fa`.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies literally; prior origin and local passes are no exemption.

## Correction input

Beneficiary/outcome: contributors get stable navigation proof under the existing
30-second case budget, and every test-owned runner is stopped even if startup
fails. Preserve every original scenario, independent assertion, relative
browser/API URL and private per-test state. Boundary-only runs request no app.
The trial snapshots, inputs and transcripts remain unchanged.

Actual: Distribution's delivery read exceeds 30,000 bytes by 207; integrated
shard 4 has 19 failed navigation cases out of 41 and a surviving Cursor runner.
Expected: unchanged read-budget check passes, no survivor, and the affected
navigation cases are stable on the applicable hosted repair revision.

No case, suite, hook or group timeout increases; no `test.slow`, assertion
weakening, scenario deletion, rerun-until-green, native paid-host probe or
blanket ownership handoff. No exact other active repair owner exists.
SEED-324 is returned to backlog, clean, and explicitly excludes blanket
ownership through a shared fixture. Plan 648 is provisional, not an owner.

## Accepted compatible work, not yet published

- Exact published repair `d288b03f91096cef74c581fa1794f1f7cf3a748b` applied
  uncommitted to `Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md`.
  The unchanged `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/read-budget.test.mjs`
  failed at 30,207 then passed; all 20 link targets remain.
- Six deletions in `dashboard/tests/navigation/frame-board-look.spec.ts`
  remove an unused caller-owned machine. The existing harness owns cleanup.
  Same injected post-start failure reproduced `runLifecycle.ts:40` with
  orphaned runner PID 57803 before, and no survivor after. Injection removed;
  affected file passed 3/3 in 6.5s. Scenario/assertions unchanged.

The prior repair agent used about ten active minutes, returned quiescent with
these two completed changes, and made no speculative fixture edit. Records:
`/tmp/seed-391-frame-start-red.log`,
`/tmp/seed-391-frame-start-repaired-injection.log`,
`/tmp/seed-391-frame-repaired.log`, and
`/tmp/seed-391-ci-repair-consumer-trace.dispositioned.md`.

## Decisive observations and selected direction

- Complete artifact roster has 50 entries; the first API page had only 30.
  Report artifact `14226514824` is recovered at
  `/tmp/seed-391-integrated-report-4.zip`; all 19 traces under
  `/tmp/seed-391-report-4-partial/`; title/time/worker mapping at
  `/tmp/seed-391-failed-case-timeline.json`. These are recoverable from the
  linked run; do not repeat the mistaken missing-artifact claim.
- Actual hosted workers: four, Ubuntu 24.04.5. No CPU/RAM/load metrics
  retained. First four Before Hooks take 20.292–21.321s, including 17.3–18s
  in `dashboard`. The first 13 failures precede the later Cursor survivor;
  its cleanup fix cannot explain them. Global deadline did not fire.
- `dashboard/tests/dashboardTest.ts` asks for shared app/server inputs in
  its case-scoped fixture. Existing `pageTest.ts:prepareServerInputs` and
  worker `dashboardPreviewReady` own cold immutable preparation, but the
  ordinary dashboard path does not request that worker fixture.
- PFE choice: reuse that existing preparation owner with a worker profile
  distinguishing preview and boundary. Declare worker fixtures in the common
  `pageTest.ts` pool. Check actual `serverMode` uses before moving its scope;
  return a conflicting current consumer before changing it. Boundary mode
  must prepare the server bundle and no app. Keep public URL mechanics.
- Separate diagnosis, not selected speculative repair: Playwright's
  `_setupArtifacts` (auto `all-hooks-included`) depends on combined context
  options, then our `baseURL`, then `dashboard`. Traces show extra dashboard
  starts in beforeAll/afterAll. Existing stable TCP address support in
  `e2e/observation/revision-stream-stopped.spec.ts` is a future PFE lead,
  but a new proxy/relative-URL migration is outside this bounded attempt.

## Remaining proof and ownership

All 19 original cases remain owned: keyboard (2), touch (2), scroll (1),
accessible Board reflow (1), header (4), Intent/frame/sessions (3), empty
projects startup (1), launch appearance (3), sessions appearance (1), project
keyboard navigation (1). Exact inventory/log:
`/tmp/seed-391-ci-failure.json`, `/tmp/seed-391-integrated-job.log`.
The unchanged 11-spec local selection passed 31/31 in 42.5s; that clears none
of the historical CI failures.

Slice 2 must observe cold preparation outside the case clock, no app request
for a boundary-only run, preserved relative browser/API requests, and affected
consumer proof. Check MakeMe/page-object selection for newly implicated tests.
Use existing fixtures and assertions before adding focused regression proof.
Publish the meaningful correction through the same observer, retain progress
until hosted evidence settles the actual revision, and diagnose remaining
failures rather than treating a pass of an unchanged attempt as a repair.

Local gate: selected Node 24.21.0 and locked install/Chromium ready; macOS on
AC, ordinary load about 2 at last inspection, no owned competing test run.
Recheck before expensive proof and use `caffeinate -s -i` with named selections
and two workers initially. Local headroom establishes no remote headroom.
Reconsider changed conditions; no paid native-host test. Failure policy above
and [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
remain binding. The coordinator owns publication, refactor, CI and restoration.

## Slice 2 local correction observation

The common worker pool now owns constant `serverMode` and on-demand
`dashboardServerInputsReady`, using existing `prepareServerInputs` and
`coldInputPreparation`. Base dashboard, preparationPage and keptStartJourney
request it; per-case servers, state, settings, URLs and assertions stay local.
AST audit found 129 `.use` mode overrides: all file-level literal boundary.
No timeout changes. Controlled real app build held 31s: unchanged keyboard
case timed out setting up dashboard at 30000ms; repaired worker prepared inputs
for 31.884s, then the same case passed in 1.1s (33.9s run).

Named local proof: original 11 navigation files + kept-start paging 32/32
(37.5s); boundary/environment/Done/native-refusal/Codex continuation 6/6
(5.1s), artifact trace has zero app requests; queued Claude/Codex/kept-start
E2E 7/7 (16.3s); scratch relative browser and API checks 2/2 (2.6s);
`npm run typecheck:dashboard` passed. AC, Node 24.21.0, two requested workers,
`caffeinate -s -i`. These local results establish no Ubuntu headroom and do not
settle the 19 original failures. Full consumer dispositions, literal selections,
assertion purpose, gate setup and logs:
`/tmp/seed-391-cold-input-consumer-trace.dispositioned.md`; controlled traces:
`/tmp/seed-391-cold-red-green-trace-timings.json`.

Scope gap returned before extending this bounded repair: five spec-local
session/terminal dashboard overrides bypass those readiness owners. Adding a
common baseURL dependency was rejected before edit: terminal-codex uses
boundary with inherited preview option; session-alerts selects dev/preview
through its own case-scoped option. Such a dependency would prewarm an app
for boundary/dev-only consumers. Their unchanged cold clock needs matching
profile decisions at those owners; no proxy/address rewrite was attempted.
The detailed record names all five files. Existing queued preview/boundary
profiles remain coherent in the one declaration pool. Coordinator retains
hosted CI, further repair, refactor, publication and all 19 failure ownership.

## Acceptance before progress publication

Coordinator inspected the four fixture diffs, controlled gate source/trace,
relative-URL probe, boundary artifact trace and unchanged navigation assertions.
The five independent override profiles are not claimed warmed; their original
behavior is preserved and the reported navigation cohort uses repaired owners.
Independent refactor completed: only record links/owner references changed;
all runtime proof reused, no extra tests. Cohesive record extraction keeps PLAN,
context and observations under 250 lines. Source freshness unchanged at d288b03f.
Progress publication leaves slice 2 planned and owns all 19 hosted failures.
