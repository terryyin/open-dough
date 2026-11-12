// Observe malformed, external, and legacy records without inventing preparation
// or associated-plan evidence. Source bytes cross the shared reader boundary.
import { expect, type Locator } from "@playwright/test";
import { contentPathsRead, type CommittedOrigin } from "./committedOrigin.ts";
import { externalPlan, legacy, malformed } from "./storyReadinessFixture.ts";
import {
  canonicalRecord,
  inspectedDetail,
  storyCard,
} from "./storyCardControls.ts";
import { expectBadges } from "./storyCardFacts.ts";

export async function expectMalformedExternalAndLegacy(
  backlog: Locator,
  doughnutOrigin: CommittedOrigin,
) {
  const malformedCard = storyCard(backlog, malformed.title);
  await expectBadges(malformedCard, {
    absent: ["Not refined", "Not recorded"],
  });
  await expect(malformedCard.locator(".preparation-problem")).toContainText(
    "not valid JSON",
  );

  await inspectedDetail(malformedCard);
  const malformedSources = malformedCard.getByRole("list", {
    name: "Pinned source links",
  });
  await expect(canonicalRecord(malformedSources)).toHaveCount(1);
  await expect(
    malformedSources.getByRole("link", { name: /^Slice plan / }),
  ).toHaveCount(0);
  const legacyCard = storyCard(backlog, legacy.title);
  await expectBadges(legacyCard, { shown: ["Not recorded"] });

  await inspectedDetail(legacyCard);
  const legacySources = legacyCard.getByRole("list", {
    name: "Pinned source links",
  });
  await expect(canonicalRecord(legacySources)).toHaveCount(1);
  await expect(
    legacySources.getByRole("link", { name: /^Slice plan / }),
  ).toHaveCount(0);
  const externalCard = storyCard(backlog, externalPlan.title);
  await expectBadges(externalCard, { shown: ["Refined"] });
  const detail = await inspectedDetail(externalCard);
  await expect(detail.getByText("External reference")).toBeVisible();
  await expect(
    detail.getByRole("link", { name: /Slice plan/ }),
  ).toHaveAttribute("href", /example\.com\/plans\/external-only/);

  const doughnutPaths = contentPathsRead(doughnutOrigin);
  expect(doughnutPaths.some((path) => path.includes("example.com"))).toBe(
    false,
  );
}
