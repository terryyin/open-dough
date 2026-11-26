// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, Intent group
// and folder expand helpers for the locations column, how many Intent
// locations reads the page asks, Intent's not-configured content when the
// project publishes no intent locations, the Purpose of the selected file,
// and the notice of a newer revision (../src/IntentRevisionNotice.tsx).
// Reading-mode strip helpers: ./intentModePage.ts. The reading pane's scroll
// place: ./intentReadingPlacePage.ts.

import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { countAuthenticatedReads } from "./support/frontendAuthenticatedReadControl.ts";

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

function intentLocationRow(intent: Locator, locationPath: string) {
  const path = JSON.stringify(locationPath);
  return intent.locator(
    `li[data-folder-path=${path}] > [data-intent-folder-cue="root"]`,
  );
}

const disclosure = (row: Locator) =>
  row.locator(":scope > button[aria-expanded]");
const locationName = (row: Locator) =>
  row.locator(":scope > button[aria-pressed]");

// Controls for observing a configured location without changing disclosure.
export function intentGroupToggle(intent: Locator, locationPath: string) {
  return disclosure(intentLocationRow(intent, locationPath));
}

export function intentLocationName(intent: Locator, locationPath: string) {
  return locationName(intentLocationRow(intent, locationPath));
}

async function expandToggle(toggle: Locator) {
  await expect(toggle).toBeVisible();
  if ((await toggle.getAttribute("aria-expanded")) === "false")
    await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

async function revealLocationRow(intent: Locator, locationPath: string) {
  const row = intentLocationRow(intent, locationPath);
  // A configured row can be inside a closed folder. Wait for its real
  // identity before acting, since the provisional tree can have a plain folder.
  await expect(row).toBeAttached();
  const ancestors = row.locator(
    "xpath=ancestor::li[@data-folder-path][position() > 1]",
  );
  for (const ancestor of await ancestors.all())
    await expandToggle(disclosure(ancestor.locator(":scope > div")));
  return row;
}

export async function revealIntentLocation(
  intent: Locator,
  locationPath: string,
) {
  return locationName(await revealLocationRow(intent, locationPath));
}

// Selectable name for one Intent folder under the shared file tree.
export function intentFolderName(intent: Locator, path: string) {
  return locationName(
    intent.locator(`li[data-folder-path=${JSON.stringify(path)}] > div`),
  );
}

// Disclose the location after revealing its ancestors.
export async function expandIntentGroup(intent: Locator, locationPath: string) {
  await expandToggle(disclosure(await revealLocationRow(intent, locationPath)));
}

// The folder toggles inside one expanded Intent location's body.
function intentFolderToggles(intent: Locator, locationPath: string) {
  return intent
    .locator(`li[data-folder-path=${JSON.stringify(locationPath)}] > ul`)
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
export const countLocationsReads = (page: Page) =>
  countAuthenticatedReads(
    page,
    (params) => params.get("intent") === "locations",
  );

// Only top-level folders are visible when the repository tree first opens.
export async function expectIntentGroupsCollapsed(intent: Locator) {
  const toggles = intent.locator("button.story-review-folder:visible");
  await expect(toggles.first()).toBeVisible();
  for (const toggle of await toggles.all())
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
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
    `No Intent locations are configured for ${label}.`,
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

// Purpose and Proof tabs of the selected file.
export function fileReadingTab(intent: Locator, name: "Purpose" | "Proof") {
  return intent
    .getByRole("tablist", { name: "Purpose and Proof", exact: true })
    .getByRole("tab", { name, exact: true });
}

export const openFileProof = (page: Page) =>
  fileReadingTab(parts(page).intent, "Proof").click();

export const expectFileProofShown = (page: Page) =>
  expect(proofRegion(parts(page).intent)).toBeVisible();

// The notice that a newer revision than Intent's reading is available.
export function revisionNotice(intent: Locator) {
  return intent
    .getByRole("status")
    .filter({ hasText: "New revision available" });
}

// The accepted locations revision, independently of a selected file or CI.
export const browserRevision = (intent: Locator) =>
  intent.getByLabel("Test browser revision", { exact: true });
