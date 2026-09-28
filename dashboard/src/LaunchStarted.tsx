// A Backlog card's Started state: this dashboard's server launched a Claude
// Code session for the story, which the developer reaches with
// `claude attach <id>`. It is local evidence of a launch, not a story fact:
// the story stays queued until origin publishes what the session does.

import { useEffect, useRef, useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import "./agent-launch.css";

type Copying = "idle" | "copied" | "failed";

export function LaunchStarted({
  record,
  takesFocus,
}: {
  readonly record: LaunchRecord;
  // Set when the developer's own launch from this card just replaced the
  // action, so the keyboard lands on what replaced it.
  readonly takesFocus: boolean;
}) {
  const region = useRef<HTMLElement>(null);
  const [copying, setCopying] = useState<Copying>("idle");
  const attach = `claude attach ${record.session.shortId}`;

  useEffect(() => {
    if (takesFocus) region.current?.focus();
  }, [takesFocus]);

  return (
    <section
      ref={region}
      className="launch-started"
      aria-label="Started"
      tabIndex={-1}
    >
      <p>
        <span className="launch-started-state">Started</span> in Claude Code{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <p className="launch-started-local">
        Local: launched from this dashboard on this machine, not yet published.
      </p>
      <p>
        Session <code>{record.session.sessionId}</code>
      </p>
      <p className="launch-attach">
        <code>{attach}</code>{" "}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(attach).then(
              () => {
                setCopying("copied");
              },
              () => {
                setCopying("failed");
              },
            );
          }}
        >
          Copy attach command
        </button>
        <span className="launch-copy-result" aria-live="polite">
          {copying === "copied" && "Copied."}
          {copying === "failed" &&
            "Could not copy; select the command instead."}
        </span>
      </p>
    </section>
  );
}
