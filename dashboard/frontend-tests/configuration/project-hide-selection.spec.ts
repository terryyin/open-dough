import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import {
  backToDashboard,
  openSystemSettings,
  settingsButton,
  settingsRegion,
} from "./system-settings-controls.ts";
import {
  changePageAddress,
  projectChoice,
  projectFacts,
  settingsWork,
} from "./system-settings-frame.ts";
import { settingsReplies } from "./system-settings-reads.ts";

test("hiding the chosen project selects its next neighbour and hidden history or links cannot open it", async () => {
  const [openDough, ...otherWork] = settingsWork;
  let projects = settingsWork.map(({ source }) => source);
  const setHidden = vi.fn((id: string, hidden: boolean) => {
    projects = projects.map((project) =>
      project.id === id ? { ...project, hidden } : project,
    );
    return Promise.resolve(projects);
  });
  await mountBoardFrame(
    openDough,
    { width: 1440, height: 900 },
    "stories",
    {},
    {
      otherWork,
      settingsSources: settingsReplies({
        read: () =>
          Promise.resolve(settingsWork.map((work) => projectFacts(work))),
        setHidden,
      }),
    },
  );
  const visibility = (action: "Hide" | "Show", name: string) =>
    page.getByRole("button", {
      name: `${action} project ${name}`,
      exact: true,
    });
  const taken = page.getByRole("region", { name: "Taken", exact: true });
  const allHidden = page.getByRole("heading", {
    name: "All projects are hidden",
    exact: true,
  });
  const address = () => location.search;

  await userEvent.click(projectChoice("Doughnut"));
  await expect.element(projectChoice("Doughnut")).toBeChecked();
  await openSystemSettings();
  await userEvent.click(visibility("Hide", "Doughnut"));
  await expect.element(visibility("Show", "Doughnut")).toBeVisible();
  expect(setHidden).toHaveBeenCalledWith("doughnut", true);
  await userEvent.click(backToDashboard);
  await expect.element(projectChoice("Pygardon")).toBeChecked();
  expect(address()).toBe("?project=pygardon");

  history.back();
  await expect.element(projectChoice("Open Dough")).toBeChecked();
  await expect.element(projectChoice("Doughnut")).not.toBeInTheDocument();
  for (const perspective of ["", "&perspective=intent"]) {
    changePageAddress(`project=doughnut${perspective}`);
    await expect
      .poll(address)
      .toBe(perspective === "" ? "" : "?perspective=intent");
    await expect.element(projectChoice("Open Dough")).toBeChecked();
  }

  await openSystemSettings();
  for (const name of ["Open Dough", "Pygardon", "Terry Talks"]) {
    await userEvent.click(visibility("Hide", name));
    await expect.element(visibility("Show", name)).toBeVisible();
  }
  await expect
    .poll(() => settingsRegion("Projects").getByRole("listitem").elements())
    .toHaveLength(4);
  await expect
    .element(
      page.getByText("No projects configured. Add a project to get started."),
    )
    .not.toBeInTheDocument();
  await userEvent.click(backToDashboard);
  await expect.element(allHidden).toBeVisible();
  await expect
    .element(page.getByRole("heading", { name: "No projects configured" }))
    .not.toBeInTheDocument();
  expect(page.getByRole("radio").elements()).toHaveLength(0);
  await expect.element(taken).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("region", { name: "Backlog list", exact: true }))
    .not.toBeInTheDocument();
  await expect.element(settingsButton).toHaveFocus();

  changePageAddress("project=open-dough&perspective=intent");
  await expect.poll(address).toBe("");
  await expect.element(allHidden).toBeVisible();
  await expect.element(taken).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .not.toBeInTheDocument();
  await openSystemSettings();
  await userEvent.click(visibility("Show", "Pygardon"));
  await expect.element(visibility("Hide", "Pygardon")).toBeVisible();
  await userEvent.click(backToDashboard);
  await expect.element(projectChoice("Pygardon")).toBeChecked();
  await expect.element(taken).toBeVisible();
});
