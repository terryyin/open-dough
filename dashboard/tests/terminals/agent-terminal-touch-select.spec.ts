// Phone Select on the ordinary page/xterm/WebSocket/PTY path: the shown
// terminal screen pauses in place as ordinary text, a range of it copied by
// the platform reaches the clipboard and pastes back into the session, and
// the same control returns the live terminal on the attachment it never left.
// A browser's touch emulation performs no long-press selection, so the range
// is given to the page as a device's handles would leave it. Variants are
// ../../frontend-tests/agent-terminal-touch-select*.spec.ts.
import { expect } from "../dashboardTest.ts";
import { box, expectOnOneLine, tapWhereShown } from "../pageLayout.ts";
import { phonePasteJourney, test } from "../terminalPastePage.ts";
import {
  expectLive,
  expectPaused,
  expectPausedShowsDrawnRowsInPlace,
  expectPausedOverScreen,
  pausedLines,
  pausedText,
  selectKey,
  selectPausedRange,
  selectedText,
} from "../terminalSelectPage.ts";
import {
  expectMinTouchTarget,
  focusByTouch,
  reportedRows,
  tapTerminalKey,
  terminalKey,
} from "../touchTerminalPage.ts";

const openPasteTerminal = phonePasteJourney();

test("Select pauses the shown lines in place as text, a copied range pastes back, and the same attachment returns having received nothing", async ({
  page,
  dashboard,
}) => {
  const { panel, rows, sent, sizes, native } = await openPasteTerminal(
    page,
    dashboard,
  );
  const select = selectKey(panel);
  const paste = terminalKey(panel, "Paste");
  const textarea = panel.locator("textarea.xterm-helper-textarea");
  const attach = () => dashboard.claudeAttaches()[0];

  await test.step("Select is one tap away, beside Paste", async () => {
    await expect(terminalKey(panel, "More terminal keys")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(select).toBeVisible();
    await expect(select).toHaveAttribute("aria-pressed", "false");
    await expectMinTouchTarget(select);
    await expectOnOneLine([paste, select]);
    const [left, right] = [await box(paste), await box(select)];
    // No other key fits between them.
    expect(right.x - (left.x + left.width)).toBeLessThan(44);
  });

  // The session prints a path, on a line of its own and in an answer.
  const path = "/work/open-dough/docs/notes.md";
  await focusByTouch(panel);
  await page.keyboard.type(path);
  await page.keyboard.press("Enter");
  await expect(rows).toContainText(`echo ${path}`);
  await page.evaluate(() => navigator.clipboard.writeText("copied earlier"));
  const typed = sent.length;
  const sizesBefore = [...sizes];
  const look = () =>
    select.evaluate((key) => getComputedStyle(key).backgroundColor);
  const lookWhenOff = await look();
  let lookWhenOn = lookWhenOff;

  await test.step("a tap pauses the shown lines in place as ordinary text", async () => {
    // The helper also observes that the terminal's input keeps focus.
    await tapTerminalKey(panel, "Select");
    await expectPaused(panel);
    await expect(select).not.toHaveCSS("background-color", lookWhenOff);
    lookWhenOn = await look();
    await expectPausedOverScreen(panel);
    await expectPausedShowsDrawnRowsInPlace(panel);
    // The terminal holds its screen and no scrollback yet.
    const lines = await pausedLines(panel);
    expect(lines).toHaveLength(reportedRows(sizes));
    const answer = lines.indexOf(`echo ${path}`);
    expect(lines[answer - 1]).toBe(path);
    // The dashboard selected nothing and offers no Copy of its own.
    expect(await selectedText(panel)).toBe("");
    await expect(panel.getByRole("button", { name: /copy/i })).toHaveCount(0);
  });

  await test.step("a range across two lines, copied by the platform, is exactly on the clipboard", async () => {
    // A finger on the paused text touches ordinary text, as a long-press
    // would: the terminal's input no longer has focus, so the platform's copy
    // is not a key the terminal takes.
    await tapWhereShown(pausedText(panel));
    await expect(textarea).not.toBeFocused();
    await expectPaused(panel);
    // Select still shows as on once the look its own tap left has gone.
    await expect(select).toHaveCSS("background-color", lookWhenOn);
    const range = "docs/notes.md\necho /work/open-dough";
    expect(
      await selectPausedRange(panel, "docs/notes.md", "echo /work/open-dough"),
    ).toBe(range);
    await page.keyboard.press("ControlOrMeta+c");
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(range);
  });

  await test.step("a second tap returns the live terminal on the same attachment", async () => {
    await tapWhereShown(select);
    await expectLive(panel);
    await expect(select).not.toHaveCSS("background-color", lookWhenOn);
    await expect(rows).toContainText(`echo ${path}`);
    expect(dashboard.claudeAttaches()).toHaveLength(1);
    expect(attach()?.id).toBe(native.shortId);
  });

  await test.step("Paste gives the session the copied text, the first thing it received since before pausing", async () => {
    await tapWhereShown(paste);
    await expect(rows).toContainText("echo docs/notes.md");
    await expect(panel.getByRole("status")).toBeEmpty();
    expect(sent.slice(typed)).toEqual(["docs/notes.md\recho /work/open-dough"]);
    expect(attach()?.lines).toEqual([path, "docs/notes.md"]);
    // The session printed no `resized` line before that echo: neither tap
    // resized its terminal.
    expect(sizes).toEqual(sizesBefore);
  });
});
