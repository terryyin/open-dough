// Compact open Sessions row: one-line title with ellipsis beside elapsed age,
// tooltip facts, and hidden desktop disclosure — from typed observations.
import { expect, onTestFinished, test } from "vitest";
import { cdp } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  observe,
  openReading,
  present,
} from "./sessions-sidebar-open-mount.ts";

// Vitest browser contexts start with hasTouch; desktop row CSS hides Session
// details under `(any-pointer: coarse)` absent. Restore touch when the case ends.
async function useFinePointer() {
  const session = cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };
  await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  onTestFinished(async () => {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  });
  if (window.matchMedia("(any-pointer: coarse)").matches) {
    throw new Error("Fine pointer required for desktop disclosure proof");
  }
}

const shortWork = { identity: "SEED-901#short", title: "A short title" };
const longWork = {
  identity: "SEED-901#long",
  title: `A very long story title that cannot fit on one line of the narrow sidebar ${"and goes on ".repeat(8)}to its end`,
};

function entries() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".sessions-sidebar-sessions li.sessions-sidebar-session-entry",
    ),
  ];
}

function entryOf(title: string) {
  return entries().find(
    (entry) =>
      entry.querySelector("h3.sessions-sidebar-session-entry-title")
        ?.textContent === title,
  );
}

function titleOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLElement>("h3.sessions-sidebar-session-entry-title"),
    "row title",
  );
}

function elapsedOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLElement>(
      "time.sessions-sidebar-session-entry-elapsed",
    ),
    "row elapsed",
  );
}

function openControlOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLButtonElement>(
      "button.sessions-sidebar-session-entry-open",
    ),
    "row open control",
  );
}

function seenText(entry: HTMLElement) {
  return [...entry.children]
    .filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        !child.classList.contains("visually-hidden") &&
        child.tagName !== "BUTTON" &&
        child.getBoundingClientRect().height > 0,
    )
    .map((child) => child.innerText)
    .filter((text) => text !== "");
}

function tooltipLines(entry: HTMLElement) {
  return (openControlOf(entry).getAttribute("title") ?? "").split("\n");
}

function box(element: HTMLElement) {
  return element.getBoundingClientRect();
}

test("is one line of title and elapsed time, however long the title, with the rest in its tooltip", async () => {
  await useFinePointer();
  const launchedAt = new Date();
  const short = makeMe.aLaunchRecord
    .executing({
      identity: shortWork.identity,
      title: shortWork.title,
      source: "doughnut",
    })
    .inClaudeSession({ sessionId: "row-short" })
    .launchedAt(launchedAt.toISOString())
    .please();
  const long = makeMe.aLaunchRecord
    .executing({
      identity: longWork.identity,
      title: longWork.title,
      source: "doughnut",
    })
    .inClaudeSession({ sessionId: "row-long" })
    .launchedAt(launchedAt.toISOString())
    .please();
  const records = observe([
    {
      record: short,
      state: makeMe.aSessionState
        .loaded("waiting")
        .waitingFor("input needed")
        .please(),
    },
    {
      record: long,
      state: makeMe.aSessionState.loaded("working").please(),
    },
  ]);

  await mountComponent(openReading(records, { sidebarWidth: "18rem" }), {
    viewport: { width: 1280, height: 800 },
  });

  await expect.poll(() => entries().length).toBe(2);
  const shortEntry = present(entryOf(shortWork.title), "short row");
  const longEntry = present(entryOf(longWork.title), "long row");

  expect(titleOf(shortEntry).textContent).toBe(shortWork.title);
  expect(elapsedOf(shortEntry).textContent).toBe("<1m");
  expect(seenText(shortEntry)).toEqual([shortWork.title, "<1m"]);
  expect(titleOf(longEntry).textContent).toBe(longWork.title);
  expect(elapsedOf(longEntry).textContent).toBe("<1m");
  expect(seenText(longEntry)).toEqual([longWork.title, "<1m"]);

  const details = present(
    shortEntry.querySelector<HTMLDetailsElement>(
      "details.sessions-sidebar-session-entry-details",
    ),
    "session details",
  );
  const disclosure = present(
    details.querySelector("summary"),
    "session details disclosure",
  );
  expect(getComputedStyle(details).display).toBe("none");
  expect(disclosure.checkVisibility()).toBe(false);
  expect(
    shortEntry.querySelectorAll("button.sessions-sidebar-session-entry-open"),
  ).toHaveLength(1);
  expect(openControlOf(shortEntry).getAttribute("aria-labelledby")).toBe(
    titleOf(shortEntry).id,
  );

  expect(tooltipLines(shortEntry)[0]).toBe("Needs input: input needed");
  expect(tooltipLines(shortEntry)).toContain("Doughnut · Execution");
  const launchedShown = new Date(
    elapsedOf(shortEntry).getAttribute("datetime") ?? "",
  ).toLocaleString();
  expect(tooltipLines(shortEntry)).toContain(`Launched ${launchedShown}`);

  const title = titleOf(longEntry);
  expect(getComputedStyle(title).whiteSpace).toBe("nowrap");
  expect(getComputedStyle(title).textOverflow).toBe("ellipsis");
  expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
  expect(box(title).height).toBeLessThanOrEqual(lineHeight + 1);
  expect(box(longEntry).height).toBe(box(shortEntry).height);
  const elapsed = box(elapsedOf(longEntry));
  const row = box(longEntry);
  expect(elapsed.x + elapsed.width).toBeLessThanOrEqual(
    row.x + row.width + 0.5,
  );
  expect(elapsed.y).toBeGreaterThanOrEqual(row.y - 0.5);
  expect(elapsed.y + elapsed.height).toBeLessThanOrEqual(
    row.y + row.height + 0.5,
  );
});
