// The Cursor client lives in the machine-local runner. Killing the dashboard
// server's process group leaves that client running; how a restarted server
// rejoins it is ./cursor-runner-rejoin.spec.ts. Claude Code and Codex stay in
// the dashboard server, so that same close still hangs them up.
//
// These tests each start a boundary server. One serial suite keeps them from
// running together, which makes the runner's address look missing and crowds
// the launch change poll.
import { test } from "../../test-support/support/pageTest.ts";
import { serverCloseLeavesCursorAndHangsUpOtherHosts } from "../../test-support/support/cursorRunnerHosts.ts";
import {
  detachedPromptStaysWhileDashboardIsDown,
  stoppingRunnerResumesOnNextOpen,
} from "../../test-support/support/cursorRunnerLifetime.ts";

test.describe.configure({ mode: "serial" });

test("the runner keeps a detached follow-up prompt while the dashboard is down", async () => {
  await detachedPromptStaysWhileDashboardIsDown();
});

test("stopping the runner ends its clients and a new runner resumes the chat", async () => {
  await stoppingRunnerResumesOnNextOpen();
});

test("server close hangs up Claude Code and Codex and leaves the Cursor client", async () => {
  await serverCloseLeavesCursorAndHangsUpOtherHosts();
});
