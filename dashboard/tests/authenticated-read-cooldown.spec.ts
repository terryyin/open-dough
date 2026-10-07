// One rate limit GitHub directed holds back every read of the server process
// (../server/readAdmission.ts), at the local authenticated read boundary
// over real HTTP with the synthetic `gh` (./support/sharedReads.ts publishes
// the revision): until GitHub's time, any read of any project is answered at
// once as limited -- not asked, with the whole seconds left -- and reaches
// GitHub nothing; a read already at GitHub keeps its own answer, and only a
// later time moves the wait; once the time has passed, what was held back is
// asked and answered, and an optional record held back was never answered as
// missing. Each case starts a server of its own, because the wait outlives
// the request that met it. What else the wait reaches, and what starts none:
// ./authenticated-read-cooldown-reach.spec.ts. How each read reports
// GitHub's own direction: ./authenticated-read-directed-wait.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { untilReported } from "./support/directedWait.ts";
import {
  expectHeldBack,
  servedRefusing,
  timedRead,
} from "./support/heldBackReads.ts";
import { rateLimitedAnswer, type OriginAnswer } from "./originAnswers.ts";
import {
  askedSince,
  heads,
  otherSeedPath,
  otherSeedText,
  readAt,
  sharedReadsPublished,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const revision = "c3".repeat(20);
const otherSeedRead = `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`;
const profilesRead = `&revision=${revision}&agents=profiles`;
const isContent = (request: GhRequest, path: string) =>
  request.kind === "content" && request.path === path;

test.describe("authenticated read boundary: a directed rate limit holds back every read of the process (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeEach(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterEach(async () => {
    await server.close();
  });

  test("after GitHub directs a long wait, every kind of read of either project is answered at once as held back, with the same resume time, and nothing reaches GitHub", async () => {
    servedRefusing(server, revision, (request) =>
      isContent(request, sharedSeedPath)
        ? rateLimitedAnswer(429, { "Retry-After": "600" })
        : undefined,
    );
    const refused = await timedRead(server, sharedSeedRead(revision));
    expect(refused.body).toMatchObject({ retryAfterSeconds: 600 });
    const before = server.github.calls.length;

    const accepted = "a1".repeat(20);
    const readsOf = (source: string) =>
      [
        "",
        `&since=${revision}&watch=story/one`,
        `&revision=${"d4".repeat(20)}`,
        otherSeedRead,
        `${sharedSeedRead(revision)}&committed=last`,
        profilesRead,
        `&revision=${revision}&done=records`,
        `&revision=${revision}&path=${encodeURIComponent(".planning/agents/yui-chan.json")}&committed=added`,
        `&revision=${revision}&branch=story/one`,
        `&revision=${revision}&branch=story/one&head=${heads["story/one"] ?? ""}&path=${encodeURIComponent(sharedSeedPath)}`,
        `&revision=${revision}&contains=${accepted}`,
      ].map((query) => ({ source, query }));
    for (const read of [...readsOf("open-dough"), ...readsOf("doughnut")]) {
      expectHeldBack(
        await timedRead(server, read),
        refused,
        `${read.source} ${read.query}`,
      );
    }
    expect(askedSince(server, before)).toEqual([]);

    expect((await timedRead(server, "")).body.error).toMatch(
      /^GitHub limited the rate of the local GitHub CLI's requests, so main of terryyin\/open-dough was not asked of GitHub\. Reading resumes in \d+ seconds\.$/,
    );
  });

  test("reads already at GitHub keep their own answers, and a later directed time stands over an earlier one", async () => {
    const published = sharedReadsPublished(revision);
    server.github.serve(everyRepository, published);
    expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
    const isHeld = (request: GhRequest) =>
      isContent(request, sharedSeedPath) ||
      isContent(request, otherSeedPath) ||
      request.kind === "commit-list";
    const held = holdingAnswer((call) => {
      const { request } = call;
      if (isContent(request, otherSeedPath)) {
        return Promise.resolve(
          rateLimitedAnswer(429, { "Retry-After": "900" }),
        );
      }
      if (request.kind === "commit-list") {
        return Promise.resolve(rateLimitedAnswer(403, { "Retry-After": "60" }));
      }
      if (request.kind === "ref") {
        return Promise.resolve(
          rateLimitedAnswer(429, { "Retry-After": "300" }),
        );
      }
      return published(call);
    }, isHeld);
    server.github.serve(everyRepository, held.answer);
    const before = server.github.calls.length;
    const atGitHub = [
      timedRead(server, sharedSeedRead(revision)),
      timedRead(server, otherSeedRead),
      timedRead(server, `${sharedSeedRead(revision)}&committed=last`),
    ];
    await expect
      .poll(() => askedSince(server, before).length, { timeout: 5_000 })
      .toBe(3);

    const third = await timedRead(server, "");
    expect(third.body).toMatchObject({ retryAfterSeconds: 300 });
    expectHeldBack(
      await timedRead(server, profilesRead),
      third,
      "held back by the third refusal",
    );

    held.release();
    const [read, later, earlier] = await Promise.all(atGitHub);
    expect(read?.status).toBe(200);
    expect(later?.body).toEqual({
      error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${otherSeedPath} at ${revision}. GitHub asked to wait 900 seconds before asking again.`,
      retryAfterSeconds: 900,
    });
    expect(earlier?.body).toMatchObject({ retryAfterSeconds: 60 });
    if (later === undefined) throw new Error("no later refusal");
    expectHeldBack(
      await timedRead(server, profilesRead),
      later,
      "held back by the later time",
    );
    const asked = askedSince(server, before);
    expect(asked.slice(0, 3).sort()).toEqual([
      `commit-list ${sharedSeedPath}@${revision}`,
      `content ${otherSeedPath}@${revision}`,
      `content ${sharedSeedPath}@${revision}`,
    ]);
    expect(asked.slice(3)).toEqual(["ref main"]);
  });

  test("once the directed time has passed, what was held back is asked and answered, and the held-back setting file was never answered as missing", async () => {
    const settingsText = '{ "agents": [] }\n';
    let settings: OriginAnswer = {
      status: 500,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ message: "Server Error" }),
    };
    let limitSeed = true;
    const published = sharedReadsPublished(revision);
    const answerer: RepositoryAnswerer = (call) => {
      const { request } = call;
      if (isContent(request, agentSettingsPath)) {
        return Promise.resolve(settings);
      }
      if (limitSeed && isContent(request, sharedSeedPath)) {
        return Promise.resolve(rateLimitedAnswer(429, { "Retry-After": "2" }));
      }
      return published(call);
    };
    server.github.serve(everyRepository, answerer);
    // The profiles are listed and read; the setting file fails, so it is not
    // kept and is asked again by the next profile read.
    const warmed = await timedRead(server, profilesRead);
    expect(warmed.status).toBe(200);
    expect(warmed.body).toMatchObject({ settings: null });
    settings = {
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: settingsText,
    };

    const refused = await timedRead(server, sharedSeedRead(revision));
    expect(refused.body).toMatchObject({ retryAfterSeconds: 2 });
    limitSeed = false;
    const before = server.github.calls.length;
    const heldProfiles = await timedRead(server, profilesRead);
    expectHeldBack(heldProfiles, refused, "the profiles' setting file");
    expect(heldProfiles.body.error).toContain(
      `so ${agentSettingsPath} at ${revision} was not asked of GitHub`,
    );
    expectHeldBack(
      await timedRead(server, otherSeedRead),
      refused,
      "the other seed",
    );
    expect(askedSince(server, before)).toEqual([]);

    await untilReported(refused.arrivedAt, 2);
    const profiles = await readAt(server, profilesRead);
    expect(profiles.status).toBe(200);
    expect(JSON.parse(profiles.body)).toMatchObject({
      settings: settingsText,
    });
    const other = await readAt(server, otherSeedRead);
    expect(other.status).toBe(200);
    expect(JSON.parse(other.body)).toMatchObject({ text: otherSeedText });
    const seed = await readAt(server, sharedSeedRead(revision));
    expect(JSON.parse(seed.body)).toMatchObject({ text: sharedSeedText });
    expect(askedSince(server, before)).toEqual([
      `content ${agentSettingsPath}@${revision}`,
      `content ${otherSeedPath}@${revision}`,
      `content ${sharedSeedPath}@${revision}`,
    ]);
  });
});
