import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { WorkEntry } from "../../src/publishedWork.ts";
import { boardReading as board } from "./board-reading-page.ts";

export const terminal = page.getByRole("region", {
  name: "Terminal",
  exact: true,
});
export const sidebar = page.getByRole("complementary", {
  name: "Sessions sidebar",
});
export const sessions = page.getByRole("button", { name: /^Sessions\b/ });

export const backlogCard = (title: string) =>
  board.column("Backlog").getByRole("article", { name: title, exact: true });

export function openRecord(entry: WorkEntry) {
  return makeMe.aLaunchRecord
    .executing(entry)
    .inClaudeSession({ sessionId: entry.identity })
    .please();
}

export function machineWorking(...records: ReturnType<typeof openRecord>[]) {
  const { records: launched } = makeMe.aMachineAnswer
    .observingOpen(...records)
    .please();
  return { records: launched, launched };
}

// Preserve xterm and its focus owner. This mounted boundary supplies the
// transport response; the composed journey owns actual host attachment.
export function answerTerminal() {
  class Connection extends EventTarget {
    static readonly OPEN = 1;
    readyState = Connection.OPEN;
    constructor(url: string) {
      super();
      if (!new URL(url).pathname.endsWith("/__agent-terminal"))
        throw new Error(`Unexpected browser socket: ${url}`);
      queueMicrotask(() => {
        if (this.readyState !== Connection.OPEN) return;
        this.dispatchEvent(new Event("open"));
        this.dispatchEvent(
          new MessageEvent("message", { data: "Session attached\r\n" }),
        );
      });
    }
    send() {}
    close() {
      this.readyState = 3;
    }
  }
  vi.stubGlobal("WebSocket", Connection);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
}

export async function openSidebarSession(title: string) {
  await expect.element(sidebar).toBeVisible();
  await sidebar.getByRole("button", { name: title, exact: true }).click();
  await expect
    .element(terminal.getByRole("heading", { name: title, exact: true }))
    .toBeVisible();
  await expect
    .poll(() => terminal.element().contains(document.activeElement))
    .toBe(true);
}

export async function closeTerminal() {
  await terminal.getByRole("button", { name: "Close", exact: true }).click();
  await expect.element(terminal).not.toBeInTheDocument();
}

export function scroller(element: Element) {
  const scroll = element.closest(".board-scroll");
  if (!(scroll instanceof HTMLElement))
    throw new Error("Expected the Board scroll region.");
  return scroll;
}

export async function readingTop(element: Element) {
  const region = scroller(element);
  const heading = element.closest(".column")?.querySelector(".column-header");
  if (!heading) throw new Error("Expected the sticky column heading.");
  await expect
    .poll(() => {
      const at = element.getBoundingClientRect().top;
      const edge =
        region.getBoundingClientRect().top +
        Number.parseFloat(getComputedStyle(region).scrollPaddingTop) +
        Number.parseFloat(getComputedStyle(element).scrollMarginTop);
      return (
        Math.abs(at - edge) <= 1 && at >= heading.getBoundingClientRect().bottom
      );
    })
    .toBe(true);
}
