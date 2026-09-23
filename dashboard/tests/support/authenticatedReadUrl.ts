// Shared URL builders for authenticated read boundary lifecycle cases: membership
// resolve-then-backlog, an extra pinned path read, and a revision-only check
// of the ref, as the page's scheduled checks ask it.

export type AuthenticatedReadKind =
  "membership" | "extra-path" | "revision-check";

// Every catalog source shares the same boundary; lifecycle cases name one.
export const catalogSourceIds = ["open-dough", "doughnut", "pygardon"] as const;

export function authenticatedReadUrl(
  baseURL: string,
  kind: AuthenticatedReadKind,
  sourceId: string = "open-dough",
): string {
  if (kind === "membership") {
    return `${baseURL}/__authenticated-read?source=${sourceId}`;
  }
  const revision = "ab".repeat(20);
  if (kind === "revision-check") {
    return `${baseURL}/__authenticated-read?source=${sourceId}&since=${revision}`;
  }
  return `${baseURL}/__authenticated-read?source=${sourceId}&revision=${revision}&path=${encodeURIComponent(".planning/seeds/SEED-extra.md")}`;
}

export const authenticatedReadKinds: ReadonlyArray<{
  readonly kind: AuthenticatedReadKind;
  readonly label: string;
}> = [
  { kind: "membership", label: "membership read" },
  { kind: "extra-path", label: "extra path read" },
  { kind: "revision-check", label: "revision check" },
];
