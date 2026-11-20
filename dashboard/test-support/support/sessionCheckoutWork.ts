// Drives a Default main session through launch, dated work in its checkout
// and Done. The specs retain their own observations of Git and review answers.
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch, markDone } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { launchedAdHoc } from "./reportedLaunch.ts";
import { commitAt } from "./sessionCheckoutGit.ts";
import type { StartOrigin } from "./startOrigin.ts";

export class DefaultMainSessionWork {
  constructor(
    private readonly dashboard: DashboardServer,
    private readonly origin: StartOrigin,
  ) {}

  private get checkout() {
    return this.origin.project;
  }

  launchReporting(instruction: string) {
    return launchedAdHoc(this.dashboard, this.origin, instruction);
  }

  commit(at: string, file: string, content?: string) {
    return commitAt(this.checkout, at, file, content);
  }

  // Launches an ad hoc session in the project's Default main checkout, blank
  // unless given an instruction; answers its record as launched.
  async launch(instruction?: string): Promise<LaunchRecord> {
    this.dashboard.claudeScenario("launched");
    const launched = await launch(
      this.dashboard,
      makeMe.aLaunchRequest
        .adHoc(instruction === undefined ? {} : { instruction })
        .please(),
    );
    expect(launched.status).toBe(200);
    return (JSON.parse(launched.body) as { record: LaunchRecord }).record;
  }

  // Marks the session done; answers its Done time.
  async markDone(session: string): Promise<string | undefined> {
    const done = await markDone(this.dashboard, {
      source: "open-dough",
      session,
    });
    expect(done.status).toBe(200);
    return (JSON.parse(done.body) as { record: LaunchRecord }).record.doneAt;
  }
}
