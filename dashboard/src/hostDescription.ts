// Shared host facts only. Native commands and operations stay behind the
// server's LaunchHost boundary; a known identity need not have a runtime.
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export type HostIdentity = (typeof agentHosts)[number];
export type HostDescription = {
  readonly name: string;
  readonly branchNamespace: string;
  readonly models: Readonly<Record<string, { readonly name: string }>>;
  readonly skillSigil?: string;
  readonly uncertaintyHint?: string;
  readonly nativeCheckAdvice?: string;
  readonly unofferedModelExplanation?: string;
  readonly unavailableSessionExplanation?: string;
  readonly unknownObservation?: {
    readonly label: string;
    readonly note: string;
  };
  // Presence offers the host's transient native model catalog in the dialog;
  // its runtime boundary supplies `options`.
  readonly modelCatalog?: {
    readonly defaultLabel: string;
    readonly reading: string;
    readonly unreadable: string;
    readonly defaultNote: string;
    readonly unavailable: string;
    readonly stale: string;
    readonly unverified: string;
    // Follows a listed model's description when one is chosen.
    readonly chosenNote?: string;
  };
};

export const hostDescriptions = {
  claude: {
    name: "Claude Code",
    branchNamespace: "claude/",
    skillSigil: "/",
    models: {
      fable: { name: "Fable" },
      opus: { name: "Opus" },
      sonnet: { name: "Sonnet" },
    },
    uncertaintyHint: "Check `claude agents` for it.",
    nativeCheckAdvice:
      "Check `claude agents` before continuing: continuing starts its session again unless its kept evidence resumes it.",
    unavailableSessionExplanation: "Claude Code no longer lists this session.",
    unknownObservation: {
      label: "State unknown",
      note: "Claude Code's session list could not be read",
    },
  },
  codex: {
    name: "Codex",
    unavailableSessionExplanation:
      "This conversation is no longer available in Codex.",
    unknownObservation: {
      label: "Live observation unavailable",
      note: "Continue this conversation in Codex",
    },
    branchNamespace: "codex/",
    skillSigil: "$",
    models: {},
    modelCatalog: {
      defaultLabel: "Use Codex setting",
      reading: "Reading Codex model choices… You can use the Codex setting.",
      unreadable:
        "Codex model choices could not be read. Retry, or use the Codex setting.",
      defaultNote:
        "Codex resolves its configured model in the launch workspace.",
      unavailable:
        "This model is unavailable. Choose another model or use the Codex setting.",
      stale:
        "The selected Codex model is no longer available. Choose another model or use the Codex setting.",
      unverified:
        "Codex model choices could not be verified. Retry, or use the Codex setting.",
    },
    uncertaintyHint:
      "Check the dashboard history and native Codex conversations for it.",
    nativeCheckAdvice:
      "Check the dashboard history and native Codex conversations before continuing; a recorded conversation is resumed, never submitted again.",
  },
  cursor: {
    name: "Cursor",
    branchNamespace: "cursor/",
    // This invocation spells a skill as `/dough-execute-plan`.
    skillSigil: "/",
    models: {},
    modelCatalog: {
      defaultLabel: "Default (your Cursor setting)",
      reading: "Reading Cursor model choices… You can use your Cursor setting.",
      unreadable:
        "Cursor model choices could not be read. Retry, or use your Cursor setting.",
      defaultNote: "Cursor starts with your current Cursor model setting.",
      unavailable:
        "This model is unavailable. Choose another model or use your Cursor setting.",
      stale:
        "The selected Cursor model is no longer available. Choose another model or use your Cursor setting.",
      unverified:
        "Cursor model choices could not be verified. Retry, or use your Cursor setting.",
      chosenNote:
        "Cursor also saves a chosen model as your Cursor setting for later sessions.",
    },
    // No passive status command was observed, so a visible session stays unread.
    unknownObservation: {
      label: "Activity unknown",
      note: "Cursor has no passive status for this session",
    },
  },
} as const satisfies Record<HostIdentity, HostDescription>;

export function hostDescription(host: HostIdentity): HostDescription {
  return hostDescriptions[host];
}

// Offered launch hosts have a skill invocation. The server still checks
// runtime availability.
export const launchHosts = agentHosts.filter(
  (host) => hostDescription(host).skillSigil !== undefined,
);

export type LaunchModel = string;

// Static legacy names remain readable; dynamic requested IDs render verbatim.
// Admission checks each host’s offerings separately.
export const launchModels = Object.assign(
  {},
  ...agentHosts.map((host) => hostDescription(host).models),
) as Readonly<Record<LaunchModel, { readonly name: string }>>;

export const launchModelAliases = Object.keys(launchModels) as [
  LaunchModel,
  ...LaunchModel[],
];

export function launchModelName(
  host: HostIdentity,
  model: LaunchModel,
): string {
  const offered = hostDescription(host).models;
  return Object.hasOwn(offered, model)
    ? (offered[model]?.name ?? model)
    : Object.hasOwn(launchModels, model)
      ? (launchModels[model]?.name ?? model)
      : model;
}
