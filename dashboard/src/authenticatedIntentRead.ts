// Intent locations published in the project settings, read through the local
// authenticated read boundary (`../server/authenticatedRead.ts`) at a
// revision already resolved: with `intent=locations`, each configured
// location and the files its kind lists there (`./IntentPerspective.tsx`).

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";

const locationProblem = z.enum(["unsupported-kind", "no-features"]);
const settingsProblem = z.enum(["malformed", "unreadable"]);

const intentLocation = z.object({
  path: z.string().min(1),
  kind: z.string().min(1),
  files: z.array(z.string().min(1)),
  problem: locationProblem.optional(),
});

const okIntent = z.object({
  revision: commitSha,
  locations: z.array(intentLocation).nullable(),
  settingsProblem: settingsProblem.optional(),
});

export type IntentLocation = z.infer<typeof intentLocation>;
export type IntentSettingsProblem = z.infer<typeof settingsProblem>;

export type IntentLocations =
  | { readonly status: "not-configured" }
  | {
      readonly status: "settings-problem";
      readonly problem: IntentSettingsProblem;
    }
  | {
      readonly status: "configured";
      readonly locations: readonly IntentLocation[];
    };

// The Intent locations published at `revision`, or not-configured / a
// settings problem when the project has none or the settings are unusable.
export async function readIntentLocationsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<IntentLocations> {
  const reading = readingPathAt(agentSettingsPath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&intent=locations`,
    reading,
    signal,
  );
  const parsed = okIntent.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if (parsed.data.settingsProblem !== undefined) {
    if (parsed.data.locations !== null) {
      throw unexpectedAnswer(reading);
    }
    return {
      status: "settings-problem",
      problem: parsed.data.settingsProblem,
    };
  }
  return parsed.data.locations === null
    ? { status: "not-configured" }
    : { status: "configured", locations: parsed.data.locations };
}
