# Launch budget corrections

## Slice7: second-server preparation overlaps

Only agent-launch-second-server.spec.ts changes. Immediately after real installed
start acceptance, start the second preview before waiting for push.isHeld. The
same held-push poll runs inside the existing try before any observations; finally
still releases push/closes second. No shared API, test data, assertion or timeout
change. Baseline traced23.16s preparation followed by3.23s sequential startup.
The reordered await removes that serial dependency without a new helper.

Command: `caffeinate -s -i node /tmp/seed287-second-server-proof.mjs`. It runs
`npm run test:dashboard -- tests/launches/agent-launch-second-server.spec.ts --workers=2`
three separate fresh selections, with artifact/proof/timing env per run.
Strict1/1 each, retry0/default30, terminal0. Cases8.183/8.252/8.198s; shell
9.719/9.737/9.386s; runner9.328/9.341/8.992s include all cold setup/servers/
installed publication/native launch/cleanup. HostmacOS16cores, ACcaffeinate-s-i,
quietload2.34–2.60; no20–30 or precise cross-condition saving claim. Final12
retains pressure/hosted/full-suite proof. Raw /tmp/seed287-second-server-overlap.

Setup: canonical responsiveStart queued repository, private bare origin/machine,
actual accept/installed start, two previews and held native client. Observations
retain accepted id/ownedfalse/running start worker pid+notedAt, no outcome/slow;
exact warning/protected card/source links/pulse/noRecovery through reload and
project switch; release push reaches ownerlaunchPID, oneclaim; release Claude
reaches actual settledlaunch, nonownerended/workergone and exact one visible
session/profile/worktree/nativecall. No outcome supplied by fixture.

Targetedreturn /tmp/seed287-second-server-return.md and197-rowconsumerrecord
/tmp/seed287-second-server-consumers.md retain complete literal commands,
assertion/setup locations and every disposition. Named worker-handoff/change-wait
boundaries unchanged: local spec exports no shared scheduling. G4 remains
interim for receipt/Codex/comparison repairs8/9/11; this accepts one member only.

Independent refactor: none — already clean; no edits or repeated tests.
The reviewer inspected actual setup/assertions, all three strict proof records
and every consumer disposition. REFACTOR COMPLETE received; unchanged proof
reused. /tmp/seed287-second-server-refactor-return.md retains the decision.

## Slice 8: recovery starts overlap initial page work

The receipt-failure execution/refinement cases and second-server orphan now
register the existing followed origin, accept the real initial start through
HTTP, and open the page during installed preparation. Requests preserve queued
identity, Story A title, host and workflow. Receipt locators do not assert an
already-spent initial Backlog state. No fault or recovery result is supplied.
Actual chmod fault, Git publication, SIGKILL, same-port restart, UI Continue,
all recovery assertions and exact one claim/worktree/session remain unchanged.

Before edits, initial UI owners passed 13/13 and exact execution/refinement
acceptance-close cases passed 2/2. Their actual dialogs, hidden-at-acceptance,
protection, source links and launch results establish surviving proof before
removing repeated initial UI steps. Complete literal commands, setup and named
assertions: /tmp/seed287-recovery-return.md. No initial UI owner was removed.

Recovery command: `caffeinate -s -i node /tmp/seed287-recovery-proof.mjs`. Three
children select both whole specs with `--workers=2`; all three cases pass each
time, retry 0, default 30 s. Execution receipt 8.661/7.419/7.267 s; refinement
7.407/6.011/5.872 s; orphan 6.290/6.206/6.277 s. Shell elapsed
15.254/13.615/13.587 s; runner 14.828/13.211/13.192 s includes all preparation,
actual installed/native work and teardown. Raw proof and artifact records:
/tmp/seed287-recovery-initial-overlap. Host AC, 16 cores, sleep guard maintained;
quiet load 2.09–4.14. Pressure/hosted/full-suite proof remains in slice 12.

Receipt assertions still observe EACCES/unrecorded publication, no native call
before repair, raw durable state, protected card/explanation/accessibility,
fresh reload and UI Continue to the same attempt/revision/claim and one result.
Orphan assertions still observe live child after real owner death, non-owner
warning/refusal while alive, interruption after real push/exit, and Continue
into one actual native session. The 140-row consumer record has every
disposition: /tmp/seed287-recovery-consumers.md. Only two specs change; shared
helpers remain unchanged. G4 stays interim for Codex and comparison, 9/11.
The stale 'final G4 member' prose in 9 is aligned with that existing ownership.

Independent slice 8 refactor: none — already clean, no edits or repeated tests.
The reviewer inspected the surviving 15 UI-owner cases, all three recovery
records, actual setup/assertions and all 140 consumer dispositions. Existing
proof remains valid; REFACTOR COMPLETE received. Full decision:
/tmp/seed287-recovery-refactor-return.md.
