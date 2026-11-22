// System settings → Usage's source (`./SystemSettingsUsage.tsx`): reads one
// tool cohort's Token index answer for a period under an abort signal, and
// refreshes imported usage. The page binds the dashboard's two endpoints and
// keeps their refusal wording.
import { localSettingRequest } from "./localSettingRequest.ts";
import { refusalMessage } from "./refusalMessage.ts";
import type { UsagePeriod } from "./usagePeriod.ts";
import {
  tokenIndexUrl,
  usageRefreshEndpoint,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "./usageTokenIndex.ts";

const usageUnreadable = "Usage could not be read.";
const usageNotRefreshed = "Usage could not be refreshed.";

export type UsageSource = {
  readonly read: (
    cohort: TokenIndexCohort,
    period: UsagePeriod | undefined,
    signal: AbortSignal,
  ) => Promise<TokenIndexAnswer>;
  readonly refresh: () => Promise<void>;
};

export const pageUsageSource: UsageSource = {
  read: async (cohort, period, signal) => {
    const response = await fetch(tokenIndexUrl(cohort, period), { signal });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      throw new Error(refusalMessage(body, usageUnreadable));
    }
    return (await response.json()) as TokenIndexAnswer;
  },
  refresh: async () => {
    await localSettingRequest(usageRefreshEndpoint, {}, usageNotRefreshed);
  },
};
