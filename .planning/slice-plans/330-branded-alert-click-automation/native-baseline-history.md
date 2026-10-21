# Native consent baseline observation history

Historical stages retained for provenance. For current accepted proof, see
[native baseline evidence](native-baseline-evidence.md#slice-1-acceptance).

## Established context

- Established Story Branch start: publisher `dashboard-territory.local-open-dough`,
  agent `chaifeng-chan`, published claim/candidate
  `2e3ff9411d1fe94bab224b7903f8c64f1b936d15`, starting revision
  `cdcc2633a88b795563c4246bb1470562e45f44f2`.
- Owned workspace (reused from this story's preparation; its creation ref names
  this identity): `/Users/terryyin/git/open-dough/.worktrees/name-the-automation-consent-a-branded-alert-clic`,
  branch `codex/name-the-automation-consent-a-branded-alert-clic`.
  Integration checkout: `/Users/terryyin/git/open-dough`.
- Authorized closure target: `origin/main`; execution increments target
  `origin/codex/name-the-automation-consent-a-branded-alert-clic`.
- Checkout setup: `npm ci --ignore-scripts --no-audit --no-fund` succeeded;
  the plan's focused dashboard command succeeded with `NO_COLOR` unset.
  Native sender probe at the claim reports terminal-notifier 3.1.0, available.
  Existing check-only `.githooks/pre-commit` owns staged lint/typecheck;
  selective formatter is `npm run format`.
- CI: GitHub Actions, verified `ci.yml` (CI), execution branch above.
  Coordinator `codex-seed144-alert`, yielded cell `9`, session `11314`,
  observer `/tmp/dough-ci-501/watch-JG9jrV`, PID `92245`.
  The earlier trunk claim's CI is unobserved by this branch observer.
- No new replanning option was supplied; retain the existing bounded plan.
  Awaiting the developer's scoped consent/default-browser agreement before
  the native state-changing journey; no permission changes have been made.

### Slice 1 partial observation (2026-10-21 JST)

- The production read-only probe at the established claim used the command in
  the [plan’s preparation observation 1](PLAN.md#decisive-premises-and-preparation-observations) and returned terminal-notifier 3.1.0,
  `available`, at the unchanged stable app path. macOS is 26.6.2 (25G83),
  Safari 26.6.2, Google Chrome 155.0.8059.85; the sender bundle identifier is
  `dev.opendough.dashboard-notifier`.
- CUA inspection of System Settings → Privacy & Security → Automation shows
  an **Open Dough** row with **Safari** enabled and a separate collapsed
  **terminal-notifier** row. This is only existing state, not attribution
  evidence from a branded alert click. No toggles, default browser settings,
  Notifications settings, or sender installation were changed. No alert was
  posted for this probe yet.
- The complete focused dashboard command printed in slice 2 exited 0 against
  the unchanged product. The configured quiet reporter emits nothing for
  passing tests and removes passing run artifacts; this baseline alone does
  not establish any native consent promise or the missing message assertion.
- Source-only reviewer `/root/source_promises_1` was launched with fresh
  context, only the original correction Goal/Scope/examples/exclusions, and
  instructions to read no project files. Its returned commitments retain
  real-click prompt/row attribution, refusal with intact tabs/no extra tab,
  browser-control recovery, retry reuse/foreground/story navigation, both
  browsers, explicit helper refresh, and preserved callback/quoting/sender/
  Notifications identity. No slice acceptance has been claimed.
- Native journey is unperformed pending the requested agreement to temporary
  browser switches and scoped Automation consent changes, followed by
  restoration. Slice 1 stays planned; slice 2 remains dependent on its actual
  prompt/row/refusal/retry observations. Resume here without another Take or
  replacing this story's checkout. Product wording remains unchanged.
- Stop receipt for `/tmp/dough-ci-501/watch-JG9jrV`: `status: stopped`,
  coverage ended, `pendingCi: unobserved`, no unread events. Yielded cell 9
  subsequently terminated normally. No increment was committed or published.

### Approved continuation

- The developer replied `approve` to the scoped temporary default-browser
  switches and Automation browser toggles, followed by restoration. This
  approval settles the earlier permission question; do not ask it again.
- Git identity and the unchanged product revision were rechecked. The
  stopped observer was replaced with the same coordinator on the same
  execution target: cell `17`, session `10648`,
  `/tmp/dough-ci-501/watch-zx5S2q`, PID `23040`.
- Read-only CUA inspection records the original default browser as Safari.
  **Open Dough → Safari** is on. The separate **terminal-notifier** row has
  Safari and Google Chrome on. Open Dough has no Google Chrome control yet.
  The existing Safari dashboard is at `http://127.0.0.1:4173/?project=doughnut`.
- Attempting to turn off Open Dough's Safari control presented a macOS
  authorization sheet: “Privacy & Security is trying to unlock system
  settings. Touch ID or enter your password to allow this.” The toggle is
  pending authentication, which the developer must perform directly.
  No credential is requested in chat. No setting change is confirmed yet.
- After the authorization sheet cleared, CUA readback confirmed
  **Open Dough → Safari** off. Safari's native Tab Overview showed one
  existing dashboard tab; its original URL was unchanged.
- The following production-path command at product revision `2e3ff941`
  exited 0 and printed `delivered`:

  ```sh
  node --input-type=module <<'JS'
  import { sendTerminalNotification } from './dashboard/server/terminalNotifier.ts';
  const destination='http://127.0.0.1:4173/?project=open-dough&story=SEED-144%23branded-alert-click-automation';
  console.log({phase:'Safari refusal', destination});
  console.log(await sendTerminalNotification({title:'Open Dough Automation probe',message:'Safari refusal — click to test the recorded browser consent.',destination},new AbortController().signal) ?? 'delivered');
  JS
  ```

  This establishes accepted posting, not a clicked alert, attribution, or
  refusal recovery. CUA bound `com.apple.notificationcenterui` to its
  **Month** calendar-widget window, which contained no notification list or
  banner. `com.apple.controlcenter` and `com.apple.systemuiserver` binding
  attempts timed out. The Fn+N system shortcut is unavailable in this tool
  (`keyNotFound("fn")`); Ctrl+F8 exposed no status-menu state. A manual click
  was requested but no click/result has been observed.
- Before stopping, fresh System Settings readback showed Open Dough's
  Safari switch **on** again and terminal-notifier's Safari/Google Chrome
  switches **on**, matching their original state. The agent performed no
  intervening permission write; the off-to-on transition is unattributed and
  cannot count as an observed refusal/allow journey. No default-browser change,
  sender rebuild, Notifications-permission change, or product edit occurred.
  No native recovery dialog was present in the final app inventory.
- Resume needs Notification Center opened and left visible, then a fresh
  denial/click/allow journey. The developer's scoped approval remains valid;
  do not request the same permission again. Both slices remain unfinished.
- Observer `/tmp/dough-ci-501/watch-zx5S2q` stopped with coverage ended,
  `pendingCi: unobserved`, and zero unread events. Cell 17 terminated normally.
  No commit or increment publication occurred.

### Native continuation after the Notification Center focus correction

- The developer correctly noted that replying in chat dismisses Notification
  Center. The working handoff is to ask them to open it without replying,
  then inspect it while it remains open. CUA subsequently exposed the actual
  **Notification Center** system dialog and the Open Dough alert group.
  No inability to read the panel remains established once it is visibly open.
- Git remained on the established claim, with only these plan notes changed.
  Safari was confirmed as the original default again. Following direct local
  authentication, CUA confirmed **Open Dough → Safari** off while the
  separate terminal-notifier Safari/Chrome controls remained on.
  Safari Tab Overview showed one existing Open Dough dashboard tab, at
  `http://127.0.0.1:4173/`, in window UUID
  `4AF67AAA-EE66-4134-BE95-0EF9163BBDD3`.
- Production calls used `sendTerminalNotification` from this checkout, with
  the same destination/import/signal as the earlier posting command above:
  `http://127.0.0.1:4173/?project=open-dough&story=SEED-144%23branded-alert-click-automation`.
  Probe 2: title **Open Dough Automation probe 2**, message **Safari refusal —
  test this alert click.**; posting returned `delivered`. CUA expanded the
  Open Dough stack then clicked that individual card; it disappeared and
  Safari's URL stayed unchanged. Recovery presence was initially unobserved,
  not a proved product failure.
- CUA restored Open Dough's Safari control on. Probe 3: title **Open Dough
  Automation probe 3**, message **Safari allowed — retry with the original
  permission restored.**; posting returned `delivered`. After the developer
  reopened Notification Center without replying, CUA expanded the group and
  clicked the individual probe. Safari then showed the exact story URL above
  in the same window UUID, with its story container focused. This is a real
  successful callback observation, not an inferred one.
- To distinguish an inaccessible or dismissed recovery dialog from absence,
  CUA temporarily disabled only Open Dough's Safari control again. Probe 4:
  title **Open Dough Automation probe 4**, message **Safari denied — leave
  any recovery dialog open.**; posting returned `delivered`; CUA clicked
  the individual card. Access to the native dialog app
  `com.apple.UserNotificationCenter` was explicitly refused by the
  computer-use tool for safety reasons. No alternate access was attempted.
  The developer directly confirmed that **Dashboard story could not be opened**
  appeared after probe 4, but had dismissed it and could no longer copy its
  message. This confirms recovery presence; it does not establish exact native
  message text or an absent-consent prompt's wording. CUA restored and
  read back Open Dough → Safari on; terminal-notifier's controls remained on.
- Chrome setup: created one owned dashboard tab `137234812` at
  `http://127.0.0.1:4173/?project=doughnut`; the connected browser then had
  12 tabs total, with only this one at the test origin. Switched the default
  browser from Safari to **Google Chrome** and confirmed that value.
  Probe 5: title **Open Dough Automation probe 5**, message **Chrome first
  consent — record the app and browser names, then deny.**; production
  posting returned `delivered`. Its click and first-consent prompt are still
  awaiting observation. The developer was asked to open Notification Center
  without replying, then record the prompt's app/browser names and deny it.
  Restore Safari as default and any changed browser permissions after the
  journey; close only the owned Chrome test tab when finished.
- No product edit, commit, publication, sender rebuild or Notifications
  permission change has occurred. Existing CI observers remain stopped.
  Slice 1 is not accepted; the Chrome prompt/row/refusal/retry and remaining
  native observations still gate slice 2's wording change.

### Chrome observation and retained proof decision

- CUA expanded the group then clicked individual **Open Dough Automation
  probe 5**. After the developer completed the instructed denial, Chrome
  still had 12 tabs and owned tab `137234812` still showed
  `http://127.0.0.1:4173/?project=doughnut`. A fresh Automation view showed
  the newly recorded **Open Dough → Google Chrome** child control off;
  Open Dough → Safari and the separate terminal-notifier Safari/Chrome
  controls were on. This is direct row/child and no-new-tab evidence.
- Asked to confirm the first prompt's app/browser names and Chrome recovery
  dialog, the developer answered **I don't remember**. Do not claim those
  native observations from this response, or infer the prompt text from the row.
- The developer separately authorized **Enable temporarily** for the first
  Chrome grant at the action boundary. After direct local authentication,
  CUA confirmed **Open Dough → Google Chrome** on. Production probe 6 used
  title **Open Dough Automation probe 6**, message **Chrome allowed — retry
  with the observed Open Dough control enabled.**, and the same destination
  and production call as above; posting returned `delivered`. Its real click
  was not observed. The last tab observation remained 12 total with the owned
  tab still at the starting Doughnut URL, so Chrome retry/navigation remains
  unproved.
- The coordinator requested a human proof-method decision: accept attribution
  from the observed row plus completed controlled refusal/retry journeys,
  without reproducing the unretained first prompt wording; or reproduce and
  record a fresh prompt. No answer to that decision has been received. This
  is not authority to drop the source's prompt requirement or to reset this
  app's consent. Native recovery presence for Chrome also remains unconfirmed.
- While these inputs remain pending, CUA turned Open Dough's Chrome control
  **off**, confirmed Open Dough → Safari **on**, and changed the default
  browser back from Google Chrome to **Safari**, with readback confirming it.
  The newly created Chrome control remains recorded but denied; the original
  terminal-notifier controls remain on. The owned Chrome tab is marked for
  handoff and the unrelated tabs are preserved.
- Do not click pending old probe 6 as Chrome proof now: Safari is again the
  default. Resume with a fresh Chrome retry under the agreed temporary settings
  if the developer continues. Reuse this checkout and claim, the established
  setup, Safari native observations and the Chrome row/tab observations; do
  not repeat Take. No product wording or test code was changed, and no CI
  observer was rearmed during this manual continuation.
