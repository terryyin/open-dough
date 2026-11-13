// A disposed socket cannot control a later mounted attachment of the same request.
import { mkdirSync, readFileSync } from "node:fs";
import { test, expect } from "../support/codexLaunch.ts";
import { storyCardSessions } from "../dashboardPage.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { save, retained } from "../support/retainedReport.ts";
import { launchStoreFile } from "../support/launchStore.ts";
import { codexAttaches } from "../support/codexTerminal.ts";
import { finalReportParts } from "../finalReportPages.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

test("a disposed attachment cannot redirect or write into a current retry of the same session request", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record, workspace } = await retained(dashboard, native);
  mkdirSync(workspace);
  save(dashboard.home, [record]);
  const baseline = readFileSync(launchStoreFile(dashboard.home), "utf8");
  // Keep real browser sockets and real native attachments. Only late delivery
  // from a disposed external socket is controlled, after the real retry opens.
  await page.addInitScript(() => {
    const attachments: WebSocket[] = [];
    Object.assign(window, { terminalAttachments: attachments });
    const NativeSocket = window.WebSocket;
    window.WebSocket = class extends NativeSocket {
      constructor(...args: ConstructorParameters<typeof WebSocket>) {
        super(...args);
        if (String(args[0]).includes("/__agent-terminal?"))
          attachments.push(this);
      }
    };
  });
  let resultReads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/__agent-launch/result")
      resultReads++;
  });
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  await openTerminalControl(storyCardSessions(card(notRefinedStory))).click();
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  await expect(rows).toContainText("original retained history");
  await page.keyboard.press("Control+z");
  await expect(panel.getByRole("status")).toContainText("The terminal ended");
  await panel.getByRole("button", { name: "Open again" }).click();
  await expect.poll(() => codexAttaches(native).length).toBe(2);
  await expect(rows).toContainText("original retained history");
  await page.evaluate(() => {
    const { terminalAttachments } = window as unknown as {
      terminalAttachments: WebSocket[];
    };
    const old = terminalAttachments[0];
    if (old === undefined || terminalAttachments.length !== 2)
      throw new Error("Missing real retry sockets");
    for (const payload of [
      { readiness: "attached" },
      { workspaceUnavailable: { kind: "missing" } },
    ]) {
      old.dispatchEvent(
        new MessageEvent("message", {
          data: new TextEncoder().encode(JSON.stringify(payload)).buffer,
        }),
      );
    }
    old.dispatchEvent(
      new MessageEvent("message", { data: "late disposed output" }),
    );
  });
  await page.keyboard.type("current retry input");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo current retry input");
  await expect(rows).not.toContainText("late disposed output");
  await expect(finalReportParts(page).panel).toHaveCount(0);
  expect(resultReads).toBe(0);
  expect(readFileSync(launchStoreFile(dashboard.home), "utf8")).toBe(baseline);
});
