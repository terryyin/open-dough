// A story launch dialog's Session group: the session policy's three choices
// as labeled radio groups, always in view, never behind a disclosure, since
// they decide whether the result is reviewed or published. Standard tracking
// keeps its workflow's own workspace and publication, so the workspace and
// landing choices are offered only for one-shot work, starting from an
// isolated workspace that waits for review. One-shot is offered only when the
// selected host's installed skills take the policy at their start; a kept
// start shows the policy it was started with instead of choices. A session
// started with no story (`UnattachedSessionPolicy`) offers its own subset of
// the same choices, with the same words and no Tracking. A launch dialog
// takes either group as its `DialogSession`.

import type { ReactNode } from "react";
import { unattachedSessionChoices } from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  defaultSessionPolicy,
  isDefaultUnattachedPolicy,
  type LaunchChoices,
  type SessionPolicy,
  type UnattachedSessionPolicy,
} from "./agentLaunch.ts";
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
function sessionBlocksStart(session: LaunchSessionChoices): boolean {
  return (
    !session.kept &&
    session.policy.tracking === "one-shot" &&
    session.offer !== "offered"
  );
}

// One choice of a policy, a story's or an unattached session's, as a labeled
// radio group. The values are the choice's own, or those `offered`, in that
// order.
function Choice<Choice extends keyof SessionPolicy>({
  id,
  choice,
  selected,
  onSelect,
  offered,
  disabled = () => false,
  hint,
}: {
  readonly id: string;
  readonly choice: Choice;
  readonly selected: SessionPolicy[Choice];
  readonly onSelect: (value: SessionPolicy[Choice]) => void;
  readonly offered?: readonly SessionPolicy[Choice][];
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
        {(offered ?? (Object.keys(values) as SessionPolicy[Choice][])).map(
          (value) => (
            <label key={value}>
              <input
                type="radio"
                name={`${id}-${choice}`}
                value={value}
                checked={selected === value}
                disabled={disabled(value)}
                onChange={() => {
                  onSelect(value);
                }}
              />{" "}
              {values[value]}
            </label>
          ),
        )}
      </div>
      {hint !== undefined && (
        <p id={hintId} className="launch-session-hint">
          {hint}
        </p>
      )}
    </fieldset>
  );
}

function LaunchSessionPolicy({
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
        selected={policy.tracking}
        onSelect={(tracking) => {
          // One-shot starts isolated and waits for review; standard keeps
          // its workflow's own workspace and publication.
          onPolicy({ ...defaultSessionPolicy, tracking });
        }}
        disabled={(value) => value === "one-shot" && offer !== "offered"}
        hint={why ?? oneShotHint}
      />
      {oneShot && (
        <>
          <Choice
            id={id}
            choice="workspace"
            selected={policy.workspace}
            onSelect={(workspace) => {
              onPolicy({ ...policy, workspace });
            }}
          />
          <Choice
            id={id}
            choice="landing"
            selected={policy.landing}
            onSelect={(landing) => {
              onPolicy({ ...policy, landing });
            }}
            hint={autoLandHint}
          />
        </>
      )}
    </fieldset>
  );
}

// The Session group of a session started with no story: what follows the
// checks of what it later verifies. It offers no Tracking, since a workflow
// invoked in the session carries its own.
function UnattachedSessionPolicy({
  id,
  policy,
  onPolicy,
}: {
  readonly id: string;
  readonly policy: UnattachedSessionPolicy;
  readonly onPolicy: (policy: UnattachedSessionPolicy) => void;
}) {
  return (
    <fieldset className="launch-session">
      <legend>Session</legend>
      <Choice
        id={id}
        choice="landing"
        selected={policy.landing}
        onSelect={(landing) => {
          onPolicy({ ...policy, landing });
        }}
        offered={unattachedSessionChoices.landing.values}
        hint={autoLandHint}
      />
    </fieldset>
  );
}

// What a launch dialog needs of its Session group, whichever choices it
// offers: the group itself, the landing that stays selected after checks,
// the policy its request carries (none for the default), and whether the
// choices hold Start back.
export type DialogSession = {
  readonly group: (id: string) => ReactNode;
  readonly landing: SessionPolicy["landing"];
  readonly chosen: Pick<LaunchChoices, "policy" | "unattached">;
  readonly blocksStart: boolean;
};

export function storySession(session: LaunchSessionChoices): DialogSession {
  return {
    group: (id) => <LaunchSessionPolicy id={id} {...session} />,
    landing: session.policy.landing,
    chosen:
      session.policy.tracking === "one-shot" ? { policy: session.policy } : {},
    blocksStart: sessionBlocksStart(session),
  };
}

export function unattachedSession(
  policy: UnattachedSessionPolicy,
  onPolicy: (policy: UnattachedSessionPolicy) => void,
): DialogSession {
  return {
    group: (id) => (
      <UnattachedSessionPolicy id={id} policy={policy} onPolicy={onPolicy} />
    ),
    landing: policy.landing,
    chosen: isDefaultUnattachedPolicy(policy) ? {} : { unattached: policy },
    blocksStart: false,
  };
}
