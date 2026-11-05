// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, Intent group
// and folder expand helpers for the locations column, how a location header
// reads, how many Intent locations reads the page asks, and Intent's
// not-configured content when the project publishes no intent locations.
// Reading-mode strip helpers: ./intentModePage.ts. Purpose and Proof reading
// helpers: ./intentFileReadingPage.ts.

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

// One configured Intent location's header: its toggle and selectable name.
export function intentLocationHeader(intent: Locator, locationPath: string) {
  return intentGroupToggle(intent, locationPath).locator("xpath=..");
}

// How a location header reads: its own background, its change mark, whether
// its toggle and name let that background through, and whether it spans its
// group's full width.
export function locationHeaderLook(header: Locator) {
  return header.evaluate((element) => {
    const style = getComputedStyle(element);
    const group = element.parentElement ?? element;
    const groupStyle = getComputedStyle(group);
    const inner =
      group.clientWidth -
      Number.parseFloat(groupStyle.paddingLeft) -
      Number.parseFloat(groupStyle.paddingRight);
    return {
      background: style.backgroundColor,
      mark: style.boxShadow,
      controlsShowHeader: [...element.children].every(
        (child) =>
          getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
      ),
      fullWidth: Math.abs(element.getBoundingClientRect().width - inner) < 1,
    };
  });
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

// How many Intent locations reads, with their proof, the page has asked.
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
// locations are configured, naming the setting and file, without a claim that
// tests or Proof are absent, or a Structure destination.
export async function expectNotConfiguredIntent(page: Page, label: string) {
  const { board, development, direction, intent, intentChoice, perspective } =
    parts(page);
  await expect(perspective.getByRole("radio")).toHaveCount(2);
  await expect(
    perspective.getByRole("radio", { checked: true }),
  ).toHaveAccessibleName("Intent");
  await expect(intentChoice).toBeChecked();
  await expect(development).not.toBeChecked();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveCount(0);
  await expect(intent).toContainText(
    `No intent locations are configured for ${label}.`,
  );
  await expect(intent).toContainText("intent.locations");
  await expect(intent).toContainText(".planning/open-dough.json");
  await expect(intent.getByRole("list")).toHaveCount(0);
  await expect(intent).not.toContainText(
    /no (tests|proof)|(tests|proof) (are|is) (absent|missing)|passed|failed/i,
  );
  await expect(page.getByText(/Structure/)).toHaveCount(0);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(board).toBeHidden();
  await expect(direction).toBeHidden();
  await expect(
    page.getByRole("button", { name: /^Start session in / }),
  ).toBeHidden();
}
