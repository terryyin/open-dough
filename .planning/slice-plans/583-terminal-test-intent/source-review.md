# Source-only review

Reviewer: fresh generalPurpose Task launch (`73152f1f-2f3c-4b64-a73a-ca6313e18c72`) on 2026-11-12.
Input: only the original selected story Goal, Scope, Key examples, Audit findings owned by this story, and Scope limits, supplied verbatim in substance in the launch message. The reviewer was instructed to read no project files, change nothing, separate compound commitments, and derive no slice ownership or acceptance. Actual launch and numbered return are retained in this execution conversation. Allocation below is the coordinator’s subsequent responsibility.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading Terminal tests in Intent can follow which session opens, what the user enters or receives, and how input recovers. | slice 5 |  |
| 2 | Shared Terminal screen and input controls have one browser owner, so a control change needs one mechanics edit while each scenario keeps the evidence that distinguishes its outcome. | slice 5 |  |
| 3 | Resolve the Terminal input/output finding and its current same-control or same-sequence siblings across integrated and frontend tests, including launch, session, navigation, configuration and story-reading callers. | slice 5 |  |
| 4 | Reconcile moved mechanics and newly added callers. | slice 5 |  |
| 5.1 | Share screen/output observations. | slice 1 | observed: dashboard/tests/terminalScreenPage.ts expectTerminalText / terminalScreenParts().rows; proof /tmp/seed300-terminal-slice1-proof.json 15/15 including agent-terminal.spec.ts and side-panel-content-switching.spec.ts fluent expectText |
| 5.2 | Share input/draft/focus observations. | slice 2 | observed: focusTerminalInput / expectTerminalInputFocused / insertTerminalText on terminalScreenPage.ts; keyboard + prompts specs in /tmp/seed300-terminal-slice2-proof.json |
| 5.3 | Share Terminal identity observations. | slice 1 | observed: terminalScreenPage.ts expectTerminalIdentity / .heading; agent-terminal-lifetime.spec.ts and agent-terminal-codex-page.spec.ts in proof JSON |
| 5.4 | Compose existing session-entry and Side panel controls for opening. | slice 1 | observed: openTerminalControl / openTerminalFromEntry compose entry Open terminal; used from startedSessionTerminal.ts, agent-terminal.spec.ts, story-card sessions, adHocTerminalStartup.ts |
| 5.5 | Compose existing session-entry and Side panel controls for closing. | slice 1 | observed: closeTerminal wraps closeSidePanel in terminalScreenPage.ts; used from startedAdHocSession.ts; local page close helpers remain caller-owned |
| 5.6 | Compose existing session-entry and Side panel controls for recovery. | slice 2 | observed: openTerminalAgain / reconnectTerminal compose panel recovery controls; frontend terminal-prompts-recovery and session-terminal-prompts in proof JSON |
| 6 | Procedural and fluent callers use the same control owner. | slice 1 | observed: terminalPages.ts Terminal.expectText calls expectTerminalText(terminalPanel); fluent side-panel-content-switching/replacement in proof JSON |
| 7.1 | Express keyboard input through named actions and observations. | slice 2 | observed: agent-terminal-keyboard.spec.ts uses insertTerminalText / focusTerminalInput / pressTerminalKey; proof expected |
| 7.2 | Express trust and prompt choices through named actions and observations. | slice 2 | observed: session-terminal-prompts + cursor-trust-page + frontend prompts-recovery via named prompt/trust paths; proof expected |
| 7.3 | Express connecting input through named actions and observations. | slice 2 | observed: frontend terminal-prompts-recovery connecting case; sent stays [] until reconnect then deliberate choose; proof expected |
| 7.4 | Express refused input through named actions and observations. | slice 2 | observed: frontend terminal-prompts-recovery refused case; same withheld-then-choose pattern; proof expected |
| 7.5 | Express ended input through named actions and observations. | slice 2 | observed: agent-terminal-ended-input-recovery + session-terminal-prompts ended attachment; Open again required; proof expected |
| 7.6 | Express deliberate recovery through named actions and observations. | slice 2 | observed: deliberate reconnect/open-again then new prompt/input choice across recovery specs; proof expected |
| 8.1 | Express touch keys through the existing focused owners. | slice 3 | observed: tapTerminalKey / touch keys via touchTerminalPage; agent-terminal-touch-keys in /tmp/seed300-terminal-slice3-proof.json |
| 8.2 | Express soft-keyboard fit through the existing focused owners. | slice 3 | observed: soft-keyboard fit via touchTerminalSoftKeyboardPage / agent-terminal-touch-keyboard-fit; proof JSON 21/21 |
| 8.3 | Express composition through the existing focused owners. | slice 3 | observed: openTerminalComposer / Insert without Enter in agent-terminal-touch-composer; proof JSON |
| 8.4 | Express selection/copy through the existing focused owners. | slice 3 | observed: terminalSelectPage paused selection owners; integrated + frontend select specs in proof JSON |
| 8.5 | Express paste through the existing focused owners. | slice 4 |  |
| 8.6 | Express voice through the existing focused owners. | slice 5 |  |
| 9 | Preserve selection/copy’s paused-screen and application-mode proof. | slice 3 | observed: paused overlay host `.terminal-screen` distinct from `.xterm-screen`; drawn-row comparison and empty-sent-while-paused retained in select/application-scroll proofs |
| 10.1 | Where they explain the case, keep literal commands visible. | slice 2 | observed: literal keys/phrases remain call-site arguments to insert/press/choose helpers |
| 10.2 | Where they explain the case, keep draft expectations visible. | slice 2 | observed: unsent/editable draft text asserted at call sites (session-terminal-prompts insert before Enter) |
| 10.3 | Where they explain the case, keep output expectations visible. | slice 1 | observed: callers still pass expected text literals into expectTerminalText / toContainText on shared rows (e.g. attached short ids in sessions-sidebar-navigation and lifetime) |
| 10.4 | Where they explain the case, keep input modality visible. | slice 3 | observed: focusByTouch, tapTerminalKey, simulateSoftKeyboardViewport, openTerminalComposer keep phone modality explicit at call sites |
| 10.5 | Where they explain the case, keep focus visible. | slice 2 | observed: expectTerminalInputFocused / focusTerminalInput keep focus visible in keyboard spec |
| 10.6 | Where they explain the case, keep session identity visible. | slice 1 | observed: callers still pass story titles into expectTerminalIdentity (codex-page, lifetime, agent-terminal) |
| 11.1 | Keep held answers explicit. | slice 2 | observed: held trust rendition and connecting/partial readiness remain at call sites (cursor-trust-page, pending-readiness-input) |
| 11.2 | Keep provider events explicit. | slice 5 |  |
| 11.3 | Keep clock advances explicit. | slice 3 | observed: composer reconnect no-auto-replay uses page.clock.install + runFor(150), not waitForTimeout |
| 11.4 | Keep release/retry order explicit. | slice 4 |  |
| 12.1 | Preserve native attach/PTY lines at their independent observing boundaries. | slice 1 | observed: native attach arrays remain at caller boundaries (claudeAttaches/codexAttaches) in lifetime and codex-page; proof JSON expected |
| 12.2 | Preserve WebSocket frames at their independent observing boundaries. | slice 1 | observed: no WebSocket observation moved into terminalScreenPage; callers retain independent traffic checks where present |
| 12.3 | Preserve request counts at their independent observing boundaries. | slice 1 | observed: request-count assertions remain outside shared screen owner in affected proof specs |
| 12.4 | Preserve kept records at their independent observing boundaries. | slice 1 | observed: kept-record checks remain in side-panel-content-switching.spec.ts (attachesOfA / endedBy) in proof JSON |
| 13 | Direct accessibility, rendition and geometry observations remain independent when that interface is the contract. | slice 1 | observed: touchTerminalPage.ts and terminalSelectPage.ts keep evaluate `.xterm-rows > div` geometry/paused contracts; theme/rendition specs retain independent CSS expectations |
| 14 | Helpers receive caller facts. | slice 5 |  |
| 15 | Helpers never infer expected values from production state. | slice 5 |  |
| 16 | Helpers never silently complete a held read. | slice 5 |  |
| 17 | Domain data stays with MakeMe. | slice 5 |  |
| 18 | Each test keeps its existing tier. | slice 5 |  |
| 19 | Terminal-control callers of sibling launch, session/report, Board, review, settings and measurement workflows are included. | slice 5 |  |
| 20 | Unrelated workflow mechanics of those sibling workflows stay with their own stories. | slice 5 |  |
| 21 | Necessary proof-harness repair follows the project’s failing/flaky-test policy. | slice 5 |  |
| 22.1 | Share reading output. | slice 1 | observed: expectTerminalText shared reading; residual direct xterm-rows in *.spec.ts = 0 |
| 22.2 | Share sending commands. | slice 2 | observed: typeLine / insertTerminalText / pressTerminalKey shared sending; fluent typeLine reuses shared typeLine |
| 22.3 | Share checking the current draft. | slice 2 | observed: current draft/unsent text checked at call sites before deliberate Enter; composer draft stays touch owner |
| 22.4 | Share checking terminal identity. | slice 1 | observed: expectTerminalIdentity shared heading check |
| 22.5 | Share opening the panel. | slice 1 | observed: openTerminalControl / openTerminalFromEntry shared opening |
| 22.6 | Share closing the panel. | slice 1 | observed: closeTerminal shared panel close via closeSidePanel |
| 23.1 | Use the existing Terminal, touch and paste helpers to cover prompts. | slice 2 | observed: prompts via openTerminalPrompts / chooseTerminalPrompt; voice re-exports openTerminalPrompts |
| 23.2 | Use the existing Terminal, touch and paste helpers to cover trust. | slice 2 | observed: agent-terminal-cursor-trust-page.spec.ts in proof set |
| 23.3 | Use the existing Terminal, touch and paste helpers to cover ended-input recovery. | slice 2 | observed: agent-terminal-ended-input-recovery.spec.ts in proof set |
| 23.4 | Use the existing Terminal, touch and paste helpers to cover keyboard. | slice 2 | observed: agent-terminal-keyboard.spec.ts in proof set |
| 23.5 | Use the existing Terminal, touch and paste helpers to cover soft keyboard. | slice 3 | observed: soft keyboard covered through existing touch/soft-keyboard helpers in keyboard-fit proof |
| 23.6 | Use the existing Terminal, touch and paste helpers to cover compose. | slice 3 | observed: compose covered through existing touch composer helpers; Insert ≠ Enter in composer proof |
| 23.7 | Use the existing Terminal, touch and paste helpers to cover paste. | slice 4 |  |
| 23.8 | Use the existing Terminal, touch and paste helpers to cover voice. | slice 5 |  |
| 24.1 | Keep actual input as test facts. | slice 2 | observed: exact input strings and sent arrays remain call-site facts (e.g. sent == ["as recommended"]) |
| 24.2 | Keep actual output as test facts. | slice 1 | observed: expected output strings remain call-site facts in proof-set specs |
| 24.3 | Keep native attach/PTY evidence as test facts. | slice 1 | observed: native attach/PTY evidence remains call-site facts (attach length/id equality) in lifetime/codex proof cases |
| 25 | On developer review of the migration: every historical finding/current caller has an evidence-backed disposition. | slice 5 |  |
| 26 | On developer review of the migration: representative scenarios read in user terms. | slice 5 |  |
| 27 | On developer review of the migration: shared controls have one mechanics owner. | slice 5 |  |
| 28 | On developer review of the migration: clarity/edit savings justify the added helper cost without losing distinct checks. | slice 5 |  |
| Q1 | The 63 audited direct-selector specs at `7eab3d6ca` are a historical starting set, not a completion count. | slice 5 |  |
| Q2 | Suite-wide fluent conversion is not required for procedural and fluent callers to share the same control owner. | slice 1 | observed: only Terminal.expectText reuses shared owner; no suite-wide fluent conversion |
| Q3 | Selection/copy is a current same-control sibling of the Terminal input/output finding. | slice 3 | observed: selection/copy remains distinct owner (terminalSelectPage) as same-control sibling |
| Q4 | Frontend substitutes remain frontend proof rather than claiming PTY proof. | slice 4 |  |
| Q5 | Direct xterm rows or helper-textarea selectors occur in 63 browser specs across Terminal, launch, session, navigation, configuration and frontend tests. | slice 5 |  |
| E1 | A procedural host/reconnect case and a fluent Side panel journey open a session → each reads output through the shared Terminal owner → the source names the chosen session and expected text, while native attach counts, retained records and later reconnect identity remain independently checked. | slice 1 | observed: agent-terminal-lifetime.spec.ts procedural reconnect + side-panel-content-switching.spec.ts fluent journey both via shared owner; attach counts/records/identity independently asserted; proof JSON 15/15 expected |
| E2 | A Terminal is connecting, refused, on a trust prompt or ended → the user makes the case’s explicit input or recovery choice → the test still shows which exact bytes reached which session, what was withheld, and which deliberate choice makes input available again. Recovery never hides a queued input replay or an extra native session. | slice 2 | observed: connecting/refused/trust/ended cases in proof JSON; withheld then deliberate recovery; no auto-replay of presets |
| E3 | A phone user types with Terminal keys or composes a draft while the soft keyboard changes the available room → the test names the actual key, gesture, viewport and draft → focus and fitting remain observable, Insert sends the draft once without Enter, and deliberate Enter alone submits. A paused selection case still distinguishes copied text from application input and scrolling. | slice 3 | observed: touch keys/composer/fit + paused select/application-scroll in proof JSON; Insert without Enter; deliberate Enter submits; paused copy vs application input distinguished |
| E4 | A clipboard payload is available while attachment readiness is held, or the server refuses an image → the user chooses Paste and then explicitly retries when ready → the source retains the payload, refusal and release order; draft, sent bytes and native output prove insertion or refusal. Frontend substitutes remain frontend proof rather than claiming PTY proof. | slice 4 |  |
| E5 | Voice transcription is held while the user types or changes sessions → recording, provider release and the chosen follow-up remain separate → expected transcript, retained draft, cancellation and final submitted line are visible in the case, with provider and native evidence independent. | slice 5 |  |
| E6 | A developer reviews the migration → every historical finding/current caller has an evidence-backed disposition → representative scenarios read in user terms, shared controls have one mechanics owner, and clarity/edit savings justify the added helper cost without losing distinct checks. | slice 5 |  |
| X1 | No dashboard behavior change. | slice 5 |  |
| X2 | No new browser-test framework. | slice 5 |  |
| X3 | No universal fluent conversion. | slice 5 |  |
| X4 | No fewer-case or faster-suite claim. | slice 5 |  |
| X5 | No wholesale migration of the sibling launch, session/report, Board, review, settings or measurement workflows. | slice 5 |  |
