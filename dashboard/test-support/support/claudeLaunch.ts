// One `claude --bg` launch the fake recorded, as tests read it: each option
// by name, and the instruction after the `--` that ends the options. A test
// about one of them reads that one; the whole command line is the subject of
// one boundary spec alone (../../backend-tests/launches/agent-launch-boundary.spec.ts).
import type { ClaudeCall } from "./fakeClaudeControls.ts";

export type ClaudeLaunch = {
  readonly cwd: string;
  readonly name?: string;
  readonly model?: string;
  readonly effort?: string;
  // Absent for a blank session, which starts without a first prompt.
  readonly instruction?: string;
};

export function claudeLaunch(call: ClaudeCall): ClaudeLaunch {
  const options = new Map<string, string>();
  let instruction: string | undefined;
  const rest = call.argv.slice(1);
  for (let at = 0; at < rest.length; at += 1) {
    const word = rest[at] ?? "";
    if (word === "--") {
      instruction = rest[at + 1];
      break;
    }
    options.set(word, rest[(at += 1)] ?? "");
  }
  const named = (key: "name" | "model" | "effort") => {
    const value = options.get(`--${key}`);
    return value === undefined ? {} : { [key]: value };
  };
  return {
    cwd: call.cwd,
    ...named("name"),
    ...named("model"),
    ...named("effort"),
    ...(instruction === undefined ? {} : { instruction }),
  };
}
