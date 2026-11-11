// Native creation admission runs through real HTTP and durable machine evidence.
import { readFileSync } from "node:fs";
import { test, expect } from "../support/codexLaunch.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { machineHome } from "../machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keepLaunchStoreText,
  keptLaunchStore,
  launchStoreFile,
} from "../support/launchStore.ts";
import type { CreationRecord } from "../../src/launchCreation.ts";
import { rawRequest } from "../support/rawHttp.ts";
import {
  agentLaunchEndpoint,
  launchRecordsSchema,
} from "../../src/agentLaunch.ts";
import { openTakenBacklog } from "../launchStoryCardPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });
// Stand-in host inspection-args UI: dashboard/frontend-tests/agent-launch-creation-gates.spec.ts.

test("unreadable evidence refuses Codex before native creation but admits Claude and preserves the file", async ({
  dashboard,
  machine,
  codexProtocol,
}) => {
  if (machine === undefined || codexProtocol === undefined)
    throw new Error("Missing native machine fixture.");
  const unreadable = "{ unreadable launch evidence";
  keepLaunchStoreText(machineHome(machine), unreadable);
  const request = makeMe.aLaunchRequest
    .adHoc({ instruction: "Inspect safely." })
    .please();
  const refused = JSON.parse(
    (await launch(dashboard, { ...request, host: "codex" })).body,
  ) as { kind: string; reason?: string; explanation: string };
  expect(refused).toMatchObject({ kind: "uncertain", reason: "unconfirmed" });
  expect(refused.explanation).toContain("Codex");
  expect(refused.explanation).toContain("native Codex history");
  expect(refused.explanation).not.toContain("--remote");
  expect(
    codexProtocol.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(0);
  expect(readFileSync(launchStoreFile(machineHome(machine)), "utf8")).toBe(
    unreadable,
  );
  dashboard.claudeScenario("launched");
  expect(
    JSON.parse((await launch(dashboard, { ...request, host: "claude" })).body),
  ).toMatchObject({ kind: "launched" });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(
    readFileSync(`${launchStoreFile(machineHome(machine))}.unreadable`, "utf8"),
  ).toBe(unreadable);
});

test("a saved creation whose host lacks recovery stays visible with unavailable advice and no borrowed command", async ({
  dashboard,
  machine,
  page,
  launchJourney,
}) => {
  if (machine === undefined) throw new Error("Missing machine fixture.");
  const record: CreationRecord = makeMe.aCreationRecord
    .adHoc({
      title: "Unsupported recovery",
      instruction: "Inspect.",
      host: "claude",
    })
    .unresolved({
      workspace: "/saved workspace",
      endpoint: "unix:///saved endpoint",
    })
    .launchedAt("2026-10-01T00:00:00.000Z")
    .please();
  keepLaunchStore(machineHome(machine), {
    "open-dough": [record],
  });
  const reply = await rawRequest({
    url: `${dashboard.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: dashboard.origin },
  });
  expect(reply.status).toBe(200);
  const answer = launchRecordsSchema.parse(JSON.parse(reply.body));
  expect(answer.creations[0]?.recovery).toEqual({ hostName: "Claude Code" });
  await openTakenBacklog(page, launchJourney);
  const entry = page.getByRole("article", {
    name: "Unsupported recovery unresolved creation",
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText(
    "Conversation creation in Claude Code unresolved",
  );
  await expect(entry).toContainText("Native history inspection is unavailable");
  await expect(entry).not.toContainText("codex");
  await expect(entry).not.toContainText("--remote");
  expect(keptLaunchStore(machineHome(machine))).toEqual({
    "open-dough": [record],
  });
});
