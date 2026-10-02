// Restore services once per host when configured retained conversations need them.
// Re-adding a project can expose a host absent at startup. Never create/resume a
// conversation, and never stop a native session when configuration is removed.
import { configuredProjects } from "./projectConfiguration.ts";
import { keptRecordsByProject } from "./launchRecordStore.ts";
import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import { launchHost } from "./launchHosts.ts";

export class SavedSessionServices {
  private readonly controller = new AbortController();
  private readonly prepared = new Map<string, Promise<void>>();
  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const kept = await keptRecordsByProject();
      const hosts = new Set(
        configuredProjects().flatMap((source) =>
          (kept.get(source.id) ?? []).map((record) => record.session.host),
        ),
      );
      await Promise.all(
        [...hosts].map((host) => {
          const previous = this.prepared.get(host);
          if (previous) return previous;
          const preparing = this.prepare(host);
          this.prepared.set(host, preparing);
          return preparing;
        }),
      );
    } catch {
      // Unreadable evidence establishes no service to restore.
    }
  }

  private async prepare(host: AgentLaunchRequest["host"]): Promise<void> {
    if (this.controller.signal.aborted) return;
    const deadline = new AbortController();
    const timer = setTimeout(() => {
      deadline.abort();
    }, 10_000);
    try {
      await launchHost(host)?.prepareSavedSessions?.(
        AbortSignal.any([this.controller.signal, deadline.signal]),
      );
    } catch {
      // Missing/refusing CLI preserves ordinary passive observation/recovery.
    } finally {
      clearTimeout(timer);
    }
  }

  close(): void {
    this.controller.abort();
  }
}
