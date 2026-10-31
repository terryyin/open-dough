// What a journey expects of the Development and Intent perspectives
// (../src/PerspectiveSelect.tsx, ../src/IntentPerspective.tsx,
// ../src/dashboardRouteUrl.ts): the address that names them, and Intent's
// forthcoming content in place of Development's.

import { expect, type Page } from "@playwright/test";
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

// Intent shown for this project in place of Development's content: the
// selected project and perspective are clear, and the content says it is
// forthcoming without a count, a result, a claim that tests or Proof are
// absent, or a Structure destination.
export async function expectForthcomingIntent(page: Page, label: string) {
  const { board, development, direction, intent, intentChoice, perspective } =
    parts(page);
  await expect(perspective.getByRole("radio")).toHaveCount(2);
  await expect(
    perspective.getByRole("radio", { checked: true }),
  ).toHaveAccessibleName("Intent");
  await expect(intentChoice).toBeChecked();
  await expect(development).not.toBeChecked();
  await expect(intent.getByRole("heading", { level: 2 })).toHaveText("Intent");
  await expect(intent).toContainText(`Intent for ${label} is forthcoming.`);
  await expect(intent).toContainText(
    `This dashboard does not read ${label}'s tests yet`,
  );
  await expect(intent).toContainText(
    "Stories, sessions and near-future direction stay in Development.",
  );
  await expect(intent).not.toContainText(/\d/);
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
