// Native creation admission runs through real HTTP and durable machine evidence;
// unreadable evidence:
// ../../dashboard/backend-tests/launches/agent-launch-creation-gates-boundary.spec.ts.
import { test, expect } from "../../dashboard/tests/support/codexLaunch.ts";
import { machineHome } from "../../dashboard/tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keptLaunchStore,
} from "../../dashboard/tests/support/launchStore.ts";
import type { CreationRecord } from "../../dashboard/src/launchCreation.ts";
import { rawRequest } from "../../dashboard/tests/support/rawHttp.ts";
import {
  agentLaunchEndpoint,
  launchRecordsSchema,
} from "../../dashboard/src/agentLaunch.ts";
import { openTakenBacklog } from "../../dashboard/tests/launchStoryCardPage.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });
// Stand-in host inspection-args UI: dashboard/frontend-tests/agent-launch-creation-gates.spec.ts.

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
