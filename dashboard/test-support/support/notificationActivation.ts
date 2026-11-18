// Decode only the fully quoted command emitted by the production sender.
// `set --` passes its words to a harmless argv echo; osascript is never run.
import { execFileSync } from "node:child_process";
import { shellCommand } from "../../src/sessionCapabilities.ts";

export function notificationActivation(argv: readonly string[]): {
  source: string;
  destination: string;
} {
  const index = argv.indexOf("-execute");
  const command = index < 0 ? undefined : argv[index + 1];
  if (command === undefined) throw new Error("No native activation command");
  const word = new RegExp(String.raw`'((?:[^']|'\\'')*)'`, "y");
  let position = 0;
  let words = 0;
  while (position < command.length) {
    word.lastIndex = position;
    if (word.exec(command) === null)
      throw new Error("Activation contains an unquoted shell operation");
    position = word.lastIndex;
    words++;
    if (position === command.length) break;
    if (command[position] !== " ") throw new Error("Invalid argument boundary");
    position++;
  }
  if (words !== 6) throw new Error("Unexpected activation argument count");
  const echo = shellCommand([
    process.execPath,
    "-e",
    "process.stdout.write(JSON.stringify(process.argv.slice(1)))",
    "--",
  ]);
  const parsed: unknown = JSON.parse(
    execFileSync("/bin/sh", ["-c", `set -- ${command}\n${echo} "$@"`], {
      encoding: "utf8",
    }),
  );
  if (
    !Array.isArray(parsed) ||
    !parsed.every((part: unknown) => typeof part === "string")
  )
    throw new Error("Invalid activation arguments");
  const args = parsed;
  if (
    args.slice(0, 4).join("\n") !== "/usr/bin/osascript\n-l\nJavaScript\n-e" ||
    args[4] === undefined ||
    args[5] === undefined
  )
    throw new Error("Unexpected native activation protocol");
  return { source: args[4], destination: args[5] };
}
