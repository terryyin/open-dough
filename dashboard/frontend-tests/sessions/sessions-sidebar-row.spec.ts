// Compact open Sessions row: one-line title with ellipsis beside elapsed age,
// tooltip facts, hidden desktop disclosure, and age that advances on the
// production 30s tick — from typed observations.
import { expect, onTestFinished, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  entries,
  entryOf,
  observe,
  openControlOf,
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

function shortAndLongOpenRows(launchedAt: Date) {
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
  return observe([
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
}

async function mountShortAndLongOpenRows(launchedAt: Date) {
  await mountComponent(
    openReading(shortAndLongOpenRows(launchedAt), { sidebarWidth: "18rem" }),
    { viewport: { width: 1280, height: 800 } },
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
  await mountShortAndLongOpenRows(new Date());

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

test("the elapsed time is the largest whole unit, and advances on the 30 second tick", async () => {
  const launchedAt = new Date("2026-11-20T12:00:00.000Z");
  vi.useFakeTimers({
    now: launchedAt.getTime(),
    toFake: ["setInterval", "clearInterval", "Date"],
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });

  await mountShortAndLongOpenRows(launchedAt);

  // Fake timers hold React's first paint; poll with a short interval so the
  // 30s production tick does not fire before the age steps below.
  await expect
    .poll(() => entries().length, { interval: 5, timeout: 2_000 })
    .toBe(2);
  const shortEntry = present(entryOf(shortWork.title), "short row");
  const longEntry = present(entryOf(longWork.title), "long row");
  const at = launchedAt.getTime();
  const second = 1_000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const tickAt = async (afterLaunchMs: number) => {
    vi.setSystemTime(at + afterLaunchMs);
    await vi.advanceTimersByTimeAsync(30_000);
  };

  await tickAt(20 * second);
  expect(elapsedOf(shortEntry).textContent).toBe("<1m");

  vi.setSystemTime(at + 80 * second);
  expect(elapsedOf(shortEntry).textContent).toBe("<1m");
  await vi.advanceTimersByTimeAsync(30_000);
  expect(elapsedOf(shortEntry).textContent).toBe("1m");

  for (const [afterLaunch, words] of [
    [5 * minute, "5m"],
    [2 * hour, "2h"],
    [26 * hour, "1d"],
    [3 * 24 * hour + hour, "3d"],
  ] as const) {
    await tickAt(afterLaunch);
    expect(elapsedOf(shortEntry).textContent).toBe(words);
    expect(elapsedOf(longEntry).textContent).toBe(words);
  }
});
