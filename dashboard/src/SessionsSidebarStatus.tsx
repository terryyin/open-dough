// Title-row status beside the Sessions heading: active and attention counts
// of open sessions (zeros included) once sessions are read, then host CPU and
// free disk once host status is read. Each reading shows on its own.

import { Activity, Cpu, Hand, HardDrive, type LucideIcon } from "lucide-react";
import type { LaunchWithState } from "./agentLaunch.ts";
import { Icon } from "./Icon.tsx";
import { cpuShown, freeDiskShown, type HostStatus } from "./hostStatus.ts";
import {
  activeSessionsWords,
  attentionCount,
  attentionWords,
} from "./sessionShown.ts";

function StatusFigure({
  icon,
  shown,
  words,
}: {
  readonly icon: LucideIcon;
  readonly shown: string;
  readonly words: string;
}) {
  return (
    <span
      role="img"
      className="sessions-sidebar-status-figure"
      aria-label={words}
      title={words}
    >
      <Icon icon={icon} />
      {shown}
    </span>
  );
}

export function SessionsSidebarStatus({
  sessions,
  host,
}: {
  readonly sessions: readonly LaunchWithState[] | undefined;
  readonly host: HostStatus | undefined;
}) {
  if (sessions === undefined && host === undefined) return null;
  const waiting = sessions === undefined ? 0 : attentionCount(sessions);
  const active = (sessions?.length ?? 0) - waiting;
  return (
    <span className="sessions-sidebar-status">
      {sessions !== undefined && (
        <>
          <StatusFigure
            icon={Activity}
            shown={String(active)}
            words={activeSessionsWords(active)}
          />
          <StatusFigure
            icon={Hand}
            shown={String(waiting)}
            words={attentionWords(waiting)}
          />
        </>
      )}
      {host !== undefined && (
        <>
          <StatusFigure icon={Cpu} {...cpuShown(host.cpuPercent)} />
          <StatusFigure icon={HardDrive} {...freeDiskShown(host.freeBytes)} />
        </>
      )}
    </span>
  );
}
