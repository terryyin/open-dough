import { expect, onTestFinished, test } from "vitest";
import type { WorkDependencies } from "../../src/storyDependencies.ts";
import { page, userEvent } from "vitest/browser";
import {
  expectTabOrder,
  focusedAndVisible,
  tabTo,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

const revision = "b".repeat(40);
const record = "seeds/SEED-008-sync.md";
// boardWork publishes open-dough under example/open-dough; production resolves
// snapshot links from that repository.
const recordUrl = `https://github.com/example/open-dough/blob/${revision}/.planning/${record}`;
const dependencies = {
  status: "unavailable",
  problem: "Canonical dependency facts could not be read.",
} satisfies WorkDependencies;
const first = story("Keep the synchronization procedure readable", 8, {
  canonical: { kind: "snapshot", recorded: record, url: recordUrl, revision },
  preparation: { status: "not-recorded" },
  dependencies,
});
const work = boardWork(
  [
    first,
    story("Read the next queued work", 9, {
      dependencies,
    }),
  ],
  {
    revision,
    taken: [
      story("Taken work comes after Backlog", 20),
      story("A second Taken entry", 21),
    ],
  },
);

test("accessible Board is read by keyboard in reading order, with visible focus, and Enter follows a link", async () => {
  await mountBoardFrame(work, { width: 1440, height: 900 });
  await board.shows(["Backlog", "Taken", "Recently done"], []);
  const button = (name: string) =>
    page.getByRole("button", { name, exact: true });
  const direction = page
    .getByRole("heading", { name: "Near-future direction" })
    .element()
    .closest("summary");
  if (direction === null) throw new Error("Direction has no disclosure.");
  const stops = [
    button("Sessions").element(),
    page.getByRole("radio", { name: "Development", checked: true }).element(),
    button("Recent stories, no story selected").element(),
    page.getByRole("radio", { name: "Open Dough", checked: true }).element(),
    button("System settings").element(),
    direction,
    button("Start session in Open Dough").element(),
    button("Preparation badge legend").element(),
  ];
  for (const name of ["Backlog", "Taken"] as const) {
    for (const entry of board.column(name).getByRole("article").elements()) {
      const title = entry.getAttribute("aria-label");
      if (title === null) throw new Error("An article has no story title.");
      const card = board
        .column(name)
        .getByRole("article", { name: title, exact: true });
      if (name === "Backlog") {
        const execution = card.getByRole("button", {
          name: "Start execution",
          exact: true,
        });
        await expect.element(execution).toBeDisabled();
        await expect
          .element(execution)
          .toHaveAccessibleDescription(/dependency facts could not be read/);
        const refinement = card.getByRole("button", {
          name: "Start refinement",
          exact: true,
        });
        await expect.element(refinement).toBeEnabled();
        stops.push(refinement.element());
      }
      if (name === "Taken") {
        stops.push(card.getByRole("button", { name: /^Follow up / }).element());
      }
      expect(card.getByRole("link").elements()).toHaveLength(0);
      stops.push(
        card.getByRole("button", { name: "Inspect story" }).element(),
        card.getByRole("button", { name: "Notes" }).element(),
      );
      if (name === "Taken") {
        stops.push(
          card
            .getByRole("button", { name: "Review changes", exact: true })
            .element(),
        );
      }
    }
  }
  expect(stops).toHaveLength(22);
  await expectTabOrder(stops);
  expect(
    document.querySelectorAll(".board[tabindex='-1'], .board [tabindex='-1']"),
  ).toHaveLength(8);
  expect(document.querySelectorAll(".board [tabindex='0']")).toHaveLength(0);
  await userEvent.tab();
  expect(stops).not.toContain(document.activeElement);
  await expectTabOrder(stops.toReversed(), { shift: true });

  const card = board
    .column("Backlog")
    .getByRole("article", { name: first.title, exact: true });
  const inspect = card.getByRole("button", { name: "Inspect story" });
  await tabTo(inspect.element());
  await userEvent.keyboard("{Enter}");
  const hide = card.getByRole("button", { name: "Hide detail" });
  await expect.element(hide).toHaveFocus();
  const notes = card.getByRole("button", { name: "Notes" });
  const canonical = card.getByRole("link", {
    name: `Canonical record ${record}`,
    exact: true,
  });
  await expectTabOrder([notes.element(), canonical.element()]);
  const opened: string[] = [];
  const capture = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    opened.push(event.target.href);
    event.preventDefault();
  };
  document.addEventListener("click", capture);
  onTestFinished(() => {
    document.removeEventListener("click", capture);
  });
  await userEvent.keyboard("{Enter}");
  expect(opened).toEqual([recordUrl]);
  await expect.element(canonical).toHaveAttribute("target", "_blank");
  await expectTabOrder([notes.element(), hide.element()], { shift: true });
  await userEvent.keyboard("{Enter}");
  focusedAndVisible(card.element());
  expect(card.getByRole("link").elements()).toHaveLength(0);
});
