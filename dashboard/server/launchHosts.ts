// Common orchestration asks the delivered host boundary for native operations.
// An absent host or operation is unavailable; it never substitutes another host.
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
import { codexHost } from "./codexHost.ts";
import { claudeHost } from "./claudeHost.ts";
import type {
  EstablishedLaunch,
  HostLaunch,
  SessionObservation,
} from "./hostLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { SessionResult } from "../src/sessionResult.ts";

export type LaunchHost = {
  readonly name: string;
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
  ): {
    readonly pty: IPty;
    readonly ready?: (screen: string, cursorVisible: boolean) => boolean;
  };
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

export function launchHost(
  host: AgentLaunchRequest["host"],
): LaunchHost | undefined {
  return host === "claude"
    ? claudeHost
    : host === "codex"
      ? codexHost
      : undefined;
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
