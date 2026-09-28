# Launch execution in a Claude Code background session

## Source and authority

- **Identity:** SEED-052#launch-claude-planned-execution.
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#launch-claude-planned-execution),
  refined with Terry on 2026-09-28. It is the first story of the SEED-052
  launch chain (recent sessions, in-dashboard terminal, refinement launch,
  scripted preparation, Codex, Cursor).
- **Authority:** Terry asked for slice planning after refinement, with
  enough upfront architecture and a clear domain model that the chain grows
  cohesively and the implementation maps directly to the model. Planning only:
  no Take, execution, or publication beyond the preparation workflow.
- **Workspace:** `.worktrees/prep-launch-claude-execution` (branch
  `claude/prep-launch-claude-execution`), announced as agent Tsubomi-chan at
  `56bb56a2`.

## Outcome and boundaries

The developer looking at a project's backlog in the dashboard starts
execution of any queued story there. The local dashboard server starts a
Claude Code background session in the project's fixed folder with the
execution instruction, confirms it, and the card shows a local **Started**
state until origin shows the story Taken or gone from the backlog.

Included: **Start execution** on every Backlog card (not Taken), visibly
distinguished when the card is not **Ready for execution**; a dialog with an
optional instruction; launched, failed, and uncertain results; Started kept
by the running server across reloads and project switches; explanations for a
missing folder or `claude`; refusal of requests from other sites.

Excluded: session lists that survive a dashboard restart, attaching in the
dashboard, refinement or other skills, Codex and Cursor, model and permission
choice, configurable folders, stopping or monitoring sessions, resuming
Taken work, and automatic retry of an uncertain launch.

## Key examples

1. A **Ready for execution** Open Dough story, empty instruction: a session
   named for Open Dough and the story starts in `~/git/open-dough`; the card
   shows **Started** with its session id and `claude attach <id>`. When the
   agent's Take reaches origin, the story shows under **Taken** and Started is
   gone.
2. A **Not refined** story shows the action styled as not ready; the instruction
   "refine and plan it first, then execute" reaches the session after the
   execution instruction. While the agent prepares, the card shows both
   Preparing (published) and Started (local).
3. Reloading the page, or switching projects and back, keeps Started while origin
   is unchanged.
4. `~/git/doughnut` is missing: the result explains that folder was not found;
   nothing is launched.
5. `claude --bg` does not answer within the launch wait: an uncertain result
   advises checking `claude agents`; the card offers Start execution again.
6. A request from another site is refused and no `claude` process starts.

## Architecture and domain model

### Established direction

- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  (Proposed): origin owns durable workflow state; machine-local evidence
  supplements it later; no application database. A launch record is exactly
  that local evidence, and origin still decides every story fact.
- [North Star: one narrow loopback read boundary](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  process and credential responsibility stays in the local Vite boundary,
  shared by dev and preview; browser modules import no Node code.
- New [North Star: agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment),
  added by this plan, records the direction the whole chain follows. The
  [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) still says
  agent controls are outside the initial design; slice 3 updates it.

### Domain model

The launch is modeled in the vocabulary the dashboard already reads. An
**agent launch** requests an **agent assignment**, the published fact that
Taken and Preparing already derive from, and settles when origin publishes it.

| Concept | Meaning | Growth in later stories | Home (module) |
| --- | --- | --- | --- |
| Project | Catalog entry (`PublishedSource`) | unchanged | `src/publishedSource.ts` |
| Project folder | Where a catalog project lives on this machine; machine-local, fixed per id | configurable only if ever needed | `server/projectFolders.ts` |
| Work item | Published backlog entry, keyed by identity | unchanged | `src/publishedWork.ts` |
| Activity | What the assignment is for: `execution` (this story), `preparation` (refinement launch) | refinement adds `preparation` | `agentActivities` in the shared profile module |
| Host | The agent tool: `claude` (this story), `codex`, `cursor` | one module per delivered host | `agentHosts` in the shared profile module |
| Agent launch request | Project, work item (identity and title), activity, host, optional developer instruction | activity and host widen | `src/agentLaunch.ts` |
| Host session | The session a host started: host, session id, short id, name | attach (story 3) and recent sessions (story 2) read it | `src/agentLaunch.ts` |
| Launch result | launched (with its record), failed (reason category and explanation), or uncertain | unchanged | `src/agentLaunch.ts` |
| Launch record | A confirmed launch: request, host session, launched time. Machine-local evidence, never story state | story 2 persists and lists these same records | kept by `server/agentLaunches.ts` |
| Awaiting publication | A record whose activity's assignment is not yet published for its work item, while the item is still in the backlog. For execution: not in Taken and still queued | preparation settles on Preparing | `launchAwaitsPublication` in `src/agentLaunch.ts` |
| Session access | How a developer reaches a session: `claude attach <id>` | the embedded terminal uses the same session | Claude Code host module |

The Claude Code host (`server/claudeCode.ts`) owns everything specific to
it:
- The instruction: `/dough-execute-plan <identity>`, then a blank line and the
  developer instruction when there is one.
- The argument array: `claude --bg --name "<project> · <title>"
  <instruction>`, run with `cwd` set to the project folder. It passes no
  session id (`--bg` ignores one), model, or permission flags.
- Confirmation: read the short id from the `backgrounded · <id> · <name>`
  line `--bg` prints, then find that `id` in `claude agents --json` and take
  its `sessionId`, `name`, and `cwd`.
- Failure classification, into fixed categories only. Raw stderr is not
  forwarded, as with the `gh` boundary.

`server/agentLaunches.ts` performs one launch:
1. Resolve the folder.
2. Run the host.
3. Record a confirmed result.

It keeps the in-process record list, per project, like the read boundary's
in-process memos. No adapter interface, registry, or persistence is built
ahead of a second host or story 2.

### Boundary and data flow

1. The browser posts a launch request to the new `/__agent-launch` endpoint.
   It uses `src/agentLaunchClient.ts` and validates the answer with zod.
2. The endpoint is a second small Vite plugin (`server/agentLaunchPlugin.ts`),
   mounted in dev and preview beside `authenticatedReadPlugin`. It admits a
   request only after `verifyLocalOrigin`. Its refusal type is renamed from
   `RefusedRead` to `RefusedRequest`, because it now guards both endpoints.
   It accepts POST (launch) and GET `?source=` (that project's records), and
   refuses unknown sources, activities, and hosts, and malformed bounded text,
   before any process starts.
3. `useAgentLaunches(source)` holds that project's records, plus each card's
   in-flight or last failed or uncertain result. Selecting a project reads its
   records again.
4. `WorkCard` asks the pure `launchAwaitsPublication(record, work)` whether to
   show Started. Otherwise a Backlog card shows the action, styled from the
   existing `readyBadge(preparation)`.

### Existing solutions (PFE)

| Candidate | Finding | Choice |
| --- | --- | --- |
| `verifyLocalOrigin` (`server/localOrigin.ts`) | Loopback socket and Host, plus same-origin via `Sec-Fetch-Site` or `Origin` equal to Host. It already refuses a cross-site request of any method. | Reuse; rename `RefusedRead` to `RefusedRequest` as its second caller arrives. |
| `execGh`, `classify`, `withTrackedGh` (`server/ghRead.ts`, `trackedGh.ts`) | The `gh`-specific process runner: fixed argument array, timeout through an abort signal, fixed failure categories. | Follow the same pattern for `claude` inside the host module. The categories differ by domain, so they are not merged into a generic runner. |
| `agentHosts`, `agentActivities` (`product-backlog-agent-profile.mjs:41-52`) | The published vocabulary for host and activity, already imported by the dashboard. | Reuse as the launch request's host and activity values. |
| `readyBadge` (`src/storyPreparation.ts:104`) | The single readiness judgment behind **Ready for execution**. | Reuse for the not-ready styling. |
| Taken and queued membership (`publishedWork.ts`, `agentAssignments.ts`) | The snapshot already separates `taken` and `backlog`, keyed by identity. | Reuse for `launchAwaitsPublication`; no new reader. |
| `claude agents` and `attach` (Claude Code 2.1.283) | Native listing and attach of background sessions. | Reuse for confirmation and developer access; no session monitoring in this story. |
| Fake `gh` test harness (`tests/fixtures/fake-gh`, `tests/support/fakeGh.ts`, `dashboardServer.ts`) | A Node script first on the server's PATH, with per-test answers and recorded calls. | Add a fake `claude` the same way, plus a temporary `HOME` holding the project folders. |

## Observed premises

Observed in `.worktrees/prep-launch-claude-execution` at `7c7e0a0e` (the
dashboard is unchanged at `f510358e`) on 2026-09-28:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| Claude Code offers background launch, listing, and attach. | `claude --version`: 2.1.283. `claude --help` lists `--bg` ("Prints the id that `claude attach`, `logs`, `stop` and `rm` take"), `-n/--name`, `--session-id <uuid>`, and the commands `agents`, `attach`, `logs`, `stop`, `rm`. | Launch uses `--bg`; access is `claude attach`. |
| Background sessions can be listed as JSON without a TTY. | `claude agents --json` printed 14 entries with the keys `cwd, id, kind, name, pid, sessionId, startedAt, state, status`, for example `id: "06628f74"` with `sessionId: "06628f74-c8ce-…"`. | Confirmation matches `sessionId` and reads `id`. |
| What `--bg` prints on success, whether it honors `--session-id`, and its exit code when spawned from a non-TTY Node process. | Slice 1 probe, 2026-09-28, Claude Code 2.1.283, `execFile` with stdin `/dev/null`: exit 0 in 3.7 s; stdout `backgrounded · b4e4f6b2 · Probe · trusted` (ANSI-colored id) plus hint lines naming `claude attach b4e4f6b2`; stderr `warning: --bg manages the session id; ignoring --session-id`. `claude agents --json` then listed `id: "b4e4f6b2"`, `sessionId: "b4e4f6b2-d2b3-…"`, the name, the cwd, `startedAt` (ms), and kept listing it after it finished (`state: "done"`). | No TTY is needed. `--session-id` is dropped; the short id comes from stdout and is confirmed in the listing. |
| How `--bg` fails for an untrusted or missing folder. | Same probe: a fresh `/tmp` folder gave exit 1 in 3.6 s, stdout empty, stderr `Workspace not trusted. Run \`claude\` in <folder> once and accept the trust prompt, then retry.`, and no session was listed. A missing `cwd` makes Node's spawn fail with `ENOENT` before `claude` runs, the same code as a missing `claude`. A folder under a trusted folder (`~/git/open-dough/.worktrees/…`) was trusted. | `folder-not-trusted` is recognized from that stderr; the folder is checked before spawning so `folder-not-found` and `not-installed` stay distinct. |
| The dashboard has one process boundary and one origin guard. | The architecture survey: `vite.config.mts:22` mounts `authenticatedReadPlugin()` only; `ghRead.ts` is the only `child_process` import under `server/` and `src/`; `localOrigin.ts:29-73` refuses non-loopback and cross-origin requests, and its comment at L44-56 notes that a same-origin POST sends `Origin`, compared with Host. | The launch endpoint reuses the guard; a same-origin POST is admitted. |
| No code reads a local path or home directory. | The survey found no `cwd` or `homedir` use; the only environment reads are `DOUGH_READ_TIMEOUT_MS`, `DOUGH_AVATAR_ORIGIN`, and `GH_PROMPT_DISABLED`. | Project folders resolve from `os.homedir()` + `git/<name>`; tests set `HOME` to a temporary directory. |
| Backlog and Taken share one card component. | `WorkStages.tsx:20-89` `WorkCard` renders both lists; `Stage` maps entries by identity. | The action and Started go in `WorkCard` for backlog entries only. |
| Only Playwright tests the dashboard, with a faked `gh` and a real Vite server. | `dashboard/playwright.config.ts`; `tests/support/dashboardServer.ts` starts Vite with fake `gh` on PATH; boundary specs use raw HTTP (`authenticated-read-refusal.spec.ts`). | Proof: boundary specs over raw HTTP and page journeys, both with a fake `claude`. |
| Focused baseline is green. | From the default checkout at `56bb56a2` (dashboard code identical): `npx playwright test --config dashboard/playwright.config.ts --reporter=line authenticated-read-refusal backlog-preparing` gave 20 passed in 10.3 s. | These are the starting boundaries. |
| Plan number. | `git ls-tree origin/main .planning/slice-plans/` shows 140-143 allocated. | This plan is 144. |

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| The real Claude Code accepts the product's launch argument array from a non-TTY Node process, and the listing confirms it. | 1: manual probe of the real CLI (see slice 1). |
| A same-origin launch request starts one Claude Code background session in the project's folder with the execution instruction and name, and answers launched with the short id it printed, once listed. | 2: boundary spec over raw HTTP in dev and preview; the fake `claude` records argv and cwd. |
| Missing folder, missing `claude`, a refusing `claude`, a timeout, and a launch that exits 0 but is unlisted give failed or uncertain answers with no record. | 2: boundary spec cases, one per category. |
| Cross-site, non-loopback, unknown source, unsupported activity or host, and malformed text are refused before any `claude` process. | 2: refusal cases assert zero fake-`claude` calls. |
| Every Backlog card offers Start execution, and none does on Taken; not-ready cards are distinguished. | 3: page journey on a committed origin with ready and not-ready queued stories and a Taken story. |
| Starting from the dialog sends the optional instruction and shows Started with the session id and attach command; failures and uncertainty show their explanations and leave the action available. | 3: page journey with fake `claude` scenarios, checking the recorded argv. |
| Started survives reload and project switching, and ends when origin shows the story Taken or gone. | 4: page journey advancing the committed origin through a Take. |
| A Preparing assignment alone does not end Started. | 4: the same journey with a published preparation assignment before the Take. |

## Ordered slices

### 1. Probe: Claude Code starts a named background session with a chosen id from a non-TTY process
Type: Probe (manual, paid)
Status: done — run once on Terry's `/dough-execute-plan 144` trigger; results
in Observed premises. The probe sessions were stopped and removed.

Run once, only on the developer's explicit trigger. Paid runs never go into
any automated or repeated suite. From a small Node script under the job
temporary directory, using `execFile` with no TTY and `cwd` set to a scratch
trusted folder, run:

`claude --bg --session-id <new uuid> --name "Probe · launch" "Reply with the word ok and stop."`

Then:

1. Record stdout, stderr, the exit code, and the elapsed time.
2. Run `claude agents --json` and confirm an entry with that `sessionId`, its
   `id` (expected to be the first 8 characters), `name`, and `cwd`.
3. Run the same command in a fresh, untrusted temporary folder, and once more
   with a `cwd` deleted after spawn preparation. Record the exit code and
   stderr wording for the folder-untrusted and cwd-missing categories.
4. Remove the probe sessions with `claude stop` and `claude rm`.

Record each observation in Observed premises. If `--session-id` is ignored
with `--bg`, change slice 2's confirmation to match by `name`, `cwd`, and
`startedAt` at or after the request. If the process needs a TTY, stop and
replan.

### 2. The local launch boundary starts and confirms a Claude Code execution session
Type: Behavior
Status: done — accepted proof: `npx playwright test --config
dashboard/playwright.config.ts --reporter=line agent-launch-boundary
agent-launch-refusal authenticated-read-refusal authenticated-read-plugin-hooks`
(launched argv, cwd, and record; one case per failure category; every refusal
with zero fake-`claude` calls, in dev and preview), `npm run
typecheck:dashboard`, and the whole `npm run test:dashboard` (210 passed). A
non-loopback socket is not observable in the harness and stays covered by the
unchanged `verifyLocalOrigin`.

Behavior: A running dashboard (dev or preview) and a same-origin POST to
`/__agent-launch` with `{source, identity, title, activity: "execution",
host: "claude", instruction}` lead to:
- the project folder (`~/git/<id>` via `os.homedir()`) being checked;
- `claude` being run there with the host module's fixed argument array;
- the short id printed by `--bg` being confirmed through `claude agents --json`;
- the endpoint answering `launched` with a launch record, which it keeps for
  that project.

Failure answers:
- **Failed:** `folder-not-found` (naming the folder), `not-installed`,
  `folder-not-trusted` or `refused` (from slice 1's categories, with advice to
  run `claude` in that folder once), or `unavailable`.
- **Uncertain:** the launch wait (`DOUGH_LAUNCH_TIMEOUT_MS`, default 30 s)
  expired, or `claude` exited 0 without a readable short id or without that
  id listed. The advice is to check
  `claude agents` before starting again.

Refusals, all before any process starts:
- non-loopback, cross-origin, or foreign Host;
- unknown `source`;
- an activity or host other than execution/Claude Code;
- identity or title empty, multi-line, or over 200 characters;
- instruction over 4,000 characters;
- a method other than GET or POST.

Changes:
- `src/agentLaunch.ts`: request, result, record, and session types with zod
  schemas; the endpoint constant; limits. No Node imports.
- `server/projectFolders.ts`, `server/claudeCode.ts`,
  `server/agentLaunches.ts`, `server/agentLaunchPlugin.ts`, wired in
  `vite.config.mts`.
- `localOrigin.ts`: `RefusedRead` becomes `RefusedRequest` (callers updated),
  and its comment covers a same-origin POST.

Proof: new `tests/fixtures/fake-claude` and `tests/support/fakeClaude.ts`:
- a Node script that appends argv and cwd to a calls file;
- its answer comes from a per-test scenario file (`launched`, `refused`,
  `untrusted`, `hang`, `unlisted`), and `agents --json` lists what it
  launched.

`startDashboardServer` gains a temporary `HOME` holding chosen project
folders, and the fake `claude` on PATH. The new `agent-launch-boundary.spec.ts`
runs in dev and preview. Existing `authenticated-read-refusal.spec.ts` and
`authenticated-read-plugin-hooks.spec.ts` stay green after the rename.

### 3. Start execution from a Backlog card and see its launch result
Type: Behavior
Status: done — accepted proof: `npx playwright test --config
dashboard/playwright.config.ts --reporter=line agent-launch-card` (5 passed:
ready, not-ready, and Taken presence; dialog focus, Escape, and Cancel send
nothing; argv with the instruction after a blank line in the Open Dough folder
and Started with time, local marker, session id, and copyable attach command;
folder-not-found; uncertain with Start disabled in flight), `npm run
typecheck:dashboard`, and the whole `npm run test:dashboard` (215 passed).
The not-installed, untrusted, and refused answers share the card's failed
rendering and are observed at the boundary in slice 2.

Behavior: The dashboard shows a committed origin with a ready queued story, a
not-refined queued story, and a Taken story.
- Every Backlog card offers **Start execution**. The not-ready one is visibly
  marked not ready, with the same accessible name plus a description. The
  Taken card offers nothing.
- Activating it opens a dialog naming the story and Claude Code, with an
  optional instruction field and Start and Cancel. Start disables while the
  request is in flight.
- **Launched:** the card shows **Started** with the launch time, the session
  id, and a copyable `claude attach <id>`, marked local. The action is
  replaced.
- **Failed or uncertain:** the card shows the explanation and keeps the
  action.
- Escape or Cancel sends nothing.

Changes:
- `src/agentLaunchClient.ts`.
- `useAgentLaunches` (`src/agentLaunches.ts`): records per project, and
  in-flight and last result per identity. Launched results join the same
  record list that slice 4 loads.
- `StartExecution.tsx` (action and dialog) and `LaunchStarted.tsx`, placed in
  `WorkCard` for backlog entries.
- Styles.
- `dashboard/README.md` gains the launch section.
- The UX/UI North Star replaces "agent controls are outside this initial
  design" with the launch control, and wording is reviewed for consistency with
  its terms.

Proof: new `agent-launch-card.spec.ts` on a committed-origin journey (as in
`backlog-preparing.spec.ts`) with fake `claude`:
- ready, not-ready, and Taken presence;
- dialog focus and Escape;
- the recorded argv contains `/dough-execute-plan <identity>`, the blank line,
  and the instruction, with `cwd` the Open Dough folder;
- the launched, folder-not-found, and uncertain scenarios render as specified.

### 4. Started survives reloads and ends when origin publishes the Take
Type: Behavior
Status: planned

Behavior: A card shows Started, and origin has not published a Take. Then:
- Reloading the page, or selecting another project and back, still shows
  Started, loaded from GET `/__agent-launch?source=`.
- Origin publishes a preparation assignment for the story: Preparing and
  Started both show.
- Origin publishes the Take: the story is under Taken, and no Started appears
  anywhere.
- A launched story that leaves the backlog shows no Started.

Changes:
- The GET route in the launch plugin.
- `useAgentLaunches` loads records on project selection.
- `launchAwaitsPublication(record, work)` in `src/agentLaunch.ts`: execution
  awaits while the identity is in `work.backlog`. When there is more than one
  record per identity, the latest one is shown.
- `dashboard/AGENT-LAUNCH.md` (linked from the README) states the local
  nature and the restart limit.

Proof: extend `agent-launch-card.spec.ts` with a journey that advances the
committed origin through a preparation announcement and then a Take, using
the production backlog CLIs as `preparingJourney.ts` does. It checks
reload, project switching and return, and the final membership. A boundary
case asserts that GET returns only the requested project's records and is
refused cross-origin.

## Current decisions

- One launch model (request, host session, record, awaiting publication) in
  `src/agentLaunch.ts`, with Claude Code specifics only in
  `server/claudeCode.ts`. Later stories extend these rather than adding
  parallel representations.
- Launch records live only in the running server process. A dashboard restart
  forgets them; origin still shows the story truthfully.
- The dashboard sets no model, permission mode, or effort. The developer's
  Claude Code settings apply.
- Verification: focused Playwright specs per slice, then
  `npm run typecheck:dashboard` and the whole `npm run test:dashboard` before
  each slice returns. The only paid run is slice 1's probe, on the developer's
  trigger.
- Use independent post-change refactoring and ordinary managed delivery when
  execution is later authorized.

## Learnings

- Slice 1: `claude --bg` ignores `--session-id` and chooses its own id, which
  it prints. The plan's fallback (match by name, cwd, and start time) was
  replaced by reading that printed id, which identifies the launch exactly;
  the listing still confirms it. The fake `claude` prints the same line.
- Slice 2: every launch outcome answers HTTP 200 with a `launchResultSchema`
  body (`launched`, `failed`, or `uncertain` with `reason` and
  `explanation`); refusals are 4xx with `{error}`, and POST requires
  `Content-Type: application/json`. The GET `?source=` route already exists,
  because slice 2 needed it to observe kept records; slice 4 still owns its
  cross-project and cross-origin proof. Both local boundaries now share
  `server/localBoundaryPlugin.ts`, and the refusals live in
  `agent-launch-refusal.spec.ts`.
- Slice 3: the North Star launch topic named a chosen `--session-id`; slice 1
  disproved it, so the topic now says `--bg` chooses and prints its own id.
  The launch guide lives in `dashboard/AGENT-LAUNCH.md` to keep the README
  within its size limit. `CardLaunch` shows `latestRecordOf` (in
  `src/agentLaunch.ts`), so slice 4 filters it with `launchAwaitsPublication`
  and replaces a project's records from the GET answer on selection. A known
  intermittent `project-keyboard-navigation-focus` failure is fixed on main by
  `25c4a514` and reaches this branch at integration.

## Concern review

No blocking slice-specific concern was identified in this review. Slice 1 is a
paid probe that bounds the one unobserved external contract, and its failure
changes only slice 2's confirmation or stops the plan. Slices 2-4 each have
one trigger and one proof loop, and extend one model:
- the boundary produces launch results and records;
- the card consumes them;
- persistence and settlement add the GET route and the pure
  `launchAwaitsPublication` over the same record list.

Nothing in slice 3 is reworked in slice 4. The rename of `RefusedRead` is
included in slice 2 as the second caller's necessary change, not a separate
Structure slice.
