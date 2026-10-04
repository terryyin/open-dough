// Running Cursor sessions, opened from the Sessions sidebar without opening
// a terminal. It says whether the Cursor runner is running. Each row is one
// session that runner holds: the project, what was started, and one label
// from that client's current screen. Choosing a row opens that session's
// terminal. When the runner is not running, or cannot be reached, the list
// says so, shows no sessions, and offers nothing that starts an agent.
import { useEffect, useId, useState } from "react";
import {
  launchKindName,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { readRunningCursorSessions } from "./agentLaunchClient.ts";
import {
  cursorRunnerSentence,
  type RunningCursorSessions,
} from "./cursorRunnerSessions.ts";
import { projectLabel, useProjects } from "./projectList.tsx";
import type { OpenSidebarEntry } from "./SidebarEntry.tsx";
import { sessionKey } from "./sessionReference.ts";

// Often enough to name the screen the runner still holds. The follow-up
// prompt keeps that process.
const refreshMs = 50;

type Listed = RunningCursorSessions | "unanswered";

function runnerSentence(listed: Listed | undefined): string {
  if (listed === undefined) return cursorRunnerSentence("reading");
  if (listed === "unanswered") return cursorRunnerSentence("unreachable");
  return cursorRunnerSentence(listed.runner);
}

function openable(
  record: LaunchRecord,
  records: readonly LaunchWithState[] | undefined,
): LaunchWithState {
  return (
    records?.find(
      (known) => sessionKey(known.session) === sessionKey(record.session),
    ) ?? { ...record, sessionState: { kind: "unknown" } }
  );
}

export function RunningCursorSessions({
  shown,
  records,
  onOpen,
}: {
  // Whether the Sessions sidebar itself is open. The list is read only then.
  readonly shown: boolean;
  readonly records: readonly LaunchWithState[] | undefined;
  readonly onOpen: OpenSidebarEntry;
}) {
  const projects = useProjects();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [listed, setListed] = useState<Listed | undefined>();
  useEffect(() => {
    if (!shown || !open) return;
    let current = true;
    let latest = 0;
    const read = () => {
      const mine = ++latest;
      void readRunningCursorSessions().then((answer) => {
        if (current && mine === latest) setListed(answer ?? "unanswered");
      });
    };
    read();
    const timer = setInterval(read, refreshMs);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [shown, open]);
  const sessions =
    listed !== undefined &&
    listed !== "unanswered" &&
    listed.runner === "running"
      ? listed.sessions
      : [];
  return (
    <section
      className="running-cursor-sessions"
      aria-label="Running Cursor sessions"
    >
      <button
        type="button"
        className="running-cursor-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setListed(undefined);
          setOpen((current) => !current);
        }}
      >
        Running Cursor sessions
      </button>
      {open && (
        <div id={panelId}>
          <p className="quiet">{runnerSentence(listed)}</p>
          {sessions.length > 0 && (
            <ul>
              {sessions.map((held) => {
                const project = projectLabel(
                  projects,
                  held.record.request.source,
                );
                const started = launchKindName(held.record.request.workflow);
                return (
                  <li key={sessionKey(held.record.session)}>
                    <button
                      type="button"
                      className="running-cursor-session"
                      onClick={(event) => {
                        onOpen({
                          record: openable(held.record, records),
                          control: event.currentTarget,
                        });
                      }}
                    >
                      <span>{project}</span>
                      <span>{started}</span>
                      <span>{held.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
