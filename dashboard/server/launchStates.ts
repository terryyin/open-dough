// Read each recorded host once and join its normalized target observations.
// Failure or omission is unknown; only the host confirms native absence.
import { savedWorkspaceState } from "./sessionWorkspace.ts";
import type { LaunchRecord, LaunchWithState } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { launchHost } from "./launchHosts.ts";
import type { SessionObservation } from "./hostLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const observationWaitMs = 10_000;

// Enforce the common read deadline even if a host cannot settle its transport
// on abort. Rejection is isolated to this host's records, never other hosts.
async function observed(
  records: readonly LaunchRecord[],
  folder: ProjectFolder,
): Promise<readonly SessionObservation[]> {
  const host = records[0]?.session.host;
  if (host === undefined) return [];
  const sessions = launchHost(host)?.sessions;
  if (sessions === undefined) return [];
  const signal = AbortSignal.timeout(observationWaitMs);
  let expire: (() => void) | undefined;
  const expiry = new Promise<readonly SessionObservation[]>((resolve) => {
    expire = () => {
      resolve([]);
    };
    signal.addEventListener("abort", expire, { once: true });
  });
  try {
    return await Promise.race([sessions(records, folder, signal), expiry]);
  } catch {
    return [];
  } finally {
    if (expire !== undefined) signal.removeEventListener("abort", expire);
  }
}

export async function withStates(
  folder: ProjectFolder,
  records: readonly LaunchRecord[],
): Promise<readonly LaunchWithState[]> {
  const hosts = [...new Set(records.map((record) => record.session.host))];
  const observations = (
    await Promise.all(
      hosts.map((host) =>
        observed(
          records.filter((record) => record.session.host === host),
          folder,
        ),
      ),
    )
  ).flat();
  return Promise.all(
    records.map(async (record) => ({
      ...record,
      ...(record.session.host === "codex"
        ? { workspaceState: await savedWorkspaceState(record.session) }
        : {}),
      sessionState: observations.find(
        (entry) => sessionKey(entry.session) === sessionKey(record.session),
      )?.sessionState ?? { kind: "unknown" },
    })),
  );
}
