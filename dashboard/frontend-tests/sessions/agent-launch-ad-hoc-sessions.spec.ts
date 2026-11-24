import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { SessionState } from "../../src/launchRecord.ts";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import { mountSessionCards, sessionsReading } from "./session-card-mount.ts";
import {
  sessionEntry,
  sidebarButton,
  sidebarSession,
  taken,
  takenAdHocSession,
} from "./session-card-page.ts";
import {
  terminal,
  terminalClose,
  terminalMaximize,
  terminalRestore,
} from "./session-terminal-page.ts";
import { openAttachedTerminal } from "./session-terminal-socket.ts";
import {
  entries,
  entryOf,
  hiddenStateLabelOf,
  present,
} from "./sessions-sidebar-page.ts";

function adHoc(title: string, state: SessionState, launchedAt?: string) {
  const launch = makeMe.aLaunchRecord.adHoc({ instruction: title, title });
  if (launchedAt !== undefined) launch.launchedAt(launchedAt);
  return makeMe.anObservedLaunch
    .of(launch.please())
    .withSessionState(state)
    .please();
}

test("a blocked ad hoc session reads Needs input in Taken and the sidebar, and the sidebar counts it", async () => {
  const title = "what is blocking us?";
  const words = "Needs input: input needed";
  const waiting = makeMe.aSessionState
    .loaded("waiting")
    .waitingFor("input needed")
    .please();
  await mountSessionCards({
    reading: sessionsReading("blocked", adHoc(title, waiting)),
  });
  const entry = takenAdHocSession(title);
  const badge = page
    .getByRole("banner")
    .getByRole("img", { name: "1 session needs attention" });
  await expect.element(entry.getByText(words, { exact: true })).toBeVisible();
  const entryStyle = getComputedStyle(entry.element());
  expect([entryStyle.borderTopStyle, entryStyle.borderLeftWidth]).toEqual([
    "solid",
    "4px",
  ]);
  await expect.element(badge).toHaveTextContent("1");

  await userEvent.click(sidebarButton);
  await expect.element(badge).toHaveTextContent("1");
  const open = sidebarSession(title);
  await expect.element(open).toBeVisible();
  expect(open.element().getAttribute("title")?.split("\n")).toContain(words);
  const row = present(entryOf(title), "blocked sidebar row");
  const style = getComputedStyle(row);
  expect([
    style.borderLeftStyle,
    style.borderLeftWidth,
    style.borderLeftColor,
  ]).toEqual(["solid", "5px", "rgb(155, 28, 28)"]);
  const accessible = hiddenStateLabelOf(row);
  expect(accessible.textContent).toBe("Needs input");
  const size = accessible.getBoundingClientRect();
  expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(1);
});

test("with the listing unreadable, an ad hoc session's record can be deleted from Taken, leaving the sidebar and moving the keyboard to the next entry", async () => {
  const unknown = makeMe.aSessionState.unknown().please();
  const older = adHoc(
    "the older question",
    unknown,
    "2026-01-01T00:00:00.000Z",
  );
  const newer = adHoc(
    "the newer question",
    unknown,
    "2026-01-01T00:05:00.000Z",
  );
  const deleteRecord = vi
    .fn<MachineReadSource["deleteRecord"]>()
    .mockResolvedValue({ kind: "deleted" });
  await mountSessionCards({
    reading: sessionsReading("unknown", older, newer),
    deleteRecord,
    viewport: { width: 1440, height: 900 },
  });
  const olderEntry = sessionEntry(takenAdHocSession(older.request.title));
  const newerEntry = sessionEntry(takenAdHocSession(newer.request.title));
  await userEvent.click(sidebarButton);
  await expect.poll(() => entries()).toHaveLength(2);
  await expect
    .element(newerEntry.state)
    .toHaveTextContent(
      "State unknown: Claude Code's session list could not be read",
    );
  const showTaken = page.getByRole("button", { name: /^Taken \d+ entr/ });
  if (showTaken.query() !== null) await userEvent.click(showTaken);

  await newerEntry.askToDelete();
  await userEvent.click(newerEntry.confirm);
  await expect.element(newerEntry.entry).not.toBeInTheDocument();
  await expect.poll(() => entries()).toHaveLength(1);
  await expect.element(sidebarSession(older.request.title)).toBeVisible();
  await expect.element(olderEntry.entry).toHaveFocus();

  await olderEntry.askToDelete();
  await userEvent.click(olderEntry.confirm);
  await expect.element(olderEntry.entry).not.toBeInTheDocument();
  await expect.poll(() => entries()).toHaveLength(0);
  await expect
    .element(
      taken.getByRole("article", {
        name: "Repair the installer's update report",
      }),
    )
    .toHaveFocus();
  expect(
    deleteRecord.mock.calls.map(([record]) => record.session.sessionId),
  ).toEqual([newer.session.sessionId, older.session.sessionId]);
});

test("with Open Dough already shown, its Sessions sidebar Session entry brings its Taken entry into view", async () => {
  const title = "where is this entry?";
  const working = makeMe.aSessionState.loaded("working").please();
  await mountSessionCards({
    reading: sessionsReading("working", adHoc(title, working)),
    openTerminal: openAttachedTerminal,
  });
  const entry = takenAdHocSession(title);
  await expect.element(entry).toBeInTheDocument();
  await page.viewport(700, 600);
  await userEvent.click(sidebarButton);
  const inViewport = () => {
    const { top, left, bottom, right } = entry
      .element()
      .getBoundingClientRect();
    return (
      right > 0 &&
      bottom > 0 &&
      left < window.innerWidth &&
      top < window.innerHeight
    );
  };
  await expect.poll(inViewport).toBe(false);

  await userEvent.click(sidebarSession(title));
  await expect
    .element(terminal.getByRole("heading", { name: title, exact: true }))
    .toBeVisible();
  await expect
    .poll(() =>
      terminal.element().parentElement?.classList.contains("page-covering"),
    )
    .toBe(true);
  expect(
    terminal.element().parentElement?.classList.contains("page-maximized"),
  ).toBe(true);
  await expect.element(terminalMaximize).not.toBeInTheDocument();
  await expect.element(terminalRestore).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("separator", { name: /panel/i }))
    .not.toBeInTheDocument();
  await userEvent.click(terminalClose);
  await expect.element(terminal).not.toBeInTheDocument();
  await expect.poll(inViewport).toBe(true);
});
