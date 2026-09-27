// The GitHub avatar of the human credited for one agent profile, as the local
// authenticated read boundary (../server/avatarRead.ts) serves it, tested
// directly against real HTTP with a synthetic `gh` and a fake avatar host on
// this spec's own isolated server process (authenticatedAvatarRecords.ts).
// Only the account GitHub matched to the committer of a listed profile's
// addition is fetched, from the avatar source GitHub named for it, once per
// source while the boundary keeps it, so a changed source is fetched afresh;
// anything else is refused before asking GitHub or its avatar host. What the
// page shows is covered in ./agent-roster-avatar.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { avatarPathsRead } from "./avatarAnswers.ts";
import {
  additions,
  agents,
  avatarHost,
  laterRevision,
  newerAvatar,
  publishedRevisions,
  revision,
} from "./authenticatedAvatarRecords.ts";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

test.describe("authenticated avatar read (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    server.github.serve(everyRepository, publishedRevisions());
    server.github.serveAvatars(avatarHost);
  });

  test.afterAll(async () => {
    await server.close();
  });

  const avatarOf = (query: string, origin = server.origin) =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-avatar?${query}`,
      headers: { Origin: origin },
    });
  const profileQuery = (file: string, at = revision) =>
    `source=open-dough&revision=${at}&path=${encodeURIComponent(`${agents}/${file}`)}`;
  const avatarReads = () => avatarPathsRead(server.github.avatarReads);

  test("serves the matched account's avatar, fetched once from the avatar source GitHub named, with no GitHub read on repeat", async () => {
    const first = await avatarOf(profileQuery("yui-chan.json"));
    expect(first.status).toBe(200);
    expect(first.headers["content-type"]).toBe("image/png");
    expect(first.headers["x-content-type-options"]).toBe("nosniff");
    expect(first.headers["cache-control"]).toBe("no-store");
    expect(server.github.avatarReads).toEqual(["/u/301?v=4&s=64"]);

    const callsBefore = server.ghCalls().length;
    const again = await avatarOf(profileQuery("yui-chan.json"));
    expect(again.status).toBe(200);
    expect(again.body).toBe(first.body);
    expect(server.ghCalls()).toHaveLength(callsBefore);
    expect(avatarReads()).toEqual(["/u/301"]);
  });

  test("fetches a changed avatar source afresh under the same login, and keeps each source", async () => {
    const earlier = await avatarOf(profileQuery("yui-chan.json"));
    expect(earlier.status).toBe(200);
    const readsBefore = server.github.avatarReads.length;

    const later = await avatarOf(profileQuery("yui-chan.json", laterRevision));
    expect(later.status).toBe(200);
    expect(later.body).toBe(newerAvatar.body.toString("utf8"));
    expect(later.body).not.toBe(earlier.body);
    expect(server.github.avatarReads.slice(readsBefore)).toEqual([
      "/u/301?v=5&s=64",
    ]);

    for (const [at, image] of [
      [revision, earlier],
      [laterRevision, later],
    ] as const) {
      const again = await avatarOf(profileQuery("yui-chan.json", at));
      expect(again.body).toBe(image.body);
    }
    expect(server.github.avatarReads.slice(readsBefore)).toEqual([
      "/u/301?v=5&s=64",
    ]);
  });

  for (const refused of [
    {
      case: "an unmatched committer",
      file: "akiho-chan.json",
      error:
        "No GitHub account is matched to the human who added this agent profile.",
    },
    { case: "an avatar off GitHub's avatar host", file: "yuma-chan.json" },
    { case: "an avatar address that is not https", file: "sola-chan.json" },
    { case: "an avatar address with another query", file: "kirara-chan.json" },
  ]) {
    test(`answers no avatar for ${refused.case} without asking the avatar host`, async () => {
      const readsBefore = avatarReads().length;
      const response = await avatarOf(profileQuery(refused.file));
      expect(response.status).toBe(404);
      const { error } = JSON.parse(response.body) as { error: string };
      expect(error).toBe(
        refused.error ??
          `GitHub named no usable avatar for ${additions[refused.file]?.login ?? ""}, the account matched to the human who added this agent profile.`,
      );
      expect(avatarReads()).toHaveLength(readsBefore);
    });
  }

  for (const failed of [
    { case: "a failed avatar read", file: "mana-chan.json", path: "/u/305" },
    { case: "an image type not shown", file: "rina-chan.json", path: "/u/306" },
    { case: "an oversized image", file: "nana-chan.json", path: "/u/307" },
    { case: "a redirected avatar", file: "maki-chan.json", path: "/u/308" },
  ]) {
    test(`reports ${failed.case} as unavailable, and asks again later`, async () => {
      for (const attempt of [1, 2]) {
        const response = await avatarOf(profileQuery(failed.file));
        expect(response.status).toBe(502);
        expect(response.headers["content-type"]).toBe("application/json");
        expect(JSON.parse(response.body)).toEqual({
          error: `The GitHub avatar of ${additions[failed.file]?.login ?? ""} could not be fetched as a small image.`,
        });
        expect(
          avatarReads().filter((read) => read === failed.path),
        ).toHaveLength(attempt);
      }
    });
  }

  // A read at a moving ref, for a record that is not an agent profile, or for
  // another repository is refused as an addition read is, by the same checks
  // (authenticated-read-profile-addition.spec.ts).
  for (const refused of [
    {
      case: "naming an image address",
      query: `${profileQuery("yui-chan.json")}&url=${encodeURIComponent("https://evil.example/x.png")}`,
      status: 400,
    },
    {
      case: "naming an account",
      query: `${profileQuery("yui-chan.json")}&login=terryyin`,
      status: 400,
    },
    {
      case: "for a profile the revision does not list",
      query: profileQuery("honoka-chan.json"),
      status: 404,
    },
  ]) {
    test(`refuses an avatar read ${refused.case} before asking the avatar host`, async () => {
      const callsBefore = server.ghCalls().length;
      const readsBefore = avatarReads().length;
      const response = await avatarOf(refused.query);
      expect(response.status).toBe(refused.status);
      expect(response.headers["content-type"]).toBe("application/json");
      expect(avatarReads()).toHaveLength(readsBefore);
      if (refused.status === 400) {
        expect(server.ghCalls()).toHaveLength(callsBefore);
      }
    });
  }

  test("refuses a cross-origin avatar read before asking GitHub or the avatar host", async () => {
    const callsBefore = server.ghCalls().length;
    const readsBefore = avatarReads().length;
    const response = await avatarOf(
      profileQuery("yui-chan.json"),
      "http://evil.example",
    );
    expect(response.status).toBe(403);
    expect(server.ghCalls()).toHaveLength(callsBefore);
    expect(avatarReads()).toHaveLength(readsBefore);
  });
});
