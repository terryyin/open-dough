// Notification content remains literal, and an ad hoc session has only a
// project destination. The real alert owner reaches the isolated executable.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openDoughFolder } from "../../test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../test-support/agentTerminalBoundary.ts";
import { keepMoreLaunchRecordsBesideServer } from "../../test-support/support/launchStore.ts";
import {
  afterFurtherListings,
  messages,
  notices,
  notificationUrls,
  test,
} from "../../test-support/support/sessionAlerts.ts";
import { expect } from "../../test-support/support/pageTest.ts";

test("passes a title with quotes and a backslash unchanged", async ({
  server,
}) => {
  const oddTitle = "Say \"hi\" to a \\ back\\slash and 'quotes'";
  const { sessionId: session } = await composeSession(server, "open-dough", {
    title: oddTitle,
  });
  await afterFurtherListings(server);
  server.claudeSessionBecomes(session, "blocked", 'Use "this" \\ that?');
  await expect.poll(() => server.notifierCalls().length).toBe(1);
  expect(notices(server)).toEqual([
    {
      message: 'Needs input: Use "this" \\ that?',
      title: `Open Dough · ${oddTitle}`,
      sound: "Glass",
    },
  ]);
  expect(server.notifierCalls()[0]?.argv).toContain(
    `\\Open Dough · ${oddTitle}`,
  );
  expect(server.notifierCalls()[0]?.argv).toContain(
    '\\Needs input: Use "this" \\ that?',
  );
});

test("an ad hoc session keeps its alert and opens its project without inventing a story", async ({
  server,
}) => {
  const instruction = "[ad hoc] with 'quotes' and \\ text";
  const name = `Open Dough · Ad hoc · ${instruction}`;
  const startedAt = Date.now();
  const sessionId = server.claudeListsSession({
    cwd: openDoughFolder(server),
    name,
    startedAt,
  });
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction, title: instruction })
    .inClaudeSession({ sessionId, name })
    .launchedAt(new Date(startedAt).toISOString())
    .please();
  await keepMoreLaunchRecordsBesideServer(server, [record]);
  await afterFurtherListings(server);
  server.claudeSessionBecomes(sessionId, "blocked", "Choose an option");
  await expect.poll(() => server.notifierCalls().length).toBe(1);
  expect(messages(server)).toEqual(["Needs input: Choose an option"]);
  expect(notificationUrls(server)).toEqual([
    `${server.origin}/?project=open-dough`,
  ]);
});
