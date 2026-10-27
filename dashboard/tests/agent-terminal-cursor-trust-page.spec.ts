// A joined current-screen replay is restored at its held dimensions before
// xterm fits it to the panel. This uses the actual browser consumer and PTY.
import { showColumn } from "./boardPage.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expect, test } from "./support/cursorStart.ts";
import {
  instructedCursorRequest,
  keptCursor,
} from "./support/keptCursorTurn.ts";
import { terminalReplaySchema } from "../src/agentTerminal.ts";

test.use({ cursorScreen: "trust-unframed", launchTimeoutMs: 1_500 });

test("a fitted terminal restores the held trust rendition and hidden cursor on join and reconnect", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 780, height: 700 });
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  const launched = await launch(
    dashboard,
    instructedCursorRequest("hold the trust screen"),
  );
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "uncertain" });
  const sizes: { cols: number; rows: number }[] = [];
  const replays: { cols: number; rows: number }[] = [];
  page.on("websocket", (socket) => {
    socket.on("framesent", ({ payload }) => {
      const parsed = JSON.parse(payload.toString()) as {
        resize?: { cols: number; rows: number };
      };
      if (parsed.resize !== undefined) sizes.push(parsed.resize);
    });
    socket.on("framereceived", ({ payload }) => {
      try {
        const parsed = terminalReplaySchema.safeParse(
          JSON.parse(payload.toString()),
        );
        if (parsed.success) replays.push(parsed.data.replay);
      } catch {
        // Text frames are terminal output rather than a control.
      }
    });
  });
  await page.goto("/");
  const open = page
    .locator(".session-entry")
    .getByRole("button", { name: "Open terminal" });
  await showColumn(page, "Taken");
  await open.click();
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const prompt = rows
    .locator("span")
    .filter({ hasText: "Workspace Trust Required" });
  await expect(rows).toContainText("[a] Trust this workspace");
  await expect(prompt).toHaveClass(/xterm-bold/);
  await expect(prompt).toHaveClass(/xterm-fg-11/);
  await expect(prompt).toHaveCSS("color", "rgb(252, 233, 79)");
  await expect(rows.locator(".xterm-cursor")).toHaveCount(0);
  await expect.poll(() => replays).toEqual([{ cols: 80, rows: 24 }]);
  await expect
    .poll(() => sizes.at(-1)?.rows)
    .toBe(await rows.locator(":scope > div").count());
  expect(sizes.at(-1)?.cols).not.toBe(80);
  expect(sizes).not.toContainEqual({ cols: 80, rows: 24 });
  expect(cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(cursor.input(pid)).toBe("");
  expect(keptCursor(dashboard.home).firstInput?.state).toBe("uncertain");

  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await page.setViewportSize({ width: 1100, height: 800 });
  await showColumn(page, "Taken");
  await open.click();
  await expect(rows).toContainText("[q] Quit");
  await expect(prompt).toHaveClass(/xterm-bold/);
  await expect(rows.locator(".xterm-cursor")).toHaveCount(0);
  await expect.poll(() => replays).toHaveLength(2);
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  await panel.locator(".xterm-screen").click();
  await page.keyboard.type("q");
  await expect.poll(() => cursor.input(pid)).toBe("q");
});
