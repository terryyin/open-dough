// Pygardon's private-read recovery journey uses a controlled fake gh; no real
// credentials change. Server-side failure categories collapse into one 502,
// covered by private-read-boundary.spec.ts; subprocess timeout is covered by
// private-read-subprocess-lifecycle.spec.ts. Here the browser proves recovery,
// project switching, and preservation of the selected project's snapshot.
//
// Public reads reuse githubOrigin.ts. Its closeOtherHosts route aborts URLs
// outside "http://localhost", so navigate to that alias rather than the server's
// literal 127.0.0.1 baseURL. Both reach the same loopback socket, but only the
// alias lets same-origin /__private-read requests through the route guard.

import { expect, test, type Page } from "@playwright/test";
import { expectMembership, openDirection, parts } from "./dashboardPage";
import { publishMovingOrigin } from "./githubOrigin";
import {
  startPrivateReadServer,
  type PrivateReadServer,
} from "./support/privateReadServer";

const doughnutRepository = "nerds-odd-e/doughnut";

const openDoughRevision = "d0".repeat(20);
const openDoughTitle = "Open Dough's own queued story";
const openDoughBacklog = `# Product backlog

## Taken

## Backlog list

- [${openDoughTitle}](seeds/SEED-900-open-dough.md#queued) — SEED-900#queued
`;

const doughnutRevision = "d1".repeat(20);
const doughnutTitle = "Doughnut's own queued story";
const doughnutBacklog = `# Product backlog

## Taken

## Backlog list

- [${doughnutTitle}](seeds/SEED-901-doughnut.md#queued) — SEED-901#queued
`;

const pygardonRevision = "c1".repeat(20);
const pygardonTakenTitle = "Pygardon's own taken story";
const pygardonQueuedTitle = "Pygardon's own queued story";
const pygardonDirection =
  "Recover from a failed private read without losing project context.";
const pygardonBacklog = `# Product backlog

## Near-future direction

${pygardonDirection}

## Taken

- [${pygardonTakenTitle}](quick/200-pygardon-story/PLAN.md) — PYG-200#story

## Backlog list

- [${pygardonQueuedTitle}](seeds/SEED-200-pygardon.md#queued) — PYG-201#queued
`;

// Use the localhost alias accepted by the public-origin route guard above.
function runningAt(server: PrivateReadServer): string {
  return server.baseURL.replace("127.0.0.1", "localhost");
}

async function publishOpenDough(page: Page): Promise<void> {
  const openDough = await publishMovingOrigin(page);
  openDough.push(openDoughRevision, openDoughBacklog);
}

async function publishBothPublicProjects(page: Page): Promise<void> {
  await publishOpenDough(page);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(doughnutRevision, doughnutBacklog);
}

test.describe("private project recovery", () => {
  test("an unavailable Pygardon read shows an actionable, project-specific failure that a public project remains selectable through; restoring access and pressing Retry reads Pygardon; a later failed Refresh keeps only Pygardon's previous snapshot", async ({
    page,
  }) => {
    let server: PrivateReadServer | undefined;
    try {
      server = await startPrivateReadServer({ mode: "dev", port: 4298 });
      server.setControl({ mode: "error" });
      await publishBothPublicProjects(page);

      await page.goto(runningAt(server));
      const { project, direction, source, problem, retry, refresh } =
        parts(page);
      const pygardon = project.getByRole("radio", {
        name: "Pygardon",
        exact: true,
      });
      const selectedProject = project.getByRole("radio", { checked: true });
      await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

      await test.step("selecting Pygardon while gh is unavailable shows an actionable failure and no snapshot", async () => {
        await pygardon.check();
        await expect(problem).toContainText("Published work could not be read");
        await expect(problem).toContainText(
          "The local authenticated read failed.",
        );
        await expect(problem).toContainText(
          "No published work is shown, because none has been read.",
        );
        await expect(page.getByRole("button")).toHaveAccessibleName("Retry");
        await expect(page.getByRole("article")).toHaveCount(0);
        await expect(page.getByText("Near-future direction")).toHaveCount(0);
      });

      await test.step("the selector stays enabled and keyboard-operable, and a public project remains fully readable", async () => {
        await expect(selectedProject).toBeEnabled();
        await selectedProject.focus();
        await expect(selectedProject).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expectMembership(page, {
          taken: [],
          backlog: [doughnutTitle],
        });
        await expect(source).toContainText(doughnutRevision);
        await expect(problem).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: "Refresh" }),
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(
          0,
        );
      });

      await test.step("returning to Pygardon while access is still unavailable starts a fresh, still-failing read -- not stale Doughnut data", async () => {
        await pygardon.check();
        await expect(problem).toContainText(
          "The local authenticated read failed.",
        );
        await expect(page.locator("body")).not.toContainText(doughnutTitle);
        await expect(page.getByRole("article")).toHaveCount(0);
      });

      await test.step("restoring existing access and pressing Retry reads Pygardon's actual published work", async () => {
        server?.setControl({
          mode: "normal",
          revision: pygardonRevision,
          backlog: pygardonBacklog,
        });
        await retry.click();
        await expectMembership(page, {
          taken: [pygardonTakenTitle],
          backlog: [pygardonQueuedTitle],
        });
        await openDirection(page);
        await expect(direction).toContainText(pygardonDirection);
        await expect(source).toContainText(pygardonRevision);
        await expect(problem).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: "Refresh" }),
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(
          0,
        );
      });

      await test.step("a later failed Refresh keeps only Pygardon's previous snapshot, with the failure reported alongside it", async () => {
        server?.setControl({ mode: "error" });
        await refresh.click();
        await expect(problem).toContainText(
          "The local authenticated read failed.",
        );
        await expect(problem).toContainText(
          "What is shown is the earlier snapshot, retrieved at",
        );
        await expectMembership(page, {
          taken: [pygardonTakenTitle],
          backlog: [pygardonQueuedTitle],
        });
        await expect(source).toContainText(pygardonRevision);
        await expect(page.locator("body")).not.toContainText(doughnutTitle);
        await expect(page.locator("body")).not.toContainText(openDoughTitle);
        await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Refresh" })).toHaveCount(
          0,
        );
      });
    } finally {
      await server?.close();
    }
  });

  test("the bounded stalled-read timeout resolves into the same ordinary recoverable failure as any other cause, and Retry after restored access succeeds", async ({
    page,
  }) => {
    let server: PrivateReadServer | undefined;
    try {
      server = await startPrivateReadServer({
        mode: "dev",
        port: 4299,
        readTimeoutMs: 300,
      });
      server.setControl({ mode: "hang" });
      await publishOpenDough(page);

      await page.goto(runningAt(server));
      const { project, problem, retry } = parts(page);
      await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

      await project
        .getByRole("radio", { name: "Pygardon", exact: true })
        .check();
      await expect(problem).toContainText("Published work could not be read", {
        timeout: 10_000,
      });
      await expect(problem).toContainText(
        "The local authenticated read failed.",
      );
      await expect(page.getByRole("button")).toHaveAccessibleName("Retry");
      await expect(page.getByRole("article")).toHaveCount(0);

      server.setControl({
        mode: "normal",
        revision: pygardonRevision,
        backlog: pygardonBacklog,
      });
      await retry.click();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await expect(problem).toHaveCount(0);
    } finally {
      await server?.close();
    }
  });
});
