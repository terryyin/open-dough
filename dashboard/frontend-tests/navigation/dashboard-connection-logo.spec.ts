import { expect, onTestFinished, test, vi } from "vitest";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import type { RevisionCheck } from "../../src/revisionCheckRead.ts";
import {
  navigationNextHopProtocol,
  revisionStreamSlotCap,
  revisionStreamSlotLockNames,
} from "../../src/revisionStreamSlot.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { banner, sessions } from "./dashboard-header-reading.ts";
import { expectServedBrandAsset } from "./frame-brand-asset.ts";
import {
  openDough,
  projectViewport,
  readsProjectBoard,
} from "./project-navigation-frame.ts";

const knead = "/opendough-knead.svg";

async function occupyRevisionStreamSlots() {
  const cap = revisionStreamSlotCap(navigationNextHopProtocol());
  expect(cap).toBe(2);
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  await Promise.all(
    revisionStreamSlotLockNames(cap).map(
      (name) =>
        new Promise<void>((ready, reject) => {
          void navigator.locks
            .request(name, { ifAvailable: true }, async (lock) => {
              if (lock === null)
                throw new Error(
                  `Revision stream slot ${name} was already occupied.`,
                );
              ready();
              await held;
            })
            .catch(reject);
        }),
    ),
  );
}

function observeAnimationLoads() {
  const loads: string[] = [];
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const url = new URL(entry.name);
      if (
        url.pathname === knead &&
        (entry as PerformanceResourceTiming).initiatorType === "img"
      )
        loads.push(url.href);
    }
  });
  observer.observe({ type: "resource" });
  onTestFinished(() => {
    observer.disconnect();
  });
  return loads;
}

test("the logo kneads once when the waiting dashboard receives updates", async () => {
  await emulateMedia([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await occupyRevisionStreamSlots();
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout"],
    shouldAdvanceTime: true,
  });
  const visibility = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  onTestFinished(() => {
    vi.useRealTimers();
    visibility.mockRestore();
  });
  const loads = observeAnimationLoads();
  const mark = () =>
    sessions.element().querySelector<HTMLImageElement>("img.product-mark");
  const shownAsset = () => mark()?.getAttribute("src");
  const connection = banner.getByRole("img", {
    name: /^Dashboard connection:/,
  });
  const checks: (() => void)[] = [];
  const releaseCheck = (index: number) => {
    const reply = checks[index];
    if (reply === undefined)
      throw new Error(`Revision check ${index + 1} is not waiting.`);
    reply();
  };
  const unchanged = {
    changed: false,
    heads: new Map(),
  } satisfies RevisionCheck;
  onTestFinished(() => {
    for (const answer of checks) answer();
  });
  const frame = await mountBoardFrame(
    openDough,
    projectViewport,
    "stories",
    {},
    {
      revisionCheck: () =>
        new Promise<RevisionCheck>((answer) => {
          checks.push(() => {
            answer(unchanged);
          });
        }),
    },
  );
  await readsProjectBoard(openDough);
  await expect
    .poll(() => document.querySelector(".board [aria-busy='true']"))
    .toBeNull();
  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  await expect.poll(() => checks.length).toBe(1);
  expect(frame.subscriptionCount()).toBe(0);
  await expect
    .element(connection)
    .toHaveAccessibleName(
      "Dashboard connection: awaiting updates since return",
    );
  await expect.poll(shownAsset).toBe("/icon-64.png");
  expect(loads).toEqual([]);

  releaseCheck(0);
  await expect
    .element(connection)
    .toHaveAccessibleName(
      "Dashboard connection: updates received since return",
    );
  await expect.poll(shownAsset).toMatch(/^\/opendough-knead\.svg\?play=/);
  const first = mark();
  if (first === null) throw new Error("Expected a playing product mark.");
  await expect.poll(() => first.naturalWidth).toBe(256);
  const firstURL = first.currentSrc;
  await expect.poll(() => loads).toEqual([firstURL]);
  await expectServedBrandAsset(firstURL, "kneadingAnimation");
  await vi.advanceTimersByTimeAsync(4_000);
  await expect.poll(shownAsset).toBe("/icon-64.png");

  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  await expect.poll(() => checks.length).toBe(2);
  releaseCheck(1);
  await vi.advanceTimersByTimeAsync(4_000);
  await expect
    .element(connection)
    .toHaveAccessibleName(
      "Dashboard connection: updates received since return",
    );
  await expect.poll(shownAsset).toBe("/icon-64.png");
  expect(loads).toEqual([firstURL]);

  visibility.mockReturnValue("hidden");
  document.dispatchEvent(new Event("visibilitychange"));
  visibility.mockReturnValue("visible");
  document.dispatchEvent(new Event("visibilitychange"));
  await expect
    .element(connection)
    .toHaveAccessibleName(
      "Dashboard connection: awaiting updates since return",
    );
  await expect.poll(shownAsset).toBe("/icon-64.png");
  await vi.advanceTimersByTimeAsync(1);
  await expect.poll(() => checks.length).toBe(3);
  releaseCheck(2);
  await expect.poll(shownAsset).toMatch(/^\/opendough-knead\.svg\?play=/);
  const replay = mark();
  if (replay === null) throw new Error("Expected the returning product mark.");
  await expect.poll(() => replay.naturalWidth).toBe(256);
  const replayURL = replay.currentSrc;
  expect(replayURL).not.toBe(firstURL);
  await expect.poll(() => loads).toEqual([firstURL, replayURL]);
  await vi.advanceTimersByTimeAsync(4_000);
  await expect.poll(shownAsset).toBe("/icon-64.png");
  expect(loads).toEqual([firstURL, replayURL]);
});
