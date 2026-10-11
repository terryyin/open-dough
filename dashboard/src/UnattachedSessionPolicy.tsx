// The Session group of a session started with no story: where it runs
// (Workspace) and what follows the checks of what it later verifies (After
// checks), with the story dialogs' words, order, and radio groups
// (`./LaunchSessionPolicy.tsx`). It offers no Tracking, since a workflow
// invoked in the session carries its own. The choices other than the default
// are offered only when the selected host's installed skills establish a
// session without a story; otherwise their radios are disabled with why, and
// a choice left from another host holds Start back.

import { unattachedSessionChoices } from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  isDefaultUnattachedPolicy,
  unattachedPolicyOf,
  type UnattachedSessionPolicy as Policy,
} from "./agentLaunch.ts";
import type { SessionPolicyOffer } from "./launchOffers.ts";
import { SessionChoice, type DialogSession } from "./LaunchSessionPolicy.tsx";
import {
  autoLandHint,
  notOfferedHint,
  unattachedNotOffered,
} from "./sessionPolicyWords.ts";

type UnattachedChoices = {
  readonly policy: Policy;
  readonly onPolicy: (policy: Policy) => void;
  readonly offer: SessionPolicyOffer;
};

const defaults = unattachedPolicyOf({});

function UnattachedSessionPolicy({
  id,
  policy,
  onPolicy,
  offer,
}: { readonly id: string } & UnattachedChoices) {
  const why = notOfferedHint(offer, unattachedNotOffered);
  return (
    <fieldset className="launch-session">
      <legend>Session</legend>
      <SessionChoice
        id={id}
        choice="workspace"
        selected={policy.workspace}
        onSelect={(workspace) => {
          onPolicy({ ...policy, workspace });
        }}
        disabled={(value) => value !== defaults.workspace && why !== undefined}
        hint={why}
      />
      <SessionChoice
        id={id}
        choice="landing"
        selected={policy.landing}
        onSelect={(landing) => {
          onPolicy({ ...policy, landing });
        }}
        offered={unattachedSessionChoices.landing.values}
        disabled={(value) => value !== defaults.landing && why !== undefined}
        hint={autoLandHint}
      />
    </fieldset>
  );
}

export function unattachedSession(session: UnattachedChoices): DialogSession {
  const chosen = !isDefaultUnattachedPolicy(session.policy);
  return {
    group: (id) => <UnattachedSessionPolicy id={id} {...session} />,
    landing: session.policy.landing,
    chosen: chosen ? { unattached: session.policy } : {},
    blocksStart: chosen && session.offer !== "offered",
  };
}
