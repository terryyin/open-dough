// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, Intent group
// and folder expand helpers for the locations column, how many Intent
// locations reads the page asks, Intent's not-configured content when the
// project publishes no intent locations, the Purpose of the selected file
// and the pane that scrolls its reading, and the notice of a newer revision (../src/IntentRevisionNotice.tsx).
// Reading-mode strip helpers: ./intentModePage.ts. How a location header
// reads: ./intentLocationHeaderLook.ts.

import { expect, type Locator, type Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { intentLocationIdPrefix } from "../src/intentLocationIds.ts";
import { parts } from "./dashboardParts.ts";

// The project, Development's view and the perspective the address names.
export function expectAddress(
  page: Page,
  expected: {
    readonly project: string | null;
    readonly view?: string | null;
    readonly perspective: string | null;
  },
) {
  const params = new URL(page.url()).searchParams;
  expect({
    project: params.get("project"),
    view: params.get("view"),
    perspective: params.get("perspective"),
  }).toEqual({ view: null, ...expected });
}

// Toggle disclosure for one configured Intent location path (expansion only).
export function intentGroupToggle(intent: Locator, locationPath: string) {
  const bodyId = `${intentLocationIdPrefix(locationPath)}-body`;
  return intent.locator(
    `button.intent-location-toggle[aria-controls="${bodyId}"]`,
  );
}

// Selectable name for one configured Intent location path.
export function intentLocationName(intent: Locator, locationPath: string) {
  return intent.locator(
    `button.intent-location-name[data-location-path="${locationPath}"]`,
  );
}

// Selectable name for one Intent folder under the shared file tree.
export function intentFolderName(intent: Locator, folderName: string) {
  return intent
    .locator("button.story-review-folder-name")
    .filter({ hasText: folderName });
}

// Expand the owning Intent group when it is collapsed (exclusive expand).
export async function expandIntentGroup(intent: Locator, locationPath: string) {
  const toggle = intentGroupToggle(intent, locationPath);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

// Collapse the open Intent group when it is expanded.
export async function collapseIntentGroup(
  intent: Locator,
  locationPath: string,
) {
  const toggle = intentGroupToggle(intent, locationPath);
  if ((await toggle.getAttribute("aria-expanded")) === "true") {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
}

// The folder toggles inside one expanded Intent location's body.
function intentFolderToggles(intent: Locator, locationPath: string) {
  return intent
    .locator(`[id="${intentLocationIdPrefix(locationPath)}-body"]`)
    .locator("button.story-review-folder");
}

// Every folder in one expanded Intent location shows collapsed: only its
// outermost folders are visible, each with its toggle closed.
export async function expectIntentFoldersCollapsed(
  intent: Locator,
  locationPath: string,
) {
  const toggles = intentFolderToggles(intent, locationPath);
  await expect(toggles.first()).toBeVisible();
  const count = await toggles.count();
  for (let i = 0; i < count; i += 1) {
    await expect(toggles.nth(i)).toHaveAttribute("aria-expanded", "false");
  }
}

// Open every folder in one expanded Intent location by its toggle, outer
// folders first, so the journey reads the whole tree.
export async function expandIntentFolders(
  intent: Locator,
  locationPath: string,
) {
  const closed = intentFolderToggles(intent, locationPath).and(
    intent.locator('button[aria-expanded="false"]:visible'),
  );
  while ((await closed.count()) > 0) {
    const toggle = closed.first();
    const controls = await toggle.getAttribute("aria-controls");
    await toggle.click();
    await expect(
      intent.locator(`button[aria-controls="${controls}"]`),
    ).toHaveAttribute("aria-expanded", "true");
  }
}

// How many Intent locations reads the page has asked.
export function countLocationsReads(page: Page) {
  let reads = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    ) {
      reads += 1;
    }
  });
  return () => reads;
}

// Every Intent group header starts collapsed with no file/list body shown.
export async function expectIntentGroupsCollapsed(intent: Locator) {
  const toggles = intent.locator("button.intent-location-toggle");
  await expect(toggles.first()).toBeVisible();
  const count = await toggles.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(toggles.nth(i)).toHaveAttribute("aria-expanded", "false");
  }
  await expect(intent.locator(".intent-location-body")).toHaveCount(0);
}

// Intent shown for this project in place of Development's content: the
// selected project and perspective are clear, and the content says no intent
// locations are configured, naming the setting and file, without that
// explanation claiming tests or Purpose/Proof are absent, or a Structure
// destination. CI status of the judged branch sits beside the explanation as
// Intent's homepage (may name Failed, Proof, Check again).
export async function expectNotConfiguredIntent(page: Page, label: string) {
  const { board, development, direction, intent, intentChoice, perspective } =
    parts(page);
  await expect(perspective.getByRole("radio")).toHaveCount(2);
  await expect(
    perspective.getByRole("radio", { checked: true }),
  ).toHaveAccessibleName("Intent");
  await expect(intentChoice).toBeChecked();
  await expect(development).not.toBeChecked();
  await expect(
    intent.getByRole("heading", { name: "No story selected", exact: true }),
  ).toBeVisible();
  const explanation = intent.getByText(
    `No intent locations are configured for ${label}.`,
  );
  await expect(explanation).toBeVisible();
  await expect(intent).toContainText("intent.locations");
  await expect(intent).toContainText(".planning/open-dough.json");
  await expect(intent.getByRole("list")).toHaveCount(0);
  await expect(explanation).not.toContainText(
    /no (tests|proof)|(tests|proof) (are|is) (absent|missing)|passed|failed/i,
  );
  // CI status sits beside a settled not-configured explanation; when the
  // published read has not settled (work unread), Intent withholds it so a
  // cold open does not double-judge.
  await expect(page.getByText(/Structure/)).toHaveCount(0);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(board).toBeHidden();
  await expect(direction).toBeHidden();
  await expect(
    page.getByRole("button", { name: /^Start session in / }),
  ).toBeHidden();
}

// Intent's Purpose of the selected file (../src/IntentFileReading.tsx).
export function purposeRegion(intent: Locator) {
  return intent.getByRole("region", { name: "Purpose", exact: true });
}

// Intent's Proof of the selected file (../src/IntentFileReading.tsx).
export function proofRegion(intent: Locator) {
  return intent.getByRole("region", { name: "Proof", exact: true });
}

// The pane that scrolls the selected file's reading.
export const intentReadingPane = (intent: Locator) =>
  intent.locator(".intent-reading");

export const intentReadingScroll = (intent: Locator) =>
  intentReadingPane(intent).evaluate((element) => element.scrollTop);

// The caller's independently observed place remains after the transition.
export async function expectReadingOffset(intent: Locator, offset: number) {
  expect(await intentReadingScroll(intent)).toBe(offset);
}

// Scrolls the reading pane halfway, as the developer reading would, and
// returns the offset it came to rest at.
export async function scrollIntentReadingHalfway(intent: Locator) {
  const offset = await intentReadingPane(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        const most = element.scrollHeight - element.clientHeight;
        if (most < 40) {
          resolve(0);
          return;
        }
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({ top: Math.floor(most / 2) });
      }),
  );
  expect(offset).toBeGreaterThan(20);
  return offset;
}

// Purpose and Proof tabs of the selected file.
export function fileReadingTab(intent: Locator, name: "Purpose" | "Proof") {
  return intent
    .getByRole("tablist", { name: "Purpose and Proof", exact: true })
    .getByRole("tab", { name, exact: true });
}

// The notice that a newer revision than Intent's reading is available.
export function revisionNotice(intent: Locator) {
  return intent
    .getByRole("status")
    .filter({ hasText: "New revision available" });
}

// The accepted locations revision, independently of a selected file or CI.
export const browserRevision = (intent: Locator) =>
  intent.getByLabel("Test browser revision", { exact: true });
