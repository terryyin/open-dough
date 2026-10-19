// Notification content remains literal, and an ad hoc session has only a
// project destination. The real alert owner reaches the isolated executable.
import { launchRequest } from "./agentLaunchBoundary.ts";
import {
  afterFurtherListings,
  messages,
  notices,
  notificationUrls,
  start,
  test,
} from "./support/sessionAlerts.ts";
import { expect } from "./support/pageTest.ts";

test("passes a title with quotes and a backslash unchanged", async ({
  server,
}) => {
  const oddTitle = "Say \"hi\" to a \\ back\\slash and 'quotes'";
  const session = await start(server, { ...launchRequest, title: oddTitle });
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
  const session = await start(server, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "claude",
    instruction: "[ad hoc] with 'quotes' and \\ text",
  });
  await afterFurtherListings(server);
  server.claudeSessionBecomes(session, "blocked", "Choose an option");
  await expect.poll(() => server.notifierCalls().length).toBe(1);
  expect(messages(server)).toEqual(["Needs input: Choose an option"]);
  expect(notificationUrls(server)).toEqual([
    `${server.origin}/?project=open-dough`,
  ]);
});
