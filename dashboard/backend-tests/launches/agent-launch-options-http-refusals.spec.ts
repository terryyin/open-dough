// Mounted installed-option refusals retained until their typed coverage moves.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect } from "../../test-support/support/pageTest.ts";
import {
  expectStoryCommand,
  launchClaude,
  queuedExecution,
  refinementDefinition,
  refinementSkill,
  refinementSkillFolder,
  refuseOptions,
  roughRefinement,
  test,
} from "../support/installedClaudeLaunch.ts";

const explored = "--explore";

const definitionOf = (command: string, flag: string) =>
  JSON.stringify(
    makeMe.anOptionsDefinition
      .with({
        command,
        options: [makeMe.anOptionsEntry.with({ flag }).please()],
      })
      .please(),
  );
const definitionRevision = (text: string) => ({
  files: { [refinementDefinition]: text },
});

test("refuses a flag the definition does not define, naming it", async ({
  installedClaude,
}) => {
  const server = await installedClaude();
  const error = await refuseOptions(server, {
    ...roughRefinement,
    options: [explored, "--bogus"],
  });
  expect(error).toContain("--bogus");
  expect(error).not.toContain(explored);
});

test("refuses a flag the project's own definition lacks, and starts with one it has", async ({
  installedClaude,
}) => {
  const server = await installedClaude(
    {},
    definitionRevision(definitionOf(refinementSkill, "--only")),
  );
  expect(
    await refuseOptions(server, { ...roughRefinement, options: [explored] }),
  ).toContain(explored);
  const result = await launchClaude(server, {
    ...roughRefinement,
    options: ["--only"],
  });
  expectStoryCommand(
    result.started,
    `/${refinementSkill} ${roughRefinement.identity} --only`,
  );
});

for (const [kind, file, why] of [
  ["not JSON", "{", "has an options file that is not valid"],
  [
    "another command",
    definitionOf("dough-other", "--a"),
    "has an options file for another command",
  ],
] as const) {
  test(`refuses options when the definition is ${kind}, saying why`, async ({
    installedClaude,
  }) => {
    const server = await installedClaude({}, definitionRevision(file));
    expect(
      await refuseOptions(server, { ...roughRefinement, options: ["--a"] }),
    ).toContain(why);
  });
}

for (const [kind, removed] of [
  ["has no definition", refinementDefinition],
  ["is not installed", refinementSkillFolder],
] as const) {
  test(`refuses options for a project whose skill ${kind}, saying so`, async ({
    installedClaude,
  }) => {
    const server = await installedClaude({}, { remove: [removed] });
    expect(
      await refuseOptions(server, {
        ...roughRefinement,
        options: [explored],
      }),
    ).toContain("has no options file");
  });
}

test("refuses an unreadable definition, saying so", async ({
  installedClaude,
}) => {
  const server = await installedClaude(
    {},
    {
      remove: [refinementDefinition],
      files: {
        [`${refinementDefinition}/fixture`]: "directory instead of a file\n",
      },
    },
  );
  expect(
    await refuseOptions(server, {
      ...roughRefinement,
      options: [explored],
    }),
  ).toContain("has an options file that could not be read");
});

for (const [kind, body] of [
  ["an execution", queuedExecution],
  ["an ad hoc", makeMe.aLaunchRequest.adHoc().please()],
] as const) {
  test(`refuses options on ${kind} request, which has no definition`, async ({
    installedClaude,
  }) => {
    const server = await installedClaude();
    expect(
      await refuseOptions(server, { ...body, options: [explored] }),
    ).toContain("has no options to select");
  });
}
