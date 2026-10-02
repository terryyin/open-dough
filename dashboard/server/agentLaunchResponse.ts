// JSON responses from the local launch boundary, including refused requests.
import type { ServerResponse } from "node:http";
import type {
  Acceptance,
  ChangedAnswer,
  Alerts,
  AttemptObservation,
  KeptStart,
  RunningStart,
  OfferedDefinition,
  LaunchWithState,
  ReconciledAnswer,
  VerifiedAnswer,
} from "../src/agentLaunch.ts";
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import type { SessionResult } from "../src/sessionResult.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { hostOperations } from "./launchHosts.ts";

import type { LaunchHostOptions } from "../src/launchHostOptions.ts";

export type AgentLaunchAnswer =
  | { readonly status: number; readonly body: LaunchHostOptions }
  | { readonly status: number; readonly body: SessionResult }
  | { readonly status: number; readonly body: Acceptance }
  | { readonly status: number; readonly body: ChangedAnswer }
  | { readonly status: number; readonly body: ReconciledAnswer }
  | { readonly status: number; readonly body: VerifiedAnswer }
  | {
      readonly status: number;
      readonly body: {
        records: readonly LaunchWithState[];
        attempts: readonly AttemptObservation[];
        attemptsReadable: boolean;
        hostOperations: ReturnType<typeof hostOperations>;
        creations: Awaited<ReturnType<AgentLaunches["creations"]>>;
        alerts: Alerts;
        establishing: readonly string[];
        establishingPreparation: readonly string[];
        keptStarts: readonly KeptStart[];
        starts: readonly RunningStart[];
        definitions: readonly OfferedDefinition[];
        establishingHosts: Awaited<
          ReturnType<AgentLaunches["establishingHosts"]>
        >;
        sessionPolicies: Awaited<ReturnType<AgentLaunches["sessionPolicies"]>>;
      };
    }
  | { readonly status: number; readonly body: { record: LaunchWithState } }
  | { readonly status: number; readonly body: DeleteRecordAnswer }
  | { readonly status: number; readonly body: { error: string } };

export function respondToLaunch(
  res: ServerResponse,
  { status, body }: AgentLaunchAnswer,
): void {
  if (res.writableEnded || res.destroyed) {
    return;
  }
  res.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}
