// The Claude Code session a launch record names, and the copyable
// `claude attach <id>` the developer reaches it with from a terminal, offered
// only where `attachOpens` says it opens the session. A card's Started and a
// Recent sessions entry both show a session this way.

import { useState } from "react";
import { attachOpens, type LaunchWithState } from "./agentLaunch.ts";
import "./agent-launch.css";

type Copying = "idle" | "copied" | "failed";

export function LaunchSession({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const [copying, setCopying] = useState<Copying>("idle");
  const attach = `claude attach ${record.session.shortId}`;
  return (
    <>
      <p>
        Session <code>{record.session.sessionId}</code>
      </p>
      {attachOpens(record.sessionState) && (
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
      )}
    </>
  );
}
