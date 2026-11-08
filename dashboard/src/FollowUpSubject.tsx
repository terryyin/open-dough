// What a Follow up's Start session dialog shows besides its choices: the entry
// it follows up, as the entry reads, and, read-only and one line per item, the
// context the server will send with the request (`./followUpContext.ts`):
// a done story's first, then each session's.

import { followUpItems, type FollowUpContext } from "./followUpContext.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import "./follow-up.css";

// What a Follow up names and lists: its source, the entry as it reads, and
// the context it supplies.
export type FollowUpShown = {
  readonly source: FollowUpSource;
  readonly name: string;
  readonly context: FollowUpContext;
};

export function FollowUpSubject({
  followUp,
}: {
  readonly followUp: FollowUpShown;
}) {
  return (
    <div className="follow-up-subject">
      <p className="follow-up-source">
        Follows up <strong>{followUp.name}</strong>
      </p>
      <ul className="follow-up-context" aria-label="Follow-up context">
        {followUpItems(followUp.context).map((item, index) => (
          <li key={index} title={item.value}>
            {item.label}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
