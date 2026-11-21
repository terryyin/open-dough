// A review diff selects its grammar from the file's new path, else from the
// Intent syntax hint; each selected grammar loads and tokenizes its keyword.

import { expect, test } from "vitest";
import { diffLanguage } from "../../src/diffLineTokens.ts";
import { highlightSourceLines } from "../../src/sourceHighlight.ts";

test.each([
  { path: "a.ts", language: "typescript" },
  { path: "a.mts", language: "typescript" },
  { path: "a.cts", language: "typescript" },
  { path: "a.tsx", language: "tsx" },
  { path: "a.js", language: "javascript" },
  { path: "a.mjs", language: "javascript" },
  { path: "a.cjs", language: "javascript" },
  { path: "a.jsx", language: "javascript" },
  { path: "A.java", language: "java" },
  { path: "a.py", language: "python" },
  { path: "a.sh", language: "shell" },
  { path: "a.bash", language: "shell" },
  { path: "a.feature", language: "gherkin" },
  { path: "README.md", language: "markdown" },
  { path: "data.json", language: "json" },
  { path: "a.css", language: "css" },
  { path: "a.yaml", language: "yaml" },
  { path: "settings.yml", language: "yaml" },
])("$path selects $language", ({ path, language }) => {
  expect(diffLanguage(path)).toBe(language);
});

// A rename's diff is read under its new path.
test.each([
  { oldPath: "old.txt", path: "new.ts", language: "typescript" },
  { oldPath: "settings.yaml", path: "settings.yml", language: "yaml" },
  { oldPath: "old.ts", path: "new.txt", language: undefined },
])(
  "a rename from $oldPath to $path selects $language",
  ({ path, language }) => {
    expect(diffLanguage(path)).toBe(language);
  },
);

test.each([
  { path: "notes.txt", hint: undefined, language: undefined },
  { path: "scripts/setup.test", hint: "shell", language: "shell" },
  {
    path: "scripts/setup.test",
    hint: "unfamiliar-language",
    language: undefined,
  },
  { path: "lib/app.ts", hint: "shell", language: "typescript" },
])("$path with hint $hint selects $language", ({ path, hint, language }) => {
  expect(diffLanguage(path, hint)).toBe(language);
});

test.each([
  {
    language: "typescript",
    code: "const shown: number = 1;",
    keyword: "const",
  },
  { language: "tsx", code: "const shown = <div />;", keyword: "const" },
  {
    language: "javascript",
    code: 'const shown = require("x");',
    keyword: "const",
  },
  { language: "java", code: "public class A {}", keyword: "class" },
  { language: "python", code: "def shown(): pass", keyword: "def" },
  { language: "shell", code: "if true; then echo x; fi", keyword: "if" },
  { language: "gherkin", code: "Feature: Shown", keyword: "Feature" },
  { language: "markdown", code: "# Shown", keyword: "# Shown" },
  { language: "json", code: '{ "shown": 1 }', keyword: '"shown"' },
  { language: "css", code: "body { margin: 0; }", keyword: "body" },
  { language: "yaml", code: "shown: true", keyword: "shown" },
])(
  "the $language grammar tokenizes $keyword",
  async ({ language, code, keyword }) => {
    const lines = await highlightSourceLines(code, language);
    expect(lines?.[0]?.map((token) => token.content)).toEqual(
      expect.arrayContaining([keyword]),
    );
  },
);
