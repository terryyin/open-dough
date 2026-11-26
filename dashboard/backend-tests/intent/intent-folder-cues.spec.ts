import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentFolderCues } from "../../src/intentFolderCues.ts";
import { reviewFileTree } from "../../src/reviewFileTree.ts";

test("only shown roots and their collapsed ancestors carry an Intent cue", () => {
  const locations = [
    makeMe.anIntentLocation
      .at("e2e")
      .ofKind("typescript")
      .selecting("e2e/a.spec.ts")
      .please(),
    makeMe.anIntentLocation
      .at("e2e_test/features")
      .ofKind("gherkin")
      .selecting()
      .please(),
    makeMe.anIntentLocation
      .at("e2e_test/packaged/features")
      .ofKind("unsupported")
      .selecting()
      .please(),
  ];
  const paths = locations.map(({ path }) => path);
  const roots = new Set(paths);
  const tree = reviewFileTree(
    [...locations.flatMap(({ files }) => files), "e2e_test_archive/b.txt"].map(
      (path) => ({ path }),
    ),
    { compact: false, folders: paths },
  );

  expect(
    intentFolderCues(
      tree,
      new Set(["e2e", "e2e_test", "e2e_test_archive"]),
      roots,
    ),
  ).toEqual(
    new Map([
      ["e2e", "root"],
      ["e2e_test", "ancestor"],
      ["e2e_test/features", "root"],
      ["e2e_test/packaged/features", "root"],
    ]),
  );
  expect(intentFolderCues(tree, new Set(["e2e_test/packaged"]), roots)).toEqual(
    new Map([
      ["e2e", "root"],
      ["e2e_test/features", "root"],
      ["e2e_test/packaged", "ancestor"],
      ["e2e_test/packaged/features", "root"],
    ]),
  );

  const filtered = reviewFileTree([{ path: "e2e_test/changed.txt" }], {
    compact: false,
  });
  expect(intentFolderCues(filtered, new Set(["e2e_test"]), roots)).toEqual(
    new Map(),
  );
});
