// Shell fixture entry point. Read published membership facts from stdin.
import { readFileSync } from "node:fs";
import { makeMe } from "./makeMe.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";

const {
  taken = [],
  queued = [],
  direction,
} = JSON.parse(readFileSync(0, "utf8"));
const entries = (facts) =>
  facts.map((entry) => makeMe.aBacklogEntry.with(entry).please());

process.stdout.write(
  renderPublishedBacklog({
    taken: entries(taken),
    queued: entries(queued),
    direction,
  }),
);
