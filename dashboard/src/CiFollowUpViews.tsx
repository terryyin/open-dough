import { useCallback, useEffect, useState } from "react";
import {
  ciFollowUpAnswerSchema,
  ciFollowUpEndpoint,
  provisionalRepeatRule,
  type CiFollowUpAnswer,
} from "./ciFollowUp.ts";
import { localSettingRequest } from "./localSettingRequest.ts";
import { useLocalSetting } from "./useLocalSetting.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import { executionTimeWords } from "./ciProofTimeWords.ts";
import "./ci-follow-up.css";
import { FollowUpLink } from "./ciFollowUpNavigation.tsx";

const failure = "Automatic CI follow-up evidence could not be read.";
async function request(
  project: string,
  enabled?: boolean,
): Promise<CiFollowUpAnswer> {
  return ciFollowUpAnswerSchema.parse(
    await localSettingRequest(
      `${ciFollowUpEndpoint}?id=${encodeURIComponent(project)}`,
      enabled === undefined ? undefined : { enabled },
      failure,
    ),
  );
}
export function CiFollowUpSetting({ project }: { readonly project: string }) {
  const read = useCallback(() => request(project), [project]);
  const { value, problem, busy, change, retryRead } = useLocalSetting(
    read,
    failure,
    "Automatic CI follow-up could not be updated.",
  );
  return (
    <div className="ci-follow-up-setting">
      <p>
        Automatic CI follow-up:{" "}
        {value === undefined ? "Loading…" : value.enabled ? "On" : "Off"}
      </p>
      <p className="settings-note">{value?.explanation}</p>
      {value !== undefined && (
        <p className="settings-note">
          Production action machine: {value.machine}
        </p>
      )}
      <p className="settings-note">
        {provisionalRepeatRule} Enabling applies to new receipts only; disabling
        stops new requests. Spent allowances never renew.
      </p>
      {value !== undefined && (
        <button
          type="button"
          className="frame-button"
          disabled={busy || (!value.available && !value.enabled)}
          onClick={() => {
            void change(() => request(project, !value.enabled));
          }}
        >
          {value.enabled
            ? "Disable automatic CI follow-up"
            : "Enable automatic CI follow-up on this machine"}
        </button>
      )}
      {problem !== undefined && (
        <p role="alert">
          {problem}{" "}
          <button type="button" className="frame-button" onClick={retryRead}>
            Retry follow-up settings
          </button>
        </p>
      )}
    </div>
  );
}

// One local read per project/refresh, shared by every visible Done card.
export function useCiFollowUps(project: string): CiFollowUpAnswer | undefined {
  const [value, setValue] = useState<CiFollowUpAnswer>();
  useEffect(() => {
    let current = true;
    setValue(undefined);
    const read = () => {
      void request(project).then(
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
  }, [project]);
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
