// Which configured Playwright projects select a given absolute spec file.
import type { FullConfig } from "@playwright/test/reporter";
import path from "node:path";

function matchPattern(
  pattern: string | RegExp | ((file: string) => boolean),
  candidates: readonly string[],
): boolean {
  if (typeof pattern === "function") {
    return candidates.some((candidate) => pattern(candidate));
  }
  if (pattern instanceof RegExp) {
    return candidates.some((candidate) => pattern.test(candidate));
  }
  return candidates.some(
    (candidate) =>
      candidate === pattern ||
      candidate.endsWith(pattern) ||
      candidate.includes(pattern),
  );
}

function toPatterns(
  value: FullConfig["projects"][number]["testMatch"] | undefined,
  whenMissing: Array<string | RegExp>,
): Array<string | RegExp | ((file: string) => boolean)> {
  if (Array.isArray(value)) return [...value];
  if (value === undefined) return whenMissing;
  return [value];
}

function projectSelectsFile(
  project: FullConfig["projects"][number],
  absoluteFile: string,
): boolean {
  const relative = path.relative(project.testDir, absoluteFile);
  const underTestDir =
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
  const candidates = [
    absoluteFile,
    absoluteFile.replaceAll("\\", "/"),
    relative.replaceAll("\\", "/"),
    path.basename(absoluteFile),
  ];
  const patterns = toPatterns(project.testMatch, underTestDir ? [/.*/] : []);
  const ignores = toPatterns(project.testIgnore, []);
  if (patterns.length === 0) return false;
  const matched = patterns.some((pattern) => matchPattern(pattern, candidates));
  const ignored = ignores.some((pattern) => matchPattern(pattern, candidates));
  return matched && !ignored;
}

export function projectsSelectingFile(
  config: FullConfig,
  absoluteFile: string,
): string[] {
  return config.projects
    .filter((project) => projectSelectsFile(project, absoluteFile))
    .map((project) => project.name);
}
