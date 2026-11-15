// Recognizes the installed `start` invocations a native host stream holds, for
// the publication journeys' stream fields
// (git-publication-native-stream-fields.mjs).

// An execution-start `start` invocation, whether or not the shell quoted the
// script path or the subcommand.
export const startPattern = /execution-start\.mjs["']?\s+["']?start["']?(\s|$)/;
// A preparation-assignment `start` invocation, quoted or not.
export const preparationStartPattern =
  /preparation-assignment\.mjs["']?\s+["']?start["']?(\s|$)/;

// Distinct `start` invocations in stream `read` matching `pattern` (by
// default execution start), without --help probes.
export function startCommands(read, pattern = startPattern) {
  return [
    ...new Set(
      read.segments.filter(
        (segment) => pattern.test(segment) && !segment.includes("--help"),
      ),
    ),
  ];
}

// The `commands` that carry option `name`.
export const withFlag = (commands, name) =>
  commands.filter((command) => command.includes(name));
