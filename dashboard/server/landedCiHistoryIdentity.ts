// Compatibility of retained adapter subjects, applied by every history read
// and atomic update before any build can be reused.
import { isDeepStrictEqual } from "node:util";
import type { CiProof } from "../src/ciProof.ts";
import { buildKeyOf, type KeptBuild } from "./landedCiObservation.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";

export function compatibleAdapterProof(
  build: KeptBuild,
  proof: CiProof | undefined = build.proof,
): boolean {
  if (build.adapterAttempt === undefined || proof?.kind !== "summary")
    return true;
  return (
    "attemptId" in proof.summary &&
    proof.summary.attemptId === String(build.adapterAttempt.attemptId) &&
    proof.summary.revision.toLowerCase() === build.revision
  );
}

// Old adapter keys named only attemptId. Preserve the surviving compatible
// exact observation, but never infer which lost subject a non-exact alias
// originally selected. Reads project this compatibility view without writing;
// the next existing store update keeps its canonical keys atomically.
export function withAdapterIdentity(project: ProjectHistory): ProjectHistory {
  const builds: ProjectHistory["builds"] = {};
  const keys = new Map<string, string>();
  const legacy = new Set<string>();
  const unsupported = new Set<string>();
  for (const [key, build] of Object.entries(project.builds)) {
    if (build.adapterAttempt === undefined) {
      builds[key] = build;
      continue;
    }
    const canonical = buildKeyOf(build);
    const old = key === `attempt/${String(build.adapterAttempt.attemptId)}`;
    keys.set(key, canonical);
    if (old) legacy.add(key);
    if (
      (!old && key !== canonical) ||
      build.adapterAttempt.ambiguous === true ||
      !compatibleAdapterProof(build)
    )
      unsupported.add(key);
    const held = builds[canonical];
    if (
      held === undefined ||
      (build.proof?.kind === "summary" &&
        compatibleAdapterProof(build) &&
        (held.proof?.kind !== "summary" || !compatibleAdapterProof(held)))
    )
      builds[canonical] = build;
  }
  const landings = Object.fromEntries(
    Object.entries(project.landings).map(([receipt, landing]) => {
      const observed = landing.observed;
      if (observed.kind !== "build") return [receipt, landing];
      const key = keys.get(observed.build);
      if (key === undefined) return [receipt, landing];
      const build = project.builds[observed.build];
      const unprovable =
        unsupported.has(observed.build) ||
        (legacy.has(observed.build) && observed.selection !== "exact") ||
        (observed.selection === "exact" &&
          landing.revision !== build?.revision);
      return [
        receipt,
        {
          ...landing,
          observed: unprovable
            ? {
                kind: "gap" as const,
                reason: "identity" as const,
                explanation:
                  "The retained adapter attempt identity cannot be established for this landing.",
              }
            : { ...observed, build: key },
        },
      ];
    }),
  );
  const normalized = { ...project, builds, landings };
  return isDeepStrictEqual(project, normalized) ? project : normalized;
}
