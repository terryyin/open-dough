// A Backlog card's Started state for one workflow: this dashboard's server
// launched a Claude Code session to run the workflow on the story, which the
// developer opens in the page's terminal. It is local evidence of a launch,
// not a story fact: the story stays queued until origin publishes what the
// session does.

import { useEffect, useRef } from "react";
import { launchWorkflows, type LaunchWithState } from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import { LaunchSession } from "./LaunchSession.tsx";
import "./agent-launch.css";

export function LaunchStarted({
  record,
  takesFocus,
}: {
  readonly record: LaunchWithState;
  // Set when the developer's own launch from this card just replaced the
  // action, so the keyboard lands on what replaced it.
  readonly takesFocus: boolean;
}) {
  const region = useRef<HTMLElement>(null);
  const started = `${launchWorkflows[record.request.workflow].name} started`;

  useEffect(() => {
    if (takesFocus) region.current?.focus();
  }, [takesFocus]);

  return (
    <section
      ref={region}
      className="launch-started"
      aria-label={started}
      tabIndex={-1}
    >
      <p>
        <span className="launch-started-state">{started}</span> in Claude Code{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <p className="launch-local">
        Local: launched from this dashboard on this machine, not yet published.
      </p>
      <LaunchSession record={record} />
    </section>
  );
}
