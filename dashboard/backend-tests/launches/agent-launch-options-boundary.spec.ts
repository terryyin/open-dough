// The requesting project's installed definition controls the selected flags.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  roughStoryC,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { withSelectedOptions } from "../../server/launchOptions.ts";
import { localFolder, type LocalFolder } from "../../server/localFolder.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";

const refinementSkill = "dough-story-refinement";

async function newProject() {
  const project = localFolder(
    await mkdtemp(path.join(tmpdir(), "dough-options-")),
  );
  onTestFinished(() => rm(project.path, { recursive: true, force: true }));
  return project;
}

function refinementWithOptions(...options: string[]) {
  return makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions(options)
    .please();
}

function optionsDefinition(
  command: string,
  options: string[],
  focuses: string[] = [],
) {
  const entry = (flag: string) => makeMe.anOptionsEntry.with({ flag }).please();
  return makeMe.anOptionsDefinition
    .with({
      command,
      options: options.map(entry),
      focuses: focuses.map(entry),
    })
    .please();
}

function optionsFile(project: LocalFolder) {
  return installedSkillPath(
    "claude",
    project,
    refinementSkill,
    "references",
    "refinement-options.json",
  );
}

async function installOptions(project: LocalFolder, text: string) {
  const file = optionsFile(project);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}

async function expectRefusal(
  refusal: Promise<AgentLaunchRequest>,
  reason: string,
) {
  await expect(refusal).rejects.toHaveProperty("status", 400);
  await expect(refusal).rejects.toThrow(reason);
}

test("orders selected options and a focus by the installed definition", async () => {
  const project = await newProject();
  const request = refinementWithOptions("--borrow", "--ux-ui", "--explore");
  const definition = optionsDefinition(
    refinementSkill,
    ["--explore", "--borrow"],
    ["--ux-ui"],
  );
  await installOptions(project, JSON.stringify(definition));

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

test("names the unknown flag in a mixed selection", async () => {
  const project = await newProject();
  const definition = optionsDefinition(refinementSkill, ["--explore"]);
  await installOptions(project, JSON.stringify(definition));

  const request = refinementWithOptions("--explore", "--bogus");
  const refusal = withSelectedOptions(request, project);
  await expectRefusal(refusal, "Option --bogus is not one");
  await expect(refusal).rejects.not.toThrow("--explore");
});

test("accepts the same flag only in the project whose definition offers it", async () => {
  const offersExplore = await newProject();
  const offersBorrow = await newProject();
  await installOptions(
    offersExplore,
    JSON.stringify(optionsDefinition(refinementSkill, ["--explore"])),
  );
  await installOptions(
    offersBorrow,
    JSON.stringify(optionsDefinition(refinementSkill, ["--borrow"])),
  );

  const request = refinementWithOptions("--explore");
  const accepted = await withSelectedOptions(request, offersExplore);
  expect(accepted.options).toEqual(["--explore"]);
  await expectRefusal(
    withSelectedOptions(request, offersBorrow),
    `Option --explore is not one the installed ${refinementSkill} skill in ${offersBorrow.shown} defines.`,
  );
});

test.each([
  {
    kind: "malformed JSON",
    contents: "{",
    reason: "has an options file that is not valid",
  },
  {
    kind: "a definition for another command",
    contents: JSON.stringify(optionsDefinition("dough-other", ["--explore"])),
    reason: "has an options file for another command",
  },
])(
  "explains why options are refused with $kind",
  async ({ contents, reason }) => {
    const project = await newProject();
    await installOptions(project, contents);

    await expectRefusal(
      withSelectedOptions(refinementWithOptions("--explore"), project),
      reason,
    );
  },
);

test("reports a missing options file when the installed skill has no definition", async () => {
  const project = await newProject();
  await mkdir(path.dirname(optionsFile(project)), { recursive: true });

  await expectRefusal(
    withSelectedOptions(refinementWithOptions("--explore"), project),
    "has no options file",
  );
});

test("reports a missing options file when the skill is absent", async () => {
  const project = await newProject();

  await expectRefusal(
    withSelectedOptions(refinementWithOptions("--explore"), project),
    "has no options file",
  );
});

test("explains when the options file could not be read", async () => {
  const project = await newProject();
  await mkdir(optionsFile(project), { recursive: true });

  await expectRefusal(
    withSelectedOptions(refinementWithOptions("--explore"), project),
    "has an options file that could not be read",
  );
});

test.each([
  {
    workflow: "Execution",
    request: makeMe.aLaunchRequest
      .executing(storyA)
      .withOptions(["--explore"])
      .please(),
  },
  {
    workflow: "Ad hoc",
    request: makeMe.aLaunchRequest.adHoc().withOptions(["--explore"]).please(),
  },
])("refuses selected options for $workflow", async ({ workflow, request }) => {
  const project = await newProject();

  await expectRefusal(
    withSelectedOptions(request, project),
    `${workflow} has no options to select.`,
  );
});
