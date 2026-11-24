import { StoryNotesAttachment } from "./AttachStoryNotes.tsx";
import { followUpItems, type FollowUpContext } from "./followUpContext.ts";
import { FollowUpDetails } from "./FollowUpDetails.tsx";
import {
  followUpSessionKey,
  type FollowUpSessionChoice,
  type FollowUpSource,
} from "./followUpRequest.ts";
import {
  followUpSessionContext,
  followUpSessionName,
  type FollowUpSession,
} from "./followUpSessions.ts";
import { LaunchDisclosure } from "./LaunchDisclosure.tsx";
import "./follow-up.css";

// The required source context and any sessions the developer can attach.
export type FollowUpShown = {
  readonly source: FollowUpSource;
  readonly name: string;
  readonly context: FollowUpContext;
  readonly sessions?: readonly FollowUpSession[];
};

export function FollowUpSubject({
  followUp,
  sourceId,
  selected,
  onSessions,
  attachNotes,
  onNotes,
}: {
  readonly followUp: FollowUpShown;
  readonly sourceId: string;
  readonly selected: readonly FollowUpSessionChoice[];
  readonly onSessions: (sessions: readonly FollowUpSessionChoice[]) => void;
  readonly attachNotes: boolean;
  readonly onNotes: (attach: boolean) => void;
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
          {followUp.sessions.map((session) => {
            const { choice } = session;
            const key = followUpSessionKey(choice);
            const context = followUpSessionContext(session);
            const name = followUpSessionName(session, context.label);
            return (
              <div className="follow-up-session" key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.some(
                      (each) => followUpSessionKey(each) === key,
                    )}
                    onChange={(event) => {
                      onSessions(
                        event.currentTarget.checked
                          ? [...selected, choice]
                          : selected.filter(
                              (each) => followUpSessionKey(each) !== key,
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
                  <FollowUpDetails items={context.items} />
                </LaunchDisclosure>
              </div>
            );
          })}
        </fieldset>
      )}
      {"story" in followUp.source && (
        <StoryNotesAttachment
          sourceId={sourceId}
          identity={followUp.source.story.identity}
          checked={attachNotes}
          onAttach={onNotes}
        />
      )}
    </div>
  );
}
