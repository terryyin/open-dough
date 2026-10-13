import type { HostSession } from "../src/hostSession.ts";
import type {
  DetachedIdle,
  ScreenReadiness,
  UnavailableWorkspace,
} from "./launchHosts.ts";
import type { LaunchInstructionInput } from "./launchInstruction.ts";

// What a registry supplies for one client, beside its process and live set.
export type LiveTerminalClientOptions = {
  readonly key: string;
  readonly hostName: string;
  readonly keep: boolean;
  readonly session: HostSession;
  readonly admitted: boolean;
  readonly size: { readonly cols: number; readonly rows: number };
  readonly readiness: ScreenReadiness | undefined;
  readonly startupFailure: (() => UnavailableWorkspace | undefined) | undefined;
  readonly detachedIdle?: DetachedIdle;
  // Records the screen of a client that does not declare keep.
  readonly observeScreen?: true;
  // Absent when this client was not started with a launch instruction.
  readonly launchInput?: LaunchInstructionInput;
};
