// Accepted input and lost observation are separate durable facts, including
// confirmed records saved by the previous dashboard's pending-text bug.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { cardSessions } from "./dashboardPage.ts";
import {
  publishLaunchJourney,
  notRefinedIdentity,
  notRefinedStory,
} from "./launchJourney.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";

test.use({ projectFolders: ["open-dough"] });
test("confirmation clears pending evidence; legacy reload is truthful and connection loss retains continuation context", async ({
  page,
  dashboard,
  codexProtocol: native,
  afterGitHubStops,
}) => {
  if (native === undefined) throw new Error("Missing native fixture.");
  const journey = await publishLaunchJourney();
  afterGitHubStops(journey.cleanup);
  const { card } = await openTakenBacklog(page, journey);
  expect(
    JSON.parse(
      (
        await launch(dashboard, {
          ...refinementRequest,
          identity: notRefinedIdentity,
          title: notRefinedStory,
          host: "codex",
        })
      ).body,
    ),
  ).toMatchObject({ kind: "launched" });
  const session = cardSessions(card(notRefinedStory));
  await page.reload();
  await expect(session).toContainText("First input accepted");
  expect(stored(dashboard.home)[0]?.firstInput).not.toHaveProperty(
    "explanation",
  );
  await expect(session).not.toContainText("has not been acknowledged");
  const saved = stored(dashboard.home)[0];
  if (saved?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const document = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    { firstInput: { explanation?: string } }[]
  >;
  const legacy = document["open-dough"]?.[0];
  if (legacy === undefined) throw new Error("Missing saved legacy record.");
  legacy.firstInput.explanation =
    "First-input acceptance has not been acknowledged. Continue this conversation before starting again.";
  writeFileSync(file, JSON.stringify(document));
  await page.reload();
  await expect(session).toContainText("First input accepted");
  await expect(session).not.toContainText("has not been acknowledged");
  await expect(session).toContainText(saved.session.sessionId);
  native.failConnection();
  await expect
    .poll(() => {
      const session = stored(dashboard.home)[0]?.session;
      return session?.host === "codex"
        ? session.continuation?.notice
        : undefined;
    })
    .toContain("native connection ended");
  await page.reload();
  await expect(session).toContainText("First input accepted");
  await expect(session).toContainText("native connection ended");
  await expect(session).not.toContainText("has not been acknowledged");
  const current = stored(dashboard.home)[0];
  if (current?.session.host !== "codex")
    throw new Error("Missing saved Codex record.");
  expect(current.session.continuation?.args).toEqual(
    saved.session.continuation?.args,
  );
  expect(
    native.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});
