// Remove/corrupt accepted attempt evidence after native creation, before binding.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launchResultSchema } from "../src/launchOutcome.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { CreationRecord } from "../src/launchCreation.ts";
import { test, expect } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";

for (const fault of ["missing", "unreadable"] as const) {
  test(`mid-launch ${fault} attempt refuses a false binding, retains native recovery identity and submits no first input`, async ({
    dashboard,
    codexProtocol: native,
  }) => {
    if (native === undefined) throw new Error("No native fixture");
    const nativeSession = native;
    const attempts = path.join(
      dashboard.home,
      ".open-dough/dashboard/launch-attempts.json",
    );
    let reached = false;
    nativeSession.afterCreation = () => {
      expect(existsSync(attempts)).toBe(true);
      reached = true;
      if (fault === "missing") {
        rmSync(attempts);
      } else {
        writeFileSync(attempts, "unreadable attempt evidence\n");
      }
    };
    const result = launchResultSchema.parse(
      JSON.parse(
        (
          await launch(dashboard, {
            source: "open-dough",
            host: "codex",
            workflow: "ad-hoc",
            instruction: "Start this bounded assignment.",
          })
        ).body,
      ),
    );
    expect(reached).toBe(true);
    expect(result.kind).toBe("uncertain");
    if (result.kind !== "uncertain")
      throw new Error("No uncertain recovery outcome");
    expect(result.explanation).toContain(native.threadId);
    expect(result.explanation).toContain("could not be saved in the dashboard");
    expect(result.explanation).toContain("No first input was submitted");
    expect(result.explanation).toContain("codex");
    expect(result.explanation).toContain("resume");
    expect(
      native.calls.filter((call) => call.method === "thread/start"),
    ).toHaveLength(1);
    expect(
      native.calls.filter((call) => call.method === "turn/start"),
    ).toHaveLength(0);
    const document = JSON.parse(
      readFileSync(
        path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
        "utf8",
      ),
    ) as Record<string, Array<LaunchRecord | CreationRecord>>;
    expect(
      (document["open-dough"] ?? []).filter((entry) => "session" in entry),
    ).toHaveLength(0);
    if (fault === "unreadable") {
      expect(readFileSync(`${attempts}.unreadable`, "utf8")).toBe(
        "unreadable attempt evidence\n",
      );
    }
  });
}
