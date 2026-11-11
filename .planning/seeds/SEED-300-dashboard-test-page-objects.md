---
id: SEED-300
status: active
planted: 2026-11-11
planted_during: Terry requested a suite-wide audit after the dashboard page-object campaign
trigger_when: Dashboard specs repeat browser mechanics or obscure the user behavior they prove
scope: story
---

# SEED-300 — Dashboard test intent through page objects

<a id="express-dashboard-test-intent-through-page-objects"></a>

### Express dashboard test intent through page objects

**Identity:** SEED-300#express-dashboard-test-intent-through-page-objects

#### Goal

A developer reading dashboard tests in Intent can follow what the user does,
what changes, and what the test proves. When a shared control changes, its
browser mechanics have one maintained owner across the affected tests.
Cover every finding below, including sibling specs that repeat the same
sequence or selector.

#### Audit findings

Source review at `7eab3d6ca`. The inventory covered all 589 integrated and
12 frontend-only specs. A syntax scan across those and all 376 dashboard
backend specs located locator chains, browser operations and local helpers.
Candidate call sites were checked against their feature's existing helpers.
The backend inventory yielded no dashboard page interactions. The findings
are static source observations.

**Intent**

- **CI comparison and Summary.** Integrated and mounted specs each reach into
  the comparison's identity, wall time, active time, gaps, and table markup.
  The mounted legacy and units specs even define their own `fileProofRows`.
  Give comparison metrics, entry tables and Summary rows a shared reading API
  usable by both test setups. Keep the expected values, order, and absence of
  unsupported comparisons in each case.
  [Integrated counts](../../dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts#L61),
  [adapter outcomes](../../dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts#L97),
  [retry and gaps](../../dashboard/tests/intent/intent-ci-comparison-mounted-retry.spec.ts#L32),
  [mounted legacy](../../dashboard/tests/intent/intent-ci-comparison-mounted-legacy.spec.ts#L16),
  [mounted units](../../dashboard/tests/intent/intent-ci-comparison-mounted-units.spec.ts#L23).
- **CI sorting and relative presentation.** Summary and comparison tests
  separately locate rows and sort state, gather percentage marks, and drive
  keyboard activation of the time presentation controls. Name the table,
  sort, and display-mode operations across mounted and integrated specs.
  [Comparison drilldown](../../dashboard/tests/intent/intent-ci-comparison-drilldown-relative.spec.ts#L33),
  [relative comparison](../../dashboard/tests/intent/intent-ci-comparison-relative.spec.ts#L101),
  [Summary sort](../../dashboard/tests/intent/intent-summary-ci-proof-sort.spec.ts#L75),
  [mounted Summary percentages](../../dashboard/tests/intent/intent-summary-story-comparison-mounted-relative.spec.ts#L171).
- **CI status and Proof.** Many cases already open the view through
  `intentCiStatusPage.ts` and `intentCiProofPage.ts`, then reconstruct the
  displayed state, time, checking and gap locators. Extend those owners for
  freshness, kept answers, scope and proof rows, so the test can say which
  answer the user still sees while a read is outstanding.
  [Freshness](../../dashboard/tests/intent/intent-ci-status-freshness.spec.ts#L57),
  [kept status](../../dashboard/tests/intent/intent-ci-status-kept.spec.ts#L105),
  [story gaps](../../dashboard/tests/intent/intent-ci-status-story-gaps.spec.ts#L59),
  [adapter reasons](../../dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts#L85),
  [unit rows](../../dashboard/tests/intent/intent-ci-proof-units.spec.ts#L103).
- **Timing history.** The CI wall-time, prior-build and scope histories repeat
  disclosure, sample selection, SVG point/reference-line access, and reading
  of the selected observation. Expose those observations through the history
  helpers, with expected dates, values, gaps and reference placement in the
  scenarios that prove them.
  [CI wall-time ordering](../../dashboard/tests/intent/intent-ci-wall-time-history-order.spec.ts#L58),
  [prior-build reference](../../dashboard/tests/intent/intent-ci-prior-build-average.spec.ts#L191),
  [scope history reading](../../dashboard/frontend-tests/intent-scope-timing-history-reading.spec.ts#L143),
  [scope history units](../../dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts#L148).
- **Locations, source and recovery.** Code and Gherkin browsers, Purpose,
  revision notices and candidate journeys rebuild source rows, target lines,
  selected-file and reading-place probes. Share the operations for choosing a
  location, reading the target line, retaining the reading place, and seeing
  or retrying a failed read. Keep the request, hold, and revision sequence
  visible where it determines the outcome.
  [Source browse](../../dashboard/tests/intent/intent-code-browse-sources.spec.ts#L99),
  [Gherkin browse](../../dashboard/tests/intent/intent-gherkin-browse.spec.ts#L77),
  [Purpose target line](../../dashboard/tests/intent/intent-purpose-case.spec.ts#L59),
  [revision notice](../../dashboard/tests/intent/intent-revision-notice.spec.ts#L57),
  [candidate source](../../dashboard/tests/intent/intent-test-optimization-candidates-case.spec.ts#L32),
  [integrated recovery](../../dashboard/tests/intent/intent-read-recovery.spec.ts#L45),
  [frontend candidate recovery](../../dashboard/frontend-tests/intent-candidates-read-recovery.spec.ts#L56).
- **Story Intent and perspective changes.** The existing tab and tree helpers
  leave the story header, revision evidence, file selection, diff and
  scroll retention to individual specs. Share these across changed-tests,
  Done, project visit and source selection cases. Include narrow views and
  Files sidebar behavior, with keyboard and expected focus explicit.
  [Story changes](../../dashboard/tests/intent/intent-story-changes.spec.ts#L69),
  [Done reading after refresh](../../dashboard/tests/intent/intent-done-project-refresh-reading.spec.ts#L63),
  [project visit](../../dashboard/tests/intent/intent-project-visit.spec.ts#L68),
  [reading place](../../dashboard/tests/intent/intent-reading-place.spec.ts#L68),
  [Files sidebar](../../dashboard/tests/intent/intent-sidebar-toggle.spec.ts#L51),
  [narrow story views](../../dashboard/tests/intent/intent-story-views-narrow.spec.ts#L32).

- **Retained CI follow-up.** The Done card and retained comparison journeys
  repeat entry through the card, navigation between Development and Intent,
  and reading the original, repeat and saved reference. Extend the existing
  follow-up reading helper to own those operations, including the attempt
  links and keyboard path. Keep the expected timings, attempt IDs, reference
  membership and absence of new CI acquisition explicit.
  [Retained comparison](../../dashboard/tests/intent/intent-ci-follow-up.spec.ts#L61),
  [Done card follow-up](../../dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts#L49),
  [existing Proof helper](../../dashboard/tests/support/ciFollowUpReadingPage.ts#L14).

**Story review and Side panel**

- **Opening review and reading a comparison.** The fluent pilot owns
  `Review changes` within its three journeys. A literal role-name search
  still finds that control in 22 specs. Procedural review, Intent handoffs
  and panel resize cases repeatedly select the review region, comparison,
  file, additions/removals and line counts. Share those controls with the
  existing review helpers across branch, trunk, completed and one-shot
  review. Keep the revision, file and diff expectations at the call site.
  [Review entry](../../dashboard/tests/review/story-review-action.spec.ts#L49),
  [trunk commit review](../../dashboard/tests/review/story-review-commit-trunk.spec.ts#L29),
  [completed review](../../dashboard/tests/review/story-review-completed.spec.ts#L34),
  [one-shot choice](../../dashboard/tests/review/story-review-one-shot-choice.spec.ts#L44),
  [review from Intent](../../dashboard/tests/intent/intent-story-review-return.spec.ts#L32).
- **Review tree, diff and freshness.** Tree, pane, diff context and refresh
  specs duplicate selected-file, diff-row, focus and scroll mechanics.
  Commit refresh and uncommitted check specs also rebuild refresh controls
  and displayed file checks. Compose these observations using the tree,
  pane and commit-choice helpers, while leaving held responses and the
  ordering of their release in the test.
  [Tree](../../dashboard/tests/review/story-review-tree.spec.ts#L71),
  [diff context](../../dashboard/tests/review/story-review-diff-context.spec.ts#L79),
  [refresh](../../dashboard/tests/review/story-review-refresh.spec.ts#L56),
  [commit refresh](../../dashboard/tests/review/story-review-commit-refresh.spec.ts#L35),
  [uncommitted check refresh](../../dashboard/tests/review/story-review-uncommitted-check-refresh.spec.ts#L46).
- **Divider, covering and returning to the Board.** The width specs already
  share geometry helpers, yet repeat panel open/close, drag cancellation,
  arrow-key loops, viewport transitions and xterm access. Share panel and
  divider actions with Final report and Terminal journeys. Keep chosen
  widths, bounds, input modality, before/after measurements and attach or
  request counts legible.
  [Width and cancellation](../../dashboard/tests/navigation/side-panel-width.spec.ts#L87),
  [covering](../../dashboard/tests/navigation/side-panel-width-covering.spec.ts#L94),
  [kept width](../../dashboard/tests/navigation/side-panel-width-kept.spec.ts#L34),
  [Final report divider](../../dashboard/tests/sessions/final-report-touch-divider.spec.ts#L48),
  [Terminal maximize](../../dashboard/tests/terminals/agent-terminal-maximize.spec.ts#L165).

**Launches, sessions and Terminal**

- **Launch entry and dialog.** The base-CI siblings repeat opening a card's
  start menu, choosing a host and confirming. Story, ad hoc, preparation,
  model/options and existing-changes cases likewise rebuild dialog controls.
  Extend the launch and session dialog helpers to express workflow, host,
  options, review of existing changes and confirmation. Keep refusal and
  disclosure steps visible in cases that prove them.
  [Base CI](../../dashboard/tests/launches/agent-launch-base-ci.spec.ts#L34),
  [unread base CI](../../dashboard/tests/launches/agent-launch-base-ci-unread.spec.ts#L39),
  [model controls](../../dashboard/tests/launches/agent-launch-model.spec.ts#L73),
  [exclusive options](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L44),
  [existing changes](../../dashboard/tests/launches/agent-launch-start-session-existing-changes.spec.ts#L68).
- **Launch input, attachments and touch layout.** Host-specific attachment
  tests repeat preview and draft controls, and input-voice cases repeat
  recording, cancellation and overflow editing. Launch layout cases
  repeatedly disclose, scroll to and touch the same dialog controls.
  Give the dialog reusable operations for attach, paste, draft, record,
  edit and touch reachability. Keep payloads, provider faults, expected
  focus and gesture distinctions in the cases.
  [Attachment cancellation](../../dashboard/tests/launches/agent-launch-ad-hoc-attachments-cancel.spec.ts#L28),
  [Cursor attachments](../../dashboard/tests/launches/agent-launch-ad-hoc-attachments-cursor.spec.ts#L42),
  [frontend refusal](../../dashboard/frontend-tests/agent-launch-ad-hoc-attachments-refusal.spec.ts#L59),
  [voice overflow](../../dashboard/tests/launches/session-instruction-voice-overflow.spec.ts#L98),
  [touch dialog](../../dashboard/tests/launches/agent-launch-dialog-touch.spec.ts#L44).
- **Startup answers and recovery.** Launch response, accepted progress,
  retry/recheck/continue and refusal selectors are repeated across
  preparation, responsive and recovery families. Use shared operations to
  read a launch result and take the next available action. Keep host
  progress gates and exact verification/refusal wording as scenario evidence.
  [Story start answers](../../dashboard/tests/launches/agent-launch-start-story-card.spec.ts#L81),
  [preparation retry](../../dashboard/tests/launches/agent-launch-preparation-codex-retry.spec.ts#L78),
  [responsive access](../../dashboard/tests/launches/responsive-session-access.spec.ts#L100),
  [recovery verification](../../dashboard/tests/launches/responsive-session-recovery-verification.spec.ts#L93),
  [frontend startup words](../../dashboard/frontend-tests/startup-host-words.spec.ts#L52).
- **Session rows, actions and membership.** Board, sidebar and retained
  session tests repeat the row selector, disclosures, state/badge locators
  and Done/Delete controls. Share row operations and observations for open,
  inspect, confirm/cancel and placement in Taken or Recently done, using the
  existing session-entry and mark-done helpers. Keep separate checks for the
  same session shown in different surfaces where that is the promise.
  [Compact entry](../../dashboard/tests/sessions/compact-session-entry.spec.ts#L69),
  [story-card session rows](../../dashboard/tests/sessions/agent-launch-story-card-sessions.spec.ts#L203),
  [Delete](../../dashboard/tests/sessions/agent-launch-story-card-delete.spec.ts#L99),
  [column membership](../../dashboard/tests/sessions/session-column-membership.spec.ts#L82),
  [unread reports](../../dashboard/tests/sessions/session-unread-report.spec.ts#L91),
  [Cursor recovery](../../dashboard/tests/sessions/cursor-session-recovery-stops.spec.ts#L56).
- **Sessions sidebar and Running Cursor sessions.** Keyboard walks,
  selection, paging, scroll retention and resize are still built from
  locators, coordinates and raw focus checks. The frontend and integrated
  host-status specs each define `expectFigure`. The frontend Running Cursor
  spec duplicates opening the list. Share those observations and actions
  without coupling frontend fixtures to integrated servers.
  [Sidebar keyboard](../../dashboard/tests/sessions/sessions-sidebar-keyboard.spec.ts#L81),
  [kept scroll](../../dashboard/tests/sessions/sessions-sidebar-stays-as-left.spec.ts#L129),
  [Recently done paging](../../dashboard/tests/sessions/recently-done-sessions-sidebar-paging.spec.ts#L174),
  [Cursor resize](../../dashboard/tests/sessions/cursor-sessions-sidebar-resize.spec.ts#L96),
  [integrated host status](../../dashboard/tests/sessions/sessions-sidebar-host-status.spec.ts#L21),
  [frontend host status](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L20),
  [frontend Running Cursor](../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts#L73).
- **Final report, retained sessions and workspace retirement.** The
  Recently done selection, unread report, completion and retirement families
  repeat report text, panel title, session ID and read/open/close mechanics.
  Expose those facts through the report and session pages. Keep exact
  report text, the distinction between selecting a session and opening its
  report, and retired-workspace evidence visible.
  [Recently done selection](../../dashboard/tests/sessions/recently-done-sessions-select.spec.ts#L82),
  [report reading by touch](../../dashboard/tests/sessions/final-report-touch.spec.ts#L57),
  [completion attention](../../dashboard/tests/sessions/agent-completion-attention.spec.ts#L160),
  [retirement attach](../../dashboard/tests/sessions/session-workspace-retirement-attach.spec.ts#L85),
  [retirement and reports](../../dashboard/tests/sessions/session-workspace-retirement.spec.ts#L47).
- **Terminal input and output.** Direct xterm rows or helper-textarea selectors
  occur in 63 browser specs, across Terminal, launch, session, navigation,
  configuration and frontend tests. Share reading output, sending commands,
  checking the current draft and terminal identity, and opening or closing
  the panel. Use the existing Terminal, touch and paste helpers to cover
  prompts, trust, ended-input recovery, keyboard, soft keyboard, compose,
  paste, and voice. Keep actual input, output, and native attach/PTY evidence
  as test facts.
  [Keyboard](../../dashboard/tests/terminals/agent-terminal-keyboard.spec.ts#L103),
  [touch keys](../../dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts#L59),
  [keyboard fit](../../dashboard/tests/terminals/agent-terminal-touch-keyboard-fit.spec.ts#L85),
  [voice](../../dashboard/tests/terminals/session-terminal-voice.spec.ts#L32),
  [frontend paste](../../dashboard/frontend-tests/agent-terminal-touch-paste-image.spec.ts#L66),
  [frontend prompts](../../dashboard/frontend-tests/terminal-prompts-recovery.spec.ts#L100).

**Board, navigation and published reads**

- **Board columns and accessible reading.** The Board helpers own some
  layout and paging actions, while individual specs reconstruct keyboard
  walks, DOM scroll probes, responsive transitions and covering behavior.
  Express reading or paging a named column, reaching the next action and
  returning to a kept position through the Board. Preserve the expected
  order, viewport and input modality in each scenario.
  [Board scroll](../../dashboard/tests/navigation/board-scroll.spec.ts#L62),
  [column paging](../../dashboard/tests/navigation/board-paging.spec.ts#L95),
  [reading with a Side panel](../../dashboard/tests/navigation/board-reading.spec.ts#L53),
  [keyboard Board](../../dashboard/tests/navigation/accessible-board-keyboard.spec.ts#L84),
  [touch Board](../../dashboard/tests/navigation/accessible-board-touch.spec.ts#L77).
- **Project choice, header and destination focus.** The project keyboard,
  compact/wide header, development frame, notification and source navigation
  cases duplicate reaching controls, changing perspective/project, and
  reading focus or scroll after arrival. Extend the project choice and
  frame/navigation helpers for those actions. Keep expected key order,
  selected project, destination and sanitized-link expectations explicit.
  [Header](../../dashboard/tests/navigation/dashboard-header.spec.ts#L137),
  [compact header](../../dashboard/tests/navigation/dashboard-header-compact.spec.ts#L91),
  [project keyboard eligibility](../../dashboard/tests/navigation/project-keyboard-navigation-eligibility.spec.ts#L59),
  [notification destination](../../dashboard/tests/navigation/notification-story-navigation.spec.ts#L107),
  [source link](../../dashboard/tests/navigation/source-navigation.spec.ts#L130).
- **Story inspection and references.** Story selection, dependency and
  reference suites re-find the same card, dependency disclosure, destination
  and notice. The Done cancellation spec repeats the first half of the
  pending jump three times and computes pointer/focus operations inline.
  Give the story card and Board a shared reference flow, with separate
  actions for pointer-down and release so a held read can answer between them.
  [Card selection](../../dashboard/tests/navigation/story-card-selection.spec.ts#L118),
  [dependency selection](../../dashboard/tests/navigation/story-card-dependency-selection.spec.ts#L51),
  [reference navigation](../../dashboard/tests/navigation/story-reference-navigation.spec.ts#L69),
  [Done cancellation](../../dashboard/tests/navigation/story-reference-done-cancellation.spec.ts#L35),
  [Done recovery](../../dashboard/tests/navigation/story-reference-done-recovery.spec.ts#L40).
- **Story card evidence.** Preparation, dependencies, readiness, ownership,
  roster and branch progress tests repeat card subregions, badge classes,
  avatar and owner lookups, and expansion controls. Extend the existing
  card/roster helpers to read the visible evidence. Keep expected ordering,
  actor, links, statuses, slice counts and malformed-record messages explicit.
  [Preparing](../../dashboard/tests/stories/backlog-preparing.spec.ts#L55),
  [readiness](../../dashboard/tests/stories/story-readiness.spec.ts#L77),
  [dependencies](../../dashboard/tests/stories/story-dependencies.spec.ts#L57),
  [roster and credit](../../dashboard/tests/stories/agent-roster-avatar.spec.ts#L44),
  [slice progress](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L125),
  [branch progress reading](../../dashboard/tests/stories/branch-progress-reading.spec.ts#L35).
- **Recently done stories.** Progressive loading and reset, refresh and
  retained-range journeys share some setup but still inline the column count,
  latest-range controls, wheel/scroll and collapse focus mechanics. Share
  those Board operations with reference and retained session cases. Keep
  which requests answer, visible entry order, and the distinction between
  showing fewer stories and abandoning a pending destination.
  [Progressive loading](../../dashboard/tests/stories/recently-done-progressive-loading.spec.ts#L81),
  [retained state](../../dashboard/tests/stories/recently-done-progressive-state.spec.ts#L111),
  [refresh](../../dashboard/tests/stories/recently-done-progressive-refresh.spec.ts#L113),
  [read latency](../../dashboard/tests/stories/recently-done-read-latency.spec.ts#L38).
- **Published facts, refresh and read recovery.** Observation tests repeat
  card/owner/progress selectors, timestamps and notices, and inline browser
  probes for retained focus, scroll and placeholders. Extend the existing
  dashboard and recovery helpers so the spec can say what remains visible
  while the next answer is held, and what appears when it arrives. Keep
  held reads, controlled clock steps, request logs and pinned revisions
  where the causal order is the proof.
  [Published facts reading](../../dashboard/tests/observation/published-facts-reading.spec.ts#L40),
  [steady refresh](../../dashboard/tests/observation/steady-refresh-carry.spec.ts#L43),
  [automatic recovery](../../dashboard/tests/observation/auto-refresh-recovery.spec.ts#L68),
  [rate limit](../../dashboard/tests/observation/auto-refresh-rate-limit.spec.ts#L92),
  [profile latency](../../dashboard/tests/observation/profile-addition-latency.spec.ts#L100),
  [transient credit](../../dashboard/tests/observation/transient-credit-recovery.spec.ts#L102).

**Settings, appearance and focused frontend proofs**

- **Projects and settings navigation.** Add/refusal and settings management
  repeat the add dialog's fields and submit action. Remove, hide and project
  configuration cases rebuild settings row controls and focus recovery.
  Reuse the settings and project-add helpers for rows, dialogs and return
  to Board. Keep the URLs, paths, chosen project, focus destination and
  filesystem evidence explicit.
  [Add refusal](../../dashboard/tests/configuration/project-add-refusal.spec.ts#L29),
  [project removal](../../dashboard/tests/configuration/project-remove.spec.ts#L20),
  [hide with sessions](../../dashboard/tests/configuration/project-hide-sessions.spec.ts#L78),
  [settings project management](../../dashboard/tests/configuration/system-settings-project-management.spec.ts#L24),
  [touch project management](../../dashboard/tests/configuration/system-settings-project-management-touch.spec.ts#L48).
- **Settings controls and appearance.** Credential recovery, terminal
  theme, feedback maintenance and system appearance cases repeat selected
  options, status, focus and visibility/contrast reads. Reuse settings
  controls and appearance helpers for these operations, including the
  integrated Intent dark-appearance case. Keep expected values, color
  scheme and dimensions where the behavior depends on them.
  [Credential recovery](../../dashboard/tests/configuration/system-settings-openai-recovery.spec.ts#L26),
  [terminal theme](../../dashboard/tests/configuration/system-settings-terminal-theme.spec.ts#L25),
  [feedback maintenance](../../dashboard/tests/configuration/system-settings-feedback-maintenance.spec.ts#L57),
  [frontend system appearance](../../dashboard/frontend-tests/dashboard-system-appearance.spec.ts#L126),
  [Intent dark appearance](../../dashboard/tests/intent/intent-story-dark-appearance.spec.ts#L48).
- **Browser measurement proofs.** Frontend observation, reachability and
  touch-reading cases deliberately exercise the measurement utilities. The
  surrounding fixture DOM lookups, coordinate plumbing and CDP touch setup
  can use shared test-side primitives where repeated. Keep the direct
  utility call and independent measurement evidence visible. Runtime specs
  use browser turns, trace reporting, document metadata and request draining
  as their proof. Their direct observations serve the tested contract.
  [Observation measurements](../../dashboard/frontend-tests/observation-measurements.spec.ts#L13),
  [reachability](../../dashboard/frontend-tests/control-reachability-observation.spec.ts#L99),
  [touch reading](../../dashboard/frontend-tests/touch-reading-observation.spec.ts#L37),
  [runtime browser turn](../../dashboard/tests/runtime/observation-measurements.spec.ts#L43).

#### Acceptance

- Each finding has a resolved disposition backed by the affected specs.
  A representative before/after from each feature family shows the user
  action and expected outcome in domain terms, with repeated locators and
  interaction sequences owned by shared helpers. Prefer existing procedural
  helpers and component owners. The
  [fluent pilot](../../dashboard/tests/writing-journeys.md#what-the-pilot-earned)
  supplies evidence for shared controls and recurring handoffs. Adopt fluent
  phases where those benefits justify the extra code.
- A shared control edit, such as the Story card's Review changes action or
  the Terminal's input locator, has one maintained selector owner for the
  affected callers. A test of the exact name, accessibility contract, or DOM
  measurement retains its independent expected value. Use the audited source
  as the comparison baseline and weigh call-site clarity, edit sites and
  helper cost under the
  [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Held-read tests still show which action happens before the answer, which
  user choice supersedes it, and what stays selected after release. Touch
  and keyboard tests still identify the actual input and expected focus.
  Keep Git, HTTP, host and record evidence at the boundary it observes,
  along with the assertions that distinguish outcomes.
- Preserve each distinct behavior check and the existing test tiers. Use
  MakeMe for domain data and the existing causal waits. Run the changed
  specs and the applicable dashboard gates under the project's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).
