// Intent file choices and source readings, shared by Code, Gherkin, Purpose,
// revision journeys and candidate records (../src/IntentSourceLines.tsx).

import { expect, type Locator } from "@playwright/test";
import {
  expandIntentGroup,
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";

// Scope is the locations tree or the candidate entry that offers this file.
// CI table destinations belong to intentCiProofPage.ts's openCiEntry.
export const sourceFile = (scope: Locator, path: string) =>
  scope.getByRole("button", { name: path, exact: true });

export const fileSource = (intent: Locator, path: string) =>
  intent.getByLabel(`${path} source`, { exact: true });

export const sourceLineText = (source: Locator) =>
  source.locator(".source-line-text");

export const sourceLineNumbers = (source: Locator) =>
  source.locator(".source-line-number");

export const sourceTargetLine = (source: Locator) =>
  source.locator(".source-line.is-target");

export const sourceText = (source: Locator) =>
  sourceLineText(source).evaluateAll((lines) =>
    lines.map((line) => line.textContent).join("\n"),
  );

// The case target is unique, identified as the current location and in view.
export async function expectSourceTargetLine(source: Locator, line: number) {
  const target = sourceTargetLine(source);
  await expect(target).toHaveCount(1);
  await expect(target).toHaveAttribute("data-line", String(line));
  await expect(target).toHaveAttribute("aria-current", "location");
  await expect(target).toBeInViewport();
  await expect(sourceLineNumbers(target)).toHaveText(String(line));
}

// A labelled Intent location lists its include-matched specs, omits helpers,
// and opens exact source text under that location's canonical path.
export async function expectLabelledEntrySource(
  intent: Locator,
  locationPath: string,
  label: string,
  listedSpec: string,
  omittedHelper: string,
  expectedLines: readonly string[],
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
    sourceFile(intent, `${locationPath}/${omittedHelper}`),
  ).toHaveCount(0);
  await sourceFile(intent, `${locationPath}/${listedSpec}`).click();
  await expect(
    sourceLineText(fileSource(intent, `${locationPath}/${listedSpec}`)),
  ).toHaveText(expectedLines);
}
