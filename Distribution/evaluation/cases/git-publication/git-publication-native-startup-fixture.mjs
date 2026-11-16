// @ts-check
// Builds the startup native journeys' starting repository, then prints its
// coordinates as JSON: trunk queues Ready stories A and B and holds the
// project's setup and command, which leave their markers in the fixture root
// shared by the checkout and every workspace beside it.
//
// Usage: node git-publication-native-startup-fixture.mjs <parent>
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../tests/support/repository-fixture.mjs";
import { queuedReadyStartupRepository } from "../../../tests/support/startup-command-files.mjs";

const [parent] = process.argv.slice(2);
const trunk = await materializeRepository(
  queuedReadyStartupRepository({ queued: [storyA, storyB] }).please(),
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
