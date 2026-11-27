// The Cursor client lives in the machine-local runner. How closing the
// Dashboard leaves that client and hangs up the Dashboard's own attachments is
// ./cursor-runner-dashboard-close.spec.ts; how a restarted server rejoins it is
// ./cursor-runner-rejoin.spec.ts.
import { test } from "../../test-support/support/pageTest.ts";
import { stoppingRunnerResumesOnNextOpen } from "../../test-support/support/cursorRunnerLifetime.ts";

test("stopping the runner ends its clients and a new runner resumes the chat", async () => {
  await stoppingRunnerResumesOnNextOpen();
});
