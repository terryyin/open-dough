// A session entry's message part, the same on a card and in Recent sessions:
// the session's attention message under its report's completion label. The
// label is the part's disclosure button (./frame-controls.css). While the
// report is unread the part is expanded, offers Mark as read, and does not
// collapse; read, or on a session marked done, it is collapsed until the
// developer expands it. That choice holds for this report only, in this page:
// a newer report is unread again, and a reload starts collapsed.

import { ChevronRight } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import {
  completionLabel,
  reportUnread,
  type CompletionReport,
} from "./completionReport.ts";
import { Icon } from "./Icon.tsx";
import { notMarkedRead, useMarking, usePageSessions } from "./pageSessions.ts";
import { useFrameDescription } from "./protectedFrame.ts";
import "./frame-controls.css";
import "./session-attention-message.css";

export function SessionAttentionMessage({
  record,
  report,
  say,
}: {
  readonly record: LaunchWithState;
  // The record's report, holding its attention message.
  readonly report: CompletionReport;
  // Says in the entry's status line what Mark as read came to.
  readonly say: (words: string | undefined) => void;
}) {
  const { markRead } = usePageSessions();
  const { marking, follow } = useMarking();
  const unread = reportUnread(record);
  // The developer's last choice, for the report it was made on.
  const [chosen, setChosen] = useState<
    { readonly receipt: string; readonly expanded: boolean } | undefined
  >();
  const expanded =
    unread || (chosen?.receipt === report.receipt && chosen.expanded);
  const heading = useRef<HTMLButtonElement>(null);
  const textId = useId();
  const described = useFrameDescription();
  return (
    <div className="session-attention-message">
      <p>
        <button
          ref={heading}
          type="button"
          className="session-attention-heading frame-disclosure-button"
          aria-expanded={expanded}
          aria-controls={expanded ? textId : undefined}
          aria-disabled={unread}
          onClick={() => {
            if (!unread)
              setChosen({ receipt: report.receipt, expanded: !expanded });
          }}
        >
          <Icon icon={ChevronRight} />
          {completionLabel(report)}
        </button>
      </p>
      {expanded && (
        <div id={textId}>
          <pre>{report.message}</pre>
          {unread && (
            <p className="launch-open">
              <button
                type="button"
                aria-describedby={described}
                disabled={marking === "marking"}
                onClick={(event) => {
                  say(undefined);
                  follow(
                    markRead({ record, control: event.currentTarget }),
                    (marked) => {
                      if (marked) heading.current?.focus();
                      else say(notMarkedRead);
                    },
                  );
                }}
              >
                Mark as read
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
