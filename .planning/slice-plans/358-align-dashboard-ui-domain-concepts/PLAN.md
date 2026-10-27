# Align the dashboard globally with its UI domain concepts

**Identity:** SEED-153#align-dashboard-ui-domain-concepts
**Source:** [Selected story](../../seeds/SEED-153-dashboard-ui-domain-concepts.md#align-dashboard-ui-domain-concepts)

## Goal and scope

Use ADR 0008's Board, Column, Story card, Session entry, Sessions sidebar, Side panel, Panel divider and region-qualified Scrollbar names directly throughout UI/accessibility, implementation, CSS, tests/support and maintained docs. No competing synonyms or vocabulary aliases. Make the Board its own scroll region in every layout (Terry, 2026-10-27).

Included: `dashboard/src`, `dashboard/tests` (specs, page objects/support and writing guidance), `dashboard/*.md`, `docs/dashboard-*.md`, dashboard references in `docs/project-visibility-requirements.md`, and server names representing adopted UI concepts.
Preserve facts, session identities, story URLs, behavior and saved preferences, including former-key recovery. Exclude new ADR concepts and redesign beyond Board scrolling. Outside-table concepts retain names unless they overload an adopted concept; published record formats retain their names.
Casing adapts to syntax. Session entry presentation may vary by placement while keeping the same concept name.

## Architecture and current decisions

ADRs 0001/0008 govern direct UI vocabulary and derived spatial state; navigation guidance owns layout. Reuse existing implementations under their adopted names; Session entry retains its two placement presentations. File moves preserve responsibilities. The seed's findings retain candidate evidence.

- **Names chosen (Terry delegates wording):**
  - Board: `DashboardColumns`/`WorkStages`/`stages` → `Board`; accessible region name "Board".
  - Column: `stage`/`StageView`/`stage-header` → `Column`/`column-header`.
  - Story card: `WorkCard` → `StoryCard`; `DoneStoryCard` stays a Story card in Recently done.
  - Session entry: `SidebarEntry`/`sidebar-entry` → a Session entry presented in the Sessions sidebar.
  - Sessions sidebar: `SessionSidebar`/`session-sidebar` → `SessionsSidebar`/`sessions-sidebar`.
  - Side panel content: `TerminalPanel` → terminal, `SessionResultPanel`/"session result" → final report, `StoryReviewPanel` → story review, and the opening operations named for their content.
  - Panel divider: `SidePanelEdge` → `PanelDivider`, accessible name "Panel divider".
  - Other resize and paging controls: the generic `ResizeEdge` becomes a divider component, and the Running Cursor sessions control is named "Running Cursor sessions divider". `ColumnEdge` is renamed for its hidden-column paging responsibility, without "edge".
- **Saved preferences:** each renamed browser key (`open-dough.dashboardColumns.position`, `open-dough.sessionSidebar.open`, `open-dough.sessionSidebar.runningCursorHeight`) is read from its new key, falls back to the former key once, and is then kept under the new key. `open-dough.sidePanel.width` already matches its concept.
- **Board scroll region:** the region below the banner scrolls instead of the document. The banner sits above it unpinned by `position: sticky`. Focus and reveal padding, the readable/in-view checks (`pageMovement.ts`, `storyCardFocus.ts`), the Preparation legend's reading-position restore, and the sticky Column headers and paging controls refer to that region instead of `html`/`window`. When the agent roster replaces the Board, it scrolls in its own region. Stacked, the Side panel takes 50dvh above the Board instead of 70dvh, so the banner and Board keep room to read a Story card. This is a reversible layout value.

## Preparation observations and decisive premises

Observed here on 2026-10-27, Darwin arm64, `94b93cd6` plus seed draft, Node 24.21.0; native npm/browser/check setup passed:

1. With story review open at `127.0.0.1:4173`, a wheel scroll at 1400×420 moved `.page-column` 362px while sticky `.side-panel` stayed at top 0. At 700×800 the Side panel moved to −542. This is slice 4's baseline; seed findings retain details.
2. Scratch `.page-column { height:100dvh; overflow-y:auto; scroll-padding-* as html }` in `side-panel.css` produced 20 failures/154 passes across 67 scroll/viewport specs at eight workers. Reverted, the 15 failing files passed all 36 checks (load about 11). Affected families: accessible overview, column clamp/height/paging, published-facts reading, story-reference navigation/identity/scroll completion, Recently done progressive refresh/navigation, branch progress, ad-hoc terminal and card delete. Consumers are `pageMovement.ts`, `workFocus.ts`, html padding, `pageLayout.ts`, `readingPlace.ts`, Board page support, `recentlyDoneProgressivePage.ts`, `sessionNavigationJourney.ts` and touch objects. Scratch edits were reverted before execution.
3. `touchTerminalPage.ts` asserts stacked Side panel height 0.7; slice 4 adopts the decided 0.5.
4. Existing reload journeys cover the four preference constants (`columnPaging.ts`, former `SessionSidebar.tsx`, `runningCursorHeight.ts`, `sidePanelWidth.ts`). Slices 1–2 add former-key recovery.

No paid or owner-held premise remains.

## Ordered slices

### 1. The Board and its Columns carry their concept names
Type: Behavior
Status: done
Proof: Board-region and Column-paging journeys (renamed from `dashboard-columns-*`) with the "Board" accessible name and a former-key position; consumer-trace-listed specs green

Behavior: Board/Column names and paging controls trace directly through implementation/tests/docs; former saved column position recovers.

### 2. Story cards, Session entries, and the Sessions sidebar carry their concept names
Type: Behavior
Status: done
Proof: card, Sessions sidebar, and Running Cursor journeys with former-key open state and height; consumer-trace-listed specs green

Behavior: Story cards, one Session entry across all placements, the Sessions sidebar and its saved open/height values retain behavior under adopted names.

### 3. Side panel content and its dividers carry their concept names
Type: Behavior
Status: done
Proof: terminal, final report, story review, side panel width, and Running Cursor resize journeys; consumer-trace-listed specs green

Behavior: Terminal, final report and story review share one Side panel; the named Panel divider and Running Cursor divider preserve pointer/key resizing.

### 4. The Board scrolls in its own region
Type: Behavior
Status: done
Proof: new Board scroll journey (side by side and stacked, Side panel open); the 20 tests from observation 2 and the remaining scroll-observing specs green against the Board region; reveal and focus journeys land below the banner and Column heading

Behavior: with the Side panel open beside or above a long Board → scrolling
the Board moves only the Board, through the Board scrollbar at its own edge,
and the Side panel stays in place. Story reveal, keyboard focus, column paging,
reading position, and Maximize/Restore behave as before. The agent roster
scrolls in its own region. Navigation docs name the Board scrollbar and the
other region scrollbars.

### 5. A whole-dashboard review finds one name per concept
Type: Behavior
Status: done
Proof: recorded name review (search terms in Current decisions plus "page"/"dashboard"/"panel"/"edge" meaning an adopted concept) with every remaining match dispositioned; full dashboard suite, `npm test`, typecheck, and lint green

Behavior: Whole-dashboard review finds no competing or overloaded adopted names. Rename residue and keep existing journeys green.

## Execution complete

Product advice: no change. The adopted vocabulary and independent Board scrolling satisfy the selected story; preserve deferred spatial navigation and existing priorities. Review found no remaining correction or product decision. Actual repaired Linux CI remains the owned completion gate.

## Plan review

Five cohesive concept/proof groups; Board scrolling is separated from naming and bounded by preparation observation. No original slice-review concern remained.

## Execution context

- Established Story Branch start: `SEED-153#align-dashboard-ui-domain-concepts`, publisher `dashboard-territory.local-open-dough`, agent `bas-chan`.
- Originating and integration checkout: `/Users/terryyin/git/open-dough`; execution checkout: `/Users/terryyin/git/open-dough/.worktrees/align-the-dashboard-globally-with-its-ui-domain` (existing owned linked worktree), branch `codex/align-the-dashboard-globally-with-its-ui-domain`.
- Authorized trunk `origin/main`; ordinary delivery targets the origin execution branch. Starting revision `421fbf9e9dbdeb561e4f886a50a06ae2b37c383e`; published claim and initial candidate `3901d3ac8ddd5717744a0af36d53160033595add`. Claim CI is unobserved on trunk.
- Execution-branch accepted revisions: `801f62c3bb2427ab838588ef2ba48f217ab156f6` (base `3901d3ac8ddd5717744a0af36d53160033595add`), `08b604666d982b7140faab011cfb801aae5a7fe2` (base `801f62c3bb2427ab838588ef2ba48f217ab156f6`), `420f72dc12a441e10e27c4070300ab9c1146a1a4` (base `08b604666d982b7140faab011cfb801aae5a7fe2`), `1f45ec1c2fe7d481a3fc817ea41958c2d4494121` (base `420f72dc12a441e10e27c4070300ab9c1146a1a4`), slice5 `08a2c4aa8297fe7c357099880af8a6f5b2f44aff` (base `1f45ec1c2fe7d481a3fc817ea41958c2d4494121`). All formatting/full lint/size/staged-hook/typecheck gates passed; observer reused for each.
- Current published base/CI repair: `bdfdfb409949d7b5bf145a95dfa0b44443a57097`, suffix08a2; final observer reused.
- Checkout readiness: Node 24.21.0; `node scripts/setup-native.mjs npm`, `browser`, `check`, then `npm run typecheck:dashboard` passed in this checkout. Selective formatting is `PATH=/opt/homebrew/bin:$PATH npm run format`; `.githooks/pre-commit` is check-only staged lint and script-triggered dashboard typecheck.
- CI observer: GitHub Actions `terryyin/open-dough`, execution branch, selector `ci.yml` (verified active, display name `CI`); replacement coordinator `seed153-codex-final`, live directory `/tmp/dough-ci-501/watch-XrEojj`, PID55840, PTY13757, yielded cell220, checkout as above. Prior8HHXKr ended finished after08:11 GitHub read failure; PID3898 absent, native delivered events2/ack2 recovered (not CI success). Workflow readiness reverified; managed resume of08a2 accepted with pushCount0 and recovered observation. No publication repeated.
- Settled size decision: Terry rejected an exception on2026-10-27 (“no. Make it shorter.”); coherently shorten all touched files to<=250. Original observer `/tmp/dough-ci-501/watch-SEWXXM` stopped for that judgment (unread0, recorded/delivered0, PID51741 absent); current rearmed observer is named above. This is historical, not an active stop.
- Proof policy: The source-only acceptance table below maps every promise, trigger and qualification to its owning slice and observation. Each slice runs typecheck and full lint with `/opt/homebrew/bin` first on PATH, plus consumer-traced specs. When most dashboard journeys consume the effect, run the full dashboard suite. Slice 5 runs full dashboard proof and `npm test` on the final state before publication; CI follows publication. Board scroll proof includes both 1400×420 and 700×800 with an open Side panel, stationary panel/document and preserved reveal/focus behavior.
- No numeric slice budget or overrun permission supplied; preserve the planned scope and ordinary planning authority.
- Expensive proof decision: local Darwin arm64 host, 16 cores / 48 GiB RAM, load 4.23 at startup; no known competing owned heavy proof. Run one suite at a time with at most 8 workers, preserving coverage. Reconsider on contention, failure, or workload change; each implementation agent owns its verification through terminal result.

## Source-only acceptance review

[Original commitments, qualifications and proof owners](ACCEPTED-PROOF.md#source-only-acceptance-review) remain intact in the acceptance evidence.

## Accepted proof

[Slices 1–5 acceptance and independent refactoring](ACCEPTED-PROOF.md) retain commands, observations, trace dispositions and failure recovery. Their accepted revisions are in Execution context.

Destructive-outcome check for slice4: replace document scrolling with Board-owned scrolling; later slice5 requires existing journeys and consistent region names. Compatible: source explicitly requests this ownership change, with reveal/keyboard/paging/banner/Maximize preserved through adapted consumers. No later-outcome conflict.
Baseline reuse: recorded pre-change document/stacked observations remain applicable to scroll ownership; slices1–3 retained layout declaration values (including stacked70dvh) and all existing journeys passed. Obtain only missing current observations before invalidating them; no repeat of the expensive scratch experiment is required.

## Story obligations

### G1. Sessions sidebar accessible region name
Reported: slice 2 — "implementation reports the complementary region still has accessible name "Sessions"; coordinator requires "Sessions sidebar" to expose its adopted concept. Heading/button Sessions retain their existing content/action wording."
Story clause: "align UI wording and accessible names"
Disposition: proved by slice 2: sessions-sidebar.spec.ts opening journey observes exact complementary name; final full proof selects all55 region consumers; /tmp/seed153-slice2-handoff.txt.

### G2. Required process-cleanup proof
Reported: slice 2 — "full dashboard run observed boundary/run-processes.spec.ts:110 intentional timeout without its expected orphan-cleanup diagnostic; initial broad run was stopped gracefully and retained at /tmp/seed153-slice2-proof.json. Sanitized diagnosis /tmp/seed153-slice2-process-observation.json confirms spawnSync ps ENOBUFS at1,114,112 bytes versus successful1,967,922-byte observation locating the exact owned orphan. Repair observation completeness/failure handling without changing run ownership; preserve the separately observed foreign orphan. New fake-ps regression also needs explicit platform-boundary setup so Linux CI reaches the intended PS path; slice 2 owns that focused correction after the current full run."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 2: boundary/run-process-observation.spec.ts covers complete large PS output, actual own-child termination/other-owner survival, sanitized failure and resource removal; original boundary/run-processes.spec.ts observes real nested orphan cleanup. Final portable six-test proof and full proof passed; /tmp/seed153-slice2-handoff.txt includes inspected lifecycle and exact-owned cleanup receipts. Actual Linux execution remains CI-owned.

### G3. Story card geometry after rename
Reported: slice 2 — "published-facts-reading scroll checks fail because StoryCard's className array retains literal "card" while its styling moved to ".story-card". Correct after the frozen run ends; fresh full proof must cover the corrected geometry and G1 accessibility together."
Story clause: "Preserve published story facts, session identities, story URLs, existing behavior, and saved browser preferences."
Disposition: proved by slice 2: StoryCard base class restored under adopted name; all nine geometry failures pass focused and full; /tmp/seed153-slice2-handoff.txt retains original traces/causal limits.

### G4. Current selection marker overload
Reported: slice 3 — "Frozen review finds .in-terminal also marks final-report content on Story cards and both Session entry placements. Rename to .in-side-panel after terminal proof and validate traced observers."
Story clause: "A whole-dashboard review finds no competing name for an adopted concept or single name used for incompatible concepts."
Disposition: proved by slice 3: final marker twelve-case proof observes Story card and both Session entry placements for terminal/final report, close/replacement/navigation; declarations and selection expressions unchanged. /tmp/seed153-slice3-handoff.md.

### G5. Side panel controls global names
Reported: slice 3 — "Coordinator inspection finds PanelControls/usePanelCloseShortcut/closeShortcutLabel exclusively implement shared Side panel controls. Rename global module/API to expose that adopted region while preserving implementation."
Story clause: "components, modules, files, types, functions, state"
Disposition: proved by slice 3: exact SidePanelControls module/API comparison and typecheck, with shared controls exercised in twelve marker cases; shortcut/resize/full content proof retained. /tmp/seed153-slice3-handoff.md.

### G6. Component/model basename collision
Reported: slice 3 — "Required formatter/lint project service omits FinalReport.tsx and StoryReview.tsx because case-insensitive TypeScript roots select paired finalReport.ts/storyReview.ts schema modules. Installed parser confirms only model roots; no commit or publication occurred. Rename schema/transport modules to explicit finalReportContract.ts/storyReviewContract.ts and renew affected module-loading proof."
Story clause: "components, modules, files, types, functions, state"
Disposition: proved by slice 3: all four compiler roots present on actual case-insensitive host, forced typecheck and eight fresh content/schema/native-report module-loading cases passed; exact module/API equivalence and1177-consumer trace in /tmp/seed153-slice3-handoff.md. Required formatter/lint retry passed before420f72dc publication.

### G7. Native keyboard scrolling from the body
Reported: slice 4 — "First focused scroll proof passed 15/16; End from body no longer moved the Board after document scrolling was removed. Existing modal/settings boundaries are reused for a minimal body-only focus handoff to the visible Board/roster before native default scrolling; focused controls keep native keys."
Story clause: "Story reveal, keyboard scrolling, hidden-column controls, the pinned banner, and Maximize/Restore keep their current behavior against that region."
Disposition: proved by slice 4: board-reading.spec.ts End/Home/Page/focused-control/modal/nonzero-restore assertions and board-native-reading.spec.ts default-browser handoff; focused12 and current full observations passed.

### G8. Preserve original narrow Session-entry reveal
Reported: slice 4 — "At original700x900, card is531px high but Board349px: old whole-window fit precondition is no longer supplied after planned50dvh. Retain same original input/fixture with source-required readable card-top observation, plus genuine-fit1600 whole-card proof and planned700x800 top case. No data/assertion ratios/timeouts shrink."
Story clause: "Revealing a story through its URL or a Session entry still brings its card's top into view below the banner and Column heading."
Disposition: proved by slice 4: board-session-reading.spec.ts retains original700x900 input with readable-top observation, adds700x800 and genuine-fit1600 whole-card proof; original navigation fixture retained. Current full passed all three.

### G9. Board scrollbar and Panel divider hit boundaries
Reported: slice 4 — "Coordinator CSS inspection finds negative Panel divider left offset extends its hitbox toward Board's new scrollbar. Center inequality alone does not prove distinct pointer controls; actual edge hit-testing/interaction is pending and any confirmed overlap needs a bounded spacing correction. Visible-native-bar probe confirms the15px gutter hit the divider; preserve its original placement/layer and reserve the Board-side half-strip from Board/roster scrolling regions with one shared room value. Prove scrollbar and divider pointer independence."
Story clause: "Resize controls and scroll controls stay distinct."
Disposition: proved by slice 4: board-scroll.spec.ts uses visible native scrollbar hit/track movement with fixed panel/document, then actual Panel divider drag; sidePanelWidthPage.ts verifies real divider pointer hit, with existing resize keyboard/range/cancel journeys passed in current full.

### G10. Reveal keeper follows height-only region changes
Reported: slice 4 — "Bounded1400x420 to1400x620 probe loses80.0625px reading clearance because keeper size comparison tracks row dimensions but ignores newly observed scroll-region height. Include region height in the existing comparison; no new scroll framework. Initial failing observation retained at /tmp/seed153-slice4-resize-probe.json."
Story clause: "Story reveal, keyboard scrolling, hidden-column controls, the pinned banner, and Maximize/Restore keep their current behavior against that region."
Disposition: proved by slice 4: board-reading.spec.ts reveals tall cards through URL and Session entry, changes only viewport height in both directions, and observes the same readable top. Current full passed.

### G11. Touch terminal input after stacked height reduction
Reported: slice 4 — "Original phone/tablet240px journeys expose17px input below44px with panel120/header89/identity72. A fixture-specific320px cutoff also fails the same long-title/native fixture at400px. Preserve original assertions and constrain coarse terminal identity/padding from available Side panel height; retain whole PTY rows and header touch reading. Evidence /tmp/seed153-slice4-terminal-space.json and /tmp/seed153-slice4-touch400-probe.json."
Story clause: "Preserve published story facts, session identities, story URLs, existing behavior, and saved browser preferences."
Disposition: proved by slice 4: agent-terminal-touch.spec.ts original240px and added400px phone/tablet long-identity journeys retain44px input, whole PTY rows, header reading/rotation/Maximize checks; current full passed with available-panel-room constraint.

### G12. Mobile Sessions sidebar follows actual banner position
Reported: slice 4 — "Full run1680 selected ends1677pass/3fail. Mobile Sessions sidebar center hit is cut by banner z5 above sidebar z4 because stacked50dvh places banner mid-viewport. Preserve original overlay hit assertions and anchor its scroll region below the actual banner position."
Story clause: "Preserve published story facts, session identities, story URLs, existing behavior, and saved browser preferences."
Disposition: proved by slice 4: sessionsSidebarPage.ts expectSessionsSidebarLayout retains original overlay center-hit assertion after existing resizeUntilArranged; sessions-sidebar.css anchors below actual stacked panel/banner. Focused12 and current full passed.

### G13. Story-review touch targets within reduced panel room
Reported: slice 4 — "The same full run finds phone/tablet story-review-touch44px targets clipped: top30% cap shrinks with50dvh panel while expanded context-values18dvh can exceed that viewport. Preserve original fixtures/target assertions and ensure nested top scrolling has usable room."
Story clause: "Preserve published story facts, session identities, story URLs, existing behavior, and saved browser preferences."
Disposition: proved by slice 4: story-review-touch.spec.ts original phone/tablet fixtures retain44px, clipping/hit, pane reading, rotation and header-without-repair assertions. reachReviewControl adds native own-region reach for off-fold content and verifies panel/document stationary plus no ancestor clipping. Focused12 and current full passed.

### G14. Native modified reading keys from the body
Reported: slice 4 — "Bounded actual Darwin Chromium document comparison shows Meta+ArrowDown and Meta+ArrowUp move the native document, while Ctrl+End/Home do not. The new body handoff excludes all modifiers, losing the observed Meta reading commands; hand only those observed commands to the existing Board before native default scrolling."
Story clause: "Story reveal, keyboard scrolling, hidden-column controls, the pinned banner, and Maximize/Restore keep their current behavior against that region."
Disposition: proved by slice 4: board-native-reading.spec.ts compares real native document and unfocused Board edge movement, modal and app shortcuts on Darwin; product focus-only handoff allows Meta Up/Down and Ctrl Home/End without OS policy. Focused/current full passed; actual Linux family remains CI-owned.

### G15. Paging queries use actual Board room
Reported: slice 4 — "At viewport1152 with visible scrollbar, page container1152 but Board client1137 shows three Columns instead of two and loses saved position1. Move the existing Board-specific container-query ownership to its actual scrolling viewport; reuse the fit rules without a second algorithm."
Story clause: "Story reveal, keyboard scrolling, hidden-column controls, the pinned banner, and Maximize/Restore keep their current behavior against that region."
Disposition: proved by slice 4: board-scroll.spec.ts visible native gutter/client-width boundary observes Taken/Recently done and saved-position reload; inner content owns unchanged CSS fit rules and stable gutter prevents fit feedback. Focused/current full passed.

### G16. Trust replay journey reaches a hidden Column
Reported: slice 4 — "Frozen full run reports agent-terminal-cursor-trust-page.spec.ts line57 timeout: viewport780x700 now supplies Boardclient765 below48rem after native gutter/query correction, so direct Taken Session-entry click lacks paging. Preserve the original viewport/trust fixture and add ordinary showColumn navigation; no initial Taken-visible promise or timeout extension."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 4: agent-terminal-cursor-trust-page.spec.ts retains780/1100 inputs and all replay/PTY join/reconnect assertions, using ordinary showColumn Taken before Open. Corrected2-case strict proof /tmp/seed153-slice4-cursor-preconditions.json passed.

### G17. Cursor scope continuation recovery after reload
Reported: slice 4 — "Frozen full run reports cursor-session-scope-continuation.spec.ts cannot-load replacement timeout after raw reload: Recover remains disabled and retained snapshot says execution start needs reconciliation. The sibling journey uses reloadUntilRead plus agent-not-running assertion. Inspect lifecycle/startup/read paths before choosing a real product correction or missing settled-recovery precondition; no assumed harmless timing explanation."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 4: inspected storyStartup/needsReconciliation and disabled StoryCard frame through RecoverSession; test now observes real enclosing settledOutcome launched before endHeldClient held-list0, reloadUntilRead and agent-not-running before Recover. Original replacement/scope/no-model assertions passed in corrected2-case strict proof; no product change.

### G18. Whole-dashboard vocabulary residue
Reported: slice 5 — "Initial audit finds Column paging counts still named edge, Board helpers/specs called accessible overview or dashboard, Column CSS described as panels, stale page/document-scroll and query-owner comments, and shared white-fill token --panel also used outside the Side panel. Align actual responsibilities across every representation; preserve generic shell/frame and real wire/record exclusions, fixture facts/URLs, timing rows and color values."
Story clause: "A whole-dashboard review finds no competing name for an adopted concept or single name used for incompatible concepts."
Disposition: proved by slice 5: final per-match name audit /tmp/seed153-slice5-name-audit.json maps13,891 remaining lines across1,481 text files to actual meanings, with native/browser/sprite/visual frame distinctions and legacy-key/record exceptions inspected. Direct SidePanel state and Board/support/spec/doc renames, identical21 CSS declaration sequences after color-token spelling, all549 mapped timing rows and matched fact literals preserved. Full current1,681 passed observations cover these names; rate-limit observation is renewed under proved G20.

### G19. Touch Start waits for real policy offers
Reported: slice 5 — "Frozen full reports phone/tablet agent-launch-start-session-touch.spec.ts line53 unchecked radio after raw tap. At load29/16cores the actual Isolated workspace radio was disabled awaiting session-policy offers; openBacklog supplies origin/page, not completed offers. Preserve original fixtures/44px/clipping/hit/raw-tap/checked/rotation/draft assertions and wait for the real enabled precondition. Owned failed run stopped gracefully with diagnostics retained; next full bounded to4workers."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 5: launchOffers reading→offered and notOfferedHint/UnattachedSessionPolicy disabled guard inspected. Existing phone/tablet raw touch now waits for real enabled radio before unchanged hit/clipping/checked/draft/rotation observations. Focused2/2 strict6.450s and both cases in current full passed; no product or timeout change.

### G20. Directed-time rate-limit check admission
Reported: slice 5 — "Four-worker full reports auto-refresh-rate-limit.spec.ts directed-time check expected200 but got502 while the page reports server admission wait1s remaining. Host load11.67/16cores does not establish an environmental cause. Inspect real/server/browser clock and admission/continuation paths before correcting behavior or setup; retain actual failed verdict and current unaffected observations."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 5: controlled unchanged-helper plus actual ReadAdmission counterexample reproduces return79ms before its own deadline and held-back1 under80ms during-wait clock rollback; no OS clock changed. One absolute deadline is now rechecked after each timer wake, with no cushion/API/policy change. Both controlled cases now at/after deadline and allowed; all27 real tests across11 affected specs passed strict24.006s. Original incident clock event remains unrecorded, not claimed; current fixture contract and original journey are proved. Full1,681/1 failed verdict retained,1,655 unaffected observations reused plus27 renewed; final typecheck passed. Evidence /tmp/seed153-g20-clock-adjustment-before.json, /tmp/seed153-g20-clock-adjustment-after.json and /tmp/seed153-slice5-g20-real-consumers-20261027-1715.json; actual single-request continuation/store-before-response and35-consumer dispositions inspected.

### G21. Linux CI short-height terminal title reading
Reported: slice 5 — "Recovered registered CI1f45 run40470183333/attempt1 job122075164144 and current08a2 run40481398209/attempt1 job122112322004 both fail dashboard2/12 phone agent-terminal-touch.spec.ts line105: titleWordsShown(heading,0,28) is false at original240px height. Current production constraints are identical apart from color-token spelling, so no demonstrated repair exists. Preserve full original phone/tablet fixtures, first28/title/session touch reading,44px input/native rows/rotation/Maximize/Close; inspect actual Linux artifact and correct the bounded layout constraint, with current local proof plus required final CI."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 5: guarded CI repair; exact Linux08a2 artifact shows the40px cap clipping the original title; sibling controls already reserve44px. Shared control-size floor uses that existing row, preserving native input/PTY room. Original11 affected journeys across7 specs passed strict22.548s; typecheck and whitespace passed. Root retains actual Linux CI on the repaired publication as the required completion gate; no Linux success is claimed here.

### G22. Linux CI reaches the title ending through native header touch
Reported: slice 5 — "Repairbdfdfb40 CI run40486349358/attempt1/job122128981102 now passes the original first28 title assertion but fails agent-terminal-touch.spec.ts:131: original last20 title characters never become wholly shown after bounded native strokes at390x240. This is a distinct remaining failed observation; inspect the actual Linux artifact/scroll path, preserving original fixtures, text, native touch, input44px/whole PTY rows, session/rotation/Maximize/Close assertions. No unexplained rerun-until-green or weakened reading promise."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 5: actual Linux snapshots show scroll8,16,24,32,40,49,57,65,73,81,89,97; screenshots at89/97 show the reading position skipped by complete strokes. Native in-stroke observation now uses<=1px movement and lifts on the unchanged title/session predicate, retaining12strokes/distance/fixtures/assertions. All24 actual helper-consumer cases across9 specs passed strict43.984s; typecheck/whitespace passed,332 consumers dispositioned. Root retains actual repaired Linux CI completion gate; exact Linux Range rectangles were unavailable and no success is inferred.
