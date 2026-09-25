// Observe malformed, external, and legacy records without inventing preparation
// or associated-plan evidence. Source bytes cross the shared reader boundary.
import { expect, type Locator } from "@playwright/test";
import { contentPathsRead, type CommittedOrigin } from "./committedOrigin.ts";
import { externalPlan, legacy, malformed } from "./storyReadinessFixture.ts";

export async function expectMalformedExternalAndLegacy(
  backlog: Locator,
  doughnutOrigin: CommittedOrigin,
) {
  const malformedCard = backlog.getByRole("article", {
    name: malformed.title,
  });
  await expect(
    malformedCard.getByText("Not refined", { exact: true }),
  ).toHaveCount(0);
  await expect(
    malformedCard.getByText("Not recorded", { exact: true }),
  ).toHaveCount(0);
  await expect(malformedCard.locator(".preparation-problem")).toContainText(
    "not valid JSON",
  );

  await expect(
    malformedCard.getByRole("link", { name: /^Slice plan / }),
  ).toHaveCount(0);
  const legacyCard = backlog.getByRole("article", { name: legacy.title });
  await expect(
    legacyCard.getByText("Not recorded", { exact: true }),
  ).toBeVisible();

  await expect(
    legacyCard.getByRole("link", { name: /^Slice plan / }),
  ).toHaveCount(0);
  const externalCard = backlog.getByRole("article", {
    name: externalPlan.title,
  });
  await expect(
    externalCard.getByText("Refined", { exact: true }),
  ).toBeVisible();
  await externalCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = externalCard.getByRole("region", {
    name: `Detail for ${externalPlan.title}`,
  });
  await expect(detail.getByText("External reference")).toBeVisible();
  await expect(
    detail.getByRole("link", { name: /Slice plan/ }),
  ).toHaveAttribute("href", /example\.com\/plans\/external-only/);

  const doughnutPaths = contentPathsRead(doughnutOrigin);
  expect(doughnutPaths.some((path) => path.includes("example.com"))).toBe(
    false,
  );
}
