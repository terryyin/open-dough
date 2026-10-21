# Name the Automation consent a branded alert click actually needs

**Identity:** SEED-144#branded-alert-click-automation
**Source:** [Correction story](../../seeds/SEED-144-opendough-product-icon.md#branded-alert-click-automation), a bounded retrospective correction of SEED-144#recognize-opendough-by-its-icon (plan 326; attributable commits `80dbc29e`, `3683628d`, `2f99e1d5`, `597db2d4`, `ba2fce6e` on published claim `fb071924`).

## Goal and scope

When a branded Open Dough alert's click cannot script the developer's browser,
the recovery dialog and alert docs name the exact Automation entry macOS consults,
established by observed app/browser rows and real controlled refusal/retry under
the developer's proof amendment. Setup docs say to rerun setup after helper updates.

Excluded: changing the click mechanism, the sender identity or its
Notifications permission; any new setup action or automatic refresh; other
browsers than the supported Safari and Google Chrome.

## Current findings (evidence)

- Plan 326 G2 (`f248ce357226b7ad2ccea65a926e40676b3d8a2c:.planning/slice-plans/326-recognizable-product-identity/PLAN.md`): both observed clicks navigated Safari with no Automation prompt,
  although `dev.opendough.dashboard-notifier` was never granted Automation.
  Which process macOS credits for the inline `osascript` callback is unknown;
  it may be an older grant (previously documented as
  **Automation → terminal-notifier**), so a machine without that grant may
  behave differently from what was observed.
- At preparation, `dashboard/server/notificationActivation.ts` (recovery `displayAlert`),
  `dashboard/README.md` (alert click paragraph) and
  `dashboard/AGENT-LAUNCH-HISTORY.md` (click section) said "the alert
  sender", a name no Automation row carries; the refusal recovery had never been
  observed.
- `dashboard/server/notifierApp.ts` `prepareBrandedNotifierApp` snapshots the
  installed helper; COMMANDS omitted that updates require rerunning setup.

Preserved promises: inline self-contained click callback with a safely quoted
URL argument; tab reuse and foregrounding; a refused inspection shows the
recovery dialog instead of opening an extra tab; the branded sender's identity,
icon and Notifications permission.

## Key examples

- A developer has no Apple Events consent for the process attributed to a
  branded alert click. Clicking the alert asks to control the selected supported
  browser. Refusing produces the recovery dialog, leaves existing tabs intact,
  and opens no extra tab. The corrected dialog names the actual Automation row
  and browser control to enable.
- After enabling that browser under the observed row, a subsequent branded
  alert click reuses and foregrounds an existing dashboard tab and reaches its
  requested story. Both Safari and Google Chrome remain supported.
- A developer updates terminal-notifier. The setup documentation tells them to
  re-run `npm run setup-notifier:dashboard` to refresh the copied Open Dough
  sender. This correction adds the missing instruction, not automatic refresh.

## Existing solution and constraints

PFE: change the existing recovery message in
`dashboard/server/notificationActivation.ts`. `terminalNotifier.ts` embeds that
source in the safely quoted `-execute` command; `notifierApp.ts` owns the stable
branded app and explicit snapshot refresh. `notifierSetup.ts` and
`terminalNotifier.ts` already tell users to re-run setup after an unsupported
helper version. Extend the maintained setup instructions to cover ordinary
updates; do not introduce another recovery, sender, or permission model.

Consumers: the callback becomes a shell argument, then JXA source, then a native
`displayAlert` message. `dashboard/README.md` and `AGENT-LAUNCH-HISTORY.md`
explain that same click recovery; `dashboard/COMMANDS.md` explains setup.
`tests/support/notificationActivation.ts` decodes the emitted command;
`tests/support/browserActivation.ts` runs its actual source against browser API
stand-ins. The activation spec currently observes only the alert title, so it
cannot prove accurate recovery text. Extend that stand-in to expose message
options and assert the observed entry in the refusal case. Preserve source and
shell encoding; do not impose an artificial ban on punctuation in user text.

This is a local recovery correction, with no new architectural boundary or
North Star change. The ADR index and dashboard North Star were reviewed;
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports learning from the native attribution before committing to wording.
The browser, sender, click mechanism and Notifications identity remain as above.

## Decisive premises and preparation observations

Preparation observations (2026-10-21 JST), revision `051435a6d9c2b779e7f088964231fd2b797025cd`, checkout
`/Users/terryyin/git/open-dough/.worktrees/name-the-automation-consent-a-branded-alert-clic`.
These established availability, not attribution; execution repeated the native probe.

1. `sw_vers` reported macOS 26.6.2 (25G83). This production probe reported
   terminal-notifier 3.1.0 and `available` for the stable branded app:

   ```sh
   node --input-type=module <<'JS'
   import { brandedNotifierExecutable } from './dashboard/server/notifierApp.ts';
   import { probeTerminalNotifier } from './dashboard/server/terminalNotifier.ts';
   import { execFileSync } from 'node:child_process';
   console.log(execFileSync(brandedNotifierExecutable(), ['-version'], {encoding:'utf8'}).trim());
   console.log(await probeTerminalNotifier(new AbortController().signal) ?? 'available');
   JS
   ```

   Read-only `mdfind 'kMDItemCFBundleIdentifier == "com.apple.Safari"'` and the
   equivalent `com.google.Chrome` query found both applications, proving
   availability, not Apple Events/attribution. Slice 1 owns consent changes.
2. The existing command, activation and story-navigation route runs here:
   `env -u NO_COLOR npm run test:dashboard -- boundary/session-alerts-activation.spec.ts boundary/session-alerts-activation-command.spec.ts notification-story-navigation.spec.ts`
   passed after `npm ci --ignore-scripts --no-audit --no-fund`.
   Inherited `NO_COLOR` initially conflicted with `FORCE_COLOR`; unsetting it
   resolved the quiet-output failure without product/test changes.
3. The refusal observation discriminates dialog presence. In a temporary local
   edit, replacing `application.displayAlert(` with
   `return; application.displayAlert(` in `notificationActivation.ts`, then
   running `env -u NO_COLOR npm run test:dashboard -- boundary/session-alerts-activation.spec.ts`,
   failed both browser cases at the dialog-title assertion (empty alerts).
   The original bytes were restored and `git diff` confirmed no product change.
   The stand-in discarded message text; slice 2 adds that observation and shows
   failure against old wording before accepting the correction.

## Outside-in proof ownership

| Promise | Owner | Observable result |
| --- | --- | --- |
| Known entry for real branded clicks | 1 | System Settings Automation row/browser child and controlled refusal/retry through real clicks, with actual sender/browser versions and launch context; first-prompt wording waived by the developer's proof amendment |
| Refusal preserves tabs; allowing restores navigation | 1 baseline, reused by 2 | Controlled native refusal/retry proves no extra tab, reuse/foreground and exact story for both browsers; unchanged mechanisms retain this proof under the developer's final instruction |
| Dialog and maintained recovery docs name that entry | 2 | Actual emitted-source regression asserts the complete corrected message against the natively observed row; README/history match. Final native rendering repetition is omitted by developer instruction |
| Safe, durable inline callback and destination quoting | 2 | Full activation-command and activation specs pass, including literal quote/substitution destinations and both browser models |
| Sender identity, icon and Notifications permission preserved | 2 | Matching sender metadata/executable/icon hashes and native Open Dough Notifications entry; no sender setup or Notifications setting change |
| Helper-update refresh instruction is present | 2 | COMMANDS setup paragraph explicitly says to re-run setup after updating terminal-notifier; review matches the existing explicit snapshot-refresh behavior |

## Ordered slices

### 1. Establish the consent attribution of a real branded alert click
Type: Behavior
Status: done
Proof: Native baseline through the existing sender and inline callback, under
`dough-manual-testing`; no product change is required for this early probe.

Given the developer's agreed, narrowly scoped consent reset or toggle for the
candidate app, when a real branded alert is clicked, record the resulting
System Settings Automation app row and browser child control. Establish that
this entry is consulted through its controlled refusal/retry behavior, under
the developer's approved proof amendment; do not recreate the first prompt.
Refuse and observe the existing recovery dialog and unchanged tab count; then
allow that control and verify a later click reuses/foregrounds the dashboard
and reaches its story. Exercise Safari and Google Chrome as default browsers
in turn, keeping their observations separate if attribution differs.

Record the execution checkout/revision, actual posting command or application
trigger and destination, sender bundle/path/version, browser versions, exact
row wording, refusal and successful retry results. Use the production
`sendTerminalNotification` path from that checkout with a controlled dashboard
story destination; do not replace it with standalone osascript, which can have
different attribution. Announce desktop takeover under the manual-testing
workflow, agree the specific consent change before resetting it, and restore
agreed consent/default-browser settings afterwards. Never reset all apps'
consents. No permission change is authorized by preparation alone.

Safe stop: no wording changes until this evidence supports a stable recovery
instruction. If consent cannot be isolated, attribution varies without an
explainable stable instruction, refusal fails to show recovery, or enabling the
identified control does not restore navigation, stop dependent slice 2, record
what happened and return the product decision to the developer. A successful
probe completes the learning, not the correction. This state-changing probe is
the permitted early-probe exception; no cheap unresolved premise is deferred.

### 2. Recover using the observed Automation entry
Type: Behavior
Status: done
Proof: Accepted native baseline for unchanged mechanisms, message regression
through the actual emitted callback, and maintained-document review. The later
developer instruction ends further developer-operated native checks.

Given the attribution established in slice 1, when a branded click cannot
control the supported browser, the recovery dialog and maintained alert docs
name the entry and browser control the developer can actually enable. Enabling
it makes the next click navigate as before. Keep the manual-open fallback and
Safari/Chrome advice. Document re-running setup after a helper update as part
of the same maintained alert guidance.

Extend the existing activation stand-in/spec to observe the recovery message,
show the new assertion fails with the old generic wording, then update the
existing callback and docs. Reuse the native baseline for unchanged mechanics;
verify corrected emitted message through the regression as directed by the
developer. Mocked APIs do not establish TCC attribution.
Preserve the established branded sender and Notifications permission without
rebuilding it merely to change this inline message.

Focused local verification:

```sh
env -u NO_COLOR npm run test:dashboard -- boundary/session-alerts-activation.spec.ts boundary/session-alerts-activation-command.spec.ts notification-story-navigation.spec.ts
npm run typecheck:dashboard
```

The activation spec owns message/refusal/tab behavior, the command spec owns
shell argument integrity, and navigation specs preserve the URL-to-story
consumer. Typechecking covers the changed shared test stand-in. The commit
hook owns staged lint (and typechecking for staged scripts). Broader suites
are needed only if the actual changes reach additional consumers. Apply the
normal execution skill's post-change refactor and delivery gates after edits.

Accepted evidence: [slice 2 proof and settled native-check disposition](slice-2-evidence.md).

## Current decisions

- The seed's developer-approved proof amendment replaces first-prompt recapture
  with observed app/browser rows plus controlled real-click refusal/retry. Both
  browser journeys remain required; no repeated prompt question/reset is needed.
- The later instruction, “Please complete this without me,” ends developer-operated
  native checks. Reuse the completed baseline and emitted-message regression;
  retain the Chrome grant cleanup reminder because macOS requires local authentication.
- Retain this identity and plan; no new plan/promise or preparation Take, implementation or consent mutation.
- The observed Automation row is Open Dough, distinct from terminal-notifier.
  Notifications and Automation consent are separate.
- One native recovery journey bounds both slices: first isolate attribution,
  then deliver the evidenced correction. No Structure slice, abstraction,
  permission detector, automatic refresh, additional browser or sender redesign is needed.

## Learnings

Preparation found omitted activation proof and its missing message observation.
Slice 1 established native attribution; slice 2 observes the corrected message.

## Execution context

- Story Branch identity `SEED-144#branded-alert-click-automation`; publisher `dashboard-territory.local-open-dough`; agent `chaifeng-chan`.
- Owned worktree `/Users/terryyin/git/open-dough/.worktrees/name-the-automation-consent-a-branded-alert-clic`,
  branch `codex/name-the-automation-consent-a-branded-alert-clic`; integration checkout `/Users/terryyin/git/open-dough`.
- Starting revision `cdcc2633a88b795563c4246bb1470562e45f44f2`; published claim/base `2e3ff9411d1fe94bab224b7903f8c64f1b936d15`; no increment published yet.
- Targets: execution `origin/codex/name-the-automation-consent-a-branded-alert-clic`, closure `origin/main`.
  Established checkout setup/check-only hook contract retained; selective formatting: `npm run format`.
- Last branch CI stream stopped normally: coordinator `codex-seed144-alert`, cell `37`, session `53263`, `/tmp/dough-ci-501/watch-edrnlE`, PID `73485`.
  Verified `ci.yml` (CI); no unread events; CI unobserved. Earlier streams stopped; trunk claim CI unobserved.
- [Baseline evidence](native-baseline-evidence.md): acceptance/amended source review; [history](native-baseline-history.md): posting commands, settings, observations/prior stops.

## Story obligations

### G1. Native attribution and refusal remain unobserved
Reported: slice 1 — "Production posting returned delivered, but the desktop tool exposed only Notification Center's calendar widget; no real alert click, Automation prompt, or refusal/allow journey has been observed."
Story clause: "observe on a Mac which app macOS asks about (and records) for the branded alert's browser scripting, including a refusal"
Disposition: proved by slice 1: native-baseline-evidence.md, Slice 1 acceptance — controlled Safari refusal/recovery and probe 3 retry; Chrome refusal probe 7 and probe 9 same-tab exact-story retry with focused container; developer-approved row/refusal/retry proof amendment.

### G2. Corrected callback still awaits final native observation
Reported: slice 2 — "Corrected native dialog rendering, final refusal/no-new-tab and allowed retry/reuse/foreground/exact-story journeys for Safari and Chrome, and final sender/icon/Notifications preservation remain coordinator-owned and unobserved."
Story clause: "it does not waive refusal/recovery, tab preservation, successful retry, or support for either Safari or Google Chrome"
Disposition: owner changed "Please complete this without me"

## Execution complete

Product advice: no change. Retrospective found no product correction or architectural drift; source, emitted-message proof and preserved browser/sender boundaries agree. Related revisions: claim `2e3ff941`, native records `9c8e8c50`, implementation `ac342c94`. Process findings DD-325/DD-326 recorded in DearDough.md (582 physical lines; existing 500-line advisory applies). Chrome temporary Automation grant remains enabled behind macOS authentication; final native repetition was omitted by explicit developer instruction.
