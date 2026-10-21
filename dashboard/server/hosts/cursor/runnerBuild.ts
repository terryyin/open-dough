// The identity of the runner code this dashboard would start, and that a
// started runner publishes with its address and wire answers. No version is
// stamped by hand: the identity is a digest of the resolved runner code
// itself. A bundled runner is one file, so that file's content is the
// identity. A source runner's behaviour lives in the modules its entry
// imports, so the identity covers the entry and every relative module it
// reaches; changing any one of them changes the identity. A runner whose
// published identity is absent (started before proof existed) or differs
// is stale for new work.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The runner entry this dashboard would start, resolved as runnerProcess
// has always resolved it: the bundled entry beside the emitted server when
// there is one, otherwise the source entry.
export function runnerEntryPath(): string {
  const compiled = fileURLToPath(import.meta.resolve("./runnerMain.mjs"));
  if (existsSync(compiled)) return compiled;
  const fromRoot = path.join(
    process.cwd(),
    "dashboard/server/hosts/cursor/runnerMain.ts",
  );
  if (existsSync(fromRoot)) return fromRoot;
  return fileURLToPath(new URL("./runnerMain.ts", import.meta.url));
}

function isFile(candidate: string): boolean {
  try {
    return statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function resolveRelative(
  fromFile: string,
  specifier: string,
): string | undefined {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.mts`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.mts"),
    path.join(base, "index.js"),
    path.join(base, "index.mjs"),
  ];
  return candidates.find((candidate) => isFile(candidate));
}

function relativeSpecifiers(code: string): string[] {
  const found: string[] = [];
  const pattern = /(?:from|import)\s*(?:\(\s*)?["'](\.[^"']+)["']/g;
  for (const match of code.matchAll(pattern)) {
    const specifier = match[1];
    if (specifier !== undefined) found.push(specifier);
  }
  return found;
}

// Every file the source entry reaches through relative imports, entry
// included. Bare imports are installed dependencies, not runner code.
function sourceClosure(entry: string): string[] {
  const visited = new Set<string>();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop();
    if (file === undefined || visited.has(file)) continue;
    visited.add(file);
    let code: string;
    try {
      code = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const specifier of relativeSpecifiers(code)) {
      const resolved = resolveRelative(file, specifier);
      if (resolved !== undefined && !visited.has(resolved)) {
        pending.push(resolved);
      }
    }
  }
  return [...visited].sort();
}

export function computeRunnerBuildId(
  entry: string = runnerEntryPath(),
): string {
  const hash = createHash("sha256");
  if (entry.endsWith(".mjs") || entry.endsWith(".js")) {
    hash.update(readFileSync(entry));
    return hash.digest("hex");
  }
  const directory = path.dirname(entry);
  for (const file of sourceClosure(entry)) {
    hash.update(path.relative(directory, file));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}
