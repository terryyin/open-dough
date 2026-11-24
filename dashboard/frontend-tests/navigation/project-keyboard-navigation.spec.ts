import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { holdPublishedSnapshot } from "./board-frame-observation-supply.ts";
import { storyCard } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import {
  doughnut,
  focus,
  mountProjectCatalog,
  openDough,
  projectRadio,
  pygardon,
  readsDirection,
  route,
  showsProjectBoard,
  systemSettings,
  terryTalks,
} from "./project-navigation-frame.ts";

test("unmodified Left and Right wrap through the catalog while a banner control keeps focus", async () => {
  await mountProjectCatalog();
  await showsProjectBoard(openDough);
  focus(systemSettings());
  await expect.element(systemSettings()).toHaveFocus();
  for (const [key, order] of [
    ["ArrowRight", [doughnut, pygardon, terryTalks, openDough]],
    ["ArrowLeft", [terryTalks, pygardon, doughnut, openDough]],
  ] as const) {
    for (const work of order) {
      await userEvent.keyboard(`{${key}}`);
      await showsProjectBoard(work);
      await expect.element(systemSettings()).toHaveFocus();
      expect(route().get("project")).toBe(
        work === openDough ? null : work.source.id,
      );
      expect(route().get("view")).toBeNull();
    }
  }
  await readsDirection(openDough.direction);
});

test("a focused native project radio advances exactly once and keeps focus across wrapping", async () => {
  await mountProjectCatalog();
  const openDoughRadio = projectRadio("Open Dough");
  focus(openDoughRadio);
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(doughnut);
  await expect.element(projectRadio("Doughnut")).toHaveFocus();
  await readsDirection(doughnut.direction);

  const terryRadio = projectRadio("Terry Talks");
  await terryRadio.click();
  await showsProjectBoard(terryTalks);
  focus(terryRadio);
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(openDough);
  await expect.element(openDoughRadio).toHaveFocus();
  await readsDirection(openDough.direction);
  focus(openDoughRadio);
  await userEvent.keyboard("{ArrowLeft}");
  await showsProjectBoard(terryTalks);
  await expect.element(terryRadio).toHaveFocus();
  await readsDirection(terryTalks.direction);
});

test("keyboard choice keeps the roster view and Board choices restore through Back and Forward", async () => {
  await mountProjectCatalog("roster");
  const roster = page.getByRole("region", {
    name: "Agent roster",
    exact: true,
  });
  await expect
    .element(
      roster.getByText(
        /^Open Dough: agent profiles published at revision 0d0d0d0\./,
      ),
    )
    .toBeVisible();
  focus(systemSettings());
  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(
      roster.getByText(
        /^Doughnut: agent profiles published at revision d7d7d7d\./,
      ),
    )
    .toBeVisible();
  await expect.element(projectRadio("Doughnut")).toBeChecked();
  await expect
    .element(storyCard("Open Dough's own taken story"))
    .not.toBeInTheDocument();
  expect(route().get("project")).toBe("doughnut");
  expect(route().get("view")).toBe("roster");
  await roster.getByRole("button", { name: "Back to stories" }).click();
  await projectRadio("Open Dough").click();
  await showsProjectBoard(openDough);
  focus(systemSettings());
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(doughnut);
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(pygardon);
  history.back();
  await showsProjectBoard(doughnut);
  expect(route().get("project")).toBe("doughnut");
  expect(route().get("view")).toBeNull();
  history.forward();
  await showsProjectBoard(pygardon);
  expect(route().get("project")).toBe("pygardon");
  expect(route().get("view")).toBeNull();
});

test("focus moves off departed story content and switching cancels an earlier held project read", async () => {
  const frame = await mountProjectCatalog();
  await showsProjectBoard(openDough);
  focus(systemSettings());
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(doughnut);
  await expect.element(systemSettings()).toHaveFocus();
  const card = storyCard("Doughnut's own queued story");
  await card
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  focus(card.getByRole("link", { name: /^Canonical record/ }));
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(pygardon);
  await expect.element(projectRadio("Pygardon")).toHaveFocus();

  const held = holdPublishedSnapshot(doughnut);
  let readSignal: AbortSignal | undefined;
  frame.queueSnapshot((signal) => {
    readSignal = signal;
    return held.snapshot;
  });
  await projectRadio("Doughnut").click();
  await expect.poll(() => readSignal?.aborted).toBe(false);
  await expect.element(page.getByText(/Reading published work/)).toBeVisible();
  const heldAsks = frame.snapshotAsks.filter(
    ({ sourceId }) => sourceId === "doughnut",
  ).length;
  const changed = boardWork([story("Open Dough after held switch", 333)], {
    taken: [],
    revision: "e2".repeat(20),
  });
  frame.queueSnapshot(changed);
  focus(systemSettings());
  await userEvent.keyboard("{ArrowLeft}");
  await showsProjectBoard(changed);
  await expect.element(systemSettings()).toHaveFocus();
  expect(readSignal?.aborted).toBe(true);
  held.release();
  await new Promise<void>((painted) => {
    requestAnimationFrame(() => setTimeout(painted, 0));
  });
  await showsProjectBoard(changed);
  expect(
    frame.snapshotAsks.filter(({ sourceId }) => sourceId === "doughnut"),
  ).toHaveLength(heldAsks);
});

test("help, editing, native controls, prevented events and modifiers keep their arrows", async () => {
  await mountProjectCatalog();
  await showsProjectBoard(openDough);
  await page.getByRole("button", { name: "Preparation badge legend" }).click();
  const dialog = page.getByRole("dialog", { name: "Preparation badges" });
  await expect.element(dialog).toBeVisible();
  for (const key of ["ArrowRight", "ArrowLeft"]) {
    await userEvent.keyboard(`{${key}}`);
    await expect.element(projectRadio("Open Dough")).toBeChecked();
    expect(
      route().get("project"),
      `Preparation badges absorbs ${key}`,
    ).toBeNull();
  }
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  focus(systemSettings());
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(doughnut);
  expect(route().get("project")).toBe("doughnut");
  await projectRadio("Open Dough").click();
  await showsProjectBoard(openDough);

  const fields = document.body.appendChild(document.createElement("div"));
  onTestFinished(() => {
    fields.remove();
  });
  fields.innerHTML = `
    <input aria-label="Text input for arrows">
    <textarea aria-label="Text area for arrows"></textarea>
    <select aria-label="Select for arrows"><option>a</option><option>b</option></select>
    <input aria-label="Range for arrows" type="range" min="0" max="10" value="3">
  `;
  const keepsOpenDough = (reason: string) => {
    const radio = projectRadio("Open Dough").element() as HTMLInputElement;
    expect(radio.checked, reason).toBe(true);
    expect(route().get("project"), reason).toBeNull();
  };
  for (const field of fields.querySelectorAll<HTMLElement>(
    "input, textarea, select",
  )) {
    field.focus();
    await userEvent.keyboard("{ArrowRight}");
    keepsOpenDough(field.getAttribute("aria-label") ?? "focused control");
  }
  fields.remove();

  focus(systemSettings());
  const prevent = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight")
      event.preventDefault();
  };
  window.addEventListener("keydown", prevent, true);
  try {
    for (const key of ["ArrowRight", "ArrowLeft"]) {
      await userEvent.keyboard(`{${key}}`);
      keepsOpenDough(`prevented ${key}`);
    }
  } finally {
    window.removeEventListener("keydown", prevent, true);
  }
  for (const [modifier, arrow] of [
    ["Shift", "ArrowRight"],
    ["Control", "ArrowRight"],
    ["Alt", "ArrowRight"],
    ["Meta", "ArrowRight"],
    ["Shift", "ArrowLeft"],
  ]) {
    await userEvent.keyboard(`{${modifier}>}{${arrow}}{/${modifier}}`);
    keepsOpenDough(`${modifier}+${arrow}`);
  }
  await userEvent.keyboard("{ArrowRight}");
  await showsProjectBoard(doughnut);
});
