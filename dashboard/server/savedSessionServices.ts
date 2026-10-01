// The server restores host services once for its retained catalog conversations.
// This lifecycle never creates or resumes a conversation.
import { catalog } from "../src/publishedSource.ts";
import { keptRecordsByProject } from "./launchRecordStore.ts";
import { launchHost } from "./launchHosts.ts";

export class SavedSessionServices {
  private readonly controller = new AbortController();
  readonly ready = this.prepareSavedSessions();

  // Once per server lifetime, restore only services needed by retained catalog
  // conversations. Failure leaves ordinary passive observation/recovery intact.
  private async prepareSavedSessions(): Promise<void> {
    const deadline = setTimeout(() => {
      this.controller.abort();
    }, 10_000);
    try {
      const kept = await keptRecordsByProject();
      const hosts = new Set(
        catalog.flatMap((source) =>
          (kept.get(source.id) ?? []).map((record) => record.session.host),
        ),
      );
      await Promise.all(
        [...hosts].map(async (host) => {
          if (this.controller.signal.aborted) return;
          try {
            await launchHost(host)?.prepareSavedSessions?.(
              this.controller.signal,
            );
          } catch {
            // Missing/refusing CLI never discards records or blocks the dashboard.
          }
        }),
      );
    } catch {
      // Unreadable local evidence establishes no service to start.
    } finally {
      clearTimeout(deadline);
    }
  }

  close(): void {
    this.controller.abort();
  }
}
