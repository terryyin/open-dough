// Starts a host's attach client for one session and reads its attach result
// as the terminal client it describes. A private client ignores the host's
// keep, readiness, and idle declarations, and records its screen.
import type { IPty } from "@lydell/node-pty";
import type { HostSession } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { launchHost, type UnavailableWorkspace } from "./launchHosts.ts";
import type { LiveTerminalClientOptions } from "./liveTerminalClient.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const initialSize = { cols: 80, rows: 24 } as const;

export function nativeAttach(
  session: HostSession,
  folder: ProjectFolder,
  privately: boolean,
):
  | { readonly pty: IPty; readonly options: LiveTerminalClientOptions }
  | { readonly workspaceUnavailable: UnavailableWorkspace }
  | { readonly failedHost: string } {
  const host = launchHost(session.host);
  const hostName = host?.name ?? session.host;
  let attachment;
  try {
    if (host?.attach === undefined) {
      throw new Error("This host cannot attach.");
    }
    attachment = host.attach(session, folder, initialSize);
  } catch {
    return { failedHost: hostName };
  }
  if ("workspaceUnavailable" in attachment) return attachment;
  const common = {
    key: sessionKey(session),
    hostName,
    session,
    size: { cols: initialSize.cols, rows: initialSize.rows },
  };
  return {
    pty: attachment.pty,
    options: privately
      ? {
          ...common,
          keep: false,
          admitted: true,
          readiness: undefined,
          startupFailure: undefined,
          observeScreen: true,
        }
      : {
          ...common,
          keep: attachment.keep === true,
          admitted: attachment.ready === undefined,
          readiness: attachment.ready,
          startupFailure: attachment.startupFailure,
          ...(attachment.detachedIdle !== undefined
            ? { detachedIdle: attachment.detachedIdle }
            : {}),
        },
  };
}
