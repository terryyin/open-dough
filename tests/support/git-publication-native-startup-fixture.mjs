// @ts-check
// Builds the startup native journeys' starting repository, then prints its
// coordinates as JSON: trunk queues Ready stories A and B and holds the
// project's setup and command, which leave their markers in the fixture root
// shared by the checkout and every workspace beside it.
//
// Usage: node git-publication-native-startup-fixture.mjs <parent>
import { readyContributing } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { queuedReadyRepository, storyA, storyB } from "./queued-repository.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import { startupCommandFiles } from "./startup-command-files.mjs";

const [parent] = process.argv.slice(2);
const trunk = await materializeRepository(
  queuedReadyRepository({
    queued: [storyA, storyB],
    files: startupCommandFiles({
      contributing: readyContributing,
      durableCommandEvidence: true,
    }),
  }).please(),
  { parent },
);
process.stdout.write(
  JSON.stringify({
    root: trunk.fixture,
    origin: trunk.origin,
    integration: trunk.integration,
    trunk: trunk.trunkSha,
  }),
);
