// What a Follow up's Start session dialog shows besides its choices: the entry
// it follows up, by its label, and, read-only and one line per item, the
// context the server will send with the request (`./followUpContext.ts`).

import type { FollowUpSessionContext } from "./followUpContext.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import "./follow-up.css";

// What a Follow up names and lists: its source, the entry as it reads, and
// the context of each session it holds.
export type FollowUpShown = {
  readonly source: FollowUpSource;
  readonly name: string;
  readonly sessions: readonly FollowUpSessionContext[];
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
        {followUp.sessions.flatMap(({ label, items }) =>
          items.map((item) => (
            <li key={`${label} ${item.label}`} title={item.value}>
              {item.label}: {item.value}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
