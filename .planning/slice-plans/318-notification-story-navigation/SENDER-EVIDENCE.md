# Slice 3 sender proof and remaining native observation

Observed on 2026-10-19 in the execution checkout named by the plan, based on
published slice 2 revision `45642b38746e2fe65d9c206f676ba3c2997927ef`.
Implementation remains uncommitted while obligation G2 is open.

## Accepted automated boundaries

The initial real-preview test failed before the sender change: the captured
notification argument was `-e`, rather than the serving origin and encoded
story identity. Command:

```sh
env -u NO_COLOR npm run test:dashboard -- session-alerts-navigation.spec.ts --workers=1
```

The fixture publishes membership from two projects sharing a stable identity;
it does not construct the emitted destination or implement routing/reveal.
The new journey captures the real sender's `-open` argument, opens it in a real
dev/preview page on an allocated port, and asserts the named project, renamed
story card, keyboard focus, 99% viewport intersection and unchanged host-action
logs. Its initial 720px viewport exposed a tall session card at 95.6%; increasing
this new journey's viewport to 1100px retained the full visibility assertion.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-origin-helper.json npm run test:dashboard -- session-alerts-navigation.spec.ts boundary/session-alerts-origin.spec.ts boundary/session-alerts-helper.spec.ts --workers=2
```

Exit 0; 10 selected/completed; runner and strict status passed. The origin
suite uses real IPv4/wildcard/IPv6 sockets and existing `verifyLocalOrigin`
admission, rather than URL syntax alone. IPv6 uses the admitted `localhost`
alias; an unusable address emits no invented destination. Helper-owner tests
exercise pre-listening suppression and aborted startup/delivery children.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-regressions.json npm run test:dashboard -- session-alerts.spec.ts session-alerts-unavailable.spec.ts boundary/session-alerts-unread-report.spec.ts boundary/agent-launch-codex-observation-alerts.spec.ts notification-story-navigation.spec.ts --workers=2
```

Exit 0; 25 selected/completed; runner and strict status passed. Inspected
consumers preserve startup baseline, attention transitions, repeated readings,
unread reports, Codex observations, literal text, ad hoc project destinations,
unavailable UI/recovery and held-child shutdown. All eight URL journeys passed
after moving the query contract to the shared pure module.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-literal-helper.json npm run test:dashboard -- boundary/session-alerts-helper.spec.ts session-alerts-unavailable.spec.ts --workers=2
```

Exit 0; 10 selected/completed; runner and strict status passed. This final
implementation run adds all eight native-proven leading characters, observing
raw escaped arguments and encoded project/identity URLs through `SessionAlerts`.
The fake helper is external to the actual alert owner and supplies only its
process responses. Missing-helper fixtures exclude the real helper from PATH.
The fake never supplies a destination or rendered outcome. Typecheck and
`git diff --check` also passed.

Independent refactor extracted `terminalNotifier.ts` within the same server
responsibility and moved the two literal/ad hoc cases to
`session-alerts-delivery.spec.ts`, preserving their assertions. Policy, abort
ownership, origin selection, pure URL contract and page resolution stayed intact.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-refactor.json npm run test:dashboard -- session-alerts.spec.ts session-alerts-delivery.spec.ts session-alerts-unavailable.spec.ts boundary/session-alerts-unread-report.spec.ts boundary/agent-launch-codex-observation-alerts.spec.ts boundary/session-alerts-helper.spec.ts session-alerts-navigation.spec.ts --workers=2
```

Exit 0; 23 selected/completed; runner and strict status passed. Typecheck and
whitespace checks passed. The independent refactor returned `REFACTOR COMPLETE`;
native G2 remained open. Unchanged origin and URL proof remains applicable.

The first `npm run format` exited 1 on six lint diagnostics. Minimal repairs
kept post-await cancellation checks through a fresh `isStopped()` query instead
of TypeScript's stale readonly-signal narrowing; fixture-only fixes retained
the same promises and input values. Replacement affected proof:

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-refactor-aborts-live.json npm run test:dashboard -- boundary/session-alerts-helper.spec.ts session-alerts.spec.ts --grep 'closing aborts a held startup diagnostic|closing aborts a held delivery|closing the server ends' --workers=2
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice3-refactor-origin.json npm run test:dashboard -- boundary/session-alerts-origin.spec.ts --workers=2
```

Both exited 0; respectively 3 and 5 selected/completed, runner and strict passed.
Typecheck and whitespace checks passed; independent refactor completion was
renewed. Unchanged proof remains valid outside those replaced observations.
The repaired `npm run format` reached terminal exit 0; log:
`/tmp/seed140-slice3-format-repaired.log`. Final whitespace checks passed, every
changed file is at most 250 lines, and the index is empty. Slice 3 is preserved
uncommitted until G2 is proved; no execution-completion record is claimed.

## Native final boundary remains open

A disposable recipe at `/tmp/seed140-native-fixture.mts` used existing isolated
preview, published-file and fake-host fixtures, with only the real installed
helper prepended to PATH. Its one intentional fake launch was the baseline;
no real agent was launched. It was run with:

```sh
node --experimental-transform-types --disable-warning=ExperimentalWarning /tmp/seed140-native-fixture.mts /opt/homebrew/bin/terminal-notifier
```

It served `http://127.0.0.1:56074`; fake session
`ea278a49-2c69-4bb4-ab00-83a3119b3c13` was read working repeatedly, then stdin
`blocked` induced the product's real attention transition. The installed
helper's `-list ALL` showed title `Doughnut · SEED-140 final native probe`,
message `Needs input`, delivered at 10:02:22 UTC. This proves native delivery
only. It does not establish activation, destination, focus or click safety.

Supported computer control again bound Notification Center to its `Month`
calendar widget and exposed no notification body. No actual click, dismissal,
Safari/Chrome story-card observation, stale-target native click or stopped-server
native click was obtained. Those required composed observations remain G2;
earlier helper-probe and automated URL evidence cannot substitute for them.

The helper banner style was temporarily Persistent and restored through normal
Settings UI to its original Temporary setting, with the selected value observed.
Safari remained the default browser. The only listed probe notification was
removed; stdin `stop` requested fixture cleanup. Restart the disposable fixture
from final reviewed source for the human-assisted observations, then restore
settings and remove its owned probes again. No native check is reported passed.
The fixture process reached exit 0 after cleanup. The recipe alone is retained
under `/tmp` for resumption; no live test server remains. A fresh Settings read
confirmed default browser Safari.

## Human-assisted final continuation

A fresh final-source fixture remains live in exec session `24397`, origin
`http://127.0.0.1:58312`, fake session `3528c770-04d0-4763-9798-755dae4aef5b`,
server PID `67577`. Its initial working baseline had 26 listings and one
intentional fake launch, no attaches/resumes/Codex actions. At 10:25:59 UTC,
the product delivered `Doughnut · SEED-140 final native probe` / `Needs input`.

Safari was observed as the default in Settings. Terry opened the project-only
Open Dough page before clicking that real notification and answered yes to
Safari opening Doughnut, showing `Doughnut's renamed notified story` in view
with a focus outline. The later log contained one attach at 10:29:10.250 UTC;
Terry clarified: "When I open from notification it doesn't should the terminal.
But just now I opened from sidebar. I guess that's why the terminal showed".
The subsequent native AX observation showed the fixture's Doughnut page and
named card, with its terminal and project-only URL after that sidebar action.
Accept the notification navigation observation separately from that intentional
sidebar attachment; preserve the log rather than clearing it. No second launch,
resume or Codex action occurred. The next native observation's attach baseline
is one, attributable to the explicit sidebar action.

The fake session returned to working for repeated listings. Settings
temporarily selected Google Chrome for the cold Chrome check; its tab inventory
showed no Open Dough dashboard or fixture page before the next notification.
Safari was restored and its selected value verified after Chrome observations.
Other final native cases remain open;
G2 is not closed by this partial evidence.

Chrome's cold notification was delivered at 10:34:29 UTC. The Chrome inventory
still showed zero dashboard/fixture tabs after delivery, before the requested
click. Terry then answered "look good" to the correct story, focus outline and
no-terminal question, leaving the page untouched. The resulting actual Chrome
tab `137234276`, opened at 10:40:50.311 UTC, had URL
`http://127.0.0.1:58312/?project=doughnut&story=SEED-777%23shared-story`.
Its native AX tree independently showed Doughnut selected, the renamed card,
and that card as the focused UI element, with no Terminal container. Post-click
host logs remained one intentional launch and the single earlier user-requested
sidebar attach; no new attach, resume or Codex action occurred. Returning the
fake session to working permits the next attention transition.

Terry then added: "please be reminded that it should open the existing browser
window if there is one. Otherwise open new. Should not always open new".
Terry clarified "reuse the exsting tab". The selected story and remaining plan
now require that behavior. Preserve the valid destination/host-safety evidence;
the plain URL click does not prove tab reuse. [Tab-reuse evidence](TAB-REUSE-EVIDENCE.md)
records both browsers' actual helper-click Automation permission observations
and the bounded remaining callback probe.

Both browser callback probes subsequently passed; see the tab-reuse evidence.
The next [final native observation](FINAL-NATIVE-EVIDENCE.md) composes the completed
production sender with the real helper and rendered story, preserving G2/G3 until
its required paths are observed.

## Existing-tab implementation and proof

The final sender uses existing `shellCommand()` to store a fixed inline JXA
callback in `-execute`, with the destination as literal argv data. It matches
the root dashboard document at the same normalized origin, preserves API pages
and other ports, selects/unminimizes/foregrounds an existing tab, creates a tab
in an existing window only when absent, and polls for the actual destination
after cold URL opening. Failed inspection/navigation shows a fixed recovery
dialog without silently duplicating a tab. No native callback ran from a model
terminal command; tests mock the external AppKit/browser API boundary.

Initial red proof `/tmp/seed140-tab-reuse-red.json` selected both browsers and
failed against the previous sender's absent activation command. The additional
`/tmp/seed140-tab-reuse-disabled.json` selected Safari with only reuse matching
disabled and failed actual window identity/count assertions. Source was restored.

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-tab-reuse-final.json npm run test:dashboard -- boundary/session-alerts-activation.spec.ts boundary/session-alerts-activation-command.spec.ts --workers=2
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-tab-reuse-consumers.json npm run test:dashboard -- session-alerts.spec.ts session-alerts-delivery.spec.ts session-alerts-unavailable.spec.ts boundary/session-alerts-unread-report.spec.ts boundary/agent-launch-codex-observation-alerts.spec.ts boundary/session-alerts-helper.spec.ts boundary/session-alerts-origin.spec.ts session-alerts-navigation.spec.ts notification-story-navigation.spec.ts boundary/session-alerts-activation.spec.ts boundary/session-alerts-activation-command.spec.ts --workers=2
npm run typecheck:dashboard
```

Terminal results were strict passed for 3 and 39 selected cases, and typecheck 0.
The parent inspected the actual emitted-command decoder, external API stand-ins,
callback identity/count/selection and delayed-cold assertions, literal command
marker absence, shared captured-URL page consumer, fake helper and affected docs.
The fixtures supply browser state and external failures, not a successful callback
outcome. Repeated clicks, API/other-port preservation, normalized origins,
window/URL-read and navigation refusal, unsupported defaults and delayed targets
are observed; this remains automated proof rather than native UI acceptance.

Fresh independent refactor changed no production behavior or observed test setup;
all accepted behavioral proof remains valid. It moved the selected canonical home
to satisfy the 250-line file gate and corrected a fixture comment. Final
`npm run format` passed, as did whitespace and every changed-file size check.
The actual final product notification Safari/Chrome acceptance remains G2/G3.
