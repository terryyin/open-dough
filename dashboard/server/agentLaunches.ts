// Performs one admitted agent launch for the local launch boundary
// (`./agentLaunchPlugin.ts`): resolve the project folder
// (`./projectFolders.ts`), run the host (`./claudeCode.ts`) within the launch
// wait, and record a confirmed result. Records are kept per project in this
// process only, like the read boundary's in-process memos; a restart forgets
// them, and origin still decides every story fact.

import type {
  AgentLaunchRequest,
  LaunchRecord,
  LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { launchClaude } from "./claudeCode.ts";
import { folderExists, projectFolder } from "./projectFolders.ts";

const defaultLaunchWaitMs = 30_000;

// How long one launch -- the host's start and its confirmation -- may take
// before its answer is uncertain. A test may shorten it through the
// environment.
function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

export class AgentLaunches {
  private readonly records = new Map<string, LaunchRecord[]>();
  private readonly running = new Set<AbortController>();

  recordsOf(source: PublishedSource): readonly LaunchRecord[] {
    return this.records.get(source.id) ?? [];
  }

  // A launch settles on its own even if the requester goes away, so its
  // record is kept for the next read.
  async launch(
    source: PublishedSource,
    request: AgentLaunchRequest,
  ): Promise<LaunchResult> {
    const folder = projectFolder(source);
    if (!(await folderExists(folder))) {
      return {
        kind: "failed",
        reason: "folder-not-found",
        explanation: `The project folder ${folder.shown} was not found on this machine. Nothing was launched.`,
      };
    }
    const controller = new AbortController();
    this.running.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
    }, launchTimeoutMs());
    try {
      const launched = await launchClaude(
        source,
        request,
        folder,
        controller.signal,
      );
      if (launched.kind !== "launched") {
        return launched;
      }
      const record: LaunchRecord = {
        request,
        session: launched.session,
        launchedAt: new Date().toISOString(),
      };
      this.records.set(source.id, [...this.recordsOf(source), record]);
      return { kind: "launched", record };
    } finally {
      clearTimeout(timer);
      this.running.delete(controller);
    }
  }

  // Ends any host process still starting when the server closes.
  close(): void {
    for (const controller of this.running) {
      controller.abort();
    }
    this.running.clear();
  }
}
