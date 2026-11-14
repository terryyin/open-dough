// Discover only a unique numbered plan in the evidenced revision, then follow
// its recorded canonical source. Current checkout paths never decide the match.
import path from "node:path";
import { usageGit } from "./usageGit.ts";
import { usagePlanSources } from "./usageStoryReaders.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";
import type { UsageSource } from "./usageRecords.ts";

export async function historicalUsagePlan(
  project: ConfiguredProject,
  revision: string,
  reference: string,
  files: string[],
): Promise<{ references: string[]; sources: UsageSource[] } | undefined> {
  const numeric = /^\d+$/.test(reference);
  const candidates = numeric
    ? files.filter((file) => {
        const number =
          /^\.planning\/(?:quick|slice-plans)\/(\d+)-[^/]+\/PLAN\.md$/.exec(
            file,
          )?.[1];
        return (
          number !== undefined &&
          number.replace(/^0+/, "") === reference.replace(/^0+/, "")
        );
      })
    : [reference.split("#")[0]?.replace(/^\.\//, "") ?? ""];
  const file = candidates[0];
  if (numeric && candidates.length !== 1) return undefined;
  if (!file?.endsWith("/PLAN.md"))
    return { references: [reference], sources: [] };
  const text = await usageGit(project.localPath, [
    "show",
    `${revision}:${file}`,
  ]);
  if (!text) return undefined;
  const references = usagePlanSources(text, file).map((source) =>
    source.includes("/")
      ? path.posix.normalize(path.posix.join(path.posix.dirname(file), source))
      : source,
  );
  if (!references.length) return undefined;
  return {
    references,
    sources: [{ kind: "git", file, repository: project.repository, revision }],
  };
}
