// A file's syntax in Intent's reading pane (../../src/IntentBrowser.tsx): the
// hint of the first source entry, in declaration order, whose pattern selects
// it (../../src/intentLocationSelection.ts), mapped to a highlighter language
// (../../src/sourceHighlight.ts). A hint with no grammar, or none, reads as
// plain text. The integrated journey:
// ../../tests/intent/intent-code-browse-sources.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { sourceEntryOfRepositoryPath } from "../../src/intentLocationSelection.ts";
import { sourceLanguage } from "../../src/sourceHighlight.ts";
import type { DeclaredLocation } from "../../server/intentLocationsSettings.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

// The highlighter language of `path` under `location`, or undefined for plain
// text; null when the location does not select the path.
function languageOf(
  path: string,
  location: DeclaredLocation,
): string | undefined | null {
  const entry = sourceEntryOfRepositoryPath(path, location);
  if (entry === undefined) return null;
  return entry.hint === undefined
    ? undefined
    : sourceLanguage(entry.hint, path);
}

test("the first matching entry in declaration order gives a file its hint", () => {
  const scripts = makeMe.anIntentLocation
    .at("scripts")
    .withSources(
      { include: ["**/*.test.mjs"], syntax: "javascript" },
      { include: ["**/*.test*"], syntax: "shell" },
    )
    .please();
  expect(languageOf("scripts/x.test.mjs", scripts)).toBe("javascript");
  expect(languageOf("scripts/y.test", scripts)).toBe("shell");
  expect(languageOf("scripts/helper.mjs", scripts)).toBeNull();
});

test("a hint with no grammar, or no hint, selects the file as plain text", () => {
  const java = makeMe.anIntentLocation
    .at("backend/src/test/java")
    .withSources({ include: ["**/*Test.java"], syntax: "java" })
    .please();
  expect(languageOf("backend/src/test/java/a/FooTest.java", java)).toBe(
    undefined,
  );
  const checks = makeMe.anIntentLocation
    .at("checks")
    .withSources({ include: ["**/*.check"] })
    .please();
  expect(languageOf("checks/a.check", checks)).toBe(undefined);
});

test("each kind name is a hint, with .tsx still highlighted as TSX", () => {
  const mixed = makeMe.anIntentLocation
    .at("t")
    .withSources(
      { include: ["**/*.feature"], syntax: "gherkin" },
      { include: ["**/*.ts", "**/*.tsx"], syntax: "typescript" },
      { include: ["**/*.js"], syntax: "javascript" },
      { include: ["**/*.py"], syntax: "python" },
      { include: ["**/*.bats"], syntax: "shell" },
    )
    .please();
  expect(languageOf("t/a.feature", mixed)).toBe("gherkin");
  expect(languageOf("t/a.ts", mixed)).toBe("typescript");
  expect(languageOf("t/a.tsx", mixed)).toBe("tsx");
  expect(languageOf("t/a.js", mixed)).toBe("javascript");
  expect(languageOf("t/a.py", mixed)).toBe("python");
  expect(languageOf("t/a.bats", mixed)).toBe("shell");
});
