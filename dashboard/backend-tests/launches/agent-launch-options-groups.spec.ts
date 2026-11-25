// The installed refinement definition orders flags and enforces its exclusive groups.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { roughStoryC } from "../../../Distribution/tests/support/queued-repository.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { withSelectedOptions } from "../../server/launchOptions.ts";
import { localFolder } from "../../server/localFolder.ts";
import type { OptionsDefinition } from "../../src/commandOptions.ts";

const explore = "--explore";
const borrow = "--borrow";
const architecture = "--architecture";
const uxUi = "--ux-ui";
const skill = "dough-story-refinement";

const entry = (flag: string) => makeMe.anOptionsEntry.with({ flag }).please();
const approaches = makeMe.anExclusiveOptionGroup
  .with({ id: "approach", label: "Approach", flags: [explore, borrow] })
  .please();

async function installDefinition(
  groups: NonNullable<OptionsDefinition["groups"]>,
  focuses = [architecture],
) {
  const project = localFolder(
    await mkdtemp(path.join(tmpdir(), "dough-options-")),
  );
  onTestFinished(() => rm(project.path, { recursive: true, force: true }));
  const file = installedSkillPath(
    "claude",
    project,
    skill,
    "references",
    "refinement-options.json",
  );
  const definition = makeMe.anOptionsDefinition
    .with({
      command: skill,
      options: [explore, borrow].map(entry),
      focuses: focuses.map(entry),
      groups,
    })
    .please();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(definition));
  return project;
}

test("orders one group member and a free flag by the installed definition", async () => {
  const project = await installDefinition([approaches]);
  const request = makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions([architecture, explore])
    .please();

  const selected = await withSelectedOptions(request, project);
  expect(selected.options).toEqual([explore, architecture]);
});

test("allows one group member alone or a free flag without a group member", async () => {
  const project = await installDefinition([approaches]);

  for (const flag of [borrow, architecture]) {
    const request = makeMe.aLaunchRequest
      .refining(roughStoryC)
      .withOptions([flag])
      .please();
    const selected = await withSelectedOptions(request, project);
    expect(selected.options).toEqual([flag]);
  }
});

test("refuses two group members, naming the group and both flags", async () => {
  const project = await installDefinition([approaches]);
  const request = makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions([borrow, architecture, explore])
    .please();

  const refusal = withSelectedOptions(request, project);
  await expect(refusal).rejects.toHaveProperty("status", 400);
  await expect(refusal).rejects.toThrow(
    "Options --explore and --borrow are in the same Approach group",
  );
});

test("enforces separate groups with the same label and allows one flag from each", async () => {
  const focuses = makeMe.anExclusiveOptionGroup
    .with({ id: "focus", label: "Approach", flags: [architecture, uxUi] })
    .please();
  const project = await installDefinition(
    [approaches, focuses],
    [architecture, uxUi],
  );
  const compatible = makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions([architecture, explore])
    .please();
  const conflicting = makeMe.aLaunchRequest
    .refining(roughStoryC)
    .withOptions([architecture, uxUi])
    .please();

  const selected = await withSelectedOptions(compatible, project);
  expect(selected.options).toEqual([explore, architecture]);
  const refusal = withSelectedOptions(conflicting, project);
  await expect(refusal).rejects.toHaveProperty("status", 400);
  await expect(refusal).rejects.toThrow(
    "Options --architecture and --ux-ui are in the same Approach group",
  );
});
