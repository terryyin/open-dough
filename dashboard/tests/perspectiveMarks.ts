// Development and Intent meaning marks (../src/PerspectiveMarks.tsx): each
// perspective choice keeps its accessible name and shows one decorative SVG
// that differs from the other. Structure is not offered.

import { expect, type Locator } from "@playwright/test";

export async function expectPerspectiveMeaningMarks({
  development,
  intentChoice,
  perspective,
}: {
  readonly development: Locator;
  readonly intentChoice: Locator;
  readonly perspective: Locator;
}) {
  await expect(development).toHaveAccessibleName("Development");
  await expect(intentChoice).toHaveAccessibleName("Intent");
  await expect(
    development.page().getByRole("radio", { name: "Structure", exact: true }),
  ).toHaveCount(0);
  const developmentMark = perspective.locator(
    'svg[data-perspective-mark="development"]',
  );
  const intentMark = perspective.locator('svg[data-perspective-mark="intent"]');
  await expect(developmentMark).toHaveCount(1);
  await expect(intentMark).toHaveCount(1);
  await expect(developmentMark).toHaveAttribute("aria-hidden", "true");
  await expect(intentMark).toHaveAttribute("aria-hidden", "true");
  expect(await developmentMark.innerHTML()).not.toBe(
    await intentMark.innerHTML(),
  );
  await expect(perspective.locator("svg")).toHaveCount(2);
}
