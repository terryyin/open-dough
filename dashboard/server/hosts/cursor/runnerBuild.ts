// The identity of the runner code this dashboard would start, and that a
// started runner publishes with its address and wire answers. No version is
// stamped by hand: the identity is a digest of the resolved runner code
// itself. A bundled runner is one file, so that file's content is the
// identity. A source runner's behaviour lives in the modules its entry
// reaches through a value import, including a dynamic import(). The identity
// covers the entry and those modules. A module reached only through a
// type-only import does not count. A module reached by any value path still
// counts when another import of it is type-only. A runner whose published
// identity is absent (started before proof existed) or differs is stale for
// new work.
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
    if (specifier === undefined) continue;
    if (typeOnlyStatement(code, match.index)) continue;
    found.push(specifier);
  }
  return found;
}

// A type-only statement does not reach the module: `import type`,
// `export type` (including `export type { ... } from`), and a specifier
// list that is entirely `type`. A value import, a mixed list, a side-effect
// import, and a dynamic import() do reach it.
function typeOnlyStatement(code: string, at: number): boolean {
  if (/^import\s*(?:\(\s*)?["']/.test(code.slice(at))) return false;
  const head = statementHead(code, at);
  if (head === undefined) return false;
  const typeKeyword = /^(?:import|export)\s+type\b([\s\S]*)$/.exec(head);
  // `import type from` names a default value `type`. Anything after `type`
  // is the type-only clause (`{ ... }`, a binding, or `* as`).
  if (typeKeyword !== null) return (typeKeyword[1] ?? "").trim().length > 0;
  const list = /^(?:import|export)\s*\{([\s\S]*)\}\s*$/.exec(head);
  if (list === null) return false;
  const specifiers = (list[1] ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return (
    specifiers.length > 0 &&
    specifiers.every((part) => /^type\s+(?!as\b)\S/.test(part))
  );
}

function statementHead(code: string, fromIndex: number): string | undefined {
  let depth = 0;
  for (let index = fromIndex - 1; index >= 0; index--) {
    const char = code[index] ?? "";
    if (char === "}") {
      depth += 1;
      continue;
    }
    if (char === "{") {
      if (depth === 0) return undefined;
      depth -= 1;
      continue;
    }
    if (depth > 0) continue;
    if (char === ";") return undefined;
    if (keywordEndsAt(code, index, "import")) {
      return code.slice(index - "import".length + 1, fromIndex).trim();
    }
    if (keywordEndsAt(code, index, "export")) {
      return code.slice(index - "export".length + 1, fromIndex).trim();
    }
    if (!/[\s,A-Za-z0-9_$*]/.test(char)) return undefined;
  }
  return undefined;
}

function keywordEndsAt(code: string, end: number, word: string): boolean {
  const start = end - word.length + 1;
  if (start < 0 || code.slice(start, end + 1) !== word) return false;
  const before = start > 0 ? (code[start - 1] ?? "") : "";
  return !/[A-Za-z0-9_$]/.test(before);
}

// Every file the source entry reaches through a relative value import,
// entry included. A type-only statement is not followed. Bare imports are
// installed dependencies, not runner code.
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
