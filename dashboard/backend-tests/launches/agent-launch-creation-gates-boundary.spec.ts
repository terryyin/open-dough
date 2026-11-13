// Native creation admission over real HTTP and durable machine evidence:
// unreadable launch evidence refuses Codex before native creation but admits
// Claude, and preserves the unreadable file beside the new store. A saved
// creation whose host lacks recovery, on the page:
// ../../../e2e/launches/agent-launch-creation-gates.spec.ts.
import { readFileSync } from "node:fs";
import { test, expect } from "../../tests/support/codexLaunch.ts";
import { launch } from "../../tests/agentLaunchBoundary.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  keepLaunchStoreText,
  launchStoreFile,
} from "../../tests/support/launchStore.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.use({ projectFolders: ["open-dough"] });

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
