// One sufficient-evidence rule for an explicitly supplied historical baseline.
// Original provenance is immutable; current assessment is a separate result.
import { readFileSync } from "node:fs";
import { readBaseline, assessBaseline } from "./native-comparison-archive.mjs";
import { expectedSettings } from "./native-comparison-settings.mjs";

export { expectedSettings } from "./native-comparison-settings.mjs";

export function baselineApplicability(file, current) {
  if (current.fresh) return { reused: false, reason: "explicit fresh pair" };
  if (!file) return { reused: false, reason: "no saved baseline supplied" };
  try {
    const archive = readBaseline(file);
    if (
      archive.case !== current.caseName ||
      archive.payload.revision !== current.revision
    )
      throw new Error("baseline payload or case differs");
    if (!archive.projectBasis || archive.projectBasis === "unknown")
      throw new Error("saved project basis is unavailable");
    const conditions = archive.conditions;
    if (
      conditions.host !== "codex" ||
      conditions.version !== current.version ||
      conditions.route !== current.route ||
      conditions.machine !== current.machine
    )
      throw new Error("host/runtime conditions differ or are unavailable");
    if (
      conditions.settings?.length !== 1 ||
      conditions.settings[0] !== expectedSettings(current.model, current.effort)
    )
      throw new Error(
        "applied model or reasoning settings differ or are unavailable",
      );
    const saved = new Map(
      archive.inputs.map(({ path, sha256 }) => [path, sha256]),
    );
    // input-hash is a repeated record field, so preserve every manifest row.
    const manifest = readFileSync(current.basis, "utf8")
      .trim()
      .split("\n")
      .map((line) => {
        const [, sha256, path] =
          /^input-hash: ([0-9a-f]{64}) (.+)$/.exec(line) ?? [];
        return { path, sha256 };
      });
    if (!manifest.length || manifest.some(({ path }) => !path))
      throw new Error("current inputs are unavailable");
    // Assessor changes can replay the preserved decisive inputs. Setup and
    // observer currently share case.bash: its changes require fresh capture.
    const derivedReaders = new Set([
      "native-comparison-retain.sh",
      "native-codex-session.mjs",
      "native-observation.sh",
      "native-result-retain.sh",
      "native-result-retain-journey.sh",
      "native-result-identity.sh",
    ]);
    const material = ({ path }) =>
      !path.endsWith("/assess.bash") &&
      !path.includes("/support/native-host-stream") &&
      !derivedReaders.has(path.split("/").at(-1));
    if (
      manifest
        .filter(material)
        .some(({ path, sha256 }) => saved.get(path) !== sha256) ||
      [...saved.keys()].some(
        (path) =>
          material({ path }) && !manifest.some((input) => input.path === path),
      )
    )
      throw new Error("case, project setup or runner inputs differ");
    for (const turn of archive.evidence.turns) {
      for (const metric of ["commands", "seconds"])
        if (
          !/^\d+(\.\d+)?$/.test(
            archive.observations[`turn-${turn.number}-${metric}`] ?? "",
          )
        )
          throw new Error(`saved ${metric} measurement is unavailable`);
    }
    if (current.requireUsage && archive.usage?.status !== "complete")
      throw new Error(
        "current criterion requires unavailable complete native usage",
      );
    const assessment = assessBaseline(
      archive,
      current.source,
      current.temporary,
    );
    return {
      reused: true,
      reason:
        "matching sufficient historical observation; reassessed under current criteria",
      archive,
      assessment,
    };
  } catch (error) {
    return {
      reused: false,
      reason: `saved baseline insufficient: ${error.message}`,
    };
  }
}
