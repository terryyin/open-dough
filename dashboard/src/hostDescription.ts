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
  readonly unofferedModelExplanation?: string;
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
    uncertaintyHint: "Check `claude agents` for it before starting again.",
  },
  codex: {
    name: "Codex",
    branchNamespace: "codex/",
    skillSigil: "$",
    models: {},
    uncertaintyHint:
      "Check the dashboard history and native Codex conversations before starting again.",
    unofferedModelExplanation:
      "Codex uses its configured default model; a Claude model cannot be selected.",
  },
  cursor: { name: "Cursor", branchNamespace: "cursor/", models: {} },
} as const satisfies Record<HostIdentity, HostDescription>;

export function hostDescription(host: HostIdentity): HostDescription {
  return hostDescriptions[host];
}

// Offered launch hosts have a skill invocation. Cursor retains its identity
// without offering a launch. The server still checks runtime availability.
export const launchHosts = agentHosts.filter(
  (host) => hostDescription(host).skillSigil !== undefined,
);

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type LaunchModel = KeysOfUnion<
  (typeof hostDescriptions)[HostIdentity]["models"]
>;

// Wire and stored records retain every known alias, including legacy records
// whose host did not offer their model. Admission separately checks offerings.
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
  return hostDescription(host).models[model]?.name ?? launchModels[model].name;
}
