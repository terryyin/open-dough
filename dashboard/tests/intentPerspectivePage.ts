// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, Intent group
// expand helpers for the locations column, how many Intent locations reads
// the page asks, and Intent's not-configured content when the project
// publishes no intent locations.

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

// Header control for one configured Intent location path.
export function intentGroupToggle(intent: Locator, locationPath: string) {
  const bodyId = `${intentLocationIdPrefix(locationPath)}-body`;
  return intent.locator(
    `button.intent-location-toggle[aria-controls="${bodyId}"]`,
  );
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
