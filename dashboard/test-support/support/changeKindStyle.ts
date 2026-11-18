// A changed file's name style in a change tree, Review changes' and Intent's
// alike, and each change kind's expected style from the dashboard's colours.

import type { Locator } from "@playwright/test";

// The style a file's name shows its kind in.
export const nameStyle = (file: Locator) =>
  file.locator("code").evaluate((code) => {
    const style = getComputedStyle(code);
    return {
      color: style.color,
      line: style.textDecorationLine,
      fontStyle: style.fontStyle,
    };
  });

// The dashboard's colours as the page resolves them within `within`.
const colours = (within: Locator) =>
  within.evaluate((root) => {
    const probe = document.createElement("span");
    root.append(probe);
    const resolve = (token: string) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const resolved = {
      text: resolve("--text"),
      ready: resolve("--ready"),
      accent: resolve("--accent"),
      quiet: resolve("--quiet"),
    };
    probe.remove();
    return resolved;
  });

// Each kind's expected name style, from the shared change-kind styles.
export async function kindStyles(within: Locator) {
  const tokens = await colours(within);
  const plain = { color: tokens.text, line: "none", fontStyle: "normal" };
  return {
    plain,
    added: { ...plain, color: tokens.ready },
    modified: { ...plain, color: tokens.accent },
    deleted: { ...plain, color: tokens.quiet, line: "line-through" },
    renamed: { ...plain, fontStyle: "italic" },
  };
}
