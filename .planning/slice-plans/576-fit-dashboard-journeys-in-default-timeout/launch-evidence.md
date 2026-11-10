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
