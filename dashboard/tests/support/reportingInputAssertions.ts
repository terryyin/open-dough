// Inspect native input against this launch's independently retained channel.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { repoRoot } from "./repositoryRoot.ts";

export function expectReportingBlock(
  block: string | undefined,
  request: RecordedLaunchRequest | undefined,
  server: Pick<DashboardServer, "home" | "origin">,
) {
  const context = request?.reporting;
  if (context === undefined || request === undefined)
    throw new Error("Missing recorded reporting context.");
  expect(context.origin).toBe(server.origin);
  expect(context.reference).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  const quote = (part: string) => `'${part.replaceAll("'", "'\\''")}'`;
  expect(context.command).toBe(
    [
      "node",
      path.join(
        server.home,
        ".open-dough/dashboard/reporting",
        context.reference,
        "dashboard-completion.mjs",
      ),
      "--origin",
      server.origin,
      "--source",
      request.source,
      "--host",
      request.host,
      "--reference",
      context.reference,
    ]
      .map(quote)
      .join(" "),
  );
  const lines = block?.split("\n") ?? [];
  expect(lines.slice(0, 5)).toEqual([
    "Dashboard reporting context:",
    `- project: ${request.source}`,
    `- host: ${request.host}`,
    `- launch reference: ${context.reference}`,
    `- reporting command: ${context.command}`,
  ]);
  expect(lines).toHaveLength(6);
  for (const rule of [
    /Dough Land or Story Wrap Up[\s\S]+after all required operations and final wording settle/,
    /--outcome completed[\s\S]+no message file/,
    /final operation[\s\S]+wait for its matching receipt[\s\S]+minimal native response/,
    /Silence, a marker, or process exit cannot report success/,
    /--outcome unfinished[\s\S]+--message-file[\s\S]+exact response/,
    /pending-native-session receipt[\s\S]+only this launch/,
    /does not stop the session or declare the story complete/,
    /delivery fails[\s\S]+reporting-only --retry[\s\S]+without repeating Git or retirement/,
  ])
    expect(lines[5]).toMatch(rule);
}

export function expectAdHocReportingInput(
  input: string,
  instruction: string,
  request: RecordedLaunchRequest | undefined,
  server: Pick<DashboardServer, "home" | "origin">,
) {
  const [developer, reporting, ...extra] = input.split("\n\n");
  expect(developer).toBe(instruction);
  expect(extra).toEqual([]);
  expectReportingBlock(reporting, request, server);
}

// The workspace's installed reporting script is the one this release ships.
export function expectInstalledReportingScript(workspace: string) {
  const script = "dough-execute-plan/scripts/dashboard-completion.mjs";
  expect(
    readFileSync(path.join(workspace, ".agents/skills", script), "utf8"),
  ).toBe(readFileSync(path.join(repoRoot, "src/skills", script), "utf8"));
}
