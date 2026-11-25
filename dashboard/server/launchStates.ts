// Read each selected host once and join its normalized target observations.
// A missing response is unknown. Only a host can confirm native absence.
import { configuredProject } from "./projectConfiguration.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { shownLaunchWorkspace } from "./launchWorkspace.ts";
import { recordedWorkspaceStates } from "./sessionWorkspace.ts";
import type {
  LaunchRecord,
  LaunchWithState,
  SessionState,
} from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { launchHost, type LaunchHost } from "./launchHosts.ts";
import type { SessionObservation } from "./hostLaunch.ts";
import type { LocalFolder } from "./localFolder.ts";

const observationWaitMs = 10_000;

// How a host reads its recorded sessions, by the host's name.
export type HostSessions = (
  host: LaunchRecord["session"]["host"],
) => LaunchHost["sessions"];
const launchHostSessions: HostSessions = (host) => launchHost(host)?.sessions;

// Enforce the common read deadline even if a host cannot settle its transport
// on abort. Rejection is isolated to this host's records, never other hosts.
async function observed(
  records: readonly LaunchRecord[],
  folder: LocalFolder,
  hostSessions: HostSessions,
): Promise<readonly SessionObservation[]> {
  const host = records[0]?.session.host;
  if (host === undefined) return [];
  const sessions = hostSessions(host);
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

// Each session's state by its key, as the first observation naming it says.
async function observedStates(
  folder: LocalFolder,
  records: readonly LaunchRecord[],
  hostSessions: HostSessions,
): Promise<ReadonlyMap<string, SessionState>> {
  const byHost = new Map<string, LaunchRecord[]>();
  for (const record of records) {
    const hostRecords = byHost.get(record.session.host);
    if (hostRecords === undefined) byHost.set(record.session.host, [record]);
    else hostRecords.push(record);
  }
  const states = new Map<string, SessionState>();
  for (const observations of await Promise.all(
    [...byHost.values()].map((hostRecords) =>
      observed(hostRecords, folder, hostSessions),
    ),
  ))
    for (const { session, sessionState } of observations) {
      const key = sessionKey(session);
      if (!states.has(key)) states.set(key, sessionState);
    }
  return states;
}

export async function withStates(
  folder: LocalFolder,
  records: readonly LaunchRecord[],
  observation: "recurring" | "on-demand" = "on-demand",
  hostSessions: HostSessions = launchHostSessions,
): Promise<readonly LaunchWithState[]> {
  const observes = ({ session, doneAt }: LaunchRecord) =>
    observation !== "recurring" ||
    session.host !== "codex" ||
    doneAt === undefined;
  const [states, workspaceStates] = await Promise.all([
    observedStates(folder, records.filter(observes), hostSessions),
    recordedWorkspaceStates(records),
  ]);
  const folders = new Map<string, LocalFolder | undefined>();
  const folderOf = (source: string) => {
    if (!folders.has(source)) {
      const project = configuredProject(source);
      folders.set(
        source,
        project === undefined ? undefined : executionCheckout(project),
      );
    }
    return folders.get(source);
  };
  return records.map((record, index) => ({
    ...record,
    ...shownLaunchWorkspace(record, folderOf(record.request.source)),
    workspaceState: workspaceStates[index],
    sessionState: observes(record)
      ? (states.get(sessionKey(record.session)) ?? { kind: "unknown" })
      : { kind: "not-observed" },
  }));
}
