// Versioned reference tariffs for the Token index (./tokenIndex.ts). Each
// version is source data: the rate card it was read from and when, the speed
// tier it prices, and per model the credits per 1M tokens of each category.
// A later version is added beside this one, so the same stored counters can
// be weighted again; no priced value is ever written into usage records.

export type TokenRates = {
  readonly input: number;
  readonly cachedInput: number;
  readonly output: number;
};

export type UsageTariff = {
  readonly version: string;
  // How the view names the version it plots.
  readonly label: string;
  readonly source: string;
  readonly readOn: string;
  readonly speedTier: "standard";
  // Index units are this model's input-token equivalents.
  readonly reference: { readonly model: string; readonly name: string };
  readonly models: Readonly<Record<string, TokenRates>>;
};

// Codex signed-in credits at standard speed, as the rate card read on
// 2026-11-15 gives them. There is no separate cache-write charge.
export const codexTariff2026_11_15: UsageTariff = {
  version: "codex-2026-11-15",
  label:
    "Codex rate card read 2026-11-15 · standard speed · GPT-6.1 Sol input-token equivalents",
  source: "https://learn.chatgpt.com/docs/pricing#token-rates",
  readOn: "2026-11-15",
  speedTier: "standard",
  reference: { model: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
  models: {
    "gpt-6.1-sol": { input: 50, cachedInput: 2.5, output: 250 },
    "gpt-6-astra": { input: 250, cachedInput: 25, output: 1_250 },
  },
};

// The version the Codex chart plots.
export const codexTariff = codexTariff2026_11_15;
