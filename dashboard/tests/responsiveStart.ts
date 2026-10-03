// Shared by the responsive start specs (./responsive-session-start*.spec.ts,
// ./responsive-session-reconciliation*.spec.ts): a test against a real start
// origin, the stories it publishes, commits made beside them, the
// acceptance answers held from the page, and what a submitted dialog, a
// protected story, and the rest of the page show meanwhile.

import type { Locator, Page } from "@playwright/test";
import { agentAcceptEndpoint } from "../src/agentLaunch.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect, test as base } from "./dashboardTest.ts";
import {
  otherQueuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

// A test whose dashboard uses the machine of a real bare origin
// (./support/startOrigin.ts) with the installed starts.
export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});

export const instruction = "Keep this exact instruction.";

// Lets the page's launch requests reach the service at once and holds each
// answer from the page until `release`; `reached` settles once the service
// answered one.
export async function holdAcceptanceAnswers(page: Page) {
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let answered = () => {};
  const reached = new Promise<void>((resolve) => {
    answered = resolve;
  });
  await page.route(
    (url) => url.pathname === agentAcceptEndpoint,
    async (route) => {
      const response = await route.fetch();
      answered();
      await held;
      await route.fulfill({ response });
    },
  );
  return { reached, release };
}

// Counts the launch requests the page sends from now on.
export function countAcceptanceRequests(page: Page) {
  let sent = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === agentAcceptEndpoint) sent += 1;
  });
  return () => sent;
}

// Opens the stories as GitHub publishes the origin, following its pushes:
// Story A in the Backlog (`story`) and once Taken (`takenStory`), and Story B.
export async function openStories(page: Page, origin: StartOrigin) {
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const { backlog, taken } = parts(page);
  const story = backlog.getByRole("article", { name: "Story A" });
  const takenStory = taken.getByRole("article", { name: "Story A" });
  const other = backlog.getByRole("article", { name: "Story B" });
  await expect(story).toBeVisible();
  await expect(other).toBeVisible();
  return { published, story, takenStory, other };
}

// A submitted dialog: Starting…, nothing to press or change, Escape ignored.
export async function expectSubmitted(page: Page, dialog: Locator) {
  await expect(
    dialog.getByRole("button", { name: "Starting…" }),
  ).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(dialog).toContainText(
    "Startup is underway and can no longer be cancelled here.",
  );
  await expect(dialog.getByRole("textbox")).toBeDisabled();
  await expect(dialog.getByRole("combobox", { name: "Host" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
}

// Every action button on the card is unavailable; its source links stay.
export async function expectProtected(card: Locator) {
  await expect(card.getByRole("button").first()).toBeVisible();
  await expect(card.getByRole("button", { disabled: false })).toHaveCount(0);
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeDisabled();
  // Source links, secondary detail otherwise, stay readable on the protected
  // card rather than behind its unavailable Inspect story.
  const link = card
    .getByRole("list", { name: "Source links" })
    .getByRole("link", { name: /^Canonical record / });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /.+/);
}

// The other story and project navigation still work.
export async function expectOthersWork(
  page: Page,
  other: Locator,
  story: Locator,
) {
  const { project } = parts(page);
  await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
  // An unprotected card keeps its source links in its detail.
  await expect(other.getByRole("list", { name: "Source links" })).toHaveCount(
    0,
  );
  await other.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    other.getByRole("button", { name: "Hide detail" }),
  ).toBeVisible();
  await other.getByRole("button", { name: "Hide detail" }).click();
  await other.getByRole("button", { name: "Start execution" }).click();
  const otherDialog = page.getByRole("dialog");
  await expect(otherDialog).toContainText(otherQueuedIdentity);
  await otherDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(otherDialog).toBeHidden();
  await project.getByRole("radio", { name: "Doughnut" }).click();
  await expect(story).toBeHidden();
  await project.getByRole("radio", { name: "Open Dough" }).click();
  await expect(story).toBeVisible();
}

// A commit in the origin with `parent`'s tree and `parent` as its only
// parent, on no branch: a descendant of `parent`, unrelated to its siblings.
export async function commitOn(
  origin: StartOrigin,
  parent: string,
): Promise<string> {
  return (
    await origin.originGit(
      "-c",
      "user.name=Another Writer",
      "-c",
      "user.email=writer@example.test",
      "commit-tree",
      `${parent}^{tree}`,
      "-p",
      parent,
      "-m",
      "another writer's commit",
    )
  ).trim();
}
