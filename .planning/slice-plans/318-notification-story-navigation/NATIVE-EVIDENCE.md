# Native notification evidence

Supporting proof for [Plan 318](PLAN.md), slice 1; observed 2026-10-19 for
`SEED-140#open-notified-story-from-macos-notification`.

### Slice 1 accepted observations

Environment: macOS 26.6.2 (25G83), Homebrew installation through
`HOMEBREW_NO_AUTO_UPDATE=1 brew install terminal-notifier`, helper 3.1.0.
The first send exited 3 with
`Could not request notification permission: Notifications are not allowed for this application`.
After normal app launch, System Settings exposed the helper as Off and
`terminal-notifier -diagnose` reported denied. Enabling its ordinary Allow
Notifications control produced authorized diagnostics with no problems.
This refusal/recovery was observed; no permission reset or bypass was used.

The initial automation-only probe stopped because the available native control
bound the calendar widget, not the notification surface. Terry resumed with
hands-on assistance and opened Notification Center through the menu-bar clock.
Its actual notification container then showed the named test. The tool could
not reliably keep that panel selected while Terry returned to chat; Terry
performed the clicks and dismissals below. Receiving the notification left the
existing browser page unchanged. A send/list exit alone was never accepted as
activation proof.

The execution-owned in-memory HTTP server used `http://127.0.0.1:62573`,
displayed its received query, and logged request URLs and browser user agents.
The exact native sends were:

```sh
terminal-notifier -title 'SEED-140 Safari click test' -message 'Wait for the chat instruction, then click this notification body.' -group open-dough-seed140-probe -open 'http://127.0.0.1:62573/?project=probe&story=SEED-140%23safari-cold'
terminal-notifier -title 'SEED-140 Chrome click test' -message 'Open Notification Center, then click this body to test Chrome.' -group open-dough-seed140-probe -open 'http://127.0.0.1:62573/?project=probe&story=SEED-140%23chrome-cold'
terminal-notifier -title 'SEED-140 Safari dismiss test' -message 'Dismiss this notification using its ×; do not click the body.' -group open-dough-seed140-probe -open 'http://127.0.0.1:62573/?project=probe&story=SEED-140%23safari-dismiss'
terminal-notifier -title 'SEED-140 stopped-server test' -message 'Click this body after the chat instruction. A connection error is expected.' -group open-dough-seed140-probe -open 'http://127.0.0.1:62573/?project=probe&story=SEED-140%23unreachable'
```

Each exited 0 before the click/dismissal. Safari was initially the verified
system default, with the production dashboard open and no isolated destination
page. Terry clicked the notification body in Notification Center and confirmed
a new Safari window with the probe content. The server recorded
`/?project=probe&story=SEED-140%23safari-cold` with Safari 26.6.2's user agent.
After temporarily selecting Google Chrome through System Settings, with no
probe page open there, Terry confirmed Chrome opened the probe. The server
recorded `/?project=probe&story=SEED-140%23chrome-cold` with Chrome 155's user
agent. The connected Chrome tab showed the probe heading and that exact query.
These observations establish default-browser activation after sender exit;
they do not establish story-card navigation, which slices 2 and 3 own.

For Chrome dismissal, the sender used the same argument array contract with
`-title` value `\[SEED-140 Chrome dismiss test]` and `-message` value
`\"Quotes" and \backslash stay literal. Dismiss this notification with its ×; do not click the body.`,
plus the same group and the URL ending `SEED-140%23chrome-dismiss`.
The helper's group-specific list preserved the title without the escaping
backslash and the complete quoted/backslash message. Terry dismissed it using
× and confirmed the browser stayed unchanged. After Safari was restored as
default, Terry likewise dismissed its test and confirmed no navigation. The
server received neither dismissal URL.

For the unreachable test, the sender exited, then the isolated server was
stopped (session `80280`, terminal exit 130) before Terry clicked. Terry
confirmed Safari displayed a connection error. No destination success or
server/agent launch was claimed.

Additional native argument probe: for each of `[bracket]`, `(parenthesis)`,
`{brace}`, `"quoted"`, `\backslash`, `-leading-dash`, `'single-quote'`, and
`normal text`, `spawnSync('terminal-notifier', ['-title', '\\' + value,
'-message', '\\' + value, '-group', 'open-dough-seed140-text-probe'])` exited 0;
its group-specific `-list` preserved the exact title and message. Select the
uniform one-leading-backslash encoding for textual option values; preserve URL
arguments as ordinary HTTP URLs. No shell activation was used.

Cleanup: both probe notification groups removed; the isolated server ended;
the Chrome probe tab closed. Safari is restored as the verified default and
the helper's alert style restored to Temporary (authorized `-diagnose` reports
banners). The installed helper and granted notification permission remain as
the selected prerequisite. No other application's notifications were removed.
Any Safari probe/error windows are disposable observations, not product output.
Native final story-card acceptance remains owned by slice 3.
