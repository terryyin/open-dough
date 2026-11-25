// The installed refinement definition orders flags and enforces its exclusive groups.
import type { OptionsDefinition } from "../../src/commandOptions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect } from "../../test-support/support/pageTest.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import {
  expectStoryCommand,
  launchClaude,
  otherRefinement,
  refinementDefinition,
  refinementSkill,
  refuseOptions,
  roughRefinement,
  test,
} from "../support/installedClaudeLaunch.ts";

const [a, b, c] = ["--a", "--b", "--c"];
const entry = (flag: string) => makeMe.anOptionsEntry.with({ flag }).please();
const group = (...flags: string[]) =>
  makeMe.anExclusiveOptionGroup
    .with({ id: "pair", label: "Pair", flags })
    .please();

function definitionWith(
  groups: NonNullable<OptionsDefinition["groups"]>,
  focuses: readonly string[] = [c],
) {
  const definition = makeMe.anOptionsDefinition
    .with({
      command: refinementSkill,
      options: [a, b].map(entry),
      focuses: focuses.map(entry),
      groups,
    })
    .please();
  return { files: { [refinementDefinition]: JSON.stringify(definition) } };
}

async function expectSelectedFlags(
  server: DashboardServer,
  options: string[],
  shown: string,
  story = roughRefinement,
) {
  const result = await launchClaude(server, { ...story, options });
  expectStoryCommand(
    result.started,
    `/${refinementSkill} ${story.identity} ${shown}`,
  );
}

test("launches a free flag beside one flag of the group, in the definition's order", async ({
  installedClaude,
}) => {
  const server = await installedClaude({}, definitionWith([group(a, b)]));
  await expectSelectedFlags(server, [c, a], `${a} ${c}`);
});

test("launches with one flag of the group alone, or none of them", async ({
  installedClaude,
}) => {
  const server = await installedClaude({}, definitionWith([group(a, b)]));
  await expectSelectedFlags(server, [b], b);
  await expectSelectedFlags(server, [c], c, otherRefinement);
});

test("refuses two flags of the group, naming the group and both flags", async ({
  installedClaude,
}) => {
  const server = await installedClaude({}, definitionWith([group(a, b)]));
  const error = await refuseOptions(server, {
    ...roughRefinement,
    options: [b, c, a],
  });
  expect(error).toContain("Pair");
  expect(error).toContain(`${a} and ${b}`);
  expect(error).not.toContain(c);
});

test("honors each group on its own, and flags of different groups together", async ({
  installedClaude,
}) => {
  const server = await installedClaude(
    {},
    definitionWith(
      [group(a, b), { ...group(c, "--d"), id: "other" }],
      [c, "--d"],
    ),
  );
  await expectSelectedFlags(server, [a, c], `${a} ${c}`);
  expect(
    await refuseOptions(server, {
      ...otherRefinement,
      options: [c, "--d"],
    }),
  ).toContain(`${c} and --d`);
});
