// The published files of a Doughnut-like project for the Vitest Proof
// journeys (`./intentVitestProofFixtures.ts`): a `frontend/tests` location
// with a `utils` folder holding a spec with a nested `describe`, an `it.each`
// with `%s`, a placeholder-less `it.each` and a test whose comment only looks
// like a test, beside a spec of three plain tests; a `toolbars` folder holding a touch spec and a
// spec run under two Vitest projects; and a `shell` script.

export const locationPath = "frontend/tests";
export const utilsPath = `${locationPath}/utils`;
const toolbarsPath = `${locationPath}/toolbars`;
export const titlePatternPath = `${utilsPath}/titlePatternRender.spec.ts`;
export const datesPath = `${utilsPath}/dates.spec.ts`;
export const touchPath = `${toolbarsPath}/DonutMenu.search.touch.spec.ts`;
export const toolbarPath = `${toolbarsPath}/Toolbar.spec.ts`;
export const scriptPath = "scripts/check.sh";

const titlePatternSource = `import { describe, expect, it } from "vitest";

describe("renderTitleFromPattern", () => {
  it("replaces {{date}} with yyyy-MM-dd", () => {
    expect(render("{{date}}")).toBe("2026-11-04");
  });

  describe("unknown placeholders", () => {
    it("leaves them unchanged", () => {
      expect(render("{{nope}}")).toBe("{{nope}}");
    });
  });

  it.each(["alpha", "Beta", "émile"])("renders %s titles", (name) => {
    expect(render(name)).toBe(name);
  });

  it.each(["\\\\u0041", "A"])("renders equivalent escapes", (text) => {
    expect(render(text)).toBe("A");
  });

  it("formats an empty pattern", () => {
    // it("looks like a test inside a comment")
    expect(render("")).toBe("");
  });
});
`;

// The 1-based line of the `%s` template's call.
export const templateLine = 14;

const datesSource = `import { describe, expect, it } from "vitest";

describe("formatDate", () => {
  it("pads months", () => {
    expect(formatDate(1)).toBe("01");
  });
  it("pads days", () => {
    expect(formatDate(2)).toBe("02");
  });
  it("pads years", () => {
    expect(formatDate(3)).toBe("0003");
  });
});
`;

const touchSource = `import { describe, expect, it } from "vitest";

describe("Donut menu touch search", () => {
  it.each(["Search", "Open search"])(
    "prepares input synchronously from %s",
    (label) => {
      expect(label).toBeTruthy();
    },
  );
});
`;

const toolbarSource = `import { describe, expect, it } from "vitest";

describe("Toolbar", () => {
  it("opens the menu", () => {
    expect(open()).toBe(true);
  });
  it("closes on escape", () => {
    expect(close()).toBe(true);
  });
});
`;

const shellSource = `#!/usr/bin/env bash
echo ok
`;

export const sources = {
  [titlePatternPath]: titlePatternSource,
  [datesPath]: datesSource,
  [touchPath]: touchSource,
  [toolbarPath]: toolbarSource,
  [scriptPath]: shellSource,
};
