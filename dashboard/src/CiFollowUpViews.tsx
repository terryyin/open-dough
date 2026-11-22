import { useEffect, useState } from "react";
import { provisionalRepeatRule, type CiFollowUpAnswer } from "./ciFollowUp.ts";
import { useCiFollowUpReads } from "./pageReads.tsx";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import "./ci-follow-up.css";
import { FollowUpLink } from "./ciFollowUpNavigation.tsx";

// One local read per project/refresh, shared by every visible Done card.
export function useCiFollowUps(project: string): CiFollowUpAnswer | undefined {
  const reads = useCiFollowUpReads();
  const [value, setValue] = useState<CiFollowUpAnswer>();
  useEffect(() => {
    let current = true;
    setValue(undefined);
    const read = () => {
      void reads.readCards(project).then(
        (answer) => {
          if (current) setValue(answer);
        },
        () => undefined,
      );
    };
    read();
    const interval = setInterval(read, checkIntervalMs);
    return () => {
      current = false;
      clearInterval(interval);
    };
  }, [project, reads]);
  return value;
}

export function CiFollowUpCard({
  answer,
  identity,
  project,
}: {
  readonly answer: CiFollowUpAnswer | undefined;
  readonly identity: string;
  readonly project: string;
}) {
  const cards =
    answer?.cards.filter((item) => item.identity === identity) ?? [];
  if (cards.length > 1)
    return (
      <p>
        Multiple retained CI follow-ups name this story; the exact completed
        landing is unverified.
      </p>
    );
  const card = cards[0];
  if (card === undefined) return null;
  return (
    <div
      className={`ci-follow-up ci-follow-up-${card.kind}`}
      aria-label="CI timing follow-up"
    >
      <p>
        <strong>{card.explanation}</strong>
      </p>
      <p>
        Original {executionTimeWords(card.originalMs)} · Repeat{" "}
        {card.repeatMs === undefined
          ? "unverified"
          : executionTimeWords(card.repeatMs)}{" "}
        · Saved average {executionTimeWords(card.averageMs)}
      </p>
      <p>{provisionalRepeatRule}</p>
      {card.reviewable && (
        <p>
          <FollowUpLink
            project={project}
            destination={{ identity, revision: card.revision }}
          >
            Review original, repeat and saved reference
          </FollowUpLink>
        </p>
      )}
      {card.kind === "slow" && (
        <p>
          Two observed timings warrant investigation; this does not prove a
          regression or its cause.
        </p>
      )}
    </div>
  );
}
