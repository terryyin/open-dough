import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { styledDiffReading } from "./mountedFileDiff.ts";
import { mountedReviewDiff } from "./mountedReviewDiffPage.ts";
import { addedLineDiff } from "./styledDiffCases.ts";

const typescript = { code: "const shown: number = 1;", keyword: /^const$/ };
const javascript = { code: 'const shown = require("x");', keyword: /^const$/ };
const jsx = { code: "const shown = <div />;", keyword: /^const$/ };
const shell = { code: "if true; then echo x; fi", keyword: /^if$/ };
const yaml = { code: "shown: true", keyword: /^shown$/ };
const supportedPaths = [
  { path: "a.ts", ...typescript },
  { path: "a.mts", ...typescript },
  { path: "a.cts", ...typescript },
  { path: "a.tsx", ...jsx },
  { path: "a.js", ...javascript },
  { path: "a.mjs", ...javascript },
  { path: "a.cjs", ...javascript },
  { path: "a.jsx", ...jsx },
  { path: "A.java", code: "public class A {}", keyword: /^class$/ },
  { path: "a.py", code: "def shown(): pass", keyword: /^def$/ },
  { path: "a.sh", ...shell },
  { path: "a.bash", ...shell },
  { path: "a.feature", code: "Feature: Shown", keyword: /^Feature$/ },
  { path: "README.md", code: "# Shown", keyword: /^# Shown$/ },
  { path: "data.json", code: '{ "shown": 1 }', keyword: /^"shown"$/ },
  { path: "a.css", code: "body { margin: 0; }", keyword: /^body$/ },
  { path: "a.yaml", ...yaml },
  { path: "a.yml", ...yaml },
];

test.each(supportedPaths)(
  "$path styles the file's keyword",
  async ({ path, code, keyword }) => {
    await mountComponent(styledDiffReading(addedLineDiff(path, code)));
    const line = mountedReviewDiff().newLine(1);
    await expect.element(line.token(keyword)).toBeVisible();
    await expect.element(line.line).toHaveTextContent(`+${code}`);
  },
);

test.each([
  { oldPath: "old.txt", path: "new.ts", ...typescript },
  { oldPath: "settings.yaml", path: "settings.yml", ...yaml },
])(
  "a rename from $oldPath to $path styles by its new path",
  async ({ path, oldPath, code, keyword }) => {
    await mountComponent(styledDiffReading(addedLineDiff(path, code, oldPath)));
    await expect
      .element(mountedReviewDiff().newLine(1).token(keyword))
      .toBeVisible();
  },
);

test.each([
  { path: "notes.txt", oldPath: undefined },
  { path: "new.txt", oldPath: "old.ts" },
])(
  "$path with no supported extension reads plain",
  async ({ path, oldPath }) => {
    const code = "const shown = 1;";
    const { rerender } = await mountComponent(
      styledDiffReading(addedLineDiff("typed.ts", code)),
    );
    const line = mountedReviewDiff().newLine(1);
    await expect.element(line.token(/^const$/)).toBeVisible();
    rerender(styledDiffReading(addedLineDiff(path, code, oldPath)));
    await expect.element(line.line).toHaveTextContent(`+${code}`);
    await expect.element(line.firstToken()).not.toBeInTheDocument();
  },
);

test.each([
  { path: "scripts/setup.test", oldPath: undefined },
  { path: "scripts/setup-renamed.test", oldPath: "legacy/run" },
])(
  "$path uses a known hint when its path names no grammar",
  async ({ path, oldPath }) => {
    await mountComponent(
      styledDiffReading({
        ...addedLineDiff(path, shell.code, oldPath),
        syntaxHint: "shell",
      }),
    );
    const line = mountedReviewDiff().newLine(1);
    await expect.element(line.token(/^if$/)).toBeVisible();
    await expect.element(line.line).toHaveTextContent(`+${shell.code}`);
  },
);

test("an unfamiliar hint leaves a path-silent file plain", async () => {
  const input = addedLineDiff("scripts/odd.check", shell.code);
  const { rerender } = await mountComponent(
    styledDiffReading({ ...input, syntaxHint: "shell" }),
  );
  const line = mountedReviewDiff().newLine(1);
  await expect.element(line.token(/^if$/)).toBeVisible();
  rerender(styledDiffReading({ ...input, syntaxHint: "unfamiliar-language" }));
  await expect.element(line.firstToken()).not.toBeInTheDocument();
  await expect.element(line.line).toHaveTextContent(`+${shell.code}`);
});

test("the file's path grammar wins over a known hint", async () => {
  await mountComponent(
    styledDiffReading({
      ...addedLineDiff("lib/app.ts", typescript.code),
      syntaxHint: "shell",
    }),
  );
  const line = mountedReviewDiff().newLine(1);
  await expect.element(line.token(/^const$/)).toBeVisible();
});
