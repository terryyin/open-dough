import { createElement } from "react";
import { expect, test } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { SessionEntry } from "../../src/SessionEntry.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountBoard } from "../navigation/board-mount.ts";
import { boardReading as board } from "../navigation/board-reading-page.ts";
import {
  backlogCard,
  sessions,
  sidebar,
} from "../navigation/board-session-view.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { inertPageSessions } from "../sessions/inert-page-sessions.ts";

const requested = (model: string) => `Model: ${model} (requested)`;
const flags = ["--explore", "--borrow"];
const refinementRecords = () =>
  [
    { title: "Explore and Borrow", model: false, options: true },
    { title: "Explore, Borrow and Opus", model: true, options: true },
    { title: "No options", model: false, options: false },
    { title: "No options on Opus", model: true, options: false },
  ].map(({ title, model, options }, index) => {
    const work = story(title, 741 + index);
    const launch = makeMe.aLaunchRecord
      .refining(work)
      .inClaudeSession({ sessionId: `record-refinement-${index}` });
    if (model) launch.requestingModel("opus");
    if (options) launch.requestingOptions(flags);
    return { work, record: launch.please(), model, options };
  });

function executionRecords() {
  const execution = (work: ReturnType<typeof story>, sessionId: string) => ({
    work,
    launch: makeMe.aLaunchRecord.executing(work).inClaudeSession({ sessionId }),
  });
  const opus = execution(story("Build on Opus", 751), "explicit-model");
  const defaulted = execution(story("Build on Default", 752), "default-model");
  const maxed = execution(story("Build at max effort", 753), "max-effort");
  return [
    { work: opus.work, record: opus.launch.requestingModel("opus").please() },
    { work: defaulted.work, record: defaulted.launch.please() },
    { work: maxed.work, record: maxed.launch.requestingEffort("max").please() },
  ] as const;
}

const adHocTitle = "8 Jan, 10:00";
const admitted = story(adHocTitle, 754);
const adHocRecord = () =>
  makeMe.aLaunchRecord
    .adHoc({ title: adHocTitle, storyIdentity: admitted.identity })
    .inClaudeSession({ sessionId: "ad-hoc-model" })
    .requestingModel("sonnet")
    .please();

const observed = (records: readonly LaunchRecord[]) =>
  makeMe.aMachineAnswer.observingOpen(...records).please().records;

async function mountEntries(records: readonly LaunchRecord[]) {
  await mountComponent(
    createElement(PageReadsOnPage, {
      reads: pageReadsSupplying({}),
      children: createElement(ProjectsOnPage, {
        projects: [],
        replaceProjects: () => undefined,
        children: createElement(
          SessionsOnPage,
          { value: inertPageSessions },
          observed(records).map((record) =>
            createElement(SessionEntry, {
              key: record.session.sessionId,
              record,
              onStoryCard: record.request.workflow !== "ad-hoc",
            }),
          ),
        ),
      }),
    }),
  );
}

function sessionIdentity(entry: Locator, record: LaunchRecord) {
  return entry.getByText(`Session ${record.session.sessionId}`, {
    exact: true,
  });
}

function activate(control: Locator) {
  const button = control.element();
  if (!(button instanceof HTMLButtonElement))
    throw new Error("Expected a session control button.");
  button.click();
}

async function openDetails(
  entry: Locator,
  record: LaunchRecord,
  byKeyboard = false,
) {
  const control = entry.getByRole("button", {
    name: "Session details",
    exact: true,
  });
  await expect.element(control).toHaveAttribute("aria-expanded", "false");
  if (byKeyboard) {
    await expect.element(sessionIdentity(entry, record)).not.toBeVisible();
    control.element().focus();
    await userEvent.keyboard("{Enter}");
  } else {
    activate(control);
  }
  await expect.element(control).toHaveAttribute("aria-expanded", "true");
  await expect.element(sessionIdentity(entry, record)).toBeVisible();
}

async function showsWords(entry: Locator, prefix: string, words?: string) {
  if (words === undefined)
    await expect
      .element(entry.getByText(new RegExp(`^${prefix}:`)))
      .not.toBeInTheDocument();
  else
    await expect.element(entry.getByText(words, { exact: true })).toBeVisible();
}

test("refinement entries show exactly the model and options that each launch requested", async () => {
  const examples = refinementRecords();
  await mountEntries(examples.map(({ record }) => record));
  const entries = page.getByRole("article", { name: "Refinement session" });

  for (const [index, { record, model, options }] of examples.entries()) {
    const entry = entries.nth(index);
    await showsWords(entry, "Model", model ? requested("Opus") : undefined);
    await openDetails(entry, record, index === 0);
    await showsWords(
      entry,
      "Options",
      options ? "Options: --explore --borrow (requested)" : undefined,
    );
  }
});

test("execution and ad hoc entries show the requested model and disclose effort only when recorded", async () => {
  const [opus, defaulted, maxed] = executionRecords();
  const adHoc = adHocRecord();
  await mountEntries([opus.record, defaulted.record, maxed.record, adHoc]);
  const entries = page.getByRole("article", { name: "Execution session" });
  await showsWords(entries.nth(0), "Model", requested("Opus"));
  await showsWords(entries.nth(1), "Model");
  for (const [entry, record, effort] of [
    [entries.nth(1), defaulted.record, undefined],
    [entries.nth(2), maxed.record, "Effort: max (requested)"],
  ] as const) {
    await openDetails(entry, record);
    await showsWords(entry, "Effort", effort);
  }
  await showsWords(
    page.getByRole("article", { name: `Ad hoc session for ${adHocTitle}` }),
    "Model",
    requested("Sonnet"),
  );
});

test("the Board lists each launch with its own story, and the sidebar names its own requested model", async () => {
  const refinements = refinementRecords().filter(
    ({ model, options }) => model === options,
  );
  const executions = executionRecords();
  const adHoc = adHocRecord();
  const examples = [...refinements, ...executions];
  const records = observed([...examples.map(({ record }) => record), adHoc]);
  await mountBoard(
    [
      boardWork(
        examples.map(({ work }) => work),
        { taken: [admitted] },
      ),
    ],
    { width: window.innerWidth, height: window.innerHeight },
    { records, launched: records },
  );

  for (const { work, record } of examples) {
    const entries = backlogCard(work.title)
      .getByRole("list", { name: "Sessions", exact: true })
      .getByRole("article");
    await expect.element(entries).toHaveLength(1);
    const workflow =
      record.request.workflow === "refinement" ? "Refinement" : "Execution";
    await expect.element(entries).toHaveAccessibleName(`${workflow} session`);
    await expect.element(sessionIdentity(entries, record)).toBeInTheDocument();
  }
  const adHocEntry = board
    .column("Taken")
    .getByRole("article", { name: adHocTitle, exact: true })
    .getByRole("article", { name: "Ad hoc session", exact: true });
  await expect.element(adHocEntry).toHaveLength(1);
  await expect.element(sessionIdentity(adHocEntry, adHoc)).toBeInTheDocument();
  const recentlyDone = board.column("Recently done");
  await expect.element(recentlyDone).toBeInTheDocument();
  await expect.element(recentlyDone.getByRole("article")).toHaveLength(0);

  await expect.element(sessions).toBeVisible();
  activate(sessions);
  await expect.element(sidebar.getByRole("listitem")).toHaveLength(6);
  const title = (name: string) =>
    sidebar.getByRole("button", { name, exact: true });
  const lines = (name: string) =>
    expect.poll(() => title(name).element().getAttribute("title")?.split("\n"));
  const [explicit, implicit] = executions;
  await lines(explicit.work.title).toEqual(
    expect.arrayContaining(["Open Dough · Execution", requested("Opus")]),
  );
  await lines(implicit.work.title).toContain("Open Dough · Execution");
  await expect
    .element(title(implicit.work.title))
    .not.toHaveAttribute("title", /Model:/);
  await lines(adHocTitle).toEqual(
    expect.arrayContaining(["Open Dough · Ad hoc", requested("Sonnet")]),
  );
});
