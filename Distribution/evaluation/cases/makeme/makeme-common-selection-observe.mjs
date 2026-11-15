import { realpathSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

// The native launcher fixes the project cwd. An absolute project argument must
// name that same fixture; relative "." is valid in its unchanged cwd.
function projectMatches(command, configuration) {
  const match = command.match(
    /--project\s+(?:"([^"]+)"|'([^']+)'|([^\s'";&]+))/,
  );
  const project = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!project) return false;
  if (configuration === undefined) return true;
  if (project === ".") return !/\bcd\s/.test(command);
  if (!isAbsolute(project)) return false;
  try {
    return (
      realpathSync(project) ===
      realpathSync(resolve(dirname(configuration), ".."))
    );
  } catch {
    return false;
  }
}

export function commonSelectionResolved(
  read,
  { selected, optedOut, changed = false, configuration },
) {
  return read.calls.some((call) => {
    if (
      !/(?:^|[;&\n]|-(?:lc|c)\s+['"])\s*(?:\S*\/)?node\s+[^\n;]*test-entry-rules\.mjs/.test(
        call.command,
      ) ||
      ![0, null].includes(call.exitCode) ||
      /(?:^|\s)--changed(?:\s|['"]|$)/.test(call.command) !== changed ||
      !projectMatches(call.command, configuration)
    )
      return false;
    return String(call.output)
      .split("\n")
      .some((line) => {
        let answer;
        try {
          answer = JSON.parse(line);
        } catch {
          return false;
        }
        if (answer.status !== "resolved" || !Array.isArray(answer.sources))
          return false;
        const sources = answer.sources;
        return (
          selected.every((path) =>
            sources.some(
              (source) =>
                source.path === path &&
                source.makeMe === true &&
                source.pageObjects === false,
            ),
          ) &&
          optedOut.every((path) =>
            sources.some(
              (source) =>
                source.path === path &&
                source.makeMe === false &&
                source.pageObjects === false,
            ),
          ) &&
          sources
            .filter((source) => source.makeMe === true)
            .every((source) => selected.includes(source.path))
        );
      });
  });
}
