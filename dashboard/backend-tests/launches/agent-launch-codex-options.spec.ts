// Selected-host defaults and admission are proven before native creation.
import { readFileSync, realpathSync } from "node:fs";
import { launchStoreFile } from "../../test-support/support/launchStore.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  queuedDashboardRepository,
} from "../../test-support/launchJourney.ts";
import { test as installedStart } from "../../test-support/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../test-support/support/codexLaunch.ts";
import {
  launch,
  machineSessions,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  daemonStarts,
  passive,
} from "../../test-support/support/codexObservation.ts";

// No page: the local boundaries alone answer these requests.
test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough"],
});
const missingOptions = installedStart.extend({
  originRepository: queuedDashboardRepository()
    .withRevision("without-options", {
      message: "Remove installed Codex refinement options",
      remove: [
        ".agents/skills/dough-story-refinement/references/refinement-options.json",
      ],
    })
    .please(),
});
const refinementRequest = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .please();

missingOptions(
  "missing Codex options allow defaults, selected options/model are refused before native creation",
  async ({ dashboard, codexProtocol: protocol }) => {
    const native = protocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    for (const changed of [{ options: ["--explore"] }, { model: "opus" }]) {
      const response = await launch(dashboard, {
        ...refinementRequest,
        host: "codex",
        ...changed,
      });
      expect(response.status).toBe(400);
      expect(
        native.calls.filter((call) =>
          ["thread/start", "turn/start"].includes(call.method),
        ),
      ).toEqual([]);
    }
    const response = await launch(dashboard, {
      ...refinementRequest,
      host: "codex",
    });
    expect(response.status).toBe(200);
    // Settings discovery, explicit launch, then one saved-host preparation.
    expect(daemonStarts(native)).toEqual([
      { cwd: realpathSync(dashboard.home) },
      { cwd: realpathSync(dashboard.home) },
      { cwd: realpathSync(dashboard.home) },
    ]);
    expect(JSON.parse(response.body)).toMatchObject({
      kind: "launched",
      record: { firstInput: { state: "confirmed" } },
    });
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    const recordFile = launchStoreFile(dashboard.home);
    const before = readFileSync(recordFile, "utf8");
    const starts = daemonStarts(native);
    const observedFrom = native.calls.length;
    await machineSessions(dashboard);
    await machineSessions(dashboard);
    expect(daemonStarts(native)).toEqual(starts);
    expect(readFileSync(recordFile, "utf8")).toBe(before);
    passive(native.calls.slice(observedFrom));
  },
);

test("native creation refusal exposes a bounded message, never arbitrary error data", async ({
  dashboard,
  codexProtocol: protocol,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.refuseCreation = true;
  for (const [error, cause] of [
    [
      {
        code: -32600,
        message:
          "failed to load configuration: No such file or directory (os error 2)",
        data: { credential: "private-native-data" },
      },
      "failed to load configuration: No such file or directory (os error 2)",
    ],
    [
      { code: -32600, message: { credential: "private-native-data" } },
      "Codex refused the native request.",
    ],
    [
      { code: -32600, message: "x".repeat(501), data: "private-native-data" },
      "Codex refused the native request.",
    ],
  ] as const) {
    native.creationError = error;
    const response = await launch(dashboard, {
      ...makeMe.aLaunchRequest
        .adHoc({ host: "codex" })
        .withInstruction("Explain this story.")
        .please(),
    });
    expect(JSON.parse(response.body)).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation: expect.stringContaining(cause),
    });
    expect(response.body).not.toContain("private-native-data");
    expect(
      native.calls.filter(({ method }) => method === "turn/start"),
    ).toEqual([]);
  }
});
