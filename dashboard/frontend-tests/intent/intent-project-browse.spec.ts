// Project Intent lists every tracked path at the shown revision
// (../../src/useProjectTreeRead.tsx) in the shared tree, narrows it with
// Intent only, and reads a selected file through the project reader
// (../../src/useIntentFileRead.ts), on the page's Intent body
// (./intent-ci-page-mount.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { heldReply } from "./intent-ci-evidence-page.tsx";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentScopeTree } from "./intent-scope-tree-page.ts";
import { intentStoryFiles } from "./intent-story-files-page.ts";

const feature = "specs/checkout.feature";
const helper = "specs/steps.ts";
const production = "src/app.ts";
const guide = "docs/guide.md";
const unitTest = "tests/app.test.ts";
const tracked = [feature, helper, production, guide, unitTest];

const configured = makeMe.anIntentLocationsAnswer
  .locating(
    makeMe.anIntentLocation
      .at("specs")
      .ofKind("gherkin")
      .selecting(feature)
      .please(),
  )
  .please();

// The project's reads at one revision: the configured reader and the project
// reader answer differently, and the project reader's paths are recorded.
// Each case reads at its own revision: reads stay cached per revision.
async function openProject(
  locations: IntentLocations,
  revision: string,
  {
    readProjectTree = () => Promise.resolve(tracked),
    viewport,
  }: {
    readonly readProjectTree?: IntentReadSource["readProjectTree"];
    readonly viewport?: { readonly width: number; readonly height: number };
  } = {},
) {
  const projectReads: string[] = [];
  await mountIntentCiPage({
    work: makeMe.aPublishedWork.ofPygardon.at(revision).please(),
    ...(viewport && { viewport }),
    reads: {
      intent: makeMe.anIntentReadSource
        .reading({
          readLocations: () => Promise.resolve(locations),
          readFile: (...[, path]) => Promise.resolve(`configured ${path}`),
          readCandidates: () => Promise.resolve({ status: "absent" }),
          readProjectTree,
          readProjectFile: (...[, path]) => {
            projectReads.push(path);
            return Promise.resolve(`tracked ${path}`);
          },
        })
        .please(),
      ci: unreadCiReads,
    },
  });
  return { projectReads, files: intentStoryFiles() };
}

test("the default tree lists production source, docs and tests, and a selected file reads through the project reader", async () => {
  const { projectReads, files } = await openProject(
    configured,
    "5a".repeat(20),
  );
  for (const folder of ["specs", "src", "docs", "tests"])
    await expect.element(files.folder(folder)).toBeVisible();
  await files.expandShownFolderPath("src");
  const reading = await intentScopeTree().openFile(production);
  await reading.shows(`tracked ${production}`);
  expect(projectReads).toEqual([production]);
});

test("an Intent location and a regular folder share the selection, and Intent only narrows the mixed folder keeping its location cue", async () => {
  const { files } = await openProject(configured, "5b".repeat(20));
  await files.expandShownFolderPath("specs");
  await expect.element(files.file(helper)).toBeVisible();
  await files.expandShownFolderPath("docs");
  const reading = await intentScopeTree().openFile(guide);
  await reading.shows(`tracked ${guide}`);
  await (await intentScopeTree().openFile(feature)).shows(`tracked ${feature}`);

  await files.toggleIntentOnly();
  await expect.element(files.file(helper)).not.toBeInTheDocument();
  await expect.element(files.file(feature)).toBeVisible();
  await expect.element(files.folder("src")).not.toBeInTheDocument();
  await expect
    .element(
      files
        .folder("specs")
        .getByCSS(':scope > [data-intent-folder-cue="root"]'),
    )
    .toBeInTheDocument();
});

test("without configured locations the project opens a tracked document, and Intent only keeps the empty-scope explanation", async () => {
  const { files } = await openProject(
    { status: "not-configured" },
    "5c".repeat(20),
  );
  await files.expandShownFolderPath("docs");
  await (await intentScopeTree().openFile(guide)).shows(`tracked ${guide}`);

  await files.toggleIntentOnly();
  await expect.element(files.folder("docs")).not.toBeInTheDocument();
  await expect
    .element(
      files.sidebar.getByText(/^No Intent locations are configured for /),
    )
    .toBeVisible();
});

// A project tree whose first read fails and whose next read waits for
// `answer()`.
function failingThenHeldTree() {
  const held = heldReply<readonly string[]>();
  let reads = 0;
  const readProjectTree: IntentReadSource["readProjectTree"] = () => {
    reads += 1;
    return reads === 1
      ? Promise.reject(new ReadProblem("The tree is unavailable."))
      : held.promise;
  };
  const answer = () => {
    held.resolve(tracked);
  };
  return { readProjectTree, answer };
}

test("a failed first project tree read says why with Retry and lists no location file; Retry says the files are being read until the tree fills", async () => {
  const tree = failingThenHeldTree();
  const { files } = await openProject(configured, "5d".repeat(20), tree);

  await expect
    .element(files.projectTreeProblem)
    .toHaveTextContent(
      "Project files could not be read: The tree is unavailable. Retry",
    );
  await expect.element(files.folder("specs")).not.toBeInTheDocument();
  await files.retryProjectTree();
  await expect.element(files.projectTreeReading).toBeVisible();
  await expect.element(files.projectTreeProblem).not.toBeInTheDocument();
  await expect.element(files.folder("specs")).not.toBeInTheDocument();

  tree.answer();
  for (const folder of ["specs", "src", "docs", "tests"])
    await expect.element(files.folder(folder)).toBeVisible();
  await expect.element(files.projectTreeReading).not.toBeInTheDocument();
});

test("on a phone with Files hidden the failed tree read and its Retry, then the reading message, stay above the reading", async () => {
  const tree = failingThenHeldTree();
  const { files } = await openProject(configured, "5e".repeat(20), {
    ...tree,
    viewport: { width: 390, height: 844 },
  });

  await expect.element(files.sidebar).not.toBeVisible();
  await expect
    .element(files.projectTreeProblem)
    .toHaveTextContent(
      "Project files could not be read: The tree is unavailable. Retry",
    );
  await files.retryProjectTree();
  await expect.element(files.projectTreeReading).toBeVisible();

  tree.answer();
  await expect.element(files.projectTreeReading).not.toBeInTheDocument();
});
