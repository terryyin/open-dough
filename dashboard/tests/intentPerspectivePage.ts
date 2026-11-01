// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, Intent's
// not-configured content when the project publishes no intent locations,
// and the Test Optimization Candidates record view.

import { expect, type Locator, type Page } from "@playwright/test";
import { parts, shortRevision } from "./dashboardParts.ts";

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

// The candidates record region Intent shows for the selected project.
export function candidatesRecord(intent: Locator) {
  return intent.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
}

export async function expectCandidatesRevision(
  intent: Locator,
  revision: string,
) {
  const record = candidatesRecord(intent);
  await expect(record).toContainText(
    `Recorded at revision ${shortRevision(revision)}`,
  );
  await expect(
    record.locator("code").filter({ hasText: revision }),
  ).toHaveCount(1);
}
