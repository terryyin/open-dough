// Read each recorded host once and join its current observation with local
// evidence. An unavailable host/listing yields unknown rather than absence.
import type { LaunchRecord, LaunchWithState } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { launchHost } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const listingWaitMs = 10_000;

export async function withStates(
  folder: ProjectFolder,
  records: readonly LaunchRecord[],
): Promise<readonly LaunchWithState[]> {
  const hosts = [...new Set(records.map((record) => record.session.host))];
  const observations = new Map(
    await Promise.all(
      hosts.map(
        async (host) =>
          [
            host,
            await launchHost(host)?.sessions?.(
              folder,
              AbortSignal.timeout(listingWaitMs),
            ),
          ] as const,
      ),
    ),
  );
  return records.map((record) => {
    const listed = observations.get(record.session.host);
    return {
      ...record,
      sessionState:
        listed === undefined
          ? { kind: "unknown" }
          : (listed.find(
              (entry) =>
                sessionKey(entry.session) === sessionKey(record.session),
            )?.sessionState ?? { kind: "unlisted" }),
    };
  });
}
