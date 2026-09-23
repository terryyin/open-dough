// The observable recovery journey for Pygardon, this dashboard's private
// third project, when its local authenticated read is unavailable. This is
// the private-transport analog of ./read-failure.spec.ts and
// ./read-failure-refresh.spec.ts: it proves, through a real browser page,
// that the failure/Retry UI those specs already prove for the public
// transport (`../src/App.tsx`'s `Attempt`/`ReadProblem` model, shared with
// the private transport since slice 3's ../src/privateRead.ts) already
// handles every `gh`-invocation failure category for Pygardon too --
// missing/denied/network/malformed-backlog causes all collapse server-side
// into one generic 502 (`../server/privateRead.ts`'s `respond()`, already
// proven at the raw-HTTP level in ./private-read-boundary.spec.ts), and a
// bounded stalled read ends the same way (../server/ghRead.ts's timeout,
// already proven at the process-lifecycle level in
// ./private-read-subprocess-lifecycle.spec.ts) -- without any production
// code change. Nothing here revokes real `gh` credentials; every failure is
// simulated with the controlled fake-`gh` fixture (./support/fakeGh.ts,
// driven through ./support/privateReadServer.ts's `startPrivateReadServer`),
// reused rather than duplicated.
//
// The public side of these journeys (selecting Open Dough/Doughnut while
// Pygardon is failing or reading) reuses ./githubOrigin.ts's existing route
// helpers unchanged. Their shared `closeOtherHosts` catch-all aborts every
// request whose URL does not start with "http://localhost", so this spec
// navigates to the isolated private-read server by its "localhost" alias
// rather than `PrivateReadServer.baseURL`'s literal "127.0.0.1" -- the exact
// same loopback socket, since Vite's `server.host`/`preview.host` of
// "127.0.0.1" (../vite.config.mts) accepts a connection addressed either
// way. Using the literal `baseURL` here would make the page's own
// same-origin fetch to `/__private-read` get caught and aborted by that same
// catch-all, alongside the actual GitHub hosts it exists to block.

import { expect, test, type Page } from "@playwright/test";
import { expectMembership, parts } from "./dashboardPage";
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

// Same loopback socket as `server.baseURL` -- see the header comment above
// for why this alias, and not the literal, is what this spec navigates to.
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
      await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

      await test.step("selecting Pygardon while gh is unavailable shows an actionable failure and no snapshot", async () => {
        await project.selectOption("pygardon");
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
        await expect(project).toBeEnabled();
        await project.focus();
        await expect(project).toBeFocused();
        await project.selectOption("doughnut");
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
        await project.selectOption("pygardon");
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

      await project.selectOption("pygardon");
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
