import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { ciReadingText } from "./intent-attempt-proof-page.ts";

export const evidenceLabels = (region: Locator, name = "CI evidence") =>
  region.getByRole("list", { name, exact: true });

function heardWords(item: Element) {
  return [...item.querySelectorAll(".intent-evidence-label-heard")].map(
    (node) => ciReadingText(node.textContent),
  );
}

export async function expectEvidenceLabels(
  strip: Locator,
  names: readonly string[],
) {
  await expect
    .poll(() =>
      strip
        .getByRole("listitem")
        .elements()
        .map((item) => ({
          heard: heardWords(item),
          ariaLabel: item.getAttribute("aria-label"),
        })),
    )
    .toEqual(names.map((name) => ({ heard: [name], ariaLabel: null })));
}

export async function evidenceLabel(region: Locator, name: string) {
  const named = () =>
    region
      .getByRole("listitem")
      .elements()
      .filter((item) => heardWords(item).some((heard) => heard === name));
  await expect.poll(() => named().length).toBe(1);
  const label = named()[0];
  if (label === undefined) throw new Error(`No evidence label named ${name}`);
  return page.elementLocator(label);
}

export function labelWords(label: Locator) {
  return ciReadingText(
    label.element().querySelector(".intent-evidence-label-words")?.textContent,
  );
}

export async function expectInFull(label: Locator, full: string) {
  await expect
    .poll(() => {
      const item = label.element();
      return {
        words: [...item.querySelectorAll(".intent-evidence-label-full")].map(
          (node) => ciReadingText(node.textContent),
        ),
        titles: [
          ...item.querySelectorAll(".intent-evidence-label-content"),
        ].map((node) => node.getAttribute("title")),
      };
    })
    .toEqual({ words: [full], titles: [full] });
}

export async function expectLabelInFull(
  region: Locator,
  name: string,
  full: string,
) {
  await expectInFull(await evidenceLabel(region, name), full);
}
