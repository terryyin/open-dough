import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { zoomedViewport } from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading } from "./board-reading-page.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";
import {
  banner,
  bannerStops,
  compactProject,
  expectBannerRow,
  expectFrameTextWhole,
  expectOnlyBannerControls,
  projectChoices,
  sessions,
  settings,
} from "./dashboard-header-reading.ts";
import { expectServedBrandAsset } from "./frame-brand-asset.ts";
import { expectIconControl, fitsViewport } from "./frame-icon-control.ts";
import {
  doughnut,
  focus,
  mountProjectCatalog,
  openDough,
  projectRadio,
  pygardon,
  showsProjectBoard,
  terryTalks,
} from "./project-navigation-frame.ts";

const wide = { width: 1280, height: 800 };

async function readsMarkOnSessions() {
  const mark = sessions.element().querySelector("img.product-mark");
  if (!(mark instanceof HTMLImageElement))
    throw new Error("Sessions should carry the product mark.");
  await expect.poll(() => mark.complete && mark.naturalWidth > 0).toBe(true);
  expect(mark.naturalWidth).toBe(mark.naturalHeight);
  expect(mark.naturalWidth).toBeGreaterThanOrEqual(mark.width * 2);
  await expectServedBrandAsset(mark.currentSrc, "productMark");
}

test("the selected project banner stays pinned and reachable across wide, mid and zoomed widths", async () => {
  const record = story("Read the installer update report", 59);
  const revision = "a".repeat(40);
  const entries = [...longBacklog, record].map((entry, index) => {
    const number = 900 + index;
    const file = `seeds/SEED-${number}-header.md#story`;
    return story(entry.title, number, {
      canonical: {
        kind: "snapshot",
        recorded: file,
        revision,
        url: `https://example.test/${file}`,
      },
    });
  });
  const work = boardWork(entries, { revision });
  const frame = await mountBoardFrame(
    work,
    wide,
    "stories",
    {},
    {
      otherWork: [doughnut, pygardon, terryTalks],
    },
  );
  const last = boardReading
    .column("Backlog")
    .getByRole("article", { name: record.title, exact: true })
    .getByRole("button", { name: "Inspect story", exact: true });
  await expect.element(last).toBeVisible();
  await expect
    .element(page.getByText("Reading preparation…"))
    .not.toBeInTheDocument();
  const beforeWalk = {
    snapshots: [...frame.snapshotAsks],
    details: [...frame.detailPaths],
  };
  expect(beforeWalk.snapshots).toEqual([
    { sourceId: "open-dough", revision: undefined },
  ]);
  expect(beforeWalk.details).toHaveLength(entries.length);
  expect(new Set(beforeWalk.details).size).toBe(entries.length);

  await expectIconControl(sessions, "Sessions", "Sessions (⌘B)");
  await expectIconControl(settings, "System settings", "System settings");
  await readsMarkOnSessions();
  const header = banner.element() as HTMLElement;
  onTestFinished(() => {
    header.style.removeProperty("font-family");
  });

  for (const { viewport, compact, font } of [
    { viewport: wide, compact: false, font: "" },
    { viewport: { width: 700, height: 720 }, compact: false, font: "" },
    { viewport: { width: 520, height: 720 }, compact: true, font: "" },
    { viewport: zoomedViewport, compact: true, font: "Verdana, sans-serif" },
  ]) {
    await page.viewport(viewport.width, viewport.height);
    header.style.fontFamily = font;
    last.element().scrollIntoView({ block: "nearest" });
    await expect.element(last).toBeInViewport({ ratio: 1 });
    await expectBannerRow(compact ? compactProject : projectChoices);
    expectOnlyBannerControls();
    if (compact) {
      await expect.element(compactProject).toHaveTextContent("Open Dough");
      expect(projectChoices.query()).toBeNull();
    } else {
      await expect.element(projectRadio("Open Dough")).toBeChecked();
      expect(compactProject.query()).toBeNull();
      const choices = projectChoices
        .element()
        .querySelectorAll(".project-choice span");
      expect(
        [...choices].map((choice) => {
          const range = document.createRange();
          range.selectNodeContents(choice);
          return range.getClientRects().length;
        }),
      ).toEqual([1, 1, 1, 1]);
    }
    expectFrameTextWhole();
    if (font !== "") {
      await expectIconControl(sessions, "Sessions", "Sessions (⌘B)");
      await expectIconControl(settings, "System settings", "System settings");
    }

    const stops = bannerStops();
    expect(stops[0]).toBe(sessions.element());
    expect(stops.at(-1)).toBe(settings.element());
    const gear = settings.element().getBoundingClientRect();
    for (const stop of stops)
      expect(stop.getBoundingClientRect().right).toBeLessThanOrEqual(
        gear.right + 0.5,
      );
    focus(sessions);
    await userEvent.tab({ shift: true });
    expect(header.querySelector(":focus")).toBeNull();

    focus(last);
    let previous = last.element();
    for (let step = 0; step < 10; step += 1) {
      await userEvent.tab({ shift: true });
      const target = document.activeElement;
      if (!(target instanceof HTMLElement))
        throw new Error("The Board lost keyboard focus.");
      const context = `${viewport.width}px, previous control ${step + 1}`;
      expect(target, context).not.toBe(previous);
      previous = target;
      expect(fitsViewport(target), context).toBe(true);
      expect(
        target.getBoundingClientRect().top,
        context,
      ).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);
    }
    expect(header.getBoundingClientRect().top).toBe(0);
  }
  expect(frame.snapshotAsks).toEqual(beforeWalk.snapshots);
  expect(frame.detailPaths).toEqual(beforeWalk.details);
});

test("the banner selects the other project's Board without changing the Sessions product mark", async () => {
  const frame = await mountProjectCatalog("stories", wide);
  await showsProjectBoard(openDough);
  expect(projectChoices.getByRole("radio").elements()).toHaveLength(4);
  await expect.element(sessions).toHaveAccessibleName("Sessions");
  await expect.element(projectRadio("Doughnut")).toBeEnabled();
  await projectRadio("Doughnut").click();
  await showsProjectBoard(doughnut);
  await expect.element(projectRadio("Open Dough")).not.toBeChecked();
  await expect.element(sessions).toHaveAccessibleName("Sessions");
  expectOnlyBannerControls();
  expect(
    sessions.element().querySelector("img.product-mark")?.getAttribute("src"),
  ).toBe("/icon-64.png");
  expect(frame.snapshotAsks).toEqual([
    { sourceId: "open-dough", revision: undefined },
    { sourceId: "doughnut", revision: undefined },
  ]);
});
