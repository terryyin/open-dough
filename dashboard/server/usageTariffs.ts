// Versioned reference tariffs for the Token index (./tokenIndex.ts), one per
// tool. Each version is source data: the rate card it was read from and when,
// the speed tier it prices, and per model its rate-card name and the price per
// 1M tokens of each category in the rate card's unit.
// A later version is added beside its tool's, so the same stored counters can
// be weighted again; no priced value is ever written into usage records.
import type { UsageTool } from "../src/usageTokenIndex.ts";

export type TokenRates = {
  readonly input: number;
  // Cache reads.
  readonly cachedInput: number;
  readonly output: number;
  // Present when the rate card prices five-minute and one-hour cache writes
  // each at its own rate; without it cache writes take the input rate.
  readonly cacheWrites?: {
    readonly fiveMinute: number;
    readonly oneHour: number;
  };
};

export type TariffModel = TokenRates & { readonly name: string };

export type UsageTariff = {
  readonly version: string;
  // How the view names the version it plots.
  readonly label: string;
  readonly source: string;
  readonly readOn: string;
  // The speed tier it prices and the service tiers a host records for it. A
  // response recorded at another tier has no rate here; one with no recorded
  // tier is at this one.
  readonly speedTier: {
    readonly name: "standard";
    readonly recorded: readonly string[];
  };
  // Index units are this model's input-token equivalents.
  readonly reference: { readonly model: string };
  readonly models: Readonly<Record<string, TariffModel>>;
};

// Codex signed-in credits at standard speed, as the rate card read on
// 2026-11-15 gives them. There is no separate cache-write charge.
export const codexTariff2026_11_15: UsageTariff = {
  version: "codex-2026-11-15",
  label:
    "Codex rate card read 2026-11-15 · standard speed · GPT-6.1 Sol input-token equivalents",
  source: "https://learn.chatgpt.com/docs/pricing#token-rates",
  readOn: "2026-11-15",
  // Codex records standard speed as its `default` service tier.
  speedTier: { name: "standard", recorded: ["default"] },
  reference: { model: "gpt-6.1-sol" },
  models: {
    "gpt-6.1-sol": {
      name: "GPT-6.1 Sol",
      input: 50,
      cachedInput: 2.5,
      output: 250,
    },
    "gpt-6-astra": {
      name: "GPT-6 Astra",
      input: 250,
      cachedInput: 25,
      output: 1_250,
    },
  },
};

// Anthropic API list prices in USD per 1M tokens at standard speed, as the
// pricing page read on 2026-11-15 gives them; fast mode costs more and has no
// rate here. Haiku 5.5 is priced at its tier for prompts up to 100,000 tokens:
// a response does not record which tier it was billed at. Claude Code records
// `<synthetic>` for messages it writes itself, which carry no tokens.
export const claudeTariff2026_11_15: UsageTariff = {
  version: "claude-2026-11-15",
  label:
    "Anthropic API list prices read 2026-11-15 · standard speed · Claude Opus 5.5 input-token equivalents",
  source: "https://platform.claude.com/docs/en/about-claude/pricing",
  readOn: "2026-11-15",
  // Claude records the speed of each response.
  speedTier: { name: "standard", recorded: ["standard"] },
  reference: { model: "claude-opus-5-5" },
  models: {
    "claude-opus-5-5": {
      name: "Claude Opus 5.5",
      input: 4,
      cachedInput: 0.2,
      output: 20,
      cacheWrites: { fiveMinute: 5, oneHour: 8 },
    },
    "claude-fable-5-2": {
      name: "Claude Fable 5.2",
      input: 8,
      cachedInput: 0.2,
      output: 40,
      cacheWrites: { fiveMinute: 10, oneHour: 16 },
    },
    "claude-fable-5-1": {
      name: "Claude Fable 5.1",
      input: 10,
      cachedInput: 0.25,
      output: 50,
      cacheWrites: { fiveMinute: 12.5, oneHour: 20 },
    },
    "claude-sonnet-5-5": {
      name: "Claude Sonnet 5.5",
      input: 2,
      cachedInput: 0.1,
      output: 10,
      cacheWrites: { fiveMinute: 2.5, oneHour: 4 },
    },
    "claude-haiku-5-5": {
      name: "Claude Haiku 5.5",
      input: 0.1,
      cachedInput: 0.01,
      output: 0.5,
      cacheWrites: { fiveMinute: 0.125, oneHour: 0.2 },
    },
    "claude-opus-4-8": {
      name: "Claude Opus 4.8",
      input: 5,
      cachedInput: 0.5,
      output: 25,
      cacheWrites: { fiveMinute: 6.25, oneHour: 10 },
    },
    "<synthetic>": {
      name: "Claude Code message",
      input: 0,
      cachedInput: 0,
      output: 0,
      cacheWrites: { fiveMinute: 0, oneHour: 0 },
    },
  },
};

// The version each tool's chart plots.
export const codexTariff = codexTariff2026_11_15;
export const usageTariffs: Readonly<Record<UsageTool, UsageTariff>> = {
  codex: codexTariff,
  claude: claudeTariff2026_11_15,
};
