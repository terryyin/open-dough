// Closing the local authenticated read boundary over real HTTP with the
// synthetic `gh` ends the reads waiting their turn at GitHub with the
// outstanding ones (github-request-admission.mjs). Turns, arrival order,
// departures and queued bounds: ./authenticated-read-request-turns.spec.ts;
// each answer's `Server-Timing`: ./authenticated-read-server-timing.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  askedSince,
  refusedMarker,
} from "../../test-support/support/sharedReads.ts";
import {
  arrived,
  asked,
  revisionOf,
  seedPaths,
  seedRead,
  servedInTurn,
  turns,
} from "../../test-support/support/turnReads.ts";

test("closing the server ends the waiting reads with the outstanding ones", async () => {
  const server = await startDashboardServer({
    ...developmentBoundary,
    ghTransport: "cli",
  });
  const revision = revisionOf("8e");
  const held = await servedInTurn(server, revision);
  const url = (path: string) =>
    `${server.baseURL}/__authenticated-read?source=open-dough${seedRead(revision, path)}`;
  for (const path of seedPaths.slice(0, turns)) {
    abandonedRequest({ url: url(path), headers: { Origin: server.origin } });
  }
  await arrived(server, held.before, turns);
  for (const path of seedPaths.slice(turns)) {
    abandonedRequest({ url: url(path), headers: { Origin: server.origin } });
  }
  await refusedMarker(server);
  const ghPid = server.ghPid();
  await server.close();
  expect(processRunning(ghPid)).toBe(false);
  expect(
    askedSince(server, held.before).filter((read) =>
      asked(revision, seedPaths.slice(turns)).includes(read),
    ),
  ).toEqual([]);
  expect(askedSince(server, held.before)).toHaveLength(turns);
});
