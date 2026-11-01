# Source review — SEED-210#confirm-broken-base-before-start

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); input was
only the seed Goal, Scope, Scope limits, Key examples, UI, and Architecture
prose. No plan, product, proof, or current-slice scope was supplied.

**Reviewer return:** Numbered commitments 1–42 as retained below (compound items
split: 6.1–6.4, 7.1–7.5, 9.1–9.2, 11.1–11.2, 14.1–14.3, 16.1–16.5, 18.1–18.5,
35.1–35.4, 40.1–40.3).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Do not silently start new work on a broken build. | slice 3 | observed: unconfirmedStart + adapter/GH judgment; fail/running/unread ask before script (adapter + GH specs) |
| 2 | Before the dashboard runs the execution start (which publishes the Take and creates the workspace and branch), it judges the CI state of the origin target the work will start from. | slice 1 | observed: dashboard/server/launchStart.ts unconfirmedStart → judgeBaseCi before attempt/script; agent-launch-base-ci.spec.ts failed case: no Take until Continue |
| 3 | When that state is not a pass, the developer sees what was found and confirms whether to start anyway. | slice 1 | observed: LaunchBaseCi.tsx + agent-launch-base-ci.spec.ts failed heading focused before Continue |
| 4 | Back starts nothing. | slice 1 | observed: agent-launch-base-ci.spec.ts Back: empty takenProfiles, keptStarts, claude launches; origin main unchanged |
| 5 | This keeps a red trunk from quietly accumulating new work on top of it, while still letting the developer start the work that fixes it. | slice 3 | observed: fail asks before start; Continue on failing base still starts (adapter + GH failed cases) |
| 6.1 | Every dashboard story execution start that runs the start script: Standard | slice 1 | observed: launchStart.ts unconfirmedStart for workflow execution; agent-launch-base-ci.spec.ts Start execution path |
| 6.2 | Every dashboard story execution start that runs the start script: One-shot | slice 1 | observed: launchStart.ts gates workflow === "execution" (one-shot is an execution start mode through the same pre-acceptance) |
| 6.3 | Every dashboard story execution start that runs the start script: Isolated workspace | slice 1 | observed: unconfirmedStart after existing-changes check; workspace selection unchanged for isolated |
| 6.4 | Every dashboard story execution start that runs the start script: Default main | slice 1 | observed: unconfirmedStart asks existing changes first then base CI for default-checkout |
| 7.1 | Not asked: Refinement starts | slice 1 | observed: launchStart.ts only judges when request.workflow === "execution" |
| 7.2 | Not asked: The project row's Start session | slice 1 | observed: launchStart.ts only judges when request.workflow === "execution" |
| 7.3 | Not asked: Resuming a kept or established start (Continue) | slice 1 | observed: keptStart early return in unconfirmedStart; agent-launch-base-ci.spec.ts kept-start case |
| 7.4 | Not asked: Startup recovery | slice 1 | observed: keptStart early return in unconfirmedStart |
| 7.5 | Not asked: Kept-start Start | slice 1 | observed: agent-launch-base-ci.spec.ts "a kept start resumed is not asked even with a failing base" |
| 8 | The base's CI state is the newest result of the project's selected CI check in the origin target's history. | slice 1 | observed: baseCiJudgment.ts newestRunFor + history walk |
| 9.1 | Use the target's head revision when it has a result of its own. | slice 1 | observed: baseCiJudgment.ts walks commits newest-first and returns first with a judged run |
| 9.2 | Otherwise use its nearest ancestor that has one. | slice 1 | observed: agent-launch-base-ci.spec.ts pass/fail cases with later planning-only head |
| 10 | Qualification: Trunk heads are usually planning-only commits that CI never runs, so the head's own result alone would almost never exist. | | Q1 |
| 11.1 | The check is GitHub Actions (`ciWorkflow`, default `ci.yml`, push runs) | slice 1 | observed: baseCiJudgment.ts judgeGitHubActions via readCiConfiguration + createGitHubActions |
| 11.2 | or the project's `ciAdapter` command's `discover` attempts | slice 3 | observed: baseCiJudgment.ts judgeCommandAdapter + agent-launch-base-ci-adapter.spec.ts |
| 12 | Of that revision's attempts, the newest decides. | slice 1 | observed: baseCiJudgment.ts newestRunFor by createdAt |
| 13 | A pass starts exactly as today, with no extra step. | slice 1 | observed: agent-launch-base-ci.spec.ts "a passing nearest result starts with no question when the head has none" |
| 14.1 | Every other state asks first, named truthfully: failed (including cancelled or timed out) | slice 1 | observed: judgeAttempt maps completed non-success to failed; LaunchBaseCi baseCiFailedHeading; failed-case spec |
| 14.2 | still running or queued | slice 2 | observed: agent-launch-base-ci-running-unread.spec.ts in-progress case; LaunchBaseCi baseCiRunningHeading |
| 14.3 | could not be read (no result in the readable history, provider or adapter failure, rate limit, or the read's time bound) | slice 2 | observed: agent-launch-base-ci-running-unread.spec.ts rate-limited + empty listing; unread heading + reason (adapter unread remains slice 3) |
| 15 | Nothing waits for a running check to finish. | slice 2 | observed: agent-launch-base-ci-running-unread.spec.ts in-progress asks immediately with Continue while CI runs; no wait |
| 16.1 | The question names the target branch | slice 1 | observed: LaunchBaseCi.tsx Origin `{found.branch}`; failed-case spec contains "main" |
| 16.2 | the judged revision (short SHA and subject) | slice 1 | observed: LaunchBaseCi.tsx shortSha + subject; failed-case spec short SHA |
| 16.3 | how many later commits have no result of their own when it is not the head | slice 1 | observed: laterLine + failed-case "One later commit has no result of its own." |
| 16.4 | the state | slice 1 | observed: baseCiFailedHeading / baseCiHeading(state) |
| 16.5 | the run or attempt reference when the provider gives one | slice 1 | observed: runUrl link; failed-case contains runUrl |
| 17 | Back returns to the dialog's choices with text and images as they were. | slice 1 | observed: failed-case Back restores Start focus and instruction value |
| 18.1 | Back starts nothing: no Take | slice 1 | observed: failed-case takenProfiles empty after Back |
| 18.2 | no assignment | slice 1 | observed: failed-case no Take/keptStarts (assignment accompanies Take) |
| 18.3 | no workspace | slice 1 | observed: failed-case no Take; claude launches empty |
| 18.4 | no branch | slice 1 | observed: failed-case originMain unchanged; no Take |
| 18.5 | no start record | slice 1 | observed: failed-case keptStarts empty |
| 19 | Continuing sends the same start naming the judged revision and state it confirmed. | slice 1 | observed: baseCiConfirmation + Continue on failing base; request.baseCi compared in unconfirmedStart |
| 20 | When the boundary now judges a different revision or state, it asks again instead of starting. | slice 1 | observed: agent-launch-base-ci.spec.ts "confirmed failure then a new failure at another revision asks again" |
| 21 | When the boundary now judges a pass, it starts without asking. | slice 1 | observed: agent-launch-base-ci.spec.ts "confirmed failure then pass starts without asking again" |
| 22 | Customized CI is in scope. | slice 3 | observed: ciAdapter path in judgeBaseCi; adapter spec |
| 23 | Qualification: adapter discover already answers attempts; Pygardon judged the same way; no follow-up story. | | Q2 |
| 24 | No waiting for, retrying, or diagnosing CI from the dashboard. | | E1 |
| 25 | No persistent trunk-CI badge on the board. | | E2 |
| 26 | No kept record of a confirmation. | slice 1 | observed: confirmation only on request.baseCi; withoutConfirmation stripping; no store write for base CI |
| 27 | No check in the start script itself, so agent-invoked starts outside the dashboard are unchanged. | | E3 |
| 28 | Trunk moving between the confirmed judgment and the start script's own fetch is not re-checked beyond the boundary's comparison at Continue. | | E4 |
| 29 | Open Dough pass example: planning-only head, nearest success → Start with no question. | slice 1 | observed: agent-launch-base-ci.spec.ts pass case |
| 30 | Pygardon fail example: nearest adapter attempt failed → Base CI failed; Back nothing; Continue starts. | slice 3 | observed: agent-launch-base-ci-adapter.spec.ts failing nearest + Back; live Pygardon at observation time judged pass (36b67d41), UI fail→Back not re-run |
| 31 | Nearest result still running → dialog says still running; does not wait. | slice 2 | observed: agent-launch-base-ci-running-unread.spec.ts in-progress case |
| 32 | Adapter unreachable or GitHub rate-limited → could not be read and why; never shows a pass. | slice 2 | observed: agent-launch-base-ci-running-unread.spec.ts rate-limited Actions case (adapter unreachable → slice 3) |
| 33 | Confirmed failure at X; then pass → starts; or new failure at Y → asks again naming Y. | slice 1 | observed: recheck pass + recheck Y specs |
| 34 | Kept start resumed from Startup recovery → no CI question. | slice 1 | observed: kept-start resume spec |
| 35.1 | Question replaces the choices | slice 1 | observed: LaunchBaseCi.tsx section replaces choices via LaunchExistingChanges confirmation path |
| 35.2 | its heading takes the keyboard | slice 1 | observed: useEffect focus + failed-case toBeFocused |
| 35.3 | Back (or Escape) returns to the choices as they were | slice 1 | observed: failed-case Back restores Start and instruction |
| 35.4 | continue action names what it does ("Continue on failing base", "Continue while CI runs", "Continue without CI result") | slice 1 | observed: baseCiContinueLabel; failed-case uses "Continue on failing base" (running/unread labels land with slice 2 proof) |
| 36 | While the boundary judges the base, Start shows that it is checking the base's CI. | slice 1 | observed: StartLaunch.tsx submittingStatus "Checking base CI…" for new execution; Start button stays Starting… |
| 37 | The dashboard boundary gains a pre-start judgment of trunk CI. | slice 1 | observed: unconfirmedStart + baseCiJudgment.ts |
| 38 | It observes CI evidence without owning it, as ADR 0008 directs. | slice 1 | observed: baseCiJudgment.ts comment + read-only GitHub modules; no CI mutate |
| 39 | It keeps nothing beyond the request (no server database). | slice 1 | observed: request.baseCi only; no startStore base-CI field |
| 40.1 | Reuse dough-execute-plan CI modules: CI selection | slice 1 | observed: readCiConfiguration import in baseCiJudgment.ts |
| 40.2 | askGitHub through this user's shared GitHub request owner | slice 1 | observed: createGitHubActions / readGitHubActions imports |
| 40.3 | command-adapter discovery | slice 3 | observed: createCommandAcquisition / discover in baseCiJudgment.ts |
| 41 | Qualification: dashboard already imports shared session policy from source. | | Q3 |
| 42 | Adapter command runs from the project folder (integration checkout); failure is "could not be read". | slice 3 | observed: adapter exit failure case → unread; judgeCommandAdapter root = folder.path |
