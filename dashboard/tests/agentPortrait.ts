// What a card shows beside its recorded agent's name, mode, and host.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// The approved portrait beside a card's recorded agent name: the tile of its
// atlas that the fixed agent rotation assigns to that name (six to an atlas,
// three columns by two rows, each tile's center square shown).
export async function expectPortrait(
  card: Locator,
  agent: string,
  { atlas, position }: { atlas: number; position: string },
) {
  const group = card.locator(".owner-agent");
  await expect(group).toHaveText(agent);
  const portrait = group.locator(".agent-portrait");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("aria-hidden", "true");
  await expect(portrait).toHaveCSS(
    "background-image",
    new RegExp(`/agent-avatars/atlas-${atlas}\\.webp"\\)$`),
  );
  await expect(portrait).toHaveCSS("background-position", position);
  const [image] = await backgroundImages(portrait);
  await expectServed(card, image ?? "", "image/webp");
  // Beside the name: the portrait ends where the name begins, on its line.
  await expectStartsGroup(portrait, group);
  await expectEnlargedSharply(portrait, atlas, position);
}

// Hovering shows the portrait larger from the high-resolution atlas, at the
// same tile, rather than upscaling the small one.
async function expectEnlargedSharply(
  portrait: Locator,
  atlas: number,
  position: string,
) {
  await portrait.hover();
  const layerFiles = async () =>
    (await backgroundImages(portrait)).map((url) =>
      new URL(url).pathname.split("/").pop(),
    );
  await expect
    .poll(layerFiles)
    .toEqual([`atlas-${atlas}-large.webp`, `atlas-${atlas}.webp`]);
  await expect(portrait).toHaveCSS(
    "background-position",
    `${position}, ${position}`,
  );
  const [large] = await backgroundImages(portrait);
  await expectServed(portrait, large ?? "", "image/webp");
  await portrait.page().mouse.move(0, 0);
}

// The local mark beside a card's recorded mode or host label: a decorative
// image, served, at the start of the group holding exactly that label, and
// clear of the agent portrait.
export async function expectMark(
  card: Locator,
  kind: "mode" | "host",
  label: string,
  file: string,
) {
  const group = card.locator(`.owner-${kind}`);
  await expect(group).toHaveText(label);
  const mark = group.locator("img.owner-mark");
  await expect(mark).toHaveCount(1);
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("alt", "");
  await expect(mark).toHaveAttribute("src", new RegExp(`/${file}$`));
  const source = await mark.evaluate(
    (image) => (image as HTMLImageElement).currentSrc,
  );
  await expectServed(
    card,
    source,
    file.endsWith(".svg") ? "image/svg+xml" : "image/png",
  );
  expect(
    await mark.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  // Beside its label: the mark starts the label's group.
  const markBox = await expectStartsGroup(mark, group);
  const portraitBox = await card.locator(".agent-portrait").boundingBox();
  expect(portraitBox).not.toBeNull();
  if (markBox === null || portraitBox === null) return;
  // Never on the portrait.
  const apart =
    markBox.x >= portraitBox.x + portraitBox.width ||
    portraitBox.x >= markBox.x + markBox.width ||
    markBox.y >= portraitBox.y + portraitBox.height ||
    portraitBox.y >= markBox.y + markBox.height;
  expect(apart).toBe(true);
}

// The image URLs of a visual's computed background layers, top layer first.
function backgroundImages(visual: Locator) {
  return visual.evaluate((element) =>
    [
      ...getComputedStyle(element).backgroundImage.matchAll(/url\("(.*?)"\)/g),
    ].map((match) => match[1] ?? ""),
  );
}

// The image behind a mark or portrait is actually served, as its type.
async function expectServed(card: Locator, url: string, contentType: string) {
  const served = await card.page().request.get(url);
  expect(served.ok()).toBe(true);
  expect(served.headers()["content-type"]).toContain(contentType);
}

// A visual sits at the start of the group holding its label, narrower than the
// group, so the label follows it on the same line. Returns the visual's box.
async function expectStartsGroup(visual: Locator, group: Locator) {
  const visualBox = await visual.boundingBox();
  const groupBox = await group.boundingBox();
  expect(visualBox).not.toBeNull();
  expect(groupBox).not.toBeNull();
  if (visualBox === null || groupBox === null) return null;
  expect(visualBox.x).toBeCloseTo(groupBox.x, 0);
  expect(visualBox.width).toBeLessThan(groupBox.width);
  return visualBox;
}
