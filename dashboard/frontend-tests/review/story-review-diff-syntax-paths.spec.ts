// A diffed file's path selects its grammar from those the dashboard loads:
// each supported extension styles the file's keyword as its own token, a
// renamed file follows its new path, and any other file reads as plain text.

import type { ReviewedFile } from "../../src/storyReviewContract.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "../../tests/support/reviewTreeRows.ts";
import { codePane } from "../../tests/support/reviewPanes.ts";
import { storyReviewDiff } from "../../tests/support/reviewDiffSyntax.ts";

const typescript = { code: "const shown: number = 1;", keyword: "const" };
const javascript = { code: 'const shown = require("x");', keyword: "const" };
const yaml = { code: "shown: true", keyword: "shown" };
const styled = [
  { path: "a.ts", ...typescript },
  { path: "a.mts", ...typescript },
  { path: "a.cts", ...typescript },
  { path: "a.tsx", code: "const shown = <div />;", keyword: "const" },
  { path: "a.js", ...javascript },
  { path: "a.mjs", ...javascript },
  { path: "a.cjs", ...javascript },
  { path: "a.jsx", code: "const shown = <div />;", keyword: "const" },
  { path: "A.java", code: "public class A {}", keyword: "class" },
  { path: "a.py", code: "def shown(): pass", keyword: "def" },
  { path: "a.sh", code: "if true; then echo x; fi", keyword: "if" },
  { path: "a.bash", code: "if true; then echo x; fi", keyword: "if" },
  { path: "a.feature", code: "Feature: Shown", keyword: "Feature" },
  { path: "README.md", code: "# Shown", keyword: "# Shown" },
  { path: "data.json", code: '{ "shown": 1 }', keyword: '"shown"' },
  { path: "a.css", code: "body { margin: 0; }", keyword: "body" },
  { path: "a.yaml", ...yaml },
  { path: "a.yml", ...yaml },
] as const;
const plain = [{ path: "notes.txt", code: "const shown = 1;" }] as const;
const renamedStyled = { oldPath: "old.txt", path: "new.ts", ...typescript };
const renamedYaml = {
  oldPath: "settings.yaml",
  path: "settings.yml",
  ...yaml,
};
const renamedPlain = { oldPath: "old.ts", path: "new.txt", ...typescript };

const lines = { added: 1, removed: 0 };

test("each supported extension and a rename's new path style the diff; other files stay plain", async ({
  page,
  frontendServices,
}) => {
  const renames = [renamedStyled, renamedYaml, renamedPlain];
  const files: ReviewedFile[] = [
    ...[...styled, ...plain].map(({ path }) => ({
      kind: "added" as const,
      path,
      lines,
    })),
    ...renames.map(({ path, oldPath }) => ({
      kind: "renamed" as const,
      path,
      oldPath,
      lines,
    })),
  ];
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({ files }),
    (answers) => {
      for (const { path, code } of [...styled, ...plain, ...renames]) {
        answers.answerFile(frontendFileDiff(path, [code]), path);
        answers.answerFileText(
          { kind: "text", baseline: null, tree: `${code}\n` },
          path,
        );
      }
    },
  );
  const shownFile = async (name: string) => {
    await fileRow(review, name).click();
    const diff = storyReviewDiff(fileDiff(review, name));
    // Both sides' text has been read, so styling has had what it needs.
    await expect(codePane(diff.locator)).toHaveAttribute("aria-busy", "false");
    const line = diff.newLine(1);
    await expect(line.line).toBeVisible();
    return line;
  };

  for (const { path, code, keyword } of styled) {
    const line = await shownFile(`Added ${path}`);
    const token = new RegExp(
      `^${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    );
    await expect(line.token(token), path).toHaveText(keyword);
    await expect(line.line).toHaveText(`+${code}`);
  }
  const renamedLine = await shownFile(
    `Renamed ${renamedStyled.oldPath} → ${renamedStyled.path}`,
  );
  await expect(renamedLine.token(/^const$/)).toBeVisible();
  const renamedYamlLine = await shownFile(
    `Renamed ${renamedYaml.oldPath} → ${renamedYaml.path}`,
  );
  await expect(renamedYamlLine.token(/^shown$/)).toBeVisible();

  for (const { name, code } of [
    ...plain.map(({ path, code }) => ({ name: `Added ${path}`, code })),
    {
      name: `Renamed ${renamedPlain.oldPath} → ${renamedPlain.path}`,
      code: renamedPlain.code,
    },
  ]) {
    const line = await shownFile(name);
    await expect(line.line).toHaveText(`+${code}`);
    await expect(line.codeTokens(), name).toHaveCount(0);
  }
});
