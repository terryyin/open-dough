// The local launch boundary (../server/agentLaunchPlugin.ts) over raw HTTP,
// in dev and preview, for a definition that declares an exclusive group: a
// selection with at most one of the group's flags launches (the flags in the
// definition's order), one naming two of them is refused naming the group and
// both flags; which groups make a definition malformed is
// ./agent-launch-options-rules.spec.ts. The project's skill is a copy of this
// repository's refinement skill references with its definition replaced; the
// synthetic `claude` records every call.

import { cpSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  launch,
  launchRequest,
  machineSessions,
  openDoughFolder,
  refinementRequest,
} from "./agentLaunchBoundary.ts";
import { closeOpenSessions } from "./openStorySessionSetup.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const skill = "dough-story-refinement";
const [a, b, c] = ["--a", "--b", "--c"];

for (const mode of ["dev", "preview"] as const) {
  test.describe(`agent launch boundary, exclusive option groups (${mode} launch mode)`, () => {
    test.describe.configure({ mode: "serial" });
    let server: DashboardServer;

    test.beforeAll(async () => {
      server = await startDashboardServer({
        mode,
        prebuilt: mode === "preview" ? builtDashboardDir : undefined,
        projectFolders: ["open-dough"],
      });
    });

    test.afterAll(async () => {
      await server.close();
    });

    const skillFolder = () =>
      path.join(openDoughFolder(server), ".claude", "skills", skill);

    // Each case starts from an installed copy of the real skill's references;
    // its scripts stay out, so the launch establishes no preparation.
    test.beforeEach(() => {
      rmSync(skillFolder(), { recursive: true, force: true });
      cpSync(
        path.join("src", "skills", skill, "references"),
        path.join(skillFolder(), "references"),
        { recursive: true },
      );
    });

    const entry = (flag: string) => ({
      flag,
      label: flag,
      summary: `${flag}.`,
      instruction: `${flag}.`,
    });

    // Installs a definition of options A and B and focus C, with these groups.
    const defineWith = (
      groups: unknown[],
      { focuses = [c] }: { focuses?: readonly string[] } = {},
    ) => {
      writeFileSync(
        path.join(skillFolder(), "references", "refinement-options.json"),
        JSON.stringify({
          command: skill,
          options: [a, b].map(entry),
          focuses: focuses.map(entry),
          groups,
        }),
      );
    };

    const group = (...flags: string[]) => ({
      id: "pair",
      label: "Pair",
      selection: "exclusive",
      flags,
    });

    const argvOf = async (options: string[]) => {
      await closeOpenSessions(server);
      server.claudeScenario("launched");
      const callsBefore = server.claudeLaunchCalls().length;
      const response = await launch(server, { ...refinementRequest, options });
      expect(response.status, response.body).toBe(200);
      const calls = server.claudeLaunchCalls();
      expect(calls).toHaveLength(callsBefore + 1);
      return calls[callsBefore]?.argv[3];
    };

    // The refusal's text, with no `claude` run and no record for it.
    async function refused(options: string[]) {
      server.claudeScenario("launched");
      const recordsBefore = (await machineSessions(server)).length;
      const callsBefore = server.claudeCalls().length;
      const response = await launch(server, { ...refinementRequest, options });
      expect(response.status).toBe(400);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
      expect(await machineSessions(server)).toHaveLength(recordsBefore);
      return (JSON.parse(response.body) as { error: string }).error;
    }

    test("launches a free flag beside one flag of the group, in the definition's order", async () => {
      defineWith([group(a, b)]);
      expect(await argvOf([c, a])).toBe(
        `/${skill} ${launchRequest.identity} ${a} ${c}`,
      );
    });

    test("launches with one flag of the group alone, or none of them", async () => {
      defineWith([group(a, b)]);
      for (const [selection, shown] of [
        [[b], b],
        [[c], c],
      ] as const) {
        expect(await argvOf([...selection])).toBe(
          `/${skill} ${launchRequest.identity} ${shown}`,
        );
      }
    });

    test("refuses two flags of the group, naming the group and both flags", async () => {
      defineWith([group(a, b)]);
      const error = await refused([b, c, a]);
      expect(error).toContain("Pair");
      expect(error).toContain(`${a} and ${b}`);
      expect(error).not.toContain(c);
    });

    test("honors each group on its own, and flags of different groups together", async () => {
      defineWith([group(a, b), { ...group(c, "--d"), id: "other" }], {
        focuses: [c, "--d"],
      });
      expect(await argvOf([a, c])).toBe(
        `/${skill} ${launchRequest.identity} ${a} ${c}`,
      );
      expect(await refused([c, "--d"])).toContain(`${c} and --d`);
    });
  });
}
