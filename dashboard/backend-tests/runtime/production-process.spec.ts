// Production process ownership (../../server/productionProcess.mjs): a
// production build or preview runs as its own process group, and stopping it
// ends that whole group.
import { expect, test } from "../../tests/support/pageTest.ts";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { ownedProcess, stopProcess } from "../../server/productionProcess.mjs";

// The leader forks a holder; the holder forks a member that exits at once,
// then leaves the group without reaping it. Stopping the leader leaves only
// that unreaped member, which macOS answers with EPERM rather than ESRCH.
const unreapedMemberGroup = `
$| = 1;
my $exited = 0;
my $holder = fork();
if ($holder == 0) {
  $SIG{CHLD} = sub { $exited = 1 };
  my $member = fork();
  exit 0 if $member == 0;
  setpgrp(0, 0);
  sleep 1 until $exited;
  print "holder $$\n";
  close STDOUT;
  close STDERR;
  sleep 60;
  exit 0;
}
sleep 60 while 1;
`;

test("stopping a production process whose group keeps only an unreaped member succeeds", async () => {
  const owned = ownedProcess("perl", ["-e", unreapedMemberGroup], {
    cwd: tmpdir(),
  });
  await expect.poll(() => owned.output()).toMatch(/holder \d+/);
  const holder = Number(/holder (\d+)/.exec(owned.output())?.[1]);
  try {
    const groupStates = () =>
      spawnSync("ps", ["-axo", "pgid=,stat="], { encoding: "utf8" })
        .stdout.split("\n")
        .map((line) => line.trim().split(/\s+/))
        .filter(([pgid]) => pgid === String(owned.child.pid))
        .map(([, stat]) => stat?.[0]);
    await stopProcess(owned);
    expect(await owned.exited).toEqual({ code: null, signal: "SIGTERM" });
    // The stop ended while the group still held its unreaped member.
    expect(groupStates()).toEqual(["Z"]);
  } finally {
    process.kill(holder, "SIGKILL");
  }
});
