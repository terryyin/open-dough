---
id: SEED-208
status: active
planted: 2026-11-01
planted_during: Terry Yin's request to turn the detailed CI retrospective into the highest-priority improvement story
trigger_when: A plan execution encounters failed or flaky proof, repairs CI, or reports final completion
scope: story
---

# SEED-208: Restore trustworthy CI completion

<a id="trustworthy-ci-completion"></a>

### Finish every execution with trustworthy CI and no known flaky tests

**Identity:** SEED-208#trustworthy-ci-completion
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/432-trustworthy-ci-completion/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bf3d8558e0e70ad64975abb0703549b8cfe77edd878b3fdcf76a827d7003e9f7","plan":"b7eed7eb12d3ae889f5f2ca36fe34198c69021bba96f0921f0578215889c6383"}}
```

**Goal:** Terry and developers using Open Dough can trust an execution's final
completion: the applicable published state has successful CI, known failed or
flaky proof has been diagnosed and repaired, and the result's claimed behavior
is actually observed. A later green run never erases an earlier unresolved
failure.

**Value now:** The reviewed 24 hours contained 99 workflow runs, 51 final failed
runs, 150 failed jobs and six failed main runs. Agents repeatedly rediscovered
shared-consumer effects and nondeterministic test assumptions. Stable,
meaningful proof supports the backlog's product-intent direction and reduces
repair loops and unnecessary developer interruptions.

**Plan:** [432 — Restore trustworthy CI completion](../slice-plans/432-trustworthy-ci-completion/PLAN.md).

#### Human direction and publication authority

Terry requested one improvement plan as the first story in the product backlog,
with every known detail preserved in the story, and explicitly authorized
editing main directly and synchronizing origin. This authorizes preparation
and publication of this story and plan; it does not execute their product or
guidance changes. Keep the current Taken assignment and all unrelated queue
order and near-future direction.

The selected outcome spans the existing completion workflow and the concrete
proof defects that made its green result unreliable. Deliver it incrementally
within this one requested story; do not silently drop a diagnosed cause, turn
it into an unowned suggestion, or expand into general test optimization.

#### Scope

- Make the project's failed/flaky-test policy available to Codex, Cursor and
  Claude Code through shared project guidance. Preserve an active sibling
  repair owner's work; a defect predating this change alone is no exemption.
- Return a complete failed-job and failed-test identity inventory alongside
  bounded diagnostic details. Expose unavailable, omitted or still-changing
  evidence instead of presenting a partial view as complete.
- Remove the demonstrated mismatch between the coordinates a native touch
  helper checks and taps. Retain real touch, reachability, clipping and
  sufficiently sized target observations; settle the transitions that need it.
- Restore genuine temporal proof for regular unmarked polling after a settled
  fresh Host-switch read, including the Start session offer result.
- Judge repairs against the complete affected behavioral lifecycle and existing
  consumers. Reconsider only affected retrospective conclusions after a repair;
  preserve source promises and regression discrimination.
- Finish on the applicable accepted revision and required target, accounting
  for all known actionable failures and observation shutdown. Keep an honest
  incomplete stop for a real unresolved gate.
- Retain evidence and link the supported findings to their response. Reconcile
  the duplicated diagnostic finding and stale setup observation through the
  existing bounded findings procedures when this story is executed; do not
  mark a process issue fixed solely because guidance was edited.

#### Key examples and counterexamples

1. An unrelated fixed-date fixture fails on my published revision. I establish
   its cause and repair it under the project policy, then finish the relevant
   CI obligation. Reproducing it on the base is attribution, not a waiver.
2. Another active execution owns that exact repair and its uncommitted files.
   I preserve those files and report the real coordination boundary, without a
   duplicate writer, stash or claim. A vague assertion of pre-existing origin
   is not evidence of that ownership.
3. A job prints an early failure, many detail lines, and a later failure before
   its exit marker; an attempt has more than ten failed jobs. The diagnostic
   names every available failed test/job and distinguishes bounded details from
   completeness. Missing logs remain explicit unknown evidence.
4. The first job to fail is npm setup, but a later sibling asserts incorrectly.
   The attempt is not waived as infrastructure. Recurring acquisition trouble
   is examined for a repository setup cause rather than ignored indefinitely.
5. A touch target moves between measurement and activation. A helper cannot
   report successful reachability for a different point and silently miss the
   target. Stable native-touch journeys and clear obstruction diagnosis survive.
6. An initial sessions read saw Option A, the configuration changes to Option B,
   and Host switches. A settled fresh response renders B; a subsequent actual
   regular poll is observed and carries no fresh marker. Initial requests or a
   timer advanced before scheduling cannot stand in for this observation.
7. A banner/dialog repair fixes its first zoom assertion. Acceptance still
   exercises opening, Close clear of the banner, and End revealing the last
   explanation, plus affected focus/navigation consumers. It does not publish
   three successive single-assertion fixes.
8. A CI repair follows a provisional retrospective. Its affected product and
   proof conclusions are reviewed on the repaired candidate. Deleting the only
   distinguishing temporal assertion cannot make the original promise proved.
9. A story branch passes, the same SHA fails on main, or an older unread
   failure remains after a later green tip. The owning execution diagnoses the
   failure and completes required trunk observation before successful closure.
10. Terry explicitly waives a specific native probe or authorizes one landing
    exception. Preserve its exact scope and truthful outcome; never turn the
    historical exception into the default completion rule.

#### Constraints and preserved behavior

- Keep Accepted ADR 0002's whole-product focus, continuous integration,
  decentralized reconciliation and stop-and-fix principles; ADR 0008's
  published-fact/local-evidence separation; and ADR 0010's evidenced-benefit
  standard. ADR 0009 is Proposed.
- Keep one shared behavioral source. Future reusable guidance changes belong
  in src/skills and must respect [AGENTS.md](../../AGENTS.md); do not
  hand-synchronize installed .agents or .claude managed copies. The explicit
  Open Dough failure policy remains project guidance rather than an imposed
  policy for other projects.
- Reuse current diagnostic/provider acquisition, bounded evidence, consumer
  tracing, CI observer, completion receipts and publication mechanisms.
  Preserve held-log waits, cancellation, safe diagnostics and exact-attempt
  identity. Add no new scheduler, global lock or completion ledger.
- No retry-until-green repair, arbitrary sleeps, blanket timeout inflation,
  muted failures, force clicks, or replacement of native touch by locator
  activation to bypass the observed problem.
- E2E scenarios retain useful integration and user-intent protection. Rule
  details may use smaller black-box tests when meaningful coverage survives;
  fewer tests, more tests or a passing run alone is not an improvement.
- Do not reimplement the already delivered relative-date, no-audit, native
  deadline, attachment-byte, WebSocket-registration or consistency repairs.
  Keep the accepted bounded-refresh heap tradeoff accepted.
- Old sessions-sidebar-touch and final-report-touch failures are candidates
  for diagnosis, not proven instances of the same touch race.
- Preserve ongoing SEED-207 assessment ownership and do not duplicate its
  general test-value/optimization work. Shared files do not create a blocking
  story dependency; reconcile actual overlapping changes through normal work.
- Changes to installation, native host delivery or release rollout require
  their established functional checks. This planning publication is not a
  release or permission to update every installation.

#### Current truth and new planning observations

The retrospective's historical window is frozen at 2026-10-31 07:43:09 through
2026-11-01 07:43:09 Asia/Singapore. Its last reviewed trunk was aef7858b;
bfbdd6a6 was pending at cutoff and passed at 07:44:37. Subsequent published
work closed the Intent reader and admitted SEED-207. Preparation starts from
ae6479d3 and does not label those later events part of the original denominator.

Current reads found no intervening changes to the implicated diagnostic,
touch helper, freshness journey, project AGENTS or cited ADRs. Two bounded
observations confirmed actionable premises without changing product code:

- Calling the current diagnostic with an early failure, 120 detail lines,
  a later failure and an exit marker omitted the early test identity.
  Eleven failed jobs produced ten job entries with omittedFailedJobs = 1.
- In an isolated headless Chromium page, the existing tapWhereShown sampled
  an 80 by 50 target at x=20; the target moved to x=300 before the helper's
  subsequent checks. The helper returned without error, but the real native
  tap produced zero target clicks. The expected result was one intended click
  or an honest refusal, not silent successful validation of a different point.
- The configured Playwright --list route with the five existing touch/freshness
  spec files selected nine tests in five files. Listing is route evidence,
  not a claim that those tests ran or that either defect is repaired.

Literal probe recipes and outcomes are retained with the executable plan.
The first historical optimization plan recoverable from Git already marks
its first slice done; no earlier ready plan has been invented.

#### Evaluation and closure

Each planned change needs discriminating failure-before/pass-after evidence
at the behavior boundary, preserved consumer proof and successful applicable
CI. For guidance, walk the representative failed-fixture, active-other-owner,
mixed-failure and post-review-repair cases from the actual executing-agent
perspective; mere file presence or a wording test does not prove usefulness.

Compare the next relevant ordinary executions with the concrete failure and
repair loops below. Keep numerator/denominator, target/revision, known misses,
human interruptions, rework and observation limits. A lower aggregate red-run
percentage alone is not causal proof because publication frequency and story
mix differ. Do not invent a universal reliability target or promise no future
environment failure.

Before closure, ensure every scoped defect is repaired or has an explicit
human-owned changed disposition, final target CI and shutdown are settled,
affected review conclusions are current, and no known flaky observation has
been left as unrelated noise. Preserve this evidence through source/plan
cleanup using normal Git recovery and durable test/document ownership.

#### Reproducible planning observations

These were bounded preparation probes, with no product edits or execution
of the improvement slices. The touch probe ran from the owned review
checkout and imported the unchanged current helper. The diagnostic probe
ran from the current project root. The following project-relative commands
preserve the same operations and synthetic inputs for another checkout.

Diagnostic omission (observed: early identity false, later identity true,
eleven failed jobs versus ten returned job details plus an omission count):

    node --input-type=module <<'JS'
    import { failedLogExcerpt, diagnoseFailedAttempt } from './src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs';
    const full = ['FAIL: earlier.spec.ts:7 meaningful first failure',
      ...Array.from({ length: 120 }, (_, i) => 'detail ' + i),
      'FAIL: later.spec.ts:9 another failure',
      '##[error]Process completed with exit code 1.'].join('\n');
    const all = Array.from({ length: 11 }, (_, i) => ({
      databaseId: i + 1, name: 'job ' + (i + 1), conclusion: 'failure',
      url: 'https://github.test/jobs/' + (i + 1),
      steps: [{ number: 1, name: 'test', conclusion: 'failure' }]
    }));
    const excerpt = failedLogExcerpt(full);
    const answer = await diagnoseFailedAttempt({
      repo: 'example/project', runId: 1, attempt: 1,
      github: { attemptJobs: async () => all, jobLog: async () => full }
    });
    console.log({
      allJobs: all.length, returnedJobs: answer.failedJobs.length,
      omittedJobs: answer.omittedFailedJobs,
      early: excerpt.lines.some(x => x.includes('earlier.spec.ts')),
      late: excerpt.lines.some(x => x.includes('later.spec.ts'))
    });
    JS

Native touch mismatch (observed: helper returned normally, zero target clicks):

    node --input-type=module <<'JS'
    import { chromium } from 'playwright';
    import { tapWhereShown } from './dashboard/tests/controlReachability.ts';
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        hasTouch: true, viewport: { width: 600, height: 300 }
      });
      const page = await context.newPage();
      await page.setContent('<button style="position:absolute;left:20px;top:20px;width:80px;height:50px" onclick="window.hit=(window.hit||0)+1">Target</button>');
      const target = page.getByRole('button', { name: 'Target' });
      const moving = new Proxy(target, {
        get(object, key) {
          if (key === 'boundingBox') return async () => {
            const before = await object.boundingBox();
            await object.evaluate(el => { el.style.left = '300px'; });
            return before;
          };
          const value = Reflect.get(object, key);
          return typeof value === 'function' ? value.bind(object) : value;
        }
      });
      await tapWhereShown(moving);
      console.log({ targetClicks: await page.evaluate(() => window.hit || 0) });
    } finally { await browser.close(); }
    JS

The Locator proxy controls the timing of the real DOM movement; it does not
supply a fake browser click. Slice 3 must turn this shape into permanent
regression proof and discriminate the corrected observable behavior.

#### Complete retained retrospective and source evidence <a id="retained-retrospective"></a>

The following is the complete detailed retrospective, including all 99 runs,
all 150 failed jobs, story/agent attribution, known causes, process history,
recommendations and limitations. It is retained as historical evidence; its
original read-only/uncommitted disposition describes that earlier review,
not the current authorized backlog publication.

The [complete evidence archive](../evidence/ci-retrospective-2026-11-01-evidence.zip)
keeps all downloaded failed-job logs, 202 failed-test entries, 157 commit
patches, recovered plans, native process excerpts, observer snapshots, CSV/JSON
ledgers and checksums. It is committed beside the story so later execution does
not depend on this machine's temporary folders or GitHub's short log retention.

Archive SHA-256: b5aead59809b5c83eba928ee07ceeb74e228883b51fd7c1176419a96ba4457d5.


#### CI instability retrospective: 31 October–1 November 2026

Review requested by Terry Yin. Both product content and execution process are in scope. This is an exploratory retrospective, not implementation authorization or a controlled comparison of agent models.

##### Finding

The instability was real and had several interacting causes. The dominant pattern was shared behavior changing faster than the agents' chosen proof followed its existing consumers. A separate npm setup problem amplified the noise. Old calendar-sensitive fixtures and interaction races then failed on otherwise unrelated publications. Several repair loops addressed the next assertion rather than the complete behavioral cause.

The evidence does **not** support the blanket explanation that every completed execution simply skipped its final CI check. Most reviewed executions eventually reached a passing branch and trunk result, sometimes after substantial repair. There was one explicit human-authorized exception for the admission repair, followed by an authorized release with disclosed failing hosted CI. Some executions also stopped unfinished and needed resuming. Historical red runs remain red after a later repair; they are not all evidence of an unresolved final execution.

The more consequential problem is that **a passing final run was repeatedly a weak proxy for having removed the causes of instability**. A latent race can pass once and fail on another writer's revision. The same Development/Intent closure SHA passed on its story branch and failed on main. Some known failures were explicitly excluded in plans or accepted as pre-existing. At least one repair removed a temporal observation instead of making that observation reliable.

##### Scope, collection and evidence limits

- **Requested window:** 31 October 2026 07:43:09 through 1 November 2026 07:43:09, Asia/Singapore; UTC 30 October 23:43:09 through 31 October 23:43:09. The boundary is frozen at the first clock observation, rather than sliding forward during analysis.
- **Repository:** terryyin/open-dough. Other installed projects appear only where a release or the Intent story changed their configuration. Their CI histories are not part of this denominator.
- **Inventory:** every workflow run returned by the repository Actions API in that creation window, every job from every available attempt, all 150 failed-job logs, 157 reachable commits committed in the window, and 13 distinct execution identities. Planning-only commits are retained as provenance and are not counted as implementations.
- **Hosts:** Codex chat history and command outputs, Cursor coordinator and relevant subagent transcripts, Claude coordinator tool calls/results, historical seeds/plans, agent profiles, and retained CI observer records. A host profile saying auto does not identify the actual underlying model.
- **Time semantics:** the run inventory uses creation time. The one run still running at the cutoff, #3406, completed successfully at 07:44:37 SGT, outside the cutoff. Its later verdict is disclosed separately; the final-outcome totals below include that resolution.
- **Snapshot:** reviewed trunk is aef7858b. The Intent reader branch is reviewed through bfbdd6a6, the last publication inside the window. Later work on that branch is outside the implementation boundary.
- **Method:** attribute by full story identity, publication branch, claim/profile, author and actual patches; distinguish original changes from integrations of siblings. A run's branch owner is the publication owner, not automatically the author of every failing behavior in its tree. No contaminated whole-trunk net diff is used as one story's implementation.
- **Limits:** all failed logs were downloaded, but not every successful job log or every binary Playwright trace was downloaded. Exact browser failures are preserved in the logs and per-test ledger. Existing agent claims about repetitions and timings are identified as recorded evidence, not fresh measurements by this review. This investigation ran no new product test suite and changed no product or skill behavior.

The local evidence directory and downloadable bundle linked from the chat contain runs.csv, failed-jobs.csv, failure-cases.csv, complete failed-job logs, original/final historical plans, commit metadata, extracted process records and observer evidence. The appendices give a complete run ledger and an index to every failed job. Original transcript paths and line numbers remain in the process JSON, so extracted text can be checked against the host record.

##### What the CI numbers mean

| Measure | Observed |
| --- | ---: |
| Workflow runs created in the window | 99 |
| Successful at the cutoff | 47 |
| Failed at the cutoff | 51 |
| Still running at the cutoff | 1 |
| Final outcomes of those same runs | 48 success, 51 failure |
| Attempts, including reruns | 106 |
| Attempt outcomes after resolution | 48 success, 58 failure |
| Jobs across attempts | 1,696 |
| Failed jobs | 150 |
| Failed npm installation jobs | 46 |
| Failed browser-suite jobs | 100 |
| Failed script-test jobs | 4 |
| Main-branch runs | 19 |
| Failed main-branch runs | 6 |
| Failed-test entries printed by logs | 202 |

The final run failure rate is 51/99, or 51.5%. At the cutoff, 51 of 98 completed runs had failed. The 202 printed failure entries contain 83 distinct emitted labels; those labels include line numbers and outcome suffixes, so 83 is not a defensible count of unique conceptual tests.

There were 58 failed attempts: 20 failed only in npm acquisition, 28 failed only in tests, and ten contained both. Therefore an npm error could not excuse the entire mixed attempt. Fifty-six distinct runs had at least one failed attempt; five eventually succeeded after a failed first attempt. Seven runs reached attempt 2; two remained failed.

The 150 failed jobs consumed about 6.9 aggregate job-hours based on their start/end timestamps. That is concurrent runner occupancy, not elapsed human time, billed usage, or a measurement of avoidable waste. No causal saving is inferred from that sum.

The workflow runs lint once, three script-test partitions and twelve browser shards. Browser retries are zero. There were no cancelled jobs in the collected inventory. The observed failures were not an unexplained wave of workflow cancellations. Individual browser timeouts often reflected missing state or a missed interaction, rather than the suite-wide deadline.

##### Product and test content: the causal clusters

###### 1. Fixed dates expired in the Recently done fixtures

**Observed behavior.** Tests expecting a retained Recently done entry instead found no entry, no Open terminal control, or an absent doneAt. The failures appeared across retirement, recovery and native Codex journeys. They were already present in the admission repair's unrelated run #3309, repeated in its attempt 2, and propagated across the header, mobile-session and voice branches.

**Cause.** Fixtures used a literal 1 October doneAt while the real retention rule follows the current clock and expires old records. A previously passing fixture stopped representing a retained session as the calendar advanced. This is deterministic date dependence, not random browser flakiness.

**Changes and ownership.** The optimization mission identified and repaired seven fixtures at a8ab552d. Other branches independently encountered the same family: f999ae22 on voice, ac83132a on the responsive header, and 697131c4/edfcfe59 on mobile sessions. The final optimization repair 7b9777c7 aligned the fixture bytes with trunk. Different implementations of the same repair increased reconciliation work; a branch did not automatically acquire another branch's unlanded repair.

**Why the proof missed it.** The mobile plan had already reproduced several failures without its scratch change, but converted that valid attribution into an instruction to report and leave them. The resulting proof boundary inherited an already-broken baseline. Other changes then produced their own new failures on top of that baseline, making the logs harder to interpret.

**Current truth.** The implicated retained-session fixtures now use a current or relative timestamp. This review found another literal doneAt in session-unread-rule.spec.ts, but that pure unread-rule test does not traverse retention; it is not evidence of the same outstanding defect. A blanket replacement of every date literal would be unjustified. Retention tests should deliberately freeze time or express their intended age through the existing fixture seam.

###### 2. npm audit ran inside the 45-second acquisition stage

**Observed behavior.** Forty-six jobs across thirty runs failed Install npm dependencies with the acquisition-deadline diagnosis, often after a warm cache restore. Several logs report packages added and audited in roughly 45 seconds before the wrapper killed the process. These failures occurred on feature branches, main, and the v0.3.79 tag.

**Cause supported by the records.** The npm setup path performed audit/funding work inside the hard 45-second setup stage. The execution investigation tied the delay to audit and changed that path. The logs prove deadline exhaustion; the audit diagnosis is corroborated by the repair, the package summaries and the later contrast between repaired and unrepaired branches. This is not evidence that all external infrastructure was healthy, or that every individual timeout had an independently traced network cause.

**Repairs.** chaifeng-chan's 7b9777c7 set NPM_CONFIG_AUDIT=false and NPM_CONFIG_FUND=false. pyo-chan independently published d4190ce4 with explicit no-audit/no-fund flags. Integration retained the environment-variable form. Both preserve locked installation and the stage limit. Earlier branches lacking that change could still fail after repaired trunk was green, as #3347 and #3351 illustrate.

**Process implication.** The diagnostic labels the symptom Infrastructure setup. Agents initially treated each occurrence as an external event to ignore or rerun. The repeated cause was also actionable repository setup behavior. pyo-chan explicitly reconsidered it after three affected publications and repaired it. The correct distinction is between an external incident and a recurring setup/configuration defect; the printed label cannot decide that distinction.

**Current truth.** The last failed npm job in the collected window was #3358. Later runs, including current trunk #3404, passed setup. This is useful post-repair exposure, not proof that npm setup can never fail again. ProjectFindings DD-376 still says the hosted trunk result was not yet observed; that statement is historically understandable but now stale. Findings-status maintenance was not invoked by this reporting request.

###### 3. The native-setup test inherited the workflow's expired deadline

The four Run test failures all identify tests/native-setup.sh. Three failed at its nominally healthy Chromium check; another failed waiting for child-ready in the interruption test.

The healthy fixture inherited OPEN_DOUGH_SETUP_DEADLINE_MS from the job's earlier acquisition phase. By the time this test ran, the shared wall deadline could already be expired. A healthy fake source then failed because of the outer job clock. cd63db18 isolated success paths with a fresh fixture deadline. This was a test-environment defect and should not have been dismissed as an external npm outage.

The separate interruption case used a roughly one-second readiness poll. Under load, the Node/setup/stub/descendant chain had not created child-ready before the test asserted its existence. d0c5bb86 widened the bounded readiness window; 7b9777c7 independently made the same change on another branch. The signal handling and no-late-write assertions remained. These two mechanisms must not be collapsed into one timeout cause merely because they shared a shell spec.

###### Local platform differences also affected proof, without explaining Linux CI failures

SEED-197's baseline investigation found a separate macOS FSEvents storm on fresh temporary checkouts: delayed file-creation events restarted the Vite development server during a watcher/HMR test. Its fixture repair selected Chokidar's NodeFsHandler through noFseventsPreload.cjs, with recorded repeated watcher runs. This is useful local reliability work, but it must not be counted as a proven cause of the Ubuntu hosted failures. The calendar, browser-locale, inherited-deadline and real-interaction issues each need their own environmental boundary.

The optimization mission's earliest committed plan recovered by this review is a8ab552d and already marks slice 1 done. Its later snapshot at 7b9777c7 records six completed slices. Native history supplies the profiling/planning context; this review does not invent an earlier execution-ready plan or describe the mission as planless merely because the admission commit lacked a plan.

###### 4. Shared header and panel changes missed existing behavioral consumers

Three adjacent UI stories changed the same underlying layout contracts:

- SEED-198 migrated read evidence out of a removed title disclosure and introduced a compact project selector.
- SEED-199 removed header UUIDs and changed narrow panels from a half-height stack to covering the page.
- SEED-192 open-development-intent-frame added perspective controls and changed the header/scroll region arrangement.

The changes were coherent user outcomes, but their impact was broader than the initial focused selections. #3311 exposed Final report UUID expectations, whole-text checks, paging and stacking consumers. a8ff15c2 repaired omitted header consumers, then its negative title margin itself clipped touch disclosure and had to be removed. The covering change reached tests that attempted to operate a now-covered Board/banner; 75592765 adapted those journeys to close the panel before reading the preserved Board result. Those are valid contract migrations when the original result assertion survives.

The responsive selector also left phone callers selecting hidden radios. The coordinator caught and updated them with chooseProject/expectProjectChoice after a wider suite, before the final slice publication. This was a local acceptance catch rather than an escaped final defect. The same investigation found locale-sensitive date expectations; aligning the assertion to the browser locale was more appropriate than calling a Mac/Chromium mismatch random noise.

The Development/Intent change then failed published-facts-reading in #3359 and #3360. The paging control was only about 88% in view under the taller header. Repair 1351254e changed real layout and the focused-card visibility rule: reserve room for the page header and allow one pixel of subpixel edge slack. Existing assertions were retained. The original local regression set had not included that consumer.

**Interpretation.** This is the recurring ODF-150 problem, not a lack of tests in absolute terms. The suite already contained useful protection. The missing step was following changed effects into those existing consumers before publication. Import or string matches alone cannot discover all geometry, focus, accessibility and helper-based consumers.

###### 5. Native touch and scrolling proof contains timing races

The strongest example is exact SHA e2d10052: [branch run #3367 passed](https://github.com/terryyin/open-dough/actions/runs/41198117963), then [main run #3369 failed](https://github.com/terryyin/open-dough/actions/runs/41198456543). The failing story-review-touch journey expected 64 changed files and displayed one, consistent with selecting the wrong comparison after a moving control was tapped.

The repair 96edd530 waited for the chosen range to finish reading before choosing a commit, and adjusted native touch/scroll settling. Its agent reported 70 repeated passes. The next trunk run #3377 found a different intermittent issue: agent-terminal-touch read Board scrollTop as zero rather than 202 immediately after closing a covering terminal. 57586a56 waited for the Board row to rest before recording/restoring that reading place. Main #3380 then passed.

Earlier main failures #3346 and #3352 involved sessions-sidebar-touch and final-report-touch. The available evidence supports their exact failure symptoms, but does not establish that every one has the same touch-coordinate cause. The review therefore does not assign them all to one root based on their names.

**Outstanding concrete weakness.** In controlReachability.ts, tapWhereShown stores a bounding box, performs clipping checks, performs hit detection against a newly measured center, then taps the original center. The successful hit test can therefore validate different coordinates from the coordinates actually tapped. Twenty-four files refer to this helper. Layout movement between these steps remains possible. The helper concern was independently identified in the original execution and the later advice chat; it remains unqueued in the reviewed backlog.

The bounded correction is to make the actual intended tap point observable, with deterministic moving-target coverage, and settle only the transitions that require settling. Replacing native touch with locator activation, arbitrary sleeps or retry-until-green would weaken the useful test boundary.

###### 6. Attach images changed existing launch behavior beyond its own examples

SEED-204's initial attachment publication 59c47d4c failed seven browser shards in #3355. Existing tests caught three distinct effects: the file input entered the keyboard tab sequence, attachment layout scrolled sideways, and the composed first input lost exact instruction whitespace. The latter was observable at the HTTP/native launch boundary, not merely cosmetic test detail.

752504ff repaired tab order, overflow and exact-byte preservation. The original focused checks had emphasized the new attachment scenario and developer-part behavior, omitting established layout/model/byte consumers. This is another ODF-150 occurrence with a real product regression, not permission to weaken byte assertions to make the attachment story pass.

A later failure #3357 had a different cause. The Recently done Cursor reopen test registered its WebSocket mock after navigation; the real attachment could win and clear Done membership. 305513aa moved mock registration before page load. The test's assertion remained intact. That repair should be assessed separately from the attachment feature's initial regressions.

The native three-host image probe was explicitly waived by Terry in that session. Its missing result is an authorized proof limit, not a secretly skipped required check. CI's synthetic host boundary tests do not retrospectively establish that waived native observation.

###### 7. Banner/mark repair became a sequence of incomplete layout fixes

SEED-205's first publication 63c7699e failed nine browser shards in #3385. Many whole-text checks had not admitted designed compact-title truncation; source-navigation also treated the new decorative product-mark image as unexpected injected content. 539b192b updated those consumers. A designed ellipsis can be excluded narrowly while preserving access to the full title; that is different from disabling all overflow checks.

The preparation legend then failed repeatedly at high zoom:

1. #3387/#3391: dialog/Close was not usable below the changed banner at 200% zoom; d470063c changed its position.
2. #3392: explanation was not fully in the viewport at 400% zoom, ratio about 0.990; 5f9ca93c changed centering/flex behavior.
3. #3395/#3398: keyboard End still left the last explanation partially outside view, ratio about 0.928; d62f0a66 allowed nearly full height with less padding.

These are three different repair commits on the same surface. DD-377 already records the avoidable sequence. Some later notifications referred to an older SHA already repaired on HEAD; those are historical observations, not proof that the same fix failed again. The decisive error was accepting a repair without replaying the complete zoomed journey: open, Close clear of the banner, and End showing the final explanation.

After the automatic retrospective and execution-complete record, #3401 exposed a compact-session Inspect control pulled out of view. 539d68f3 changed keepInView to stop on focus movement, but #3402 then broke three Board/session navigation cases because the stop was too broad. 6aa17630 narrowed it to Board focus leaving the kept entry; focus through the Side panel or banner no longer ended required settling. #3403 and trunk #3404 passed.

This repair reached shared navigation outside the visual mark itself. That makes post-repair review of the broadened behavioral change important. The transcript shows repair/delegation and tests after the original retrospective; it does not expose a distinct renewed retrospective judgment of those later pageMovement changes. Absence of that separate record is a review limit, not proof that nobody thought about the implications.

###### 8. Host-switch test repair narrowed what the test observes

SEED-206 changed demand freshness so a Host switch could not reuse an observation that began before the explicit reread. #3389 failed the new Start session journey's post-fresh polling assertion: after advancing a paused clock, requests stayed at two. 51070fa2 replaced fastForward with runFor, but #3394 failed the same observation.

256c30f4 then removed the post-fresh timer/poll observation. The surviving assertion checks only that requests before the switch were unmarked, while the test title still claims regular polls stay unmarked. No clock advancement proves that those pre-switch requests are regular polls. The other journey proves Option B rendering for a story launch; the Start session journey observes a fresh marker and the renamed dialog, not the rendered changed offer itself.

This establishes a current **proof gap**, not a demonstrated product freshness bug. The server's focused tests and shared client path supply additional evidence for the implementation. They do not make the removed temporal observation present. A bounded follow-up should observe a settled fresh response, then the subsequent ordinary poll and its unmarked request, and either assert the Start session dialog's changed offer or document the narrower responsibility honestly. Passing #3396 is evidence that the repaired suite ran, not that the deleted observation passed.

###### 9. Intent admission changed a brittle total-request expectation

SEED-192 browse-test-purpose added configured Gherkin source browsing, read states and on-demand highlighting. #3388, #3393 and #3397 all failed the same older authenticated-read committed-last assertion: it expected nine GitHub calls and observed ten. The extra call read pinned open-dough.json to decide Intent path containment.

The repair 75cf1785 split the committed-last scenarios and asserted the actual contract: a refused path does not trigger that path's content/commit request, while a pinned settings read for containment is permitted. This is a justified revision of an overly broad call-count assertion; it did not allow reading the refused secrets path. The exact request sequence remains checked.

The failure was already visible on the second slice and repeated through two later publications before repair the next morning. The coordinator had been waiting for a human usefulness judgment and later reported that observer coverage had expired. That delay left several red revisions on the branch. The collected transcript is insufficient to claim the exact first notification-delivery time or that a delivered event was consciously ignored at its original arrival.

The repaired run #3405 passed. The completion publication bfbdd6a6 was pending at the requested cutoff and passed shortly afterward in #3406. It had not landed on main within the review window, so it must not be described as a completed trunk integration at that time.

##### Execution-by-execution accountability

The complete table is appended below with branch counts and publication owners. These observations distinguish final delivery from the red intermediate history.

- **SEED-197, chaifeng-chan, Cursor profile gemini-4-argon:** measured optimization, fixture repairs, worker-local reuse and removal/consolidation of four redundant cases. Five of six branch runs remained failed, mostly npm setup. Terry explicitly said fix failures and flakies and wrap up at 17:07 SGT. 7b9777c7 repaired npm/setup readiness and a story-readiness synchronization issue. Trunk #3343 passed at 2b2c3066. The maintained timing report qualifies its large suite-wall improvement because the baseline and after-run had different host contention/reboot conditions; the focused serial comparisons are the stronger causal evidence. There is no basis to blame the four retained-coverage test removals for the unrelated setup failures.
- **SEED-201, steven-chan, Codex profile gpt-6:** admission-draft withdrawal while preserving subsequent/staged edits. The coordinator correctly stopped when retirement fixtures were failing and another active owner held the repair. Terry then explicitly instructed landing despite the unrelated failures and leaving SEED-197's repair with that owner. Main #3328 remained failed. This was a disclosed exception, not an agent silently claiming green CI.
- **Release 0.3.79, same Codex chat:** Terry explicitly requested release and client rollout after that exception. Main #3329 and tag #3330 failed npm installation, while the release report disclosed the failure. They are two workflow runs on the same release SHA, not two distinct regressions. Client installation checks and successful release preparation did not establish hosted CI success. The user-authorized exception must not become a general completion precedent.
- **SEED-198, joseph-chan, Cursor auto:** three planned slices for read-evidence migration, plain wide title and compact selector. Repaired retained-date fixtures, hidden phone selectors, browser-locale assertions and native-setup readiness. The transcript also accepted a clean-HEAD watcher flake as pre-existing during slice 2; reproducing at baseline proves attribution, not reliability. Several comment-only/fresh tips triggered new attempts after ignored npm failures. Final branch #3350 and repaired trunk #3353 passed at 22eb4b3e.
- **SEED-199, ivan-chan, Cursor auto:** two planned slices for compact headers and covering panels. Initial plan explicitly excluded certain pre-existing tests; initial completion stopped with an unfinished report asking whether to fix or waive them. On resume, the coordinator acknowledged that failures on its registered SHAs still blocked completion and repaired them. Later bounded retries exposed the distinct native-setup issue. Final branch #3348 and trunk #3349 passed at 58026ea3. It is inaccurate both to call the initial stop successful completion and to say the execution never recovered.
- **SEED-200, d.kanai-chan, Codex gpt-6.1-sol:** two planned slices for dictation and reconnect recovery, sharing the existing capture path. Initial CI mixed expired fixtures, touch/layout timing and terminal resize text. Full failure inventory recovered omissions from the bounded diagnostic. Reconnect insertion was delivered at 6c2d8744. Branch #3320 and trunk #3322 passed on attempt 2 after setup-only first-attempt failures. The saved completion receipts contain success and confirmed shutdown.
- **SEED-203, darren-chan, Codex gpt-6:** planless mission removing routine watcher polling logs. Eighteen watcher checks passed. Branch #3335 had a setup-only first-attempt failure, then succeeded on attempt 2. Main #3337 passed at 30784aac. There is no observed product regression attributable to that small change.
- **SEED-202 bounded-dashboard-refresh, pyo-chan, Claude:** four slices for parsed-document reuse, shared observation, unchanged answers and Cursor runner sharing. CI setup failures were eventually repaired instead of repeatedly dismissed. The retrospective found real consistency defects missed by the slice proof and produced the separate consistent-shared-refresh correction. A previous voice helper race remained actionable despite a later green tip; the coordinator held wrap-up and repaired it at 6f90752c. Main #3374 passed at 8348a754. The heap tradeoff was later explicitly accepted by Terry; it is not an unresolved unauthorized regression.
- **SEED-204, joey-chan, Cursor auto:** seven planned slices, with an explicitly waived native probe. Initial tab/layout/exact-byte regressions and later WebSocket mock race were repaired. Branch #3373 and trunk #3375 passed at 41f98420. The native waiver remains a qualification on proof, not a reason to call the synthetic CI failures acceptable.
- **SEED-192 open-development-intent-frame, bastiaan-chan, Claude Opus record:** one behavior slice after the responsive header landed. The initial implementation brief softened policy to fix or report; the implementer reported a pre-existing flake without fixing it, and the coordinator returned it for repair. DD-374 records that lapse. The coordinator then owned both later trunk touch failures through main #3380 at 57586a56. This is positive evidence of the intended final-CI responsibility working, albeit expensively and late.
- **SEED-202 consistent-shared-refresh, ruuf-chan, Cursor auto:** three slices correcting held revisions after actions, settings full downloads, and Cursor observation keying. All four branch runs passed; main #3382 passed at aed1e302. It is a counterexample to treating every execution as unstable. The correction was delivered after the original retrospective exposed the content issue.
- **SEED-205, philip-chan, Cursor auto:** three slices for the mark/toggle, perspective marks and quiet start success. Eight of ten branch runs failed. It needed whole-text/decoration consumer updates, three legend CSS repair commits and two keepInView repairs. Final branch #3403 and main #3404 passed at aef7858b. Observer recovery started multiple mailboxes; the original retained mailbox still shows undiscovered, but a later mailbox, watch-W15CsX, contains exact-SHA success for #3404. The abandoned mailbox is not evidence that final CI was never observed.
- **SEED-206, stanly-chan, Cursor auto:** two freshness slices and two repair commits. Final branch #3396 and main #3399 passed at d39c535a. The current polling-proof gap described above survives that green result.
- **SEED-192 browse-test-purpose, yusuke-chan, Cursor auto:** five slices, three repeated failures of the old call-count assertion, then an appropriate boundary-test repair. Its final in-window publication passed after the cutoff. Trunk closure was still outstanding at the cutoff.

##### Process retrospective

###### The expected process was already stronger than its execution

The installed execution guidance requires CI-safe increments, ownership of verification through terminal results, cause-based failure handling, repair of assertions/timeouts/flakes even after a passing rerun, and final completion through the applicable accepted revision. A failed receipt retains the observer and does not authorize completion or cleanup. Branch success does not replace required trunk-integration observation. The retrospective may start while CI is pending, but its conclusions remain conditional and affected conclusions must be reconsidered after a repair.

The project-specific expectation is also recorded in Claude memory: a failure on a revision the agent publishes is its responsibility to diagnose and repair, including pre-existing/flaky failures. Local and hosted results are expected to agree. A separate personal lesson advocates full suites before shared-path changes; that is an agent's learned practice, not proof of a universally distributed project rule.

The repository's shared AGENTS.md does not carry the same explicit failing-test policy. Cursor's mobile plan then wrote the opposite operational instruction for known baseline failures. Claude's delegation paraphrased the rule as fix or report. This is an instruction-distribution and interpretation failure, not evidence that no instructions existed anywhere. An active competing repair owner remains a legitimate coordination boundary; it must not be confused with origin before my change.

###### Planning attribution became an accidental quality exemption

The mobile plan's diagnostic work was useful: it ran the suspected consumer set with and without a scratch change. The error came afterward, when not caused by this change became this story does not own them; report them if still failing. The initial execution followed that instruction into an unfinished attention stop and asked for a fix-or-waive decision.

That creates avoidable human intervention for a decision Terry had already delegated. It also seeds every subsequent slice with an unstable baseline. The new DD-378 occurrence records this concrete plan-to-execution chain. It is distinct from protecting another active writer's repair, as the admission exception demonstrates.

###### Consumer tracing was performed but did not reliably discover the relevant effects

Multiple briefs explicitly required consumer-trace and detailed proof returns. Several independent refactor passes ran. Source-only reviews and story-obligation checks also ran. Nevertheless, CI found existing Final report UUID consumers, page-wide whole-text checks, launch tab order/byte consumers, paging under changed geometry and the authenticated-read call sequence.

These procedures often verified that the chosen proof matched the chosen story examples. They did not establish that all important effects of the shared implementation change had been selected. The recurring ODF-150 evidence is stronger than any one missed spec. The remedy should improve behavioral impact selection, rather than add another generic checklist or require every test on every tiny change.

For shared geometry, include representative short/tall/narrow/zoomed reading and focus-return transitions. For composed launch input, include existing exact-byte/native boundaries and keyboard traversal. For shared read infrastructure, inspect response consumers and refusal/caching contracts. When the affected surface's suite fits the agreed feedback budget, it belongs before publication. When it does not, make the remaining exposure explicit and preserve final CI ownership.

###### CI diagnostics encouraged narrow repair scope

The bounded diagnostic returns tails around error markers. A quiet reporter can print several failed tests long before its final exit marker; the tail can contain only the last failure. The voice execution recovered thirteen failed tests from the complete seven-browser-job inventory after the short diagnostic omitted already-failing cases. DD-373 documents this. DD-368 describes the same concrete diagnostic problem from an earlier execution; these two IDs should be reconciled during authorized findings maintenance, not treated as independent root causes.

The appropriate tool improvement is a complete failed-test identity inventory alongside bounded details. It does not require injecting every raw log into every coordinator context. This review used all 150 failed logs to avoid repeating that omission.

There is another completeness hazard while a run is still finishing: an early diagnostic can show one failed setup job before later browser jobs fail. The voice coordinator initially wrote an infrastructure disposition, then revised it after the full job set appeared. The final classification must cover every failed job and attempt, not the first red job seen.

###### Repair acceptance focused too narrowly on the current assertion

The legend sequence is the clearest example: one product surface needed three repairs because the full zoomed lifecycle was not established at each acceptance. The native setup test required two distinct diagnoses. Mobile retention repair missed remaining sibling fixtures until another run failed. A keepInView repair fixed Inspect then broke the preceding navigation promise.

The failing line is the starting clue. Repair acceptance needs the causal behavior plus its nearby lifecycle transitions and preserved contracts. Repeatedly allocating a fresh repair agent and refactor agent cannot substitute for the coordinator owning that combined proof boundary.

###### Green reruns and green final tips were sometimes overinterpreted

Setup-only retries can be a bounded way to re-observe an external acquisition failure. They are not a repair for a fixture deadline bug or interaction race. Likewise, publishing a comment-only tip can obtain a new workflow result without fixing the recurring setup cause. The responsive-header transcript explicitly did this more than once. Those tips helped its completion settle, but they did not themselves improve setup reliability.

The same-SHA branch/main contrast proves why one green run cannot settle a known flake. The bounded-refresh coordinator modeled the better rule: its final tip passed, but an earlier unread voice-helper failure remained open, so wrap-up stayed held until that cause was repaired. A later passing revision must not erase an earlier actionable failure.

###### Retrospective timing needs a meaningful post-repair boundary

Starting review while CI runs saves idle time and is expressly supported. It also means a review can say no correction needed immediately before CI finds an omitted consumer. The record must retain that provisional status and revisit the implications of subsequent product repairs.

The automatic review successfully found the bounded-refresh consistency defects and queued a correction that later ran green. That is concrete value. Other review records were narrower: the mark story's retrospective preceded its shared navigation repairs; the freshness story's repair removed a temporal assertion after its review. The available record does not establish an equally strong renewed outcome review of those changes. More automatic full retrospectives are not the first recommendation; require a short, explicit reconsideration of the changed conclusion when the repair broadens or weakens what was reviewed.

###### Coordination and interruption increased rework but do not justify stopping all parallel work

The records show interrupted delegated implementations, competing local Playwright load, repeated resume turns, independent repairs of identical date/setup causes, and publication conflicts as other stories advanced main. ODF-229 and ODF-209 already capture relevant interruption/load mechanisms. The responsive-header agent's claimed suite speedups and timing failures cannot be interpreted without that host contention.

The system also contains expensive fixed work: per-slice refactor agents, source-only review, obligation allocation and repeated guidance reads. DD-375 records about 43k reported subagent tokens and an ID remap after a deletion-only story amendment. Those costs explain part of the execution tail, but this review cannot convert them into a measured CI failure cause or assume removing independent review would improve quality.

ADR 0002 favors continuous integration and independent reconciliation. The evidence supports shorter feedback loops and clear existing repair ownership, not globally serializing every story or inventing a new lock/claim service. The admission case correctly preserved another active owner's work; the two independent npm fixes later required reconciliation. Communicating the diagnosed cause and existing repair coordinates through current handoffs is proportionate.

##### Current outcome and unresolved content

At the reviewed trunk aef7858b, the latest main CI run #3404 passed all jobs. The preceding main runs #3399, #3383 and #3382 also passed. The Intent reader's final in-window branch publication subsequently passed #3406. This is a healthier end state than the raw historical red list suggests, but does not establish the absence of latent nondeterminism.

Concrete current follow-ups are the stale-coordinate touch helper and the narrowed freshness polling proof. The two older main touch failures remain candidates for trace-based diagnosis; this review has not proved they share one cause. Completed fixture/setup fixes should not be reimplemented. Bounded-refresh consistency and explicit reread freshness already have their own completed stories; the accepted heap tradeoff should remain accepted.

The nearby product direction emphasizes understandable test intent and justified proof complexity. These reliability concerns directly support that direction: a test's title must match its observation, and a green result must mean the intended interaction was actually exercised. None requires a broad redesign of the dashboard or replacement of the test framework.

##### Recommended order and success evidence

These are recommendations, not newly queued or executed stories. Several independent outcomes are involved, so this review does not fabricate one omnibus correction plan.

| Order | Bounded response | Evidence that would justify keeping it |
| --- | --- | --- |
| 1 | Put Open Dough's failure ownership rule in project guidance read by every host; distinguish pre-existing cause from an active other repair owner; remove conflicting preparation/delegation wording when encountered | A representative old failing fixture is diagnosed and repaired without a new fix-or-waive interruption; an active sibling's files remain preserved; failure stops are accurately incomplete |
| 2 | Correct tapWhereShown's actual-coordinate observation and settle the affected transitions | A deterministic moving-target case exposes the old mismatch, then passes without locator activation/sleep/retry masking; representative native touch journeys remain meaningful |
| 3 | Restore or honestly narrow the fresh-reread polling proof | Observe a completed fresh read, then a subsequent ordinary unmarked poll; prove the Start session changed-offer promise at its intended boundary or explicitly identify shared proof ownership |
| 4 | Make the CI diagnostic enumerate every failed test and all failed jobs before repair scope is accepted | A synthetic multi-failure job and a run with a later failing sibling return the full identity inventory while details remain bounded; earlier DD-368/DD-373 symptoms do not recur |
| 5 | Apply behavior-based consumer selection and complete-lifecycle repair acceptance to the next shared UI/read change | Existing affected consumers are selected before publication; an entire high-zoom/focus/read lifecycle passes in one repair; compare rework against the concrete missed-consumer baselines here |
| 6 | Reconcile and triage the existing findings rather than add duplicate symptoms | DD-368/DD-373 share one understood response; ODF-150 and DD-377 receive an explicit response/observation status; DD-376 reflects already-observed hosted evidence |

Keep the completion gate: accepted revision and publication target, applicable successful attempt/evidence, all known actionable failures accounted for, and confirmed observation shutdown. No new completion ledger is needed merely to restate those existing facts. Sampling a later successful build without diagnosing a known nondeterministic failure is insufficient.

Do not use the 51.5% baseline as a universal long-term target without comparable workload. For the next relevant changes, judge whether the diagnosed causes recur, whether repairs preserve real behavior observations, whether final trunk proof is actually obtained, and how much avoidable repair/interruption results. Aggregate failure rate alone is distorted by how often agents publish and which stories are being exercised.

##### Architecture and review disposition

This analysis applies [Accepted ADR 0002](https://github.com/terryyin/open-dough/blob/aef7858bb9a5801f179c049b63e064add8b26b08/docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s whole-product focus, continuous integration and stop-and-fix principles; [ADR 0008](https://github.com/terryyin/open-dough/blob/aef7858bb9a5801f179c049b63e064add8b26b08/docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)'s distinction between published facts and machine-local evidence; and [ADR 0010](https://github.com/terryyin/open-dough/blob/aef7858bb9a5801f179c049b63e064add8b26b08/docs/adrs/0010-definition-of-improvement-accepted.md)'s requirement for an evidenced worthwhile improvement with explicit comparison limits. ADR 0009 remains Proposed and is not used as binding authority. A passing branch run is not a published trunk fact; an observer's local shutdown is not itself provider success.

Planning disposition: read-only recommendations; no backlog changes, implementation, source-skill edits, commits or publication. The new process occurrence DD-378 is drafted in the same owned review checkout as this report. Existing ODF-150, DD-373/DD-368, DD-374, DD-375, DD-377 and ProjectFindings DD-376 are referenced without rewriting their historical conclusions or counting this rereview as fresh occurrences of those executions.

The report and process-log change remain local for review. The owned checkout is /Users/terryyin/.codex/worktrees/ci-retrospective-20261101/open-dough, branch codex/ci-retrospective-20261101, created from freshly fetched origin/main at aef7858b. The originating/default checkout is /Users/terryyin/git/open-dough and was not changed. The process log was already above its 500-line warning threshold: it grew from 975 to 988 lines and remains below its 1,000-line ceiling. No historical content was pruned.

The appendices below are generated from the collected provider/Git evidence. Their full CSV/JSON equivalents are in the evidence bundle.

##### Appendix A: execution identities and branch outcomes

Counts are latest run outcomes after #3406 resolved. Main/tag runs are listed separately in Appendix B. Plan numbers are not unique across simultaneous preparation; the full path and story identity are the keys.

| Story identity | Agent / host / recorded model | Plan | Branch runs: success / failure | Final reviewed delivery |
| --- | --- | --- | ---: | --- |
| SEED-192#browse-test-purpose | yusuke-chan / cursor / auto | .planning/slice-plans/429-browse-test-purpose/PLAN.md | 6: 3 / 3 | bfbdd6a6 on branch; pending at cutoff |
| SEED-192#open-development-intent-frame | bastiaan-chan / claude / opus | .planning/slice-plans/424-development-intent-frame/PLAN.md | 4: 2 / 2 | 57586a56 |
| SEED-197#optimize-dashboard-test-feedback | chaifeng-chan / cursor / gemini-4-argon | .planning/slice-plans/424-optimize-dashboard-test-feedback/PLAN.md (six slices) | 6: 1 / 5 | 2b2c3066 |
| SEED-198#responsive-project-header | joseph-chan / cursor / auto | .planning/slice-plans/424-responsive-project-header/PLAN.md | 9: 2 / 7 | 22eb4b3e |
| SEED-199#mobile-session-screen | ivan-chan / cursor / auto | .planning/slice-plans/425-mobile-session-screen/PLAN.md | 11: 3 / 8 | 58026ea3 |
| SEED-200#session-terminal-voice-input | d.kanai-chan / codex / gpt-6.1-sol | .planning/slice-plans/426-session-terminal-voice-input/PLAN.md | 5: 3 / 2 | 806babff |
| SEED-201#reconcile-published-admission-drafts | steven-chan / codex / gpt-6 | Contextual / admitted mission; optimization later planned in its own record | 1: 0 / 1 | ee5badf2 (authorized exception) |
| SEED-202#bounded-dashboard-refresh | pyo-chan / claude / unknown | .planning/slice-plans/426-bounded-dashboard-refresh/PLAN.md | 8: 4 / 4 | 8348a754 |
| SEED-202#consistent-shared-refresh | ruuf-chan / cursor / auto | .planning/slice-plans/428-consistent-shared-refresh/PLAN.md | 4: 4 / 0 | aed1e302 |
| SEED-203#quiet-dashboard-polling | darren-chan / codex / gpt-6 | Contextual / admitted mission; optimization later planned in its own record | 1: 1 / 0 | 30784aac |
| SEED-204#attach-image-at-launch | joey-chan / cursor / auto | .planning/slice-plans/427-attach-image-at-launch/PLAN.md | 9: 7 / 2 | 41f98420 |
| SEED-205#logo-sidebar-toggle | philip-chan / cursor / auto | .planning/slice-plans/430-logo-sidebar-toggle/PLAN.md | 10: 2 / 8 | aef7858b |
| SEED-206#explicit-reread-freshness | stanly-chan / cursor / auto | .planning/slice-plans/431-explicit-reread-freshness/PLAN.md | 5: 3 / 2 | d39c535a |

##### Appendix B: every workflow run

Times are SGT. Attempt is the latest attempt number. For successful reruns, earlier failed jobs remain in Appendix C. Rows on main identify the publication author; integrations include sibling content. A ✓ is not used to imply that a known race was fixed.

| Run / attempt | Created SGT | Target | SHA | Publication owner / story | Final outcome | Failed-attempt scope |
| --- | --- | --- | --- | --- | --- | --- |
| [#3308](https://github.com/terryyin/open-dough/actions/runs/41162721144) / 1 | 10-31 11:03:59 | cursor/optimize-dashboard-test-feedback-seed-197 | [a8ab552d](https://github.com/terryyin/open-dough/commit/a8ab552db260cfef8d7a9667826cedbb2736601f) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | failure | a1: npm 1, browser 0, script 0 |
| [#3309](https://github.com/terryyin/open-dough/actions/runs/41164153337) / 2 | 10-31 11:23:12 | codex/reconcile-published-admission-drafts | [afda244b](https://github.com/terryyin/open-dough/commit/afda244b45ac6a16904e61770ea16551fbc8d9f4) | steven-chan / SEED-201#reconcile-published-admission-drafts | failure | a1: npm 1, browser 5, script 0; a2: npm 0, browser 5, script 0 |
| [#3310](https://github.com/terryyin/open-dough/actions/runs/41164767326) / 1 | 10-31 11:31:53 | cursor/optimize-dashboard-test-feedback-seed-197 | [1ae53f6c](https://github.com/terryyin/open-dough/commit/1ae53f6c6e8a5e9d2f361b9b3090840b52576a91) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | failure | a1: npm 1, browser 0, script 0 |
| [#3311](https://github.com/terryyin/open-dough/actions/runs/41165181622) / 1 | 10-31 11:37:32 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [eaa02378](https://github.com/terryyin/open-dough/commit/eaa0237881d704ee46711d8bc4fb188401b6ec94) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 3, browser 7, script 0 |
| [#3312](https://github.com/terryyin/open-dough/actions/runs/41165287398) / 1 | 10-31 11:39:06 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [1554cd81](https://github.com/terryyin/open-dough/commit/1554cd81d83386549eead40df7abdbc1bf00698b) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 2, browser 4, script 0 |
| [#3313](https://github.com/terryyin/open-dough/actions/runs/41165817894) / 1 | 10-31 11:46:44 | cursor/optimize-dashboard-test-feedback-seed-197 | [67126c6c](https://github.com/terryyin/open-dough/commit/67126c6c432fa5e4ef052ad71af2fc8f706e3cdd) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | failure | a1: npm 2, browser 0, script 0 |
| [#3314](https://github.com/terryyin/open-dough/actions/runs/41166733510) / 1 | 10-31 12:00:26 | codex/dictate-text-into-the-session-terminal-from-its | [e352b41c](https://github.com/terryyin/open-dough/commit/e352b41c20dc7dfb9655353a2a15cc5b967939f1) | d.kanai-chan / SEED-200#session-terminal-voice-input | failure | a1: npm 1, browser 7, script 0 |
| [#3315](https://github.com/terryyin/open-dough/actions/runs/41166760608) / 1 | 10-31 12:00:47 | cursor/optimize-dashboard-test-feedback-seed-197 | [e05b12b7](https://github.com/terryyin/open-dough/commit/e05b12b75c073c8f48dafa505e37097f261195d8) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | failure | a1: npm 2, browser 0, script 0 |
| [#3316](https://github.com/terryyin/open-dough/actions/runs/41168021650) / 1 | 10-31 12:18:25 | codex/dictate-text-into-the-session-terminal-from-its | [f999ae22](https://github.com/terryyin/open-dough/commit/f999ae22a2d56f467953a434f7536587c5cebf54) | d.kanai-chan / SEED-200#session-terminal-voice-input | failure | a1: npm 1, browser 2, script 0 |
| [#3317](https://github.com/terryyin/open-dough/actions/runs/41168325406) / 1 | 10-31 12:22:45 | cursor/optimize-dashboard-test-feedback-seed-197 | [125edc37](https://github.com/terryyin/open-dough/commit/125edc37d04f8c2062c25b1dd7c9a4309a8917a4) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | failure | a1: npm 2, browser 0, script 0 |
| [#3318](https://github.com/terryyin/open-dough/actions/runs/41169548931) / 1 | 10-31 12:40:49 | codex/dictate-text-into-the-session-terminal-from-its | [d1919b36](https://github.com/terryyin/open-dough/commit/d1919b368e687df9233334face13f9f1789f6f3a) | d.kanai-chan / SEED-200#session-terminal-voice-input | success | none |
| [#3319](https://github.com/terryyin/open-dough/actions/runs/41169951906) / 1 | 10-31 12:47:01 | codex/dictate-text-into-the-session-terminal-from-its | [6c2d8744](https://github.com/terryyin/open-dough/commit/6c2d87444ac11423c250b5a301452edd0c561b77) | d.kanai-chan / SEED-200#session-terminal-voice-input | success | none |
| [#3320](https://github.com/terryyin/open-dough/actions/runs/41170389983) / 2 | 10-31 12:53:44 | codex/dictate-text-into-the-session-terminal-from-its | [37fd51f2](https://github.com/terryyin/open-dough/commit/37fd51f2c1b6285672a1e732ed82595aa95aac02) | d.kanai-chan / SEED-200#session-terminal-voice-input | success | a1: npm 1, browser 0, script 0 |
| [#3321](https://github.com/terryyin/open-dough/actions/runs/41171436042) / 1 | 10-31 13:09:15 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [a8ff15c2](https://github.com/terryyin/open-dough/commit/a8ff15c220222c6176b11696d6fb298d82bb21ae) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 0, browser 6, script 0 |
| [#3322](https://github.com/terryyin/open-dough/actions/runs/41171627260) / 2 | 10-31 13:11:56 | main | [806babff](https://github.com/terryyin/open-dough/commit/806babff12bf935a8a2917c0fbf9ff8292735c33) | d.kanai-chan / SEED-200#session-terminal-voice-input | success | a1: npm 1, browser 0, script 0 |
| [#3323](https://github.com/terryyin/open-dough/actions/runs/41171877794) / 1 | 10-31 13:15:42 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [ac83132a](https://github.com/terryyin/open-dough/commit/ac83132ae5bd5530786835b50be36c3b6659ac40) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 1, browser 0, script 0 |
| [#3324](https://github.com/terryyin/open-dough/actions/runs/41172807487) / 1 | 10-31 13:29:44 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [533e9750](https://github.com/terryyin/open-dough/commit/533e9750732e2e3939f4a50777ed60fd8fad734d) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 0, browser 9, script 1 |
| [#3325](https://github.com/terryyin/open-dough/actions/runs/41174170114) / 1 | 10-31 13:50:25 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [75592765](https://github.com/terryyin/open-dough/commit/7559276568a21f65d3abd6d73111ccbc0c7c76a9) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 0, browser 7, script 0 |
| [#3326](https://github.com/terryyin/open-dough/actions/runs/41174225595) / 1 | 10-31 13:51:18 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [b8a0ae17](https://github.com/terryyin/open-dough/commit/b8a0ae17aa46be78ede8ea5bb4f45209087f1a45) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 3, browser 6, script 0 |
| [#3327](https://github.com/terryyin/open-dough/actions/runs/41174445360) / 1 | 10-31 13:54:47 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [576ef4c9](https://github.com/terryyin/open-dough/commit/576ef4c920b62b4e5dc379f251895c85458aafef) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 1, browser 0, script 0 |
| [#3328](https://github.com/terryyin/open-dough/actions/runs/41182720097) / 1 | 10-31 15:59:04 | main | [ee5badf2](https://github.com/terryyin/open-dough/commit/ee5badf2d0c0ffcc3322e8202471b87be78eac3f) | steven-chan / SEED-201#reconcile-published-admission-drafts | failure | a1: npm 2, browser 0, script 1 |
| [#3329](https://github.com/terryyin/open-dough/actions/runs/41183935256) / 1 | 10-31 16:16:40 | main | [b3245ae0](https://github.com/terryyin/open-dough/commit/b3245ae0c71b7229bc318020387116337c9ff33c) | Terry Yin / release / unassigned metadata | failure | a1: npm 1, browser 0, script 0 |
| [#3330](https://github.com/terryyin/open-dough/actions/runs/41183935384) / 1 | 10-31 16:16:40 | v0.3.79 | [b3245ae0](https://github.com/terryyin/open-dough/commit/b3245ae0c71b7229bc318020387116337c9ff33c) | Terry Yin / release / unassigned metadata | failure | a1: npm 1, browser 0, script 0 |
| [#3331](https://github.com/terryyin/open-dough/actions/runs/41185021662) / 1 | 10-31 16:32:29 | main | [c8361ed1](https://github.com/terryyin/open-dough/commit/c8361ed1bc2c38854f060e56d1126e2b55423298) | Terry Yin / release / unassigned metadata | success | none |
| [#3332](https://github.com/terryyin/open-dough/actions/runs/41185741764) / 1 | 10-31 16:43:13 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [697131c4](https://github.com/terryyin/open-dough/commit/697131c4a0f94f3974f296ddf05b112fd63c319a) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 2, browser 2, script 0 |
| [#3333](https://github.com/terryyin/open-dough/actions/runs/41186176148) / 1 | 10-31 16:49:46 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [edfcfe59](https://github.com/terryyin/open-dough/commit/edfcfe59a2ca7ba299854760c9549d54099082eb) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 0, browser 1, script 0 |
| [#3334](https://github.com/terryyin/open-dough/actions/runs/41186654725) / 2 | 10-31 16:57:05 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [40e28e14](https://github.com/terryyin/open-dough/commit/40e28e1488d6c38ef77fbd62ae123cf7449f097d) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 2, browser 0, script 0; a2: npm 0, browser 0, script 1 |
| [#3335](https://github.com/terryyin/open-dough/actions/runs/41186679600) / 2 | 10-31 16:57:29 | codex/quiet-dashboard-polling | [8697d103](https://github.com/terryyin/open-dough/commit/8697d103554f435bebc58aa37fce1b6eb795ed48) | darren-chan / SEED-203#quiet-dashboard-polling | success | a1: npm 1, browser 0, script 0 |
| [#3336](https://github.com/terryyin/open-dough/actions/runs/41187589503) / 2 | 10-31 17:10:25 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [cd63db18](https://github.com/terryyin/open-dough/commit/cd63db18e0c91644b5e05e4ef987f47b54e86fd3) | ivan-chan / SEED-199#mobile-session-screen | success | a1: npm 1, browser 1, script 0 |
| [#3337](https://github.com/terryyin/open-dough/actions/runs/41187674447) / 1 | 10-31 17:11:37 | main | [30784aac](https://github.com/terryyin/open-dough/commit/30784aac0fb847015e68a10e16f999b34fc9f32a) | darren-chan / SEED-203#quiet-dashboard-polling | success | none |
| [#3338](https://github.com/terryyin/open-dough/actions/runs/41188326936) / 1 | 10-31 17:20:54 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [bd5a9094](https://github.com/terryyin/open-dough/commit/bd5a9094e88fb9d0ca30c0539a4c306d768bf342) | pyo-chan / SEED-202#bounded-dashboard-refresh | failure | a1: npm 2, browser 0, script 0 |
| [#3339](https://github.com/terryyin/open-dough/actions/runs/41188390993) / 1 | 10-31 17:21:47 | cursor/optimize-dashboard-test-feedback-seed-197 | [7b9777c7](https://github.com/terryyin/open-dough/commit/7b9777c78c127519d78fe1423080851bd2476b72) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | success | none |
| [#3340](https://github.com/terryyin/open-dough/actions/runs/41188504509) / 2 | 10-31 17:23:27 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [7c761360](https://github.com/terryyin/open-dough/commit/7c7613609f608d50537ce6d9c892bd9d75acaee5) | ivan-chan / SEED-199#mobile-session-screen | success | a1: npm 1, browser 0, script 0 |
| [#3341](https://github.com/terryyin/open-dough/actions/runs/41188888860) / 1 | 10-31 17:29:24 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [c5927db4](https://github.com/terryyin/open-dough/commit/c5927db45224b9bebb11d72daf5bcb9d56fcc069) | joseph-chan / SEED-198#responsive-project-header | success | none |
| [#3342](https://github.com/terryyin/open-dough/actions/runs/41189249981) / 1 | 10-31 17:34:30 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [a2fe577f](https://github.com/terryyin/open-dough/commit/a2fe577fa77a1bc25a3efb018a0c5e44b7d70af9) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 1, browser 0, script 0 |
| [#3343](https://github.com/terryyin/open-dough/actions/runs/41189275017) / 1 | 10-31 17:34:52 | main | [2b2c3066](https://github.com/terryyin/open-dough/commit/2b2c306687aa5eeec02196aa157f873075116bb7) | chaifeng-chan / SEED-197#optimize-dashboard-test-feedback | success | none |
| [#3344](https://github.com/terryyin/open-dough/actions/runs/41189725782) / 1 | 10-31 17:41:39 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [d8e44c0b](https://github.com/terryyin/open-dough/commit/d8e44c0bf2b935c1d619d2ee9ed5c87935dad353) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 2, browser 0, script 0 |
| [#3345](https://github.com/terryyin/open-dough/actions/runs/41189798727) / 1 | 10-31 17:42:44 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [eb1ee3e3](https://github.com/terryyin/open-dough/commit/eb1ee3e3fc4abb5eab82dd865209193574e177c6) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 2, browser 0, script 1 |
| [#3346](https://github.com/terryyin/open-dough/actions/runs/41189821168) / 1 | 10-31 17:43:04 | main | [adbe9810](https://github.com/terryyin/open-dough/commit/adbe9810cb7bd9587a8b22b7c856ba70a396e747) | ivan-chan / SEED-199#mobile-session-screen | failure | a1: npm 0, browser 2, script 0 |
| [#3347](https://github.com/terryyin/open-dough/actions/runs/41190556182) / 1 | 10-31 17:54:10 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [d0c5bb86](https://github.com/terryyin/open-dough/commit/d0c5bb864706db16500763061483cec147235826) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 2, browser 0, script 0 |
| [#3348](https://github.com/terryyin/open-dough/actions/runs/41190591162) / 1 | 10-31 17:54:45 | cursor/use-the-full-mobile-screen-for-sessions-and-simp | [58026ea3](https://github.com/terryyin/open-dough/commit/58026ea33ff991eaf9069f454335a03e0dcddbbc) | ivan-chan / SEED-199#mobile-session-screen | success | none |
| [#3349](https://github.com/terryyin/open-dough/actions/runs/41190606676) / 1 | 10-31 17:54:59 | main | [58026ea3](https://github.com/terryyin/open-dough/commit/58026ea33ff991eaf9069f454335a03e0dcddbbc) | ivan-chan / SEED-199#mobile-session-screen | success | none |
| [#3350](https://github.com/terryyin/open-dough/actions/runs/41191027682) / 1 | 10-31 18:01:23 | cursor/simplify-the-project-header-and-use-a-dropdown-o | [6bee846b](https://github.com/terryyin/open-dough/commit/6bee846bfc9ee4fb84df723c5d47865926ae451f) | joseph-chan / SEED-198#responsive-project-header | success | none |
| [#3351](https://github.com/terryyin/open-dough/actions/runs/41191328229) / 1 | 10-31 18:05:36 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [218b8d92](https://github.com/terryyin/open-dough/commit/218b8d9263cbe52f9872d6ce3e497edf06c8477a) | pyo-chan / SEED-202#bounded-dashboard-refresh | failure | a1: npm 2, browser 0, script 0 |
| [#3352](https://github.com/terryyin/open-dough/actions/runs/41191928806) / 1 | 10-31 18:14:19 | main | [ce117223](https://github.com/terryyin/open-dough/commit/ce1172231572379fa032516da719e86a84074f40) | joseph-chan / SEED-198#responsive-project-header | failure | a1: npm 0, browser 1, script 0 |
| [#3353](https://github.com/terryyin/open-dough/actions/runs/41192440439) / 1 | 10-31 18:21:45 | main | [22eb4b3e](https://github.com/terryyin/open-dough/commit/22eb4b3e20a302355e0cb0eba82f52e30ae6fbe1) | joseph-chan / SEED-198#responsive-project-header | success | none |
| [#3354](https://github.com/terryyin/open-dough/actions/runs/41193368606) / 1 | 10-31 18:35:20 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [2d8118db](https://github.com/terryyin/open-dough/commit/2d8118db5328a454d2299b70c28338e85ffd91ff) | pyo-chan / SEED-202#bounded-dashboard-refresh | success | none |
| [#3355](https://github.com/terryyin/open-dough/actions/runs/41194050673) / 1 | 10-31 18:45:36 | cursor/attach-an-image-when-starting-a-session | [59c47d4c](https://github.com/terryyin/open-dough/commit/59c47d4c2183cbb908d645f649a37bbde063abb0) | joey-chan / SEED-204#attach-image-at-launch | failure | a1: npm 0, browser 7, script 0 |
| [#3356](https://github.com/terryyin/open-dough/actions/runs/41195237601) / 1 | 10-31 19:03:12 | cursor/attach-an-image-when-starting-a-session | [752504ff](https://github.com/terryyin/open-dough/commit/752504ffbeada8b716b6af7b5dd8ed18edf4868d) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3357](https://github.com/terryyin/open-dough/actions/runs/41195698251) / 1 | 10-31 19:09:45 | cursor/attach-an-image-when-starting-a-session | [b451486b](https://github.com/terryyin/open-dough/commit/b451486b22da3867ac846780335b8cd2b264695a) | joey-chan / SEED-204#attach-image-at-launch | failure | a1: npm 0, browser 1, script 0 |
| [#3358](https://github.com/terryyin/open-dough/actions/runs/41195930489) / 1 | 10-31 19:12:58 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [e01504b0](https://github.com/terryyin/open-dough/commit/e01504b0a15fdadb9d5d42e6298141e9b712723f) | pyo-chan / SEED-202#bounded-dashboard-refresh | failure | a1: npm 1, browser 0, script 0 |
| [#3359](https://github.com/terryyin/open-dough/actions/runs/41196159364) / 1 | 10-31 19:16:19 | claude/experience-the-development-and-intent-frame | [9913a6d4](https://github.com/terryyin/open-dough/commit/9913a6d40006e3de9980ab8d97e0e2f3197b5f0d) | bastiaan-chan / SEED-192#open-development-intent-frame | failure | a1: npm 0, browser 1, script 0 |
| [#3360](https://github.com/terryyin/open-dough/actions/runs/41196250164) / 1 | 10-31 19:17:38 | claude/experience-the-development-and-intent-frame | [4b5a396f](https://github.com/terryyin/open-dough/commit/4b5a396f408e5ba3eaa24384596b85465b48a767) | bastiaan-chan / SEED-192#open-development-intent-frame | failure | a1: npm 0, browser 1, script 0 |
| [#3361](https://github.com/terryyin/open-dough/actions/runs/41196457556) / 1 | 10-31 19:20:34 | cursor/attach-an-image-when-starting-a-session | [305513aa](https://github.com/terryyin/open-dough/commit/305513aa26430e77186dbef250ce1376547e4b56) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3362](https://github.com/terryyin/open-dough/actions/runs/41196698263) / 1 | 10-31 19:24:02 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [d4190ce4](https://github.com/terryyin/open-dough/commit/d4190ce4c027c75c9b15fa381369272d456f9637) | pyo-chan / SEED-202#bounded-dashboard-refresh | failure | a1: npm 0, browser 1, script 0 |
| [#3363](https://github.com/terryyin/open-dough/actions/runs/41196775816) / 1 | 10-31 19:25:09 | cursor/attach-an-image-when-starting-a-session | [affcf660](https://github.com/terryyin/open-dough/commit/affcf660ea7272661807b64abf70014c6e84a292) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3364](https://github.com/terryyin/open-dough/actions/runs/41196838540) / 1 | 10-31 19:26:05 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [76122bdf](https://github.com/terryyin/open-dough/commit/76122bdf5b4922fff2c0493cee58ecfaa715f696) | pyo-chan / SEED-202#bounded-dashboard-refresh | success | none |
| [#3365](https://github.com/terryyin/open-dough/actions/runs/41197421599) / 1 | 10-31 19:34:34 | cursor/attach-an-image-when-starting-a-session | [939122ae](https://github.com/terryyin/open-dough/commit/939122ae72945936cbcb6506ff0f8fb6bd726a8a) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3366](https://github.com/terryyin/open-dough/actions/runs/41197425328) / 1 | 10-31 19:34:37 | claude/experience-the-development-and-intent-frame | [1351254e](https://github.com/terryyin/open-dough/commit/1351254ebdb5c72dc62469a45f401edae309e9e1) | bastiaan-chan / SEED-192#open-development-intent-frame | success | none |
| [#3367](https://github.com/terryyin/open-dough/actions/runs/41198117963) / 1 | 10-31 19:44:43 | claude/experience-the-development-and-intent-frame | [e2d10052](https://github.com/terryyin/open-dough/commit/e2d10052bb09eede4bb809820d46753f83a313d9) | bastiaan-chan / SEED-192#open-development-intent-frame | success | none |
| [#3368](https://github.com/terryyin/open-dough/actions/runs/41198430330) / 1 | 10-31 19:49:14 | cursor/attach-an-image-when-starting-a-session | [cefa4184](https://github.com/terryyin/open-dough/commit/cefa41849ad5d11d0b789759a6e29b69b52d89dc) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3369](https://github.com/terryyin/open-dough/actions/runs/41198456543) / 1 | 10-31 19:49:39 | main | [e2d10052](https://github.com/terryyin/open-dough/commit/e2d10052bb09eede4bb809820d46753f83a313d9) | bastiaan-chan / SEED-192#open-development-intent-frame | failure | a1: npm 0, browser 1, script 0 |
| [#3370](https://github.com/terryyin/open-dough/actions/runs/41198621131) / 1 | 10-31 19:52:04 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [6f90752c](https://github.com/terryyin/open-dough/commit/6f90752cd82da37e735e0730216e2651b79a145f) | pyo-chan / SEED-202#bounded-dashboard-refresh | success | none |
| [#3371](https://github.com/terryyin/open-dough/actions/runs/41199106033) / 1 | 10-31 19:59:25 | cursor/attach-an-image-when-starting-a-session | [a1684512](https://github.com/terryyin/open-dough/commit/a16845123778d06a2773d4a710d900ce0ab1c438) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3372](https://github.com/terryyin/open-dough/actions/runs/41199304954) / 1 | 10-31 20:02:00 | claude/keep-dashboard-refresh-work-bounded-across-viewe | [a6fb4523](https://github.com/terryyin/open-dough/commit/a6fb4523a6ef251cfddc55466475be262ed76729) | pyo-chan / SEED-202#bounded-dashboard-refresh | success | none |
| [#3373](https://github.com/terryyin/open-dough/actions/runs/41199543929) / 1 | 10-31 20:05:17 | cursor/attach-an-image-when-starting-a-session | [b6214f9a](https://github.com/terryyin/open-dough/commit/b6214f9a51b823a16779b4f7f5a65c6e754f5db9) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3374](https://github.com/terryyin/open-dough/actions/runs/41199923359) / 1 | 10-31 20:10:31 | main | [8348a754](https://github.com/terryyin/open-dough/commit/8348a754673a3d58a83ca720fd3024d0b6cc44ad) | pyo-chan / SEED-202#bounded-dashboard-refresh | success | none |
| [#3375](https://github.com/terryyin/open-dough/actions/runs/41199947303) / 1 | 10-31 20:10:52 | main | [41f98420](https://github.com/terryyin/open-dough/commit/41f98420549674cc0dad38153465159983204946) | joey-chan / SEED-204#attach-image-at-launch | success | none |
| [#3376](https://github.com/terryyin/open-dough/actions/runs/41201179446) / 1 | 10-31 20:27:24 | cursor/keep-shared-refresh-answers-consistent-with-what | [bd970ab3](https://github.com/terryyin/open-dough/commit/bd970ab3f9ce756d9a98681b7b846c70e8dd001a) | ruuf-chan / SEED-202#consistent-shared-refresh | success | none |
| [#3377](https://github.com/terryyin/open-dough/actions/runs/41201268871) / 1 | 10-31 20:28:34 | main | [96edd530](https://github.com/terryyin/open-dough/commit/96edd530d7eca0893cd550b379b4c747ca3caef5) | bastiaan-chan / SEED-192#open-development-intent-frame | failure | a1: npm 0, browser 1, script 0 |
| [#3378](https://github.com/terryyin/open-dough/actions/runs/41201770985) / 1 | 10-31 20:35:13 | cursor/keep-shared-refresh-answers-consistent-with-what | [1bdb3420](https://github.com/terryyin/open-dough/commit/1bdb3420f32afd5bac2ac8fede621282ca3dea39) | ruuf-chan / SEED-202#consistent-shared-refresh | success | none |
| [#3379](https://github.com/terryyin/open-dough/actions/runs/41202817393) / 1 | 10-31 20:49:38 | cursor/keep-shared-refresh-answers-consistent-with-what | [81abccbd](https://github.com/terryyin/open-dough/commit/81abccbdb4b779a875820e26c78c73ef5e878c55) | ruuf-chan / SEED-202#consistent-shared-refresh | success | none |
| [#3380](https://github.com/terryyin/open-dough/actions/runs/41203076231) / 1 | 10-31 20:53:12 | main | [57586a56](https://github.com/terryyin/open-dough/commit/57586a562b13023d6f50217a4d8a468a6c4ccd3a) | bastiaan-chan / SEED-192#open-development-intent-frame | success | none |
| [#3381](https://github.com/terryyin/open-dough/actions/runs/41203089174) / 1 | 10-31 20:53:23 | cursor/keep-shared-refresh-answers-consistent-with-what | [1e910b86](https://github.com/terryyin/open-dough/commit/1e910b86d8fe2db7944358cadf045e05c7f9d9e7) | ruuf-chan / SEED-202#consistent-shared-refresh | success | none |
| [#3382](https://github.com/terryyin/open-dough/actions/runs/41203778574) / 1 | 10-31 21:02:47 | main | [aed1e302](https://github.com/terryyin/open-dough/commit/aed1e3026ea7da5bd4d00424ea24a9a6d57b19c6) | ruuf-chan / SEED-202#consistent-shared-refresh | success | none |
| [#3383](https://github.com/terryyin/open-dough/actions/runs/41211444990) / 1 | 10-31 22:43:24 | main | [84a3d957](https://github.com/terryyin/open-dough/commit/84a3d95782815c80ae66f246f929966307af745b) | Terry Yin / release / unassigned metadata | success | none |
| [#3384](https://github.com/terryyin/open-dough/actions/runs/41212342949) / 1 | 10-31 22:55:05 | cursor/browse-a-project-s-test-source-in-intent | [ab73ddd4](https://github.com/terryyin/open-dough/commit/ab73ddd47574e48447445e385c6fe5d91194fc68) | yusuke-chan / SEED-192#browse-test-purpose | success | none |
| [#3385](https://github.com/terryyin/open-dough/actions/runs/41212447397) / 1 | 10-31 22:56:28 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [63c7699e](https://github.com/terryyin/open-dough/commit/63c7699e57ce9ec57112e30434df07e944d3eaea) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 9, script 0 |
| [#3386](https://github.com/terryyin/open-dough/actions/runs/41213325952) / 1 | 10-31 23:07:24 | cursor/make-explicit-dashboard-re-reads-observe-fresh-e | [2010301f](https://github.com/terryyin/open-dough/commit/2010301f933b951b34e37c6538c957658a545080) | stanly-chan / SEED-206#explicit-reread-freshness | success | none |
| [#3387](https://github.com/terryyin/open-dough/actions/runs/41213869876) / 1 | 10-31 23:14:05 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [539b192b](https://github.com/terryyin/open-dough/commit/539b192bc047f98ac2247870567da3a30856d575) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3388](https://github.com/terryyin/open-dough/actions/runs/41214067769) / 1 | 10-31 23:16:34 | cursor/browse-a-project-s-test-source-in-intent | [2b74f403](https://github.com/terryyin/open-dough/commit/2b74f4030dc5dfd7b79c61259c1cd656113ad27b) | yusuke-chan / SEED-192#browse-test-purpose | failure | a1: npm 0, browser 1, script 0 |
| [#3389](https://github.com/terryyin/open-dough/actions/runs/41214098873) / 1 | 10-31 23:17:00 | cursor/make-explicit-dashboard-re-reads-observe-fresh-e | [97c570d2](https://github.com/terryyin/open-dough/commit/97c570d2e8e93ccd0095fec01beba25f48903773) | stanly-chan / SEED-206#explicit-reread-freshness | failure | a1: npm 0, browser 1, script 0 |
| [#3390](https://github.com/terryyin/open-dough/actions/runs/41214211457) / 1 | 10-31 23:18:22 | cursor/make-explicit-dashboard-re-reads-observe-fresh-e | [1a3d3d62](https://github.com/terryyin/open-dough/commit/1a3d3d625f1ca7ef2ab3c74bfb2b0aecd993c125) | stanly-chan / SEED-206#explicit-reread-freshness | success | none |
| [#3391](https://github.com/terryyin/open-dough/actions/runs/41214249203) / 1 | 10-31 23:18:49 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [8f878dca](https://github.com/terryyin/open-dough/commit/8f878dca961344d4cc3bc42bf1ef4045fe2cb832) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3392](https://github.com/terryyin/open-dough/actions/runs/41214826618) / 1 | 10-31 23:26:01 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [d470063c](https://github.com/terryyin/open-dough/commit/d470063cd28d1c91c624cb8cc77640e18a118ab2) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3393](https://github.com/terryyin/open-dough/actions/runs/41215085277) / 1 | 10-31 23:29:27 | cursor/browse-a-project-s-test-source-in-intent | [9c6bf664](https://github.com/terryyin/open-dough/commit/9c6bf66481d01b68894975ea40f78184113b7420) | yusuke-chan / SEED-192#browse-test-purpose | failure | a1: npm 0, browser 1, script 0 |
| [#3394](https://github.com/terryyin/open-dough/actions/runs/41215201963) / 1 | 10-31 23:30:49 | cursor/make-explicit-dashboard-re-reads-observe-fresh-e | [51070fa2](https://github.com/terryyin/open-dough/commit/51070fa2268a1096a20f1ca4bae8982eb82c1a44) | stanly-chan / SEED-206#explicit-reread-freshness | failure | a1: npm 0, browser 1, script 0 |
| [#3395](https://github.com/terryyin/open-dough/actions/runs/41216028080) / 1 | 10-31 23:41:12 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [5f9ca93c](https://github.com/terryyin/open-dough/commit/5f9ca93c6fb4dd0255366a38bef9d6ae61fc294f) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3396](https://github.com/terryyin/open-dough/actions/runs/41216031515) / 1 | 10-31 23:41:15 | cursor/make-explicit-dashboard-re-reads-observe-fresh-e | [256c30f4](https://github.com/terryyin/open-dough/commit/256c30f40045a90c8a9a725358490105c72fccf1) | stanly-chan / SEED-206#explicit-reread-freshness | success | none |
| [#3397](https://github.com/terryyin/open-dough/actions/runs/41216241706) / 1 | 10-31 23:43:57 | cursor/browse-a-project-s-test-source-in-intent | [16e8ffc4](https://github.com/terryyin/open-dough/commit/16e8ffc45d53589cc561966bf545b71940da4ce6) | yusuke-chan / SEED-192#browse-test-purpose | failure | a1: npm 0, browser 1, script 0 |
| [#3398](https://github.com/terryyin/open-dough/actions/runs/41216443225) / 1 | 10-31 23:46:27 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [31bd2744](https://github.com/terryyin/open-dough/commit/31bd2744cdf53b1d3eae724d51ea1ca24b999026) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3399](https://github.com/terryyin/open-dough/actions/runs/41216744190) / 1 | 10-31 23:50:19 | main | [d39c535a](https://github.com/terryyin/open-dough/commit/d39c535af572ceeb18df71f8a1d88cfa7f392734) | stanly-chan / SEED-206#explicit-reread-freshness | success | none |
| [#3400](https://github.com/terryyin/open-dough/actions/runs/41217080721) / 1 | 10-31 23:54:34 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [d62f0a66](https://github.com/terryyin/open-dough/commit/d62f0a66a2b3daf32cc05181f5c0a76967471d91) | philip-chan / SEED-205#logo-sidebar-toggle | success | none |
| [#3401](https://github.com/terryyin/open-dough/actions/runs/41217479901) / 1 | 10-31 23:59:47 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [923607ba](https://github.com/terryyin/open-dough/commit/923607ba50ff55495094737cce3faec13122c027) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 1, script 0 |
| [#3402](https://github.com/terryyin/open-dough/actions/runs/41218503549) / 1 | 11-01 00:11:57 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [539d68f3](https://github.com/terryyin/open-dough/commit/539d68f3227cb7e7e813043648b94e267d772971) | philip-chan / SEED-205#logo-sidebar-toggle | failure | a1: npm 0, browser 2, script 0 |
| [#3403](https://github.com/terryyin/open-dough/actions/runs/41219133028) / 1 | 11-01 00:19:35 | cursor/use-the-open-dough-mark-as-the-sidebar-toggle-an | [6aa17630](https://github.com/terryyin/open-dough/commit/6aa1763068ff5d5969db61038a547f048074026b) | philip-chan / SEED-205#logo-sidebar-toggle | success | none |
| [#3404](https://github.com/terryyin/open-dough/actions/runs/41219612973) / 1 | 11-01 00:25:26 | main | [aef7858b](https://github.com/terryyin/open-dough/commit/aef7858bb9a5801f179c049b63e064add8b26b08) | philip-chan / SEED-205#logo-sidebar-toggle | success | none |
| [#3405](https://github.com/terryyin/open-dough/actions/runs/41253114575) / 1 | 11-01 07:34:42 | cursor/browse-a-project-s-test-source-in-intent | [75cf1785](https://github.com/terryyin/open-dough/commit/75cf1785d5fb391087fc9298fe719ea03d845e09) | yusuke-chan / SEED-192#browse-test-purpose | success | none |
| [#3406](https://github.com/terryyin/open-dough/actions/runs/41253497787) / 1 | 11-01 07:40:19 | cursor/browse-a-project-s-test-source-in-intent | [bfbdd6a6](https://github.com/terryyin/open-dough/commit/bfbdd6a6dad0741d7874591aa9e5d1eacb0c3eac) | yusuke-chan / SEED-192#browse-test-purpose | success (pending at cutoff) | none |

##### Appendix C: all failed jobs, including superseded attempts

The evidence bundle keeps each complete log as failed-job-logs/log-JOBID.txt. Test identities below are a compact file inventory; failure-cases.csv preserves every printed test name, exact signals, attempt and log line. Npm entries have no test because the checks did not run in that job.

| Run / attempt | Failed job / link | Step | Failed-test files or diagnosis |
| --- | --- | --- | --- |
| #3308 / 1 | [lint](https://github.com/terryyin/open-dough/actions/runs/41162721144/job/124423582583) | Install npm dependencies | npm acquisition deadline exceeded |
| #3309 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961106) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3309 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961185) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3309 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961039) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3309 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961062) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3309 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961061) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3309 / 1 | [lint](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124427961046) | Install npm dependencies | npm acquisition deadline exceeded |
| #3309 / 2 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124429092341) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3309 / 2 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124429103636) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3309 / 2 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124429105091) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3309 / 2 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124429073701) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3309 / 2 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41164153337/job/124429073797) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3310 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41164767326/job/124429842316) | Install npm dependencies | npm acquisition deadline exceeded |
| #3311 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089901) | Install npm dependencies | npm acquisition deadline exceeded |
| #3311 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089975) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3311 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089818) | Run the dashboard browser suite | dashboard/tests/board-paging-side-panel.spec.ts:35 |
| #3311 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089798) | Install npm dependencies | npm acquisition deadline exceeded |
| #3311 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089934) | Run the dashboard browser suite | dashboard/tests/board-paging-sessions-sidebar.spec.ts:40, dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3311 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089915) | Run the dashboard browser suite | dashboard/tests/story-review-touch.spec.ts:11 |
| #3311 / 1 | [dashboard (6/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431090037) | Run the dashboard browser suite | dashboard/tests/side-panel-width-stacking.spec.ts:32 |
| #3311 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089886) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3311 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089793) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44, dashboard/tests/session-workspace-retirement.spec.ts:107, dashboard/tests/session-workspace-retirement.spec.ts:28 |
| #3311 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41165181622/job/124431089840) | Install npm dependencies | npm acquisition deadline exceeded |
| #3312 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431418152) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3312 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431418017) | Install npm dependencies | npm acquisition deadline exceeded |
| #3312 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431417927) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3312 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431418010) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3312 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431417978) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3312 / 1 | [lint](https://github.com/terryyin/open-dough/actions/runs/41165287398/job/124431417960) | Install npm dependencies | npm acquisition deadline exceeded |
| #3313 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41165817894/job/124433032839) | Install npm dependencies | npm acquisition deadline exceeded |
| #3313 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41165817894/job/124433032633) | Install npm dependencies | npm acquisition deadline exceeded |
| #3314 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435808979) | Run the dashboard browser suite | dashboard/tests/agent-terminal-touch.spec.ts:45 |
| #3314 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435808867) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3314 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435809108) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-touch.spec.ts:39 |
| #3314 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435808908) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3314 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435809098) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3314 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435808877) | Install npm dependencies | npm acquisition deadline exceeded |
| #3314 / 1 | [dashboard (6/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435809015) | Run the dashboard browser suite | dashboard/tests/session-terminal-voice-lifecycle.spec.ts:24 |
| #3314 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41166733510/job/124435809061) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3315 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41166760608/job/124435887769) | Install npm dependencies | npm acquisition deadline exceeded |
| #3315 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41166760608/job/124435887672) | Install npm dependencies | npm acquisition deadline exceeded |
| #3316 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41168021650/job/124439701907) | Run the dashboard browser suite | dashboard/tests/agent-terminal-touch.spec.ts:45 |
| #3316 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41168021650/job/124439701896) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-touch.spec.ts:40 |
| #3316 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41168021650/job/124439701837) | Install npm dependencies | npm acquisition deadline exceeded |
| #3317 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41168325406/job/124440614322) | Install npm dependencies | npm acquisition deadline exceeded |
| #3317 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41168325406/job/124440614512) | Install npm dependencies | npm acquisition deadline exceeded |
| #3320 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41170389983/job/124446890163) | Install npm dependencies | npm acquisition deadline exceeded |
| #3321 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042703) | Run the dashboard browser suite | dashboard/tests/agent-terminal-touch.spec.ts:40 |
| #3321 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042695) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3321 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042713) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3321 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042615) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3321 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042711) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3321 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41171436042/job/124450042764) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3322 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41171627260/job/124450611780) | Install npm dependencies | npm acquisition deadline exceeded |
| #3323 / 1 | [dashboard (1/12)](https://github.com/terryyin/open-dough/actions/runs/41171877794/job/124451372182) | Install npm dependencies | npm acquisition deadline exceeded |
| #3324 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179029) | Run the dashboard browser suite | dashboard/tests/board-reading.spec.ts:75 |
| #3324 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179056) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation-report.spec.ts:34, dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3324 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179089) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-touch.spec.ts:39 |
| #3324 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179036) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3324 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179072) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3324 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179069) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-refresh.spec.ts:137 |
| #3324 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179054) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation.spec.ts:106, dashboard/tests/recently-done-progressive-navigation.spec.ts:132, dashboard/tests/recently-done-progressive-navigation.spec.ts:38, dashboard/tests/sessions-sidebar.spec.ts:109 |
| #3324 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179035) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3324 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179087) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44, dashboard/tests/recently-done-sessions-sidebar-reopen.spec.ts:88 |
| #3324 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41172807487/job/124454179114) | Run test | tests/native-setup.sh |
| #3325 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458162021) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation-report.spec.ts:34, dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3325 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161732) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3325 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161654) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3325 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161698) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-refresh.spec.ts:137, dashboard/tests/story-review-touch.spec.ts:11 |
| #3325 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161832) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation.spec.ts:106, dashboard/tests/recently-done-progressive-navigation.spec.ts:132, dashboard/tests/recently-done-progressive-navigation.spec.ts:38 |
| #3325 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161695) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3325 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41174170114/job/124458161692) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3326 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323627) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation-report.spec.ts:34, dashboard/tests/session-workspace-retirement-claude.spec.ts:119 |
| #3326 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323659) | Run the dashboard browser suite | dashboard/tests/session-workspace-retirement-claude-done.spec.ts:35, dashboard/tests/session-workspace-retirement-claude-done.spec.ts:93 |
| #3326 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323551) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171, dashboard/tests/session-workspace-retirement-attach.spec.ts:36 |
| #3326 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323662) | Install npm dependencies | npm acquisition deadline exceeded |
| #3326 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323605) | Run the dashboard browser suite | dashboard/tests/recently-done-progressive-navigation.spec.ts:106, dashboard/tests/recently-done-progressive-navigation.spec.ts:132, dashboard/tests/recently-done-progressive-navigation.spec.ts:38 |
| #3326 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323730) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154, dashboard/tests/session-workspace-retirement-done.spec.ts:25 |
| #3326 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323555) | Run the dashboard browser suite | dashboard/tests/agent-terminal-codex-page.spec.ts:178, dashboard/tests/agent-terminal-codex-page.spec.ts:44 |
| #3326 / 1 | [lint](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323669) | Install npm dependencies | npm acquisition deadline exceeded |
| #3326 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41174225595/job/124458323674) | Install npm dependencies | npm acquisition deadline exceeded |
| #3327 / 1 | [dashboard (1/12)](https://github.com/terryyin/open-dough/actions/runs/41174445360/job/124458973739) | Install npm dependencies | npm acquisition deadline exceeded |
| #3328 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41182720097/job/124483264398) | Install npm dependencies | npm acquisition deadline exceeded |
| #3328 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41182720097/job/124483264433) | Install npm dependencies | npm acquisition deadline exceeded |
| #3328 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41182720097/job/124483264185) | Run test | tests/native-setup.sh |
| #3329 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41183935256/job/124486868271) | Install npm dependencies | npm acquisition deadline exceeded |
| #3330 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41183935384/job/124486868707) | Install npm dependencies | npm acquisition deadline exceeded |
| #3332 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41185741764/job/124492188649) | Install npm dependencies | npm acquisition deadline exceeded |
| #3332 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41185741764/job/124492188591) | Run the dashboard browser suite | dashboard/tests/cursor-session-recovery.spec.ts:171 |
| #3332 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41185741764/job/124492188608) | Install npm dependencies | npm acquisition deadline exceeded |
| #3332 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41185741764/job/124492188605) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-codex.spec.ts:154 |
| #3333 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41186176148/job/124493444787) | Run the dashboard browser suite | dashboard/tests/agent-terminal-touch.spec.ts:46 |
| #3334 / 1 | [dashboard (3/12)](https://github.com/terryyin/open-dough/actions/runs/41186654725/job/124494836809) | Install npm dependencies | npm acquisition deadline exceeded |
| #3334 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41186654725/job/124494836733) | Install npm dependencies | npm acquisition deadline exceeded |
| #3334 / 2 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41186654725/job/124495883543) | Run test | tests/native-setup.sh |
| #3335 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41186679600/job/124494910862) | Install npm dependencies | npm acquisition deadline exceeded |
| #3336 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41187589503/job/124497554123) | Run the dashboard browser suite | dashboard/tests/story-review-touch.spec.ts:11 |
| #3336 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41187589503/job/124497554179) | Install npm dependencies | npm acquisition deadline exceeded |
| #3338 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41188326936/job/124499709305) | Install npm dependencies | npm acquisition deadline exceeded |
| #3338 / 1 | [lint](https://github.com/terryyin/open-dough/actions/runs/41188326936/job/124499708998) | Install npm dependencies | npm acquisition deadline exceeded |
| #3340 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41188504509/job/124500228603) | Install npm dependencies | npm acquisition deadline exceeded |
| #3342 / 1 | [dashboard (3/12)](https://github.com/terryyin/open-dough/actions/runs/41189249981/job/124502430226) | Install npm dependencies | npm acquisition deadline exceeded |
| #3344 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41189725782/job/124503834830) | Install npm dependencies | npm acquisition deadline exceeded |
| #3344 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41189725782/job/124503834745) | Install npm dependencies | npm acquisition deadline exceeded |
| #3345 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41189798727/job/124504043728) | Install npm dependencies | npm acquisition deadline exceeded |
| #3345 / 1 | [test (2/3)](https://github.com/terryyin/open-dough/actions/runs/41189798727/job/124504043597) | Install npm dependencies | npm acquisition deadline exceeded |
| #3345 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41189798727/job/124504043519) | Run test | tests/native-setup.sh |
| #3346 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41189821168/job/124504112585) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-touch.spec.ts:39 |
| #3346 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41189821168/job/124504112635) | Run the dashboard browser suite | dashboard/tests/story-review-touch.spec.ts:11 |
| #3347 / 1 | [dashboard (1/12)](https://github.com/terryyin/open-dough/actions/runs/41190556182/job/124506306063) | Install npm dependencies | npm acquisition deadline exceeded |
| #3347 / 1 | [test (3/3)](https://github.com/terryyin/open-dough/actions/runs/41190556182/job/124506306076) | Install npm dependencies | npm acquisition deadline exceeded |
| #3351 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41191328229/job/124508542270) | Install npm dependencies | npm acquisition deadline exceeded |
| #3351 / 1 | [test (1/3)](https://github.com/terryyin/open-dough/actions/runs/41191328229/job/124508542095) | Install npm dependencies | npm acquisition deadline exceeded |
| #3352 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41191928806/job/124510297092) | Run the dashboard browser suite | dashboard/tests/final-report-touch.spec.ts:39 |
| #3355 / 1 | [dashboard (1/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518474) | Run the dashboard browser suite | dashboard/tests/agent-launch-dialog-touch.spec.ts:38, dashboard/tests/boundary/agent-launch-ad-hoc-codex-input.spec.ts:26 |
| #3355 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518467) | Run the dashboard browser suite | dashboard/tests/frame-launch-look.spec.ts:84 |
| #3355 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518413) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-cursor-launch-wait.spec.ts:74 |
| #3355 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518501) | Run the dashboard browser suite | dashboard/tests/agent-launch-dialog-layout.spec.ts:153, dashboard/tests/agent-launch-dialog-layout.spec.ts:51, dashboard/tests/agent-launch-start-session-layout.spec.ts:143, dashboard/tests/agent-launch-start-session-layout.spec.ts:44, dashboard/tests/agent-launch-start-session-layout.spec.ts:92 |
| #3355 / 1 | [dashboard (3/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518476) | Run the dashboard browser suite | dashboard/tests/agent-launch-start-session-touch.spec.ts:30 |
| #3355 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518488) | Run the dashboard browser suite | dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts:110, dashboard/tests/codexEffortDialogCases.ts:5 |
| #3355 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41194050673/job/124516518366) | Run the dashboard browser suite | dashboard/tests/agent-launch-model.spec.ts:162 |
| #3357 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41195698251/job/124521297953) | Run the dashboard browser suite | dashboard/tests/recently-done-sessions-sidebar-reopen.spec.ts:18 |
| #3358 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41195930489/job/124521961075) | Install npm dependencies | npm acquisition deadline exceeded |
| #3359 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41196159364/job/124522629953) | Run the dashboard browser suite | dashboard/tests/published-facts-reading.spec.ts:142, dashboard/tests/published-facts-reading.spec.ts:69 |
| #3360 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41196250164/job/124522898463) | Run the dashboard browser suite | dashboard/tests/published-facts-reading.spec.ts:142, dashboard/tests/published-facts-reading.spec.ts:69 |
| #3362 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41196698263/job/124524194130) | Run the dashboard browser suite | dashboard/tests/session-terminal-voice-lifecycle.spec.ts:24 |
| #3369 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41198456543/job/124529293076) | Run the dashboard browser suite | dashboard/tests/story-review-touch.spec.ts:11 |
| #3377 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41201268871/job/124537386403) | Run the dashboard browser suite | dashboard/tests/agent-terminal-touch.spec.ts:46 |
| #3385 / 1 | [dashboard (10/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079663) | Run the dashboard browser suite | dashboard/tests/backlog-preparing.spec.ts:42, dashboard/tests/frame-launch-look.spec.ts:102 |
| #3385 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079664) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-touch.spec.ts:39 |
| #3385 / 1 | [dashboard (2/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079675) | Run the dashboard browser suite | dashboard/tests/story-dependencies.spec.ts:29 |
| #3385 / 1 | [dashboard (4/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079826) | Run the dashboard browser suite | dashboard/tests/accessible-board.spec.ts:128, dashboard/tests/accessible-board.spec.ts:154, dashboard/tests/accessible-board.spec.ts:35, dashboard/tests/story-readiness-accessible.spec.ts:35 |
| #3385 / 1 | [dashboard (5/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079636) | Run the dashboard browser suite | dashboard/tests/cursor-sessions-sidebar-layout.spec.ts:41 |
| #3385 / 1 | [dashboard (6/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079697) | Run the dashboard browser suite | dashboard/tests/cursor-sessions-sidebar-resize-lasting.spec.ts:36 |
| #3385 / 1 | [dashboard (7/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079708) | Run the dashboard browser suite | dashboard/tests/source-navigation.spec.ts:174 |
| #3385 / 1 | [dashboard (8/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079657) | Run the dashboard browser suite | dashboard/tests/development-intent-frame.spec.ts:178 |
| #3385 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41212447397/job/124570079700) | Run the dashboard browser suite | dashboard/tests/accessible-board-touch.spec.ts:127, dashboard/tests/accessible-board-touch.spec.ts:175, dashboard/tests/accessible-board-touch.spec.ts:40, dashboard/tests/preparation-legend.spec.ts:33, dashboard/tests/preparation-legend.spec.ts:80, dashboard/tests/recently-done-sessions-sidebar-room.spec.ts:33 |
| #3387 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41213869876/job/124574244306) | Run the dashboard browser suite | dashboard/tests/preparation-legend.spec.ts:81 |
| #3388 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41214067769/job/124574817313) | Run the dashboard browser suite | dashboard/tests/boundary/authenticated-read-boundary.spec.ts:155 |
| #3389 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41214098873/job/124574912996) | Run the dashboard browser suite | dashboard/tests/agent-launch-host-switch-fresh.spec.ts:83 |
| #3391 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41214249203/job/124575353065) | Run the dashboard browser suite | dashboard/tests/preparation-legend.spec.ts:81 |
| #3392 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41214826618/job/124577069962) | Run the dashboard browser suite | dashboard/tests/preparation-legend.spec.ts:81 |
| #3393 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41215085277/job/124577847598) | Run the dashboard browser suite | dashboard/tests/boundary/authenticated-read-boundary.spec.ts:155 |
| #3394 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41215201963/job/124578174150) | Run the dashboard browser suite | dashboard/tests/agent-launch-host-switch-fresh.spec.ts:84 |
| #3395 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41216028080/job/124580617875) | Run the dashboard browser suite | dashboard/tests/preparation-legend.spec.ts:81 |
| #3397 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41216241706/job/124581257829) | Run the dashboard browser suite | dashboard/tests/boundary/authenticated-read-boundary.spec.ts:155 |
| #3398 / 1 | [dashboard (9/12)](https://github.com/terryyin/open-dough/actions/runs/41216443225/job/124581844855) | Run the dashboard browser suite | dashboard/tests/preparation-legend.spec.ts:81 |
| #3401 / 1 | [dashboard (1/12)](https://github.com/terryyin/open-dough/actions/runs/41217479901/job/124584952649) | Run the dashboard browser suite | dashboard/tests/compact-session-entry.spec.ts:23 |
| #3402 / 1 | [dashboard (11/12)](https://github.com/terryyin/open-dough/actions/runs/41218503549/job/124587964412) | Run the dashboard browser suite | dashboard/tests/board-session-reading.spec.ts:25 |
| #3402 / 1 | [dashboard (12/12)](https://github.com/terryyin/open-dough/actions/runs/41218503549/job/124587964331) | Run the dashboard browser suite | dashboard/tests/sessions-sidebar-navigation-cases.spec.ts:171 |

##### Appendix D: change manifest and source recovery

commits.json contains all 157 in-window reachable commits, full messages, parents and changed paths; commit-patches contains their patches. The execution profile manifest assigns each original author to its claimed story and keeps merge commits labeled integration. The narrative uses selected patches and historical plan snapshots rather than attributing siblings through an aggregate trunk range.

| Execution | Claim | Earliest retained plan | Latest retained plan snapshot |
| --- | --- | --- | --- |
| SEED-192#browse-test-purpose | [46e6f305](https://github.com/terryyin/open-dough/commit/46e6f305afe8d7a3f77889c7ca0f68e8ab34c79e) | [initial plan](https://github.com/terryyin/open-dough/blob/46e6f305afe8d7a3f77889c7ca0f68e8ab34c79e/.planning/slice-plans/429-browse-test-purpose/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/bfbdd6a6dad0741d7874591aa9e5d1eacb0c3eac/.planning/slice-plans/429-browse-test-purpose/PLAN.md) |
| SEED-192#open-development-intent-frame | [ec6ebf4d](https://github.com/terryyin/open-dough/commit/ec6ebf4d774ae23947da10c65d7711c171cc15ea) | [initial plan](https://github.com/terryyin/open-dough/blob/ec6ebf4d774ae23947da10c65d7711c171cc15ea/.planning/slice-plans/424-development-intent-frame/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/1351254ebdb5c72dc62469a45f401edae309e9e1/.planning/slice-plans/424-development-intent-frame/PLAN.md) |
| SEED-197#optimize-dashboard-test-feedback | [f351073d](https://github.com/terryyin/open-dough/commit/f351073d060ba25620d0c0a861b5b4c5cc9710d6) | [earliest retained plan](https://github.com/terryyin/open-dough/blob/a8ab552db260cfef8d7a9667826cedbb2736601f/.planning/slice-plans/424-optimize-dashboard-test-feedback/PLAN.md); first slice already marked done | [last plan](https://github.com/terryyin/open-dough/blob/7b9777c78c127519d78fe1423080851bd2476b72/.planning/slice-plans/424-optimize-dashboard-test-feedback/PLAN.md) |
| SEED-198#responsive-project-header | [bc88e555](https://github.com/terryyin/open-dough/commit/bc88e5559ccd9424c0a77a0f5df8ca773ed9e30b) | [initial plan](https://github.com/terryyin/open-dough/blob/bc88e5559ccd9424c0a77a0f5df8ca773ed9e30b/.planning/slice-plans/424-responsive-project-header/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/6bee846bfc9ee4fb84df723c5d47865926ae451f/.planning/slice-plans/424-responsive-project-header/PLAN.md) |
| SEED-199#mobile-session-screen | [f601fcbd](https://github.com/terryyin/open-dough/commit/f601fcbd4b8ed29cbbe70091aae93b44a8c5aeee) | [initial plan](https://github.com/terryyin/open-dough/blob/f601fcbd4b8ed29cbbe70091aae93b44a8c5aeee/.planning/slice-plans/425-mobile-session-screen/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/cd63db18e0c91644b5e05e4ef987f47b54e86fd3/.planning/slice-plans/425-mobile-session-screen/PLAN.md) |
| SEED-200#session-terminal-voice-input | [d3a51816](https://github.com/terryyin/open-dough/commit/d3a51816132a8daf82d80384b04b1ff5f4124c61) | [initial plan](https://github.com/terryyin/open-dough/blob/d3a51816132a8daf82d80384b04b1ff5f4124c61/.planning/slice-plans/426-session-terminal-voice-input/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/37fd51f2c1b6285672a1e732ed82595aa95aac02/.planning/slice-plans/426-session-terminal-voice-input/PLAN.md) |
| SEED-201#reconcile-published-admission-drafts | [9f7a27ca](https://github.com/terryyin/open-dough/commit/9f7a27ca32a0bbb45d18fa8f2c0921b6df7d43f6) | No execution plan at admission; see native record | See contextual mission and commits |
| SEED-202#bounded-dashboard-refresh | [7ad60a6f](https://github.com/terryyin/open-dough/commit/7ad60a6fbec15373d391830cc36006e22c4aa090) | [initial plan](https://github.com/terryyin/open-dough/blob/7ad60a6fbec15373d391830cc36006e22c4aa090/.planning/slice-plans/426-bounded-dashboard-refresh/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/6f90752cd82da37e735e0730216e2651b79a145f/.planning/slice-plans/426-bounded-dashboard-refresh/PLAN.md) |
| SEED-202#consistent-shared-refresh | [3241f409](https://github.com/terryyin/open-dough/commit/3241f409194c766f805c33abc027bf56b68578ba) | [initial plan](https://github.com/terryyin/open-dough/blob/3241f409194c766f805c33abc027bf56b68578ba/.planning/slice-plans/428-consistent-shared-refresh/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/1e910b86d8fe2db7944358cadf045e05c7f9d9e7/.planning/slice-plans/428-consistent-shared-refresh/PLAN.md) |
| SEED-203#quiet-dashboard-polling | [f8567b92](https://github.com/terryyin/open-dough/commit/f8567b92ff16a7e4a5d6987bc7886debe06f3771) | No execution plan at admission; see native record | See contextual mission and commits |
| SEED-204#attach-image-at-launch | [74bb9dec](https://github.com/terryyin/open-dough/commit/74bb9dec7eff0cef5bff5018e532ac8fd1196f07) | [initial plan](https://github.com/terryyin/open-dough/blob/74bb9dec7eff0cef5bff5018e532ac8fd1196f07/.planning/slice-plans/427-attach-image-at-launch/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/b6214f9a51b823a16779b4f7f5a65c6e754f5db9/.planning/slice-plans/427-attach-image-at-launch/PLAN.md) |
| SEED-205#logo-sidebar-toggle | [67ebb05b](https://github.com/terryyin/open-dough/commit/67ebb05b8861fa1ef5668655ed7804ca20e4ff8a) | [initial plan](https://github.com/terryyin/open-dough/blob/67ebb05b8861fa1ef5668655ed7804ca20e4ff8a/.planning/slice-plans/430-logo-sidebar-toggle/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/923607ba50ff55495094737cce3faec13122c027/.planning/slice-plans/430-logo-sidebar-toggle/PLAN.md) |
| SEED-206#explicit-reread-freshness | [625eac08](https://github.com/terryyin/open-dough/commit/625eac08691936e7930b271db80120aaee8cbc2c) | [initial plan](https://github.com/terryyin/open-dough/blob/625eac08691936e7930b271db80120aaee8cbc2c/.planning/slice-plans/431-explicit-reread-freshness/PLAN.md) | [last plan](https://github.com/terryyin/open-dough/blob/256c30f40045a90c8a9a725358490105c72fccf1/.planning/slice-plans/431-explicit-reread-freshness/PLAN.md) |

###### Process evidence locations

| Execution / subject | Primary native record | Decisive locations |
| --- | --- | --- |
| Mobile sessions | Cursor 363e0b94-67d5-49d4-b77d-48deec743aed | Initial plan premise 3; coordinator L48, L110–114, L124–126; final branch and trunk waits |
| Responsive header | Cursor 5220567c-77df-404c-a6d2-7abf6ccb5d69 | L58–63 baseline flake; L91–103 consumers; L124–157 fresh CI tips and repair |
| Mark/banner | Cursor 1bca2eeb-150d-41d1-ab95-a929db66954e | L47–58 consumer repair; L67–85 legend sequence; L86 review; L93–99 navigation repairs; L109–114 observer replacement |
| Fresh rereads | Cursor 83527a85-da35-4180-8b8f-f7802b72840d | L55–70 completion/repair; 51070fa2 and 256c30f4 patches |
| Image attachments | Cursor 9b247773-9b4c-456b-9be3-4f21c7043f14 | L18–23 native waiver; L69–72 regression repair; L128–157 completion |
| Test optimization | Cursor 1548fc89-d2da-4613-97e5-b6510a39edf0 | L310 explicit fix failures/flakies direction; L321–335 setup repair and green completion |
| Intent reader | Cursor 04bc7742-683e-41b1-995f-2fdbc6947449 | L115 human judgment stop; L122–144 CI repair/completion; branch publications |
| Development/Intent frame | Claude 122533a2-bf80-4f44-97fd-5759f3d0d8e9 | L619 initial flake repaired; L990 consumer miss; L1403–1871 trunk failure ownership and repairs |
| Bounded refresh | Claude 42e59800-afbe-4351-b3b0-b3e46c749dec | L1516–1664 recurring npm repair and consistency findings; L1871–1949 earlier unread failure despite green tip; trunk completion |
| Admission / release | Codex chat 01a18fca-8c01-7e12-b04e-fd0995befd69, title Find test optimization seed cause | Exact user landing exception, later release instruction, failed completion receipts and disclosed outcomes |
| Voice terminal | Codex chat 01a19003-74f1-79a1-98a2-5db0b7e2a58a, title done-Open Dough · Execution · Dictate text into the session terminal from its header | Complete failed-test inventory, branch/main attempt-2 success and shutdown receipts |
| Quiet polling | Codex chat 01a19120-9754-7371-83fe-4f110319550a, title Remove published-main log entries | Branch setup failure then attempt-2 success, trunk success, confirmed observer shutdown |

The source path for each Cursor/Claude record is retained in cursor-process-calls.json or claude-process-calls.json. Codex excerpts preserve item IDs, command outputs and chat IDs. The evidence is historical data, not instructions for future agents.
