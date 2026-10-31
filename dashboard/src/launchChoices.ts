// What a launch dialog hands its caller, and how those choices become a
// request's settings (`./launchRequest.ts`): the developer's choices among
// the request's options, as typed, before the request trims and omits them.
import type { LaunchModel } from "./hostDescription.ts";
import type {
  AgentLaunchRequest,
  SessionPolicy,
  StoryLaunchRequest,
  UnattachedSessionPolicy,
} from "./launchRequest.ts";

export type LaunchChoices = {
  readonly host: AgentLaunchRequest["host"];
  readonly instruction: NonNullable<StoryLaunchRequest["instruction"]>;
  // Absent for Default: the selected host's configured setting applies.
  readonly model?: LaunchModel;
  readonly effort?: string;
  // The flags selected, absent when none.
  readonly options?: readonly string[];
  // A story session's policy, absent for the default.
  readonly policy?: SessionPolicy;
  // An unattached session's policy, absent for the default.
  readonly unattached?: UnattachedSessionPolicy;
  // The fingerprint of the existing changes the developer confirmed.
  readonly existingChanges?: string;
  // The developer explicitly accepted the competing-writer risk of an
  // unconfirmed stop in the same workspace.
  readonly overrideStopUnconfirmed?: boolean;
  // Browser File objects kept until Start; uploaded as raw bodies, never
  // placed in the JSON launch request.
  readonly images?: readonly File[];
};

// The choices every request carries alike: the chosen host, trimmed text
// omitted when empty, and the model, options and confirmation only when
// chosen.
export function requestedSettings({
  host,
  instruction,
  model,
  effort,
  options,
  existingChanges,
  overrideStopUnconfirmed,
}: Omit<LaunchChoices, "policy" | "unattached">) {
  const own = instruction.trim();
  return {
    host,
    ...(own === "" ? {} : { instruction: own }),
    ...(model === undefined ? {} : { model }),
    ...(effort === undefined ? {} : { effort }),
    ...(options === undefined || options.length === 0
      ? {}
      : { options: [...options] }),
    ...(existingChanges === undefined ? {} : { existingChanges }),
    ...(overrideStopUnconfirmed === true
      ? { overrideStopUnconfirmed: true }
      : {}),
  };
}

// The choices as a story's request carries them: its settings, and its
// policy only when chosen.
export function requestedChoices(choices: LaunchChoices) {
  return {
    ...requestedSettings(choices),
    ...(choices.policy === undefined ? {} : { policy: choices.policy }),
  };
}
