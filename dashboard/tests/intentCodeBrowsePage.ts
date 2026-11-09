// Observations and interactions for a labelled code-source Intent location.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { browseSpec } from "./intentCodeBrowseFixtures.ts";
import {
  expandIntentGroup,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";

// A labelled Intent location lists its include-matched specs, omits helpers,
// and opens exact source text under that location's canonical path.
export async function expectLabelledEntrySource(
  intent: Locator,
  locationPath: string,
  label: string,
  listedSpec: string,
  omittedHelper: string,
) {
  const heading = intentLocationName(intent, locationPath);
  await expect(heading).toContainText(label);
  await expect(intentGroupToggle(intent, locationPath)).toHaveAccessibleName(
    `Expand ${label}`,
  );
  await heading.click();
  const summary = intent.getByRole("region", {
    name: "Summary",
    exact: true,
  });
  await expect(summary).toContainText(label);
  await expect(summary).toContainText(locationPath);
  await expandIntentGroup(intent, locationPath);
  await expect(
    intent.getByRole("button", {
      name: `${locationPath}/${omittedHelper}`,
      exact: true,
    }),
  ).toHaveCount(0);
  await intent
    .getByRole("button", {
      name: `${locationPath}/${listedSpec}`,
      exact: true,
    })
    .click();
  await expect(
    intent
      .getByLabel(`${locationPath}/${listedSpec} source`)
      .locator(".source-line-text"),
  ).toHaveText(browseSpec.split("\n"));
}
