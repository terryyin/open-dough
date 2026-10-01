// A story launch dialog's Session group: the session policy's three choices
// as labeled radio groups, always in view, never behind a disclosure, since
// they decide whether the result is reviewed or published. Standard tracking
// keeps its workflow's own workspace and publication, so the workspace and
// landing choices are offered only for one-shot work, starting from an
// isolated workspace that waits for review. One-shot is offered only when the
// selected host's installed skills take the policy at their start; a kept
// start shows the policy it was started with instead of choices.

import { defaultSessionPolicy, type SessionPolicy } from "./agentLaunch.ts";
import type { SessionPolicyOffer } from "./launchOffers.ts";
import {
  autoLandHint,
  oneShotHint,
  sessionChoiceWords,
  sessionSummary,
} from "./sessionPolicyWords.ts";

// A story dialog's session choices: the policy chosen, what the selected
// host offers, and whether a kept start's policy stands instead.
export type LaunchSessionChoices = {
  readonly policy: SessionPolicy;
  readonly onPolicy: (policy: SessionPolicy) => void;
  readonly offer: SessionPolicyOffer;
  // Set when the dialog continues a kept start, whose policy stands.
  readonly kept: boolean;
  // The workflow's name in lowercase, for why one-shot is not offered.
  readonly workflowName: string;
};

// Whether the choices hold Start back: one-shot chosen while the selected
// host's installed skills do not take it.
export function sessionBlocksStart(session: LaunchSessionChoices): boolean {
  return (
    !session.kept &&
    session.policy.tracking === "one-shot" &&
    session.offer !== "offered"
  );
}

function Choice<Choice extends keyof SessionPolicy>({
  id,
  choice,
  policy,
  onPolicy,
  disabled = () => false,
  hint,
}: {
  readonly id: string;
  readonly choice: Choice;
  readonly policy: SessionPolicy;
  readonly onPolicy: (policy: SessionPolicy) => void;
  readonly disabled?: (value: SessionPolicy[Choice]) => boolean;
  readonly hint?: string | undefined;
}) {
  const { legend, values } = sessionChoiceWords[choice];
  const hintId = `${id}-${choice}-hint`;
  return (
    <fieldset
      className="launch-session-choice"
      aria-describedby={hint === undefined ? undefined : hintId}
    >
      <legend>{legend}</legend>
      <div className="launch-session-values">
        {(Object.keys(values) as SessionPolicy[Choice][]).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name={`${id}-${choice}`}
              value={value}
              checked={policy[choice] === value}
              disabled={disabled(value)}
              onChange={() => {
                onPolicy({ ...policy, [choice]: value });
              }}
            />{" "}
            {values[value]}
          </label>
        ))}
      </div>
      {hint !== undefined && (
        <p id={hintId} className="launch-session-hint">
          {hint}
        </p>
      )}
    </fieldset>
  );
}

export function LaunchSessionPolicy({
  id,
  policy,
  onPolicy,
  offer,
  kept,
  workflowName,
}: { readonly id: string } & LaunchSessionChoices) {
  if (kept) {
    return (
      <fieldset className="launch-session">
        <legend>Session</legend>
        <p className="launch-session-kept">
          {sessionSummary(policy)}, as this kept start was started.
        </p>
      </fieldset>
    );
  }
  const oneShot = policy.tracking === "one-shot";
  const why =
    offer === "unavailable"
      ? `One-shot is not offered: the installed skills in this project do not start ${workflowName} with a session policy for this host.`
      : offer === "reading"
        ? "Reading session choices…"
        : undefined;
  return (
    <fieldset className="launch-session">
      <legend>Session</legend>
      <Choice
        id={id}
        choice="tracking"
        policy={policy}
        onPolicy={(next) => {
          // One-shot starts isolated and waits for review; standard keeps
          // its workflow's own workspace and publication.
          onPolicy({ ...defaultSessionPolicy, tracking: next.tracking });
        }}
        disabled={(value) => value === "one-shot" && offer !== "offered"}
        hint={why ?? oneShotHint}
      />
      {oneShot && (
        <>
          <Choice
            id={id}
            choice="workspace"
            policy={policy}
            onPolicy={onPolicy}
          />
          <Choice
            id={id}
            choice="landing"
            policy={policy}
            onPolicy={onPolicy}
            hint={autoLandHint}
          />
        </>
      )}
    </fieldset>
  );
}
