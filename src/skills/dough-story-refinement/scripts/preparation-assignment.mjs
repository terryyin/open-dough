#!/usr/bin/env node
// Installed CLI for a queued story's preparation assignment. `start` publishes
// the Preparing announcement before substantive preparation, or continues the
// workspace's existing one; `release` stages removal of exactly that
// assignment beside the retained result so one landing publishes both.
import { isDirectCliEntry } from "../../dough-execute-plan/scripts/ci-direct-entry.mjs";
import { releasePreparation } from "./preparation-assignment-ownership.mjs";
import { startPreparation } from "./preparation-assignment-start.mjs";

const usage =
  "usage: preparation-assignment.mjs start --integration PATH --workspace PATH --identity ID --remote NAME --target BRANCH --push-authorized [--host claude|codex|cursor] [--model TEXT] [--agent NAME-chan] [--declared-owner ID --requester ID]\n" +
  "       preparation-assignment.mjs release --workspace PATH --identity ID --remote NAME --target BRANCH [--agent NAME-chan]";

function argumentsOf(argv) {
  const [operation, ...rest] = argv;
  if (operation !== "start" && operation !== "release") throw new Error(usage);
  const values = {};
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === "--push-authorized") {
      values.pushAuthorized = true;
      continue;
    }
    if (!flag.startsWith("--") || index + 1 >= rest.length)
      throw new Error(`invalid argument ${flag}\n${usage}`);
    const key = flag
      .slice(2)
      .replace(/-[a-z]/g, (match) => match[1].toUpperCase());
    values[key] = rest[++index];
  }
  return { operation, values };
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const { operation, values } = argumentsOf(process.argv.slice(2));
    const result = await (operation === "start"
      ? startPreparation(values)
      : releasePreparation(values));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
