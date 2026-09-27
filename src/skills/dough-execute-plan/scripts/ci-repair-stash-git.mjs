// Git reads of the execution checkout and the shared stash stack for the CI
// repair pause, plus the one drop it performs: only an entry found by OID.
import { git } from "./publication-git.mjs";

// Trimmed stdout, or null when the command fails or prints nothing.
export async function gitOutputOrNull(cwd, ...args) {
  try {
    return (await git(cwd, ...args)).stdout.trim() || null;
  } catch {
    return null;
  }
}

// Staged, unstaged, and untracked paths (ignored files are never included).
export async function inventory(checkout) {
  const { stdout } = await git(
    checkout,
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
  );
  const result = { staged: [], unstaged: [], untracked: [] };
  const fields = stdout.split("\0");
  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index];
    if (entry.length < 4) continue;
    const [x, y, path] = [entry[0], entry[1], entry.slice(3)];
    if (x === "R" || x === "C") index += 1; // skip the rename source field
    if (x === "?") {
      result.untracked.push(path);
      continue;
    }
    if (x !== " ") result.staged.push(path);
    if (y !== " ") result.unstaged.push(path);
  }
  return result;
}

export function isDirty(paths) {
  return (
    paths.staged.length + paths.unstaged.length + paths.untracked.length > 0
  );
}

export async function stashEntries(checkout) {
  const listed = await gitOutputOrNull(
    checkout,
    "stash",
    "list",
    "--format=%gd%x00%H%x00%gs",
  );
  return (listed ?? "")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [selector, oid, subject] = line.split("\0");
      return { selector, oid, subject };
    });
}

export async function dropExact(checkout, oid) {
  const entry = (await stashEntries(checkout)).find((item) => item.oid === oid);
  if (!entry) return null;
  await git(checkout, "stash", "drop", "-q", entry.selector);
  return entry.selector;
}
