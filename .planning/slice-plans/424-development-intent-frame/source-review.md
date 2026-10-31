# Source review: Experience the Development and Intent frame

Launch: a fresh general-purpose reviewer, not the implementation agent and not a
fork, during slice 1 acceptance on 2026-10-31. Its only input was the unchanged
story section `SEED-192#open-development-intent-frame` (seed lines 250–395 at
`22eb4b3e`), which already includes Terry's 2026-10-31 navigation decisions. It
was told to read no other file, change nothing, and return numbered commitments
with qualifications, journey examples and exclusions. Its ids and text appear
below as returned. Observations cite the slice 1 built-page proof:
`dashboard/tests/development-intent-frame.spec.ts` (DIF; its keyboard test is in
`development-intent-frame-keyboard.spec.ts`), the from-Intent session and
covering tests in `development-intent-frame-sessions.spec.ts` (SSN),
`side-panel-content-replacement.spec.ts` (SPCR) and `dashboard-header.spec.ts` (DH).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Terry, working in the existing dashboard, can experience Development and Intent as two perspectives on the selected project | slice 1 | observed: DIF "Intent keeps the selected project and says its content is forthcoming" |
| 1.1 | …and judge whether the frame is understandable while ordinary Development work remains useful | slice 1 | observed: the implemented frame is delivered for Terry's review; Development regression set (system-settings, agent-roster, direction-disclosure, board-scroll, read-failure) passed |
| 1.2 | The implemented interface is the reviewable result | slice 1 | observed: dashboard/src/PerspectiveSelect.tsx, IntentPerspective.tsx in the built page exercised by DIF |
| 1.3 | It learns about orientation and return journeys before source readers or report collection add cost | slice 1 | observed: no reader or report collection added (diff limited to route, banner, Intent presentation) |
| 1.4 | it does not establish that the future Intent reader improves product review | slice 1 | observed: no improvement claim in IntentPerspective.tsx or docs/dashboard-navigation.md |
| 2 | Make Development and Intent reachable in the existing shared dashboard frame | slice 1 | observed: DashboardBanner.tsx PerspectiveSelect inside the existing PageFrame; DIF chooses Intent with the actual radio |
| 2a | …with the selected project and active perspective clear | slice 1 | observed: DIF checks checked radio named Intent, project radio and title unchanged; DH perspective fully in view in all three layouts |
| 2b | Preserve the existing project selector | slice 1 | observed: DH wide/compact project selector journeys; project-keyboard-navigation passed |
| 2c | switching perspective alone does not select another project | slice 1 | observed: DIF keyboard test ArrowRight/ArrowLeft on perspective keeps project radio Open Dough |
| 3 | Intent explains that its content is forthcoming | slice 1 | observed: DIF expectForthcomingIntent "Intent for X is forthcoming." |
| 3a | It may explain Purpose and Proof in ordinary language | slice 1 | observed: IntentPerspective.tsx Purpose/Proof paragraph |
| 3b | …without presenting an unimplemented reader | slice 1 | observed: DIF expectForthcomingIntent one visible main, no reader controls |
| 3c | …or claiming to have inspected the project's tests | slice 1 | observed: DIF expectForthcomingIntent "does not read X's tests yet", no digits |
| 4 | Return to useful Development navigation and the existing session context | slice 1 | observed: DIF Development after Intent shows stories, direction and Start session; SSN terminal attached across perspectives |
| 4a | Development retains its… | slice 1 | observed: see 4a.1–4a.5 |
| 4a.1 | stories | slice 1 | observed: DIF Back to Open Dough Development stories |
| 4a.2 | roster | slice 1 | observed: DIF settings test returns to roster in Development; agent-roster passed |
| 4a.3 | published-state qualifications | slice 1 | observed: DIF failed-read test expectProblemAndNoSnapshot in Development after Intent; read-failure, auto-refresh-recovery passed |
| 4a.4 | near-future direction | slice 1 | observed: DIF Development shows direction; direction-disclosure passed |
| 4a.5 | operations | slice 1 | observed: DIF "Start session in Doughnut" in Development; SSN terminal input works |
| 4b | Near-future direction stays there (in Development) | slice 1 | observed: DIF expectForthcomingIntent direction hidden in Intent |
| 4c | Perspective changes do not… | slice 1 | observed: see 4c.1–4c.4 |
| 4c.1 | start a session | slice 1 | observed: SSN/SPCR panel item counts unchanged across Intent round trip |
| 4c.2 | stop a session | slice 1 | observed: SSN attach has no endedBy after round trip |
| 4c.3 | complete a session | slice 1 | observed: SPCR session doneAt stays undefined |
| 4c.4 | reattach a session | slice 1 | observed: SSN exactly one attach after Intent and back |
| 5 | System settings remains reachable | slice 1 | observed: DIF opens System settings from Intent; system-settings passed |
| 5a | …and returns to the selected project's prior perspective | slice 1 | observed: DIF settings Back returns Intent, including after settings reload; App.tsx:31,47 keep the perspective query |
| 5b | …with usable focus | slice 1 | observed: DIF System settings gear focused on return |
| 6 | Existing project-management recovery… retain[s its] meaning | slice 1 | observed: project-remove, project-add, system-settings-project-management, project-configuration passed |
| 7 | Existing… story destinations retain their meaning | slice 1 | observed: dashboardRouteUrl.ts parseRoute story URL forces Development; notification-story-navigation, story-reference-recovery passed |
| 8 | Choosing a session from Intent opens its Development context | slice 1 | observed: SSN "from Intent goes to its project's Development stories and session" |
| 8a | …using the existing session operation | slice 1 | observed: dashboardRoute.ts showStories reused; SSN single history entry, card reveal |
| 8b | …and project attribution | slice 1 | observed: SSN Pygardon selected, card "Shown in terminal" |
| 9 | Both perspectives and the shared navigation remain usable… | slice 1 | observed: see 9a–9d |
| 9a | …with a keyboard | slice 1 | observed: DIF keyboard test Tab to Development with visible outline, arrows between perspectives |
| 9b | …and at narrow widths | slice 1 | observed: DIF 390×844 test no sideways scroll, perspective in view; DH 700px and 320px layouts |
| 9c | Perspective keyboard interaction must not inadvertently also change project | slice 1 | observed: DIF keyboard test project radio unchanged on perspective arrows |
| 9d | focus must not remain in content hidden by the switch | slice 1 | observed: DIF goBack into Intent from Board button moves focus to Intent radio; mutation of usePerspectiveFocus failed it |
| 10 | Changing projects keeps the selected perspective | slice 1 | observed: DIF Doughnut stays Intent; 390px compact title choice keeps Intent |
| 10a | Development is the first-visit default | slice 1 | observed: dashboardRouteUrl.ts default perspective; DIF starts in Development with no perspective parameter |
| 11 | An already open terminal, report or review stays visible in the shared Side panel when changing perspectives | slice 1 | observed: see 11.1–11.3 |
| 11.1 | terminal | slice 1 | observed: SSN typed text before and during Intent, one live attachment |
| 11.2 | report | slice 1 | observed: SPCR final report text kept with one panel item |
| 11.3 | review | slice 1 | observed: SPCR review keeps "Modified unstaged.txt" selected, no new review read |
| 12 | Source browsing and configuration… belong to later work | slice 1 | G1 |
| 13 | story-scoped Intent is later work | slice 1 | G1 |
| 14 | Purpose/Proof layouts are later work | slice 1 | G1 |
| 15 | observed Proof and history are later work | slice 1 | G1 |
| 16 | Structure is later work | slice 1 | G1 |
| 17 | new report machinery is later work | slice 1 | G1 |
| 18 | Do not render a disabled Structure destination… in this increment | slice 1 | observed: DIF expectForthcomingIntent no "Structure" on the page |
| 19 | Do not render… invented Proof statistics in this increment | slice 1 | observed: DIF expectForthcomingIntent no digits in Intent |
| 20 | The final placement of Start session remains open…; retaining its present Development placement is sufficient here | slice 1 | observed: DIF Start session hidden in Intent, shown in Development at its existing place |
| 21 | No new persisted workspace system… is promised | slice 1 | observed: route query only; no storage added in the diff |
| 22 | No… redesign of the Development Board is promised | slice 1 | observed: Board.tsx unchanged; frame-board-look passed |
| 23 | These limits do not require rejecting cases that the existing dashboard naturally supports | slice 1 | observed: unknown perspective values normalize to Development rather than erroring (dashboardRouteUrl.ts parseRoute) |
| 24 | Forthcoming content must not read as "no tests" or "no proof exists" | slice 1 | observed: DIF expectForthcomingIntent rejects no-tests/no-proof wording |
| 24a | Reason: this increment obtains no such evidence | slice 1 | observed: no test reader added |
| 25 | Perspective selection is presentation state, never a project fact | slice 1 | observed: perspective only in the route query (dashboardRouteUrl.ts), no API or configuration |
| 26 | Perspective selection is never evidence of session activity | slice 1 | observed: SSN/SPCR no attach, end or completion from perspective changes |
| 26a | These truthfulness constraints follow ADR 0008 | slice 1 | observed: no project or session fact derived from perspective |
| 27 | Choose Intent from Development: same project, Intent identified, forthcoming, no counts or absence claim | slice 1 | observed: DIF first test |
| 28 | Return to Development: resume stories/roster and session; direction in Development; no session created or ended | slice 1 | observed: DIF Back to Development; SSN one attach, no endedBy |
| 29 | Choose another project in Intent: new project selected, Intent remains, same honest state | slice 1 | observed: DIF Doughnut in Intent with expectForthcomingIntent |
| 30 | System settings from Intent and return: project and Intent return with usable focus | slice 1 | observed: DIF settings test |
| 31 | Choose a listed session in Intent: its project and Development stories, session opened, card revealed | slice 1 | observed: SSN from-Intent test |
| 32 | Open Side panel, Intent and back: panel visible with context, terminal not reattached | slice 1 | observed: SSN and SPCR round trips; covering mode see G2 |
| 33 | Narrow or keyboard only: controls and message reachable, perspective does not switch projects | slice 1 | observed: DIF keyboard and 390×844 tests |
| 34 | Selected approach: change the perspective on one selected project; perspective disposable, Development keeps responsibilities | slice 1 | observed: single route record with perspective field |
| 35 | Docs-only or mockup alternatives rejected | slice 1 | observed: working built-page frame delivered |
| 36 | Separately remembered workspace per perspective not chosen, not rejected | slice 1 | observed: no per-perspective workspace added |
| 37 | Preserve orientation, not a layout; perspectives independent, not overlays | slice 1 | observed: Intent replaces Development content in the same frame |
| 37a | Selecting a story or session cannot manufacture corresponding Intent content or Proof | slice 1 | observed: story and session destinations go to Development (dashboardRoute.ts showStories, dashboardRouteUrl.ts parseRoute) |
| 37b | The analogy is a design candidate, not evidence of usefulness | slice 1 | observed: no usefulness claim added |
| 38 | Evaluate the full Development → Intent → Development journey, including a session and settings | slice 1 | observed: DIF settings round trip; SSN session round trip |
| 38a | Browser proof establishes preserved behavior; Terry's encounter judges understandability | slice 1 | observed: browser proof above; Terry's judgment follows delivery |
| 38b | The result worth keeping is a clear distinction and a usable return without rebuilding the working context | slice 1 | observed: DIF and SSN returns keep view, selection and terminal |
| 39 | No measured productivity gain, reader usefulness or intent protection is claimed by this frame alone | slice 1 | observed: no such claim in the Intent content or docs |
| 40 | Reuse PageFrame owned by ConfiguredDashboard, settings hiding the mounted dashboard, session routing | slice 1 | observed: ConfiguredDashboard.tsx keeps PageFrame and mounted Board; App.tsx unchanged hiding |
| 41 | Perspective and Development's stories/roster selection are different concepts | slice 1 | observed: DashboardRoute view and perspective fields; DIF keeps view=roster in Intent |
| 41a | settings, browser navigation and existing story destinations must remain coherent with both | slice 1 | observed: DIF Back/Forward/reload and settings; notification-story-navigation passed |
| 42 | Repository facts remain repository-owned; sessions operational evidence; view state disposable | slice 1 | observed: perspective only in URL state |
| 43 | No backend store, Intent schema or report producer is required for the frame | slice 1 | observed: no server or schema change in the diff |
| 44 | This feature design belongs here, not in a new ADR | slice 1 | observed: no ADR added |
| 45 | session selection opens Development | slice 1 | observed: SSN from-Intent test, same-project case |
| 46 | project changes preserve perspective with Development as the first-visit default | slice 1 | observed: DIF project change in Intent; default Development |
| 47 | the existing Side panel remains visible across perspectives | slice 1 | observed: SSN, SPCR; covering mode see G2 |
| 47a | one project-independent perspective selection; preserve session-destination and panel continuity rules | slice 1 | observed: selectProject keeps perspective; showStories goes to Development |
| 48 | Separate per-project perspective memory and hiding the panel are unselected alternatives, not required rejection | slice 1 | observed: neither implemented nor rejected by code |
| 49 | No human scope decision remains | slice 1 | observed: none raised during slice 1 |
| 50 | The safe stopping point is a useful Development dashboard and an understandable Intent perspective | slice 1 | observed: Development regression set passed with Intent present |
| 51 | No formal blocking dependency is established | slice 1 | observed: none recorded |
