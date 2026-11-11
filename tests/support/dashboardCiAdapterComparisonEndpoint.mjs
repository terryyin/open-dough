// Selects the completed comparison endpoint through a real adapter command.
import assert from "node:assert/strict";
import { adapterRevisionLookup } from "../../dashboard/server/baseCiAdapterRevisionLookup.ts";
import { nearestRevisionBuild } from "../../dashboard/server/baseCiRevisionNearest.ts";
import { asSlot } from "../../dashboard/server/revisionBuildSlot.ts";
import { checkoutRoot } from "../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import { makeMe } from "./makeMe.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";

// Valid project configuration is setup; command wire bytes remain at the caller.
export function configureAdapter(root, command) {
  const described = makeMe.aRepository
    .withRevision("configured", {
      files: {
        ".planning/open-dough.json": JSON.stringify(
          makeMe.projectCiSettings.with({ ciAdapter: command }).please(),
        ),
      },
    })
    .please();
  writeRevisionFiles(root, described.revisions[0]);
}

/**
 * @param {ReturnType<import("./makeMe.mjs").makeMe.aCiAdapterAttempt.please>} attempt
 * @param {string} jobResponse
 * @param {AbortSignal} signal
 */
export async function selectAdapterComparisonEndpoint(
  attempt,
  jobResponse,
  signal,
) {
  const source = { repository: "owner/repo", ref: attempt.branch };
  const command = [
    process.execPath,
    "--input-type=module",
    "-e",
    `import { createServer } from 'node:net';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { operation } = JSON.parse(input);
const jobResponse = ${JSON.stringify(jobResponse)};
if (operation === 'discover') process.stdout.write(${JSON.stringify(JSON.stringify({ attempts: [attempt] }))});
else if (jobResponse === 'hold') createServer().listen(0, '127.0.0.1');
else if (jobResponse === 'unsupported') {
  process.stderr.write('adapter starting\\nunsupported CI adapter operation');
  process.exit(2);
}
else process.stdout.write(jobResponse);
`,
  ];
  const lookup = await adapterRevisionLookup(
    source,
    undefined,
    checkoutRoot,
    command,
    { maxBuffer: 1024 * 1024, signal },
    signal,
  );
  const build = await nearestRevisionBuild([attempt.sha], lookup);
  assert.ok(build);
  const slot = asSlot(build, "No build");
  assert.equal(slot.kind, "build");
  return { slot, lookup };
}
