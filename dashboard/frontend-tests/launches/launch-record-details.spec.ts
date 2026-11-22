import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { noSessions } from "../navigation/board-mount.ts";
import { boardReading as board } from "../navigation/board-reading-page.ts";
import {
  backlogCard,
  sessions,
  sidebar,
} from "../navigation/board-session-view.ts";
import { boardWork, story } from "../navigation/board-work.ts";

const viewport = { width: 1440, height: 1000 };
const requested = (model: string) => `Model: ${model} (requested)`;
const recent = board.column("Recently done");
type Story = ReturnType<typeof story>;

async function openBoard(
  stories: readonly Story[],
  records: readonly LaunchRecord[],
) {
  const { records: observed } = makeMe.aMachineAnswer
    .observingOpen(...records)
    .please();
  await mountBoardFrame(boardWork(stories), viewport, "stories", {
    ...noSessions,
    records: observed,
    launched: observed,
  });
}

async function onCard(title: string, workflow: string) {
  const entries = backlogCard(title)
    .getByRole("list", { name: "Sessions", exact: true })
    .getByRole("article");
  await expect.element(entries).toHaveLength(1);
  await expect.element(entries).toHaveAccessibleName(`${workflow} session`);
  return entries;
}

async function openDetails(entry: Locator, sessionId: string) {
  const details = entry.getByRole("button", {
    name: "Session details",
    exact: true,
  });
  details.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(details).toHaveAttribute("aria-expanded", "true");
  await expect
    .element(entry.getByText(`Session ${sessionId}`, { exact: true }))
    .toBeVisible();
}

test("refinement cards independently show requested options and model across all four recorded combinations", async () => {
  const examples = [
    { label: "Explore and Borrow", options: true, model: false },
    { label: "Explore, Borrow and Opus", options: true, model: true },
    { label: "No options", options: false, model: false },
    { label: "No options on Opus", options: false, model: true },
  ].map((each, index) => {
    const work = story(each.label, 741 + index);
    const sessionId = `record-refinement-${index}`;
    const launch = makeMe.aLaunchRecord
      .refining(work)
      .inClaudeSession({ sessionId });
    if (each.options) launch.requestingOptions(["--explore", "--borrow"]);
    if (each.model) launch.requestingModel("opus");
    return { ...each, work, sessionId, record: launch.please() };
  });
  await openBoard(
    examples.map(({ work }) => work),
    examples.map(({ record }) => record),
  );

  for (const { work, sessionId, options, model } of examples) {
    const entry = await onCard(work.title, "Refinement");
    if (model)
      await expect
        .element(entry.getByText(requested("Opus"), { exact: true }))
        .toBeVisible();
    else
      await expect.element(entry.getByText(/^Model:/)).not.toBeInTheDocument();

    await openDetails(entry, sessionId);
    if (options)
      await expect
        .element(
          entry.getByText("Options: --explore --borrow (requested)", {
            exact: true,
          }),
        )
        .toBeVisible();
    else
      await expect
        .element(entry.getByText(/^Options:/))
        .not.toBeInTheDocument();
  }
  await expect.element(recent.getByRole("article")).toHaveLength(0);
});

test("execution and ad hoc model labels appear in their own Board entries and sidebar, with effort only when recorded", async () => {
  const explicit = story("Build on Opus", 751);
  const implicit = story("Build on Default", 752);
  const maximum = story("Build at max effort", 753);
  const adHocTitle = "8 Jan, 10:00";
  const opus = makeMe.aLaunchRecord
    .executing(explicit)
    .inClaudeSession({ sessionId: "explicit-model" })
    .requestingModel("opus")
    .please();
  const maxed = makeMe.aLaunchRecord
    .executing(maximum)
    .inClaudeSession({ sessionId: "max-effort" })
    .requestingEffort("max")
    .please();
  const defaulted = makeMe.aLaunchRecord
    .executing(implicit)
    .inClaudeSession({ sessionId: "default-model" })
    .please();
  const adHoc = makeMe.aLaunchRecord
    .adHoc({ title: adHocTitle })
    .inClaudeSession({ sessionId: "ad-hoc-model" })
    .requestingModel("sonnet")
    .please();
  await openBoard(
    [explicit, implicit, maximum],
    [opus, defaulted, maxed, adHoc],
  );

  const explicitEntry = await onCard(explicit.title, "Execution");
  await expect
    .element(explicitEntry.getByText(requested("Opus"), { exact: true }))
    .toBeVisible();

  const maxEntry = await onCard(maximum.title, "Execution");
  await openDetails(maxEntry, maxed.session.sessionId);
  await expect
    .element(maxEntry.getByText("Effort: max (requested)", { exact: true }))
    .toBeVisible();

  const implicitEntry = await onCard(implicit.title, "Execution");
  await expect
    .element(implicitEntry.getByText(/^Model:/))
    .not.toBeInTheDocument();
  await openDetails(implicitEntry, defaulted.session.sessionId);
  await expect
    .element(implicitEntry.getByText(/^Effort:/))
    .not.toBeInTheDocument();

  const taken = board.column("Taken");
  const session = taken.getByRole("article", {
    name: `Ad hoc session for ${adHocTitle}`,
    exact: true,
  });
  await expect.element(session).toHaveLength(1);
  await expect
    .element(session.getByText(requested("Sonnet"), { exact: true }))
    .toBeVisible();
  await expect.element(recent.getByRole("article")).toHaveLength(0);

  await sessions.click();
  await expect.element(sidebar.getByRole("listitem")).toHaveLength(4);
  const tooltip = (name: string) =>
    sidebar.getByRole("button", { name, exact: true });
  const lines = (name: string) =>
    expect.poll(() =>
      tooltip(name).element().getAttribute("title")?.split("\n"),
    );
  await lines(explicit.title).toEqual(
    expect.arrayContaining(["Open Dough · Execution", requested("Opus")]),
  );
  await lines(implicit.title).toContain("Open Dough · Execution");
  await expect
    .element(tooltip(implicit.title))
    .not.toHaveAttribute("title", /Model:/);
  await lines(adHocTitle).toEqual(
    expect.arrayContaining(["Open Dough · Ad hoc", requested("Sonnet")]),
  );
});
