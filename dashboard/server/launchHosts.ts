// Common orchestration asks the delivered host boundary for native operations.
// An absent host or operation is unavailable; it never substitutes another host.
import type { HostOperations } from "../src/sessionCapabilities.ts";
import type { IPty } from "@lydell/node-pty";
import type {
  AgentLaunchRequest,
  HostSession,
  LaunchRecord,
  RecordedLaunchRequest,
} from "../src/agentLaunch.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { LaunchRecording } from "./launchRecording.ts";
import type { CreationRecord } from "../src/launchCreation.ts";
import { codexHost } from "./codexHost.ts";
import { claudeHost } from "./claudeHost.ts";
import { cursorHost } from "./cursorHost.ts";
import type {
  EstablishedLaunch,
  HostLaunch,
  SessionObservation,
} from "./hostLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { SessionResult } from "../src/sessionResult.ts";
import type { WorkspaceState } from "../src/launchRecord.ts";
import type { HostDescription, HostIdentity } from "../src/hostDescription.ts";

export type UnavailableWorkspace = Exclude<
  WorkspaceState,
  { kind: "available" }
>;
export type TerminalAttachment =
  | {
      readonly pty: IPty;
      readonly ready?: (screen: string, cursorVisible: boolean) => boolean;
      // Re-observe native context after a failure before readiness, never infer it
      // from a process exit code.
      readonly startupFailure?: () => UnavailableWorkspace | undefined;
    }
  | { readonly workspaceUnavailable: UnavailableWorkspace };

export type LaunchHost = {
  readonly name: string;
  readonly description: HostDescription;
  // Presence requires durable creation evidence. Native advice and inspection
  // arguments belong to the host; unreadable evidence supplies no saved facts.
  creationEvidence?(record?: CreationRecord): {
    readonly unreadableAdvice: string;
    readonly inspectionArgs?: readonly string[];
  };
  installedSkillPath(
    project: ProjectFolder,
    skill: string,
    ...segments: readonly string[]
  ): string;
  launch(
    source: PublishedSource,
    request: RecordedLaunchRequest,
    folder: ProjectFolder,
    signal: AbortSignal,
    established?: EstablishedLaunch,
    record?: LaunchRecording,
  ): Promise<HostLaunch>;
  recover?(
    record: LaunchRecord,
    signal: AbortSignal,
    recording: LaunchRecording,
  ): Promise<HostLaunch>;
  // Restore the vendor service for retained sessions without resuming work.
  prepareSavedSessions?(signal: AbortSignal): Promise<void>;
  close?(): void;
  sessions?: (
    records: readonly LaunchRecord[],
    folder: ProjectFolder,
    signal: AbortSignal,
  ) => Promise<readonly SessionObservation[]>;
  readResult?(
    session: HostSession,
    signal: AbortSignal,
  ): Promise<SessionResult>;
  attach?(
    session: HostSession,
    folder: ProjectFolder,
    size: { readonly cols: number; readonly rows: number },
  ): TerminalAttachment;
  rename?(
    record: LaunchRecord,
    folder: ProjectFolder,
    type: (session: SessionReference, input: string) => boolean,
  ): Promise<void>;
  stop?(
    session: HostSession,
    folder: ProjectFolder,
    signal: AbortSignal,
  ): Promise<void>;
};

const hostRuntimes: Readonly<Record<HostIdentity, LaunchHost | undefined>> = {
  claude: claudeHost,
  codex: codexHost,
  cursor: cursorHost,
};

export function launchHost(
  host: AgentLaunchRequest["host"],
): LaunchHost | undefined {
  return hostRuntimes[host];
}

// The sessions read projects only the registered runtime's real operations.
// Known identities without a runtime remain unavailable in every presentation.
export function hostOperations(): HostOperations {
  return Object.fromEntries(
    Object.entries(hostRuntimes).map(([identity, boundary]) => [
      identity,
      {
        attach: boundary?.attach !== undefined,
        stop: boundary?.stop !== undefined,
      },
    ]),
  );
}

export function installedSkillPath(
  host: AgentLaunchRequest["host"],
  project: ProjectFolder,
  skill: string,
  ...segments: readonly string[]
): string {
  const boundary = launchHost(host);
  if (boundary === undefined) throw new Error("This host is not available.");
  return boundary.installedSkillPath(project, skill, ...segments);
}
