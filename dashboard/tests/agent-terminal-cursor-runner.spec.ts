// The Cursor client lives in the machine-local runner. Killing the dashboard
// server's process group leaves that client running; a new server on the same
// machine joins it. Claude Code and Codex stay in the dashboard server, so
// that same close still hangs them up.
//
// These journeys each start a Vite server. One serial suite keeps them from
// running together, which makes the runner's address look missing and crowds
// the launch change poll.
import { test } from "./support/pageTest.ts";
import { serverCloseLeavesCursorAndHangsUpOtherHosts } from "./support/cursorRunnerHosts.ts";
import {
  detachedPromptEndsWhileDashboardIsDown,
  stoppingRunnerResumesOnNextOpen,
  twoServersLeaveOneRunner,
  unreachableRunnerRefusesStart,
} from "./support/cursorRunnerLifetime.ts";
import {
  restartedDashboardTypesSameClient,
  trustScreenSurvivesRestart,
  waitingAnswerSurvivesRestart,
} from "./support/cursorRunnerRestart.ts";

test.describe.configure({ mode: "serial" });

test("a restarted dashboard server types into the same Cursor client", async () => {
  await restartedDashboardTypesSameClient();
});

test("a waiting Cursor client still takes the answer after the server is killed", async () => {
  await waitingAnswerSurvivesRestart();
});

test("a trust screen stays unconfirmed across a restart until that client is ready", async () => {
  await trustScreenSurvivesRestart();
});

test("the runner ends a detached follow-up prompt while the dashboard is down", async () => {
  await detachedPromptEndsWhileDashboardIsDown();
});

test("two development servers leave one runner in its own process group", async () => {
  await twoServersLeaveOneRunner();
});

test("an unreachable runner refuses a Cursor start", async () => {
  await unreachableRunnerRefusesStart();
});

test("stopping the runner ends its clients and a new runner resumes the chat", async () => {
  await stoppingRunnerResumesOnNextOpen();
});

test("server close hangs up Claude Code and Codex and leaves the Cursor client", async () => {
  await serverCloseLeavesCursorAndHangsUpOtherHosts();
});
