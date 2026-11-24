import {
  followUpItems,
  sessionContext,
  type FollowUpContext,
} from "./followUpContext.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import { retainedFollowUpReference } from "./followUpSessions.ts";
import { LaunchDisclosure } from "./LaunchDisclosure.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import { hostName } from "./sessionCapabilities.ts";
import { sessionKey, type SessionReference } from "./sessionReference.ts";
import "./follow-up.css";

// The required source context and any sessions the developer can attach.
export type FollowUpShown = {
  readonly source: FollowUpSource;
  readonly name: string;
  readonly context: FollowUpContext;
  readonly sessions?: readonly LaunchRecord[];
};

export function FollowUpSubject({
  followUp,
  selected,
  onSessions,
}: {
  readonly followUp: FollowUpShown;
  readonly selected: readonly SessionReference[];
  readonly onSessions: (sessions: readonly SessionReference[]) => void;
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
      {followUp.sessions !== undefined && followUp.sessions.length > 0 && (
        <fieldset className="follow-up-sessions">
          <legend>Attach sessions</legend>
          {followUp.sessions.map((record) => {
            const reference = retainedFollowUpReference(record);
            const key = sessionKey(reference);
            const context = sessionContext(record);
            const name = `${context.label} · ${hostName(reference.host)} · ${reference.sessionId}`;
            return (
              <div className="follow-up-session" key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.some(
                      (session) => sessionKey(session) === key,
                    )}
                    onChange={(event) => {
                      onSessions(
                        event.currentTarget.checked
                          ? [...selected, reference]
                          : selected.filter(
                              (session) => sessionKey(session) !== key,
                            ),
                      );
                    }}
                  />
                  {name}
                </label>
                <LaunchDisclosure
                  summary={
                    <>
                      Details
                      <span className="visually-hidden"> for {name}</span>
                    </>
                  }
                >
                  <dl>
                    {context.items.map(({ label, value }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </LaunchDisclosure>
              </div>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
