// The local launch boundary (../server/agentLaunchPlugin.ts) over raw HTTP,
// in dev and preview, for a refinement launch that selects options: the flags
// go after the work item's identity in the installed definition's order, then
// the developer's text, and the record keeps them; no options starts as
// before; an undefined flag, an unusable definition, and options on a
// workflow with no definition are refused with the reason, before any
// `claude` runs. The project's skill is a copy of this repository's
// refinement skill under the literal `.claude/skills` layout; the synthetic
// `claude` (./fixtures/fake-claude) records every call.

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineSessions,
  openDoughFolder,
  refinementRequest,
  title,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const skill = "dough-story-refinement";
const explored = "--explore";
const borrowed = "--borrow";

for (const mode of ["dev", "preview"] as const) {
  test.describe(`agent launch boundary, selected options (${mode} launch mode)`, () => {
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
    const definitionFile = () =>
      path.join(skillFolder(), "references", "refinement-options.json");

    // Each case starts from an installed copy of the real skill.
    test.beforeEach(() => {
      rmSync(skillFolder(), { recursive: true, force: true });
      cpSync(path.join("src", "skills", skill), skillFolder(), {
        recursive: true,
      });
    });

    const replaceDefinition = (text: string) => {
      writeFileSync(definitionFile(), text);
    };

    // Definition text for `command` with one entry, `flag`.
    const definitionOf = (command: string, flag: string) =>
      JSON.stringify({
        command,
        options: [
          { flag, label: flag, summary: `${flag}.`, instruction: `${flag}.` },
        ],
      });

    // Launches and returns the answered record and the `--bg` argv.
    async function launched(body: unknown) {
      server.claudeScenario("launched");
      const callsBefore = server.claudeLaunchCalls().length;
      const response = await launch(server, body);
      expect(response.status, response.body).toBe(200);
      const answer = JSON.parse(response.body) as {
        kind: string;
        record: { request: Record<string, unknown> };
      };
      expect(answer.kind).toBe("launched");
      const calls = server.claudeLaunchCalls();
      expect(calls).toHaveLength(callsBefore + 1);
      return { record: answer.record, argv: calls[callsBefore]?.argv };
    }

    // The refusal's text, with no `claude` run for it.
    async function refused(body: unknown) {
      server.claudeScenario("launched");
      const recordsBefore = (await machineSessions(server)).length;
      const callsBefore = server.claudeCalls().length;
      const response = await launch(server, body);
      expect(response.status).toBe(400);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
      expect(await machineSessions(server)).toHaveLength(recordsBefore);
      return (JSON.parse(response.body) as { error: string }).error;
    }

    test("starts the session with the selected flags in the definition's order, then the developer's text, and keeps them", async () => {
      const { record, argv } = await launched({
        ...refinementRequest,
        options: [borrowed, explored],
        instruction: "go",
      });

      expect(argv).toEqual([
        "--bg",
        "--name",
        `Open Dough · Refinement · ${title}`,
        `/${skill} ${launchRequest.identity} ${explored} ${borrowed}\n\ngo`,
      ]);
      expect(record.request["options"]).toEqual([explored, borrowed]);
      expect(await machineSessions(server)).toContainEqual(
        expect.objectContaining({
          request: expect.objectContaining({ options: [explored, borrowed] }),
        }),
      );
    });

    test("selects a focus beside an option with the model before the instruction", async () => {
      const { argv } = await launched({
        ...refinementRequest,
        model: "opus",
        options: ["--ux-ui", explored],
      });

      expect(argv?.slice(3)).toEqual([
        "--model",
        "opus",
        `/${skill} ${launchRequest.identity} ${explored} --ux-ui`,
      ]);
    });

    test("starts as before with no options, and its record has none", async () => {
      for (const body of [
        refinementRequest,
        { ...refinementRequest, options: [] },
      ]) {
        const { record, argv } = await launched(body);
        expect(argv).toEqual([
          "--bg",
          "--name",
          `Open Dough · Refinement · ${title}`,
          `/${skill} ${launchRequest.identity}`,
        ]);
        expect(record.request["options"] ?? []).toEqual([]);
      }
    });

    test("refuses a flag the definition does not define, naming it", async () => {
      const error = await refused({
        ...refinementRequest,
        options: [explored, "--bogus"],
      });
      expect(error).toContain("--bogus");
      expect(error).not.toContain(explored);
    });

    test("refuses a flag the project's own definition lacks, and starts with one it has", async () => {
      replaceDefinition(definitionOf(skill, "--only"));
      expect(
        await refused({ ...refinementRequest, options: [explored] }),
      ).toContain(explored);
      const { argv } = await launched({
        ...refinementRequest,
        options: ["--only"],
      });
      expect(argv?.[3]).toBe(`/${skill} ${launchRequest.identity} --only`);
    });

    for (const [kind, remove] of [
      [
        "has no definition",
        () => {
          rmSync(definitionFile());
        },
      ],
      [
        "is not installed",
        () => {
          rmSync(skillFolder(), { recursive: true });
        },
      ],
    ] as const) {
      test(`refuses options for a project whose skill ${kind}, saying so`, async () => {
        remove();
        const error = await refused({
          ...refinementRequest,
          options: [explored],
        });
        expect(error).toContain("has no options file");
      });
    }

    for (const [kind, text, why] of [
      ["not JSON", "{", "has an options file that is not valid"],
      [
        "another command",
        definitionOf("dough-other", "--a"),
        "has an options file for another command",
      ],
    ] as const) {
      test(`refuses options when the definition is ${kind}, saying why`, async () => {
        replaceDefinition(text);
        const error = await refused({ ...refinementRequest, options: ["--a"] });
        expect(error).toContain(why);
      });
    }

    test("refuses an unreadable definition, saying so", async () => {
      rmSync(definitionFile());
      mkdirSync(definitionFile());
      const error = await refused({
        ...refinementRequest,
        options: [explored],
      });
      expect(error).toContain("has an options file that could not be read");
    });

    for (const [kind, body] of [
      ["an execution", launchRequest],
      [
        "an ad hoc",
        { source: "open-dough", workflow: "ad-hoc", host: "claude" },
      ],
    ] as const) {
      test(`refuses options on ${kind} request, which has no definition`, async () => {
        const error = await refused({ ...body, options: [explored] });
        expect(error).toContain("has no options to select");
      });
    }
  });
}
