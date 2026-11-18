// How the page paints its parts, as the browser computes them, beside the
// colour tokens the page names.

import { expect, type Locator, type Page } from "@playwright/test";

// The colour a page colour token resolves to, as computed styles report it.
export function tokenColour(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, token);
}

export const colourOf = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).color);

export const backgroundOf = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).backgroundColor);

// The first highlighted token in a source reading whose text matches `text`.
export const sourceToken = (source: Locator, text: RegExp) =>
  source.locator(".source-line-text span").filter({ hasText: text }).first();

// Kind styling: a keyword token and a string token must not share one colour.
export async function expectKeywordAndStringColours(
  source: Locator,
  keyword: RegExp,
  stringLiteral: RegExp,
) {
  const keywordToken = sourceToken(source, keyword);
  const stringToken = sourceToken(source, stringLiteral);
  await expect(keywordToken).toBeVisible();
  await expect(stringToken).toBeVisible();
  expect(await colourOf(keywordToken)).not.toBe(await colourOf(stringToken));
}

// A session entry inside a card is set off from the card on the shared raised surface
// and reads in the card's own text, while its local-launch note stays quiet.
export async function expectSessionEntrySetOff(entry: Locator) {
  const page = entry.page();
  const card = entry.locator("xpath=ancestor::article[1]");
  const quiet = await tokenColour(page, "--quiet");
  expect(await backgroundOf(entry)).toBe(
    await tokenColour(page, "--raised-surface"),
  );
  const cardColour = await colourOf(card);
  expect(cardColour).not.toBe(quiet);
  expect(await colourOf(entry)).toBe(cardColour);
  expect(await colourOf(entry.locator(".launch-local").first())).toBe(quiet);
}
