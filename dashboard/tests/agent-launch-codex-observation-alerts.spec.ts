// Actual background polling and osascript boundary with recorded native answers.
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { notRefinedStory } from "./launchJourney.ts";
import { test, expect } from "./support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observed,
  passive,
} from "./support/codexObservation.ts";
test.use({ projectFolders: ["open-dough"] });

// Alerts run without an open page: actual store/server polling and osascript boundary.
test("native transition alerts unrecognized states once and stays quiet for incomplete reads", async ({
  machine,
  codexProtocol,
  dashboard,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture");
  observed(native, "alert", { type: "notLoaded" }, "completed");
  save(dashboard, [record(dashboard, native, "alert")]);
  await dashboard.close();
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    projectFolders: ["open-dough"],
    codexProtocol: native,
    alertCheckMs: 50,
  });
  const reads = () =>
    native.calls.filter((c) => c.method === "thread/read").length;
  const further = async () => {
    const before = reads();
    await expect.poll(reads).toBeGreaterThanOrEqual(before + 3);
  };
  try {
    await further();
    expect(server.osascriptCalls()).toEqual([]);
    observed(native, "alert", { type: "active", activeFlags: [] });
    await further();
    observed(native, "alert", {
      type: "active",
      activeFlags: ["waitingOnUserInput"],
    });
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
    expect(server.osascriptCalls()[0]?.argv.slice(-2)).toEqual([
      "Needs input: Codex is waiting for your input",
      `Open Dough · ${notRefinedStory}`,
    ]);
    await further();
    expect(server.osascriptCalls()).toHaveLength(1);
    native.observations.set("alert", {
      status: { type: "idle" },
      turns: [],
      metadataError: { code: -32600, message: "Native read refused" },
    });
    await further();
    expect(server.osascriptCalls()).toHaveLength(1);
    const unexpected = [
      [{ type: "futureNativeStatus" }, undefined],
      [{ type: "active", activeFlags: ["futureFlag"] }, undefined],
      [{ type: "idle" }, "futureTurnStatus"],
    ] as const;
    for (const [index, [status, turn]] of unexpected.entries()) {
      observed(native, "alert", status, turn);
      await expect.poll(() => server.osascriptCalls().length).toBe(index + 2);
      expect(server.osascriptCalls().at(-1)?.argv.at(-2)).toBe(
        "State not recognized",
      );
      await further();
      expect(server.osascriptCalls()).toHaveLength(index + 2);
      observed(native, "alert", { type: "active", activeFlags: [] });
      await further();
    }
    // Re-entering the same reading after working alerts again.
    observed(native, "alert", { type: "idle" }, "futureTurnStatus");
    await expect.poll(() => server.osascriptCalls().length).toBe(5);
    observed(native, "alert", { type: "active" });
    await further();
    expect(server.osascriptCalls()).toHaveLength(5);
    native.observations.set("alert", {
      status: { type: "idle" },
      turns: [],
      historyError: {
        code: -32601,
        message: "list_turns is not supported yet",
      },
    });
    await further();
    expect(server.osascriptCalls()).toHaveLength(5);
    observed(native, "alert", { type: "idle" }, "completed");
    await expect.poll(() => server.osascriptCalls().length).toBe(6);
    await further();
    expect(server.osascriptCalls().at(-1)?.argv.at(-2)).toBe(
      "Ready for review",
    );
    passive(native.calls);
  } finally {
    await server.close();
  }
});
