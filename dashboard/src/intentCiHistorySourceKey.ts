// History belongs to the configured project, repository and trunk ref. Both
// the observed endpoint and its answered scope history use this identity.
import type { PublishedSource } from "./publishedSource.ts";

export const intentCiHistorySourceKey = (
  source: PublishedSource | undefined,
): string =>
  `${source?.id ?? ""}#${source?.repository ?? ""}#${source?.ref ?? ""}`;
