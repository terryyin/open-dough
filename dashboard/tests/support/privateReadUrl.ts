// Shared URL builders for private-read boundary lifecycle cases: membership
// resolve-then-backlog versus an extra pinned path read.

const knownSourceId = "open-dough";

export type PrivateReadKind = "membership" | "extra-path";

export function privateReadUrl(baseURL: string, kind: PrivateReadKind): string {
  if (kind === "membership") {
    return `${baseURL}/__private-read?source=${knownSourceId}`;
  }
  const revision = "ab".repeat(20);
  return `${baseURL}/__private-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(".planning/seeds/SEED-extra.md")}`;
}

export const privateReadKinds: ReadonlyArray<{
  readonly kind: PrivateReadKind;
  readonly label: string;
}> = [
  { kind: "membership", label: "membership read" },
  { kind: "extra-path", label: "extra path read" },
];
