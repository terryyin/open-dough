// The requesting project's installed definition controls the selected flags.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { roughStoryC } from "../../../Distribution/tests/support/queued-repository.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { withSelectedOptions } from "../../server/launchOptions.ts";
import { localFolder } from "../../server/localFolder.ts";

async function newProject() {
  const project = localFolder(
    await mkdtemp(path.join(tmpdir(), "dough-options-")),
  );
  onTestFinished(() => rm(project.path, { recursive: true, force: true }));
  return project;
}

test("orders selected options and a focus by the installed definition", async () => {
  const project = await newProject();
  const request = makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions(["--borrow", "--ux-ui", "--explore"])
    .please();
  const definition = makeMe.anOptionsDefinition
    .with({
      command: "dough-story-refinement",
      options: ["--explore", "--borrow"].map((flag) =>
        makeMe.anOptionsEntry.with({ flag }).please(),
      ),
      focuses: [makeMe.anOptionsEntry.with({ flag: "--ux-ui" }).please()],
    })
    .please();
  const file = installedSkillPath(
    request.host,
    project,
    "dough-story-refinement",
    "references",
    "refinement-options.json",
  );
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(definition));

  const selected = await withSelectedOptions(request, project);
  expect(selected.options).toEqual(["--explore", "--borrow", "--ux-ui"]);
});

test.each([
  {
    kind: "omitted",
    request: makeMe.aLaunchRequest.refining(roughStoryC).please(),
  },
  {
    kind: "empty",
    request: makeMe.aLaunchRequest
      .refining(roughStoryC)
      .withOptions([])
      .please(),
  },
])(
  "preserves a request with $kind options without an installed definition",
  async ({ request }) => {
    const project = await newProject();

    await expect(withSelectedOptions(request, project)).resolves.toEqual(
      request,
    );
  },
);
