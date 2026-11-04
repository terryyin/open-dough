// The machine's sessions as this server observes them, shared by every
// viewer's sessions answer (`./launchBoundaryAnswer.ts`) and the notification
// observer (`./sessionAlerts.ts`) through one shared observation
// (`./sharedObservation.ts`): every catalog project's launch records with each
// session's state, the launch attempts, creations, catalog facts, starts,
// alerts availability, and workspaces; and, for a viewer asking for the
// history instead, its retained done sessions and the attempts that no longer
// need attention (`../src/launchAttemptSelection.ts`,
// `../src/machineSessionsRevision.ts`). Each answer's revision, which it
// carries, is the digest of that answer's fragments
// (`./machineSessionsFragments.ts`): an observation serializes only the
// session entries that moved since the last, and puts a whole answer
// together only for a viewer needing it. The checkouts' workspaces are read
// again only when their Git files changed (`./localWorkspaces.ts`). A viewer
// naming the revision it holds is answered only that it is unchanged while it
// still stands. A demand within a second of a settled observation, or while one runs, is answered by it, so the
// saved-session services refresh and each host's native listing run once for
// all of them. A fresh demand is answered only by an observation begun after
// it arrived: it skips that settled reuse and waits out a running observation
// begun earlier, then shares one suitable observation with other fresh demand.
// An observation stands only for the project catalog and the
// machine-document revision (`./machineJsonStore.ts`) it began under: a
// catalog change, or any process changing a machine document, makes the next
// demand observe afresh. Native session and installation changes are seen at
// most a second plus one observation later. Each waiter waits at most the read
// wait, then is told to ask again; one leaving never ends the observation for
// the others.

import type { ServerResponse } from "node:http";
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
import { attemptsNeedingAttention } from "../src/launchAttemptSelection.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { type SharedAnswer, SharedGzip } from "./agentLaunchResponse.ts";
import { configuredLimit } from "./configuredLimit.ts";
import type { FeedbackMaintenanceCheck } from "./feedbackMaintenanceCheck.ts";
import { hostOperations } from "./launchHosts.ts";
import { localWorkspaces } from "./localWorkspaces.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { machineDocumentsRevision } from "./machineJsonStore.ts";
import {
  type AnswerFragments,
  SessionsAnswerFragments,
} from "./machineSessionsFragments.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import type { AdmittedSessions } from "./sessionsAdmission.ts";
import { SharedObservation } from "./sharedObservation.ts";

// How long a waiter waits for the observation. A test may shorten it.
const waitMs = () => configuredLimit("DOUGH_SESSIONS_WAIT_MS", readWaitLimitMs);
// How long a settled observation serves later demand. A test may shorten it.
const reuseMs = () => configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000);

const unanswered = `The machine's sessions were not observed within ${readWaitLimitMs / 1000} seconds. Ask again.`;

// The machine's sessions answer after its records.
type MachineSessionsRest = {
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

// One audience's answer of an observation.
type ObservedAnswer = {
  // The whole answer led by its revision, put together on first need.
  readonly serialized: () => string;
  // The answer to a viewer already holding this revision, as sent.
  readonly unchanged: string;
  readonly revision: string;
};

// The regular answer, with the observation's records and its history.
export type ObservedMachineSessions = ObservedAnswer & {
  readonly records: readonly LaunchWithState[];
  readonly history: ObservedAnswer;
};

const observedAnswer = ({
  revision,
  serialized,
}: AnswerFragments): ObservedAnswer => ({
  serialized,
  unchanged: `{"revision":${JSON.stringify(revision)},"unchanged":true}`,
  revision,
});

async function observeMachineSessions(
  launches: AgentLaunches,
  alerts: () => Alerts,
  maintenance: Pick<FeedbackMaintenanceCheck, "state">,
  fragments: SessionsAnswerFragments,
): Promise<ObservedMachineSessions> {
  const { attempts, readable } = await launches.attempts();
  const records = await launches.machineSessions();
  const feedbackMaintenance = maintenance.state(records, attempts);
  const rest: MachineSessionsRest = {
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
  const { overview, history } = fragments.answers(
    records,
    rest,
    attemptsNeedingAttention(attempts),
  );
  return {
    ...observedAnswer(overview),
    records,
    history: observedAnswer(history),
  };
}

export class MachineSessionObservation {
  private readonly shared: SharedObservation<ObservedMachineSessions>;
  // Each audience's latest full answer gzip-encoded, shared by its viewers.
  private readonly encoded = {
    overview: new SharedGzip(),
    history: new SharedGzip(),
  };

  constructor(
    launches: AgentLaunches,
    alerts: () => Alerts,
    maintenance: Pick<FeedbackMaintenanceCheck, "state">,
  ) {
    const fragments = new SessionsAnswerFragments();
    this.shared = new SharedObservation(
      () => observeMachineSessions(launches, alerts, maintenance, fragments),
      reuseMs,
    );
  }

  // The shared observation, or a retryable refusal past the read wait. A
  // waiter whose `signal` ends is refused too; nobody hears that answer.
  // When `fresh`, only an observation begun after this demand arrived may
  // answer it.
  async observed(
    signal: AbortSignal,
    fresh = false,
  ): Promise<ObservedMachineSessions> {
    const demanded = await this.shared.demand(
      [configuredProjects(), await machineDocumentsRevision()],
      waitMs(),
      signal,
      fresh,
    );
    if (demanded.kind === "observed") return demanded.value;
    throw new RefusedRequest(503, unanswered);
  }

  // The serialized answer the viewer's audience asks for, whose wait ends
  // when it leaves: only that it is unchanged when the viewer holds that
  // answer's revision, and otherwise in full with its gzip encoding, shared
  // by every viewer of that revision. When `fresh`, the answer comes from an
  // observation begun after this ask.
  async answerFor(
    res: ServerResponse,
    { audience, held, fresh }: Omit<AdmittedSessions, "kind">,
  ): Promise<SharedAnswer> {
    const departed = new AbortController();
    const leave = () => {
      departed.abort();
    };
    res.on("close", leave);
    try {
      const observed = await this.observed(departed.signal, fresh);
      const asked = audience === "history" ? observed.history : observed;
      if (asked.revision === held) return { serialized: asked.unchanged };
      return {
        serialized: asked.serialized(),
        gzipped: this.encoded[audience].of(asked.revision, asked.serialized),
      };
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
