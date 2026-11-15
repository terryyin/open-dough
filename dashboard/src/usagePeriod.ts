// A transient Usage view period: local calendar days become explicit instants
// at the HTTP boundary; the server never guesses the browser's timezone.
export type UsagePeriod = { readonly from: string; readonly until: string };

export function recentUsagePeriod(
  days: number,
  now = new Date(),
): UsagePeriod | undefined {
  if (!Number.isSafeInteger(days) || days < 1) return undefined;
  const from = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - days + 1,
  );
  const until = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Number.isFinite(from.getTime()) && Number.isFinite(until.getTime())
    ? { from: from.toISOString(), until: until.toISOString() }
    : undefined;
}

// Omitted bounds keep the all-history API. Incomplete, repeated, noncanonical
// instants and reversed/empty intervals are invalid rather than broadening it.
export function requestedUsagePeriod(
  query: URLSearchParams,
): UsagePeriod | null | undefined {
  if (!query.has("from") && !query.has("until")) return undefined;
  const from = query.get("from"),
    until = query.get("until");
  const instant = (value: string | null): value is string =>
    value !== null &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value;
  if (
    query.getAll("from").length !== 1 ||
    query.getAll("until").length !== 1 ||
    !instant(from) ||
    !instant(until) ||
    Date.parse(from) >= Date.parse(until)
  )
    return null;
  return { from, until };
}

export const inUsagePeriod = (
  at: string | null,
  period: UsagePeriod | undefined,
) =>
  period === undefined ||
  (at !== null &&
    Date.parse(at) >= Date.parse(period.from) &&
    Date.parse(at) < Date.parse(period.until));
