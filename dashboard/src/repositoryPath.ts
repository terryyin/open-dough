// Pure path helpers for repository files. Shared by the page's plan-path
// resolution (`recordedPlanPathFor`) and the local read boundary's reachable
// paths (`../server/reachablePaths.ts`) so the browser never needs Node's path
// module.

// Resolves `relative` beside `filePath` (repository paths with `/` separators).
// Returns undefined when the result would leave the repository or name no file.
export function resolveBesideFile(
  filePath: string,
  relative: string,
): string | undefined {
  const segments = filePath.split("/");
  if (segments.length === 0 || segments.at(-1) === "") {
    return undefined;
  }
  segments.pop();
  for (const part of relative.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      if (segments.length === 0) {
        return undefined;
      }
      segments.pop();
      continue;
    }
    segments.push(part);
  }
  const last = segments.at(-1);
  if (last === undefined || last === "" || last === "." || last === "..") {
    return undefined;
  }
  return segments.join("/");
}

// Reject unsafe repository paths before membership or authenticated reads.
export function isSafeRepositoryPath(path: string): boolean {
  if (path.length === 0 || path.startsWith("/") || path.includes("\\")) {
    return false;
  }
  const segments = path.split("/");
  if (
    segments.some(
      (segment) => segment === "" || segment === "." || segment === "..",
    )
  ) {
    return false;
  }
  return true;
}
