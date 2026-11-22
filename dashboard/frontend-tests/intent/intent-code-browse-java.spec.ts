// Configured Java source stays exact, numbered plain text when the page's
// source highlighter cannot highlight it (../../src/useSourceHighlight.ts,
// ../../src/SourceLines.tsx), on the page's Intent body
// (./intent-ci-page-mount.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { SourceHighlighter } from "../../src/sourceHighlight.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { intentScopeTree } from "./intent-scope-tree-page.ts";

test("a failed Java grammar leaves configured source readable as exact plain text", async () => {
  const path = "checks/Examples.java";
  const text = 'class Examples { String value = "still readable"; }\n';
  const highlighted: string[] = [];
  // The Java grammar fails to load: the highlighter answers plain text.
  const highlight: SourceHighlighter = (...[, language]) => {
    highlighted.push(language);
    return Promise.resolve(undefined);
  };
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at("checks")
        .ofKind("java")
        .selecting(path)
        .please(),
    )
    .please();
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.ofPygardon.at("7a".repeat(20)).please(),
    reads: {
      intent: intentReadsPublishing(locations, { [path]: text }),
      ci: unreadCiReads,
      highlight,
    },
  });
  const tree = intentScopeTree();
  await tree.toggle("checks").click();
  const reading = await tree.openFile(path);
  await (await reading.shows(text.trimEnd())).isSelected();
  await expect.poll(() => highlighted).toEqual(["java"]);

  const source = document.querySelector(`[aria-label="${path} source"]`);
  const lines = [...(source?.querySelectorAll(".source-line") ?? [])];
  expect(
    lines.map((line) => line.querySelector(".source-line-number")?.textContent),
  ).toEqual(["1", "2"]);
  expect(source?.querySelectorAll(".source-token")).toHaveLength(0);
});
