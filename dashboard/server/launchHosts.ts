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
// With keep: once that client has no socket, a screen that matches is hung
// up after settleMs. Any other screen keeps the client. Absent means a
// detached kept client stays until the server closes.
export type DetachedIdle = {
  readonly settleMs: number;
  readonly matches: (screen: string) => boolean;
};

export type ScreenReadiness = (
  screen: string,
  cursorVisible: boolean,
) => boolean;

export type TerminalAttachment =
  | {
      readonly pty: IPty;
      readonly ready?: ScreenReadiness;
      // Re-observe native context after a failure before readiness, never infer it
      // from a process exit code.
      readonly startupFailure?: () => UnavailableWorkspace | undefined;
      // Set only by a host whose client must survive a closed socket. Shared
      // code keeps that one client and joins a later socket to it. Absent
      // means closing the socket hangs the client up.
      readonly keep?: true;
      readonly detachedIdle?: DetachedIdle;
    }
  | { readonly workspaceUnavailable: UnavailableWorkspace };

import type { LaunchHostOptions } from "../src/launchHostOptions.ts";

// Runs `use` with typing into one attachment to this session: the newest one
// the developer has open, else a private one opened from `folder` for this
// call alone and hung up once `use` settles. Rejects with
// `TerminalAttachmentUnopened` when that private one cannot show the host’s
// ready prompt before `signal` ends the wait.
export type WithAttachment = <T>(
  session: HostSession,
  folder: ProjectFolder,
  use: (type: (input: string) => void) => Promise<T>,
  signal: AbortSignal,
  ready: ScreenReadiness,
) => Promise<T>;

// Whether the developer marked the session done, or its own report did.
export type DoneIntent = "manual" | "reporting";

export type LaunchHost = {
  options?(signal: AbortSignal, cwd?: string): Promise<LaunchHostOptions>;
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
  // The sessions its own listing names that this story launch, started in
  // `startedIn` at or after `since`, could have started; undefined when the
  // listing could not be read. A recheck of an uncertain launch settles it
  // from them (`./launchVerification.ts`).
  launchedSessions?(
    source: PublishedSource,
    request: RecordedLaunchRequest,
    startedIn: ProjectFolder,
    since: Date,
    folder: ProjectFolder,
    signal: AbortSignal,
  ): Promise<readonly SessionObservation[] | undefined>;
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
  // Each host decides when it may rename; `stopped` abandons any wait.
  rename?(
    record: LaunchRecord,
    folder: ProjectFolder,
    withAttachment: WithAttachment,
    intent: DoneIntent,
    stopped: AbortSignal,
  ): Promise<void>;
  stop?(
    session: HostSession,
    folder: ProjectFolder,
    signal: AbortSignal,
  ): Promise<void>;
  // Removes an exited session's job from the host on Mark as done.
  remove?(
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
        launchedSessions: boundary?.launchedSessions !== undefined,
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
