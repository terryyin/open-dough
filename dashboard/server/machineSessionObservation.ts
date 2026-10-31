// The machine's sessions as this server observes them, shared by every
// viewer's sessions answer (`./launchBoundaryAnswer.ts`) and the notification
// observer (`./sessionAlerts.ts`) through one shared observation
// (`./sharedObservation.ts`): every catalog project's launch records with each
// session's state, the launch attempts, creations, catalog facts, starts,
// alerts availability, and workspaces, serialized once per observation with
// the SHA-256 of that serialization as its revision. A demand within a second
// of a settled observation, or while one runs, is answered by it, so the
// saved-session services refresh and each host's native listing run once for
// all of them. An observation stands only for the project catalog and the
// machine documents it began under: a catalog change, or any process changing
// a machine document, makes the next demand observe afresh. Native
// session and installation changes are seen at most a second plus one
// observation later. Each waiter waits at most the read wait, then is told to
// ask again; one leaving never ends the observation for the others.

import { createHash } from "node:crypto";
import { readdir, stat } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import path from "node:path";
import type {
  Alerts,
  AttemptObservation,
  KeptStart,
  LaunchWithState,
  OfferedDefinition,
  RunningStart,
} from "../src/agentLaunch.ts";
import type { FeedbackMaintenanceState } from "../src/feedbackMaintenanceState.ts";
import type { LocalWorkspace } from "../src/localWorkspace.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { configuredLimit } from "./configuredLimit.ts";
import type { FeedbackMaintenanceCheck } from "./feedbackMaintenanceCheck.ts";
import { hostOperations } from "./launchHosts.ts";
import { localWorkspaces } from "./localWorkspaces.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { machineJsonReplacements } from "./machineJsonStore.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { SharedObservation } from "./sharedObservation.ts";

// How long a waiter waits for the observation. A test may shorten it.
const waitMs = () => configuredLimit("DOUGH_SESSIONS_WAIT_MS", readWaitLimitMs);
// How long a settled observation serves later demand. A test may shorten it.
const reuseMs = () => configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000);

const unanswered = `The machine's sessions were not observed within ${readWaitLimitMs / 1000} seconds. Ask again.`;

// The machine's sessions answer.
type MachineSessionsBody = {
  readonly records: readonly LaunchWithState[];
  readonly feedbackMaintenance?: FeedbackMaintenanceState;
  readonly attempts: readonly AttemptObservation[];
  readonly attemptsReadable: boolean;
  readonly hostOperations: ReturnType<typeof hostOperations>;
  readonly creations: Awaited<ReturnType<AgentLaunches["creations"]>>;
  readonly alerts: Alerts;
  readonly establishing: readonly string[];
  readonly establishingPreparation: readonly string[];
  readonly keptStarts: readonly KeptStart[];
  readonly starts: readonly RunningStart[];
  readonly definitions: readonly OfferedDefinition[];
  readonly establishingHosts: Awaited<
    ReturnType<AgentLaunches["establishingHosts"]>
  >;
  readonly sessionPolicies: Awaited<
    ReturnType<AgentLaunches["sessionPolicies"]>
  >;
  readonly workspaces: readonly LocalWorkspace[];
};

export type ObservedMachineSessions = {
  readonly records: readonly LaunchWithState[];
  // The whole sessions answer, as sent.
  readonly serialized: string;
  readonly revision: string;
};

// Every machine document as its file stands now: any process replacing,
// adding, removing, or rewriting one changes it.
async function machineDocumentsIdentity(): Promise<string> {
  const folder = machineDashboardDirectory();
  let names: string[];
  try {
    names = (await readdir(folder)).filter((name) => name.endsWith(".json"));
  } catch {
    return "absent";
  }
  const files = await Promise.all(
    names.sort().map(async (name) => {
      try {
        const { ino, mtimeNs, size } = await stat(path.join(folder, name), {
          bigint: true,
        });
        return `${name}:${ino}:${mtimeNs}:${size}`;
      } catch {
        return `${name}:absent`;
      }
    }),
  );
  return files.join("|");
}

async function observeMachineSessions(
  launches: AgentLaunches,
  alerts: () => Alerts,
  maintenance: Pick<FeedbackMaintenanceCheck, "state">,
): Promise<ObservedMachineSessions> {
  const { attempts, readable } = await launches.attempts();
  const records = await launches.machineSessions();
  const feedbackMaintenance = maintenance.state(records, attempts);
  const body: MachineSessionsBody = {
    records,
    ...(feedbackMaintenance !== undefined && { feedbackMaintenance }),
    attempts,
    attemptsReadable: readable,
    hostOperations: hostOperations(),
    creations: await launches.creations(),
    alerts: alerts(),
    establishing: await launches.establishingProjects(),
    establishingPreparation: await launches.establishingPreparation(),
    keptStarts: await launches.keptStarts(),
    starts: launches.runningStarts(),
    definitions: await launches.offeredDefinitions(),
    establishingHosts: await launches.establishingHosts(),
    sessionPolicies: await launches.sessionPolicies(),
    workspaces: await localWorkspaces(),
  };
  const serialized = JSON.stringify(body);
  const revision = createHash("sha256").update(serialized).digest("hex");
  return { records, serialized, revision };
}

export class MachineSessionObservation {
  private readonly shared: SharedObservation<ObservedMachineSessions>;

  constructor(
    launches: AgentLaunches,
    alerts: () => Alerts,
    maintenance: Pick<FeedbackMaintenanceCheck, "state">,
  ) {
    this.shared = new SharedObservation(
      () => observeMachineSessions(launches, alerts, maintenance),
      reuseMs,
    );
  }

  // The shared observation, or a retryable refusal past the read wait. A
  // waiter whose `signal` ends is refused too; nobody hears that answer.
  async observed(signal: AbortSignal): Promise<ObservedMachineSessions> {
    const demanded = await this.shared.demand(
      [
        configuredProjects(),
        machineJsonReplacements(),
        await machineDocumentsIdentity(),
      ],
      waitMs(),
      signal,
    );
    if (demanded.kind === "observed") return demanded.value;
    throw new RefusedRequest(503, unanswered);
  }

  // The serialized answer for a viewer, whose wait ends when it leaves.
  async answerFor(res: ServerResponse): Promise<string> {
    const departed = new AbortController();
    const leave = () => {
      departed.abort();
    };
    res.on("close", leave);
    try {
      return (await this.observed(departed.signal)).serialized;
    } finally {
      res.off("close", leave);
    }
  }

  // The observation's records, for the notification observer.
  async machineSessions(
    signal: AbortSignal,
  ): Promise<readonly LaunchWithState[]> {
    return (await this.observed(signal)).records;
  }
}
