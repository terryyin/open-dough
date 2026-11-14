// @ts-check
// Native backlog fixtures arrange published facts here; real installation,
// preparation recording and claims stay in the shell journeys.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { makeMe } from "./makeMe.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";
import { renderSlicePlan } from "./published-plan.mjs";
import { storySeed } from "./queued-repository.mjs";
import { backlogPath } from "./repositoryTestData.mjs";

/** @param {string} target @param {string} path @param {string} source */
function write(target, path, source) {
  const file = join(target, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, source);
}

/** @param {string} target @param {string} identity @param {string} href @param {string} planPath */
function takeFixture(target, identity, href, planPath) {
  const entry = makeMe.aBacklogEntry
    .with({ identity, href, title: "Publish the native claim" })
    .please();
  const seed = storySeed(
    entry,
    `**Goal:** A developer can start this planned story through the installed queue
claim workflow.

**Scope:** Claim this story before implementing its one bounded slice.

**Key example:** Starting the resolved plan moves this queued entry to Taken.`,
    "Native claim",
  );
  const plan = makeMe.aSlicePlan
    .with({
      slices: [
        makeMe.aPlanSlice
          .with({
            index: 1,
            name: "Publish one bounded outcome",
            proof: "inspect the resulting fixture.",
          })
          .please(),
      ],
    })
    .please();
  const preamble = `# ${entry.title}

Status: planned

## Source and outcome

Identity: ${entry.identity}

Execute the selected story after claiming it through the product backlog.

## Current decisions

- Execution is authorized only by the current request.
- Use caller-selected current-branch mode on main.
- The canonical backlog is ${backlogPath}.
- No selective formatter or commit hook applies to the backlog claim.`;
  write(target, backlogPath, renderPublishedBacklog({ queued: [entry] }));
  write(target, `.planning/${splitHref(href).path}`, seed);
  write(target, `.planning/${planPath}`, renderSlicePlan(plan, { preamble }));
}

/** @param {string} target @param {string} host */
function guardSettings(target, host) {
  const settings = makeMe.hostHookSettings.forHost(host);
  if (host === "codex") {
    settings
      .with({ description: "Keep this Codex hook config." })
      .handling("PostToolUse", { matcher: "Bash", command: "true" });
  } else {
    settings
      .with({ description: "Keep this Cursor hook config." })
      .handling("sessionStart", { command: "true", timeout: 1 });
  }
  write(
    target,
    `.${host}/hooks.json`,
    `${JSON.stringify(settings.please(), null, 2)}\n`,
  );
}

const [operation, target, ...facts] = process.argv.slice(2);
if (!target) throw new Error("missing native fixture target");
if (operation === "take") {
  const [identity, href, plan] = facts;
  if (!identity || !href || !plan)
    throw new Error("missing Take fixture facts");
  takeFixture(target, identity, href, plan);
} else if (operation === "settings") {
  const [host] = facts;
  if (!host) throw new Error("missing native settings host");
  guardSettings(target, host);
} else {
  throw new Error(
    "usage: product-backlog-native-facts.mjs <take|settings> TARGET FACTS...",
  );
}
