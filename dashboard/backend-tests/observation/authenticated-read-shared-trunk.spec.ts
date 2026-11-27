// Simultaneous Board opens at the local authenticated read boundary
// (../../server/performedRefRead.ts): opens of one project while its verified
// Git trunk check is held join that check, answer its backlog and the time it
// was asked, and ask GitHub nothing. The transfer is held at the origin's
// upload-pack (../review/verifiedOriginTrunkCase.ts); the marker the boundary
// refuses confirms both opens arrived before it is released. Simultaneous
// GitHub reads: ./authenticated-read-shared-requests.spec.ts.

import { readFileSync, rmSync } from "node:fs";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  backlogPath,
  heldUploadPack,
  readUntilClosed,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { homeReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import {
  askedSince,
  readAt,
  refusedMarker,
} from "../../test-support/support/sharedReads.ts";

type Opened = { revision: string; backlog: string; askedAt: string };

let server: DashboardServer;

test.beforeAll(async () => {
  server = await startDashboardServer({
    ...developmentBoundary,
    revisionCheckReuseMs: 0,
  });
});

test.afterAll(async () => {
  await server.close();
});

test("two opens share one held trunk check and answer the same asked time; a later open checks again", async () => {
  const backlog = "Published membership.\n";
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("published", { files: { [backlogPath]: backlog } })
      .please(),
  );
  const review = homeReviewRepository(server.home);
  const pack = heldUploadPack(repository.fixture, review, repository.origin);
  const held = readUntilClosed(pack.heldFifo);
  const before = server.github.calls.length;
  try {
    const opens = [readAt(server, ""), readAt(server, "")];
    await refusedMarker(server);
    await expect(held).resolves.toBe("held\n");
    expect(readFileSync(pack.log, "utf8")).toBe("call\ncall\nheld\n");
    await signalFifo(pack.releaseFifo, true);
    const answers = await Promise.all(opens);
    expect(answers.map(({ status }) => status)).toEqual([200, 200]);
    const [one, two] = answers.map(({ body }) => JSON.parse(body) as Opened);
    expect(one).toMatchObject({ revision: repository.trunkSha, backlog });
    expect(one?.askedAt).toEqual(expect.any(String));
    expect(two).toEqual(one);
    expect(askedSince(server, before)).toEqual([]);

    // Reuse is zero, so this open starts another trunk check.
    const later = await readAt(server, "");
    expect(later.status).toBe(200);
    const again = JSON.parse(later.body) as Opened;
    expect(again.revision).toBe(repository.trunkSha);
    expect(again.askedAt).not.toBe(one?.askedAt);
    expect(readFileSync(pack.log, "utf8")).toBe(
      "call\ncall\nheld\ncall\ncall\n",
    );
  } finally {
    await signalFifo(pack.releaseFifo, false);
    rmSync(review, { recursive: true, force: true });
    await repository.cleanup();
  }
});
