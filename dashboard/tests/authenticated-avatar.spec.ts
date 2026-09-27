// The GitHub avatar of the human credited for one agent profile, as the local
// authenticated read boundary (../server/avatarRead.ts) serves it, tested
// directly against real HTTP with a synthetic `gh` and a fake avatar host on
// this spec's own isolated server process. Only the account GitHub matched to
// the committer of a listed profile's addition is fetched, from the avatar
// source GitHub named for it, once while the boundary keeps it; anything
// else is refused before asking GitHub or its avatar host. What the page
// shows is covered in ./agent-roster-avatar.spec.ts.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type AvatarAnswer,
} from "./support/fakeGitHub.ts";
import { pathChange, type PathHistories } from "./pathHistoryAnswers.ts";
import {
  avatarPathsRead,
  avatarPng,
  avatarServerError,
  avatarsAt,
  onAvatarHost,
} from "./avatarAnswers.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { rawRequest } from "./support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const revision = "f1".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const agents = ".planning/agents";

// Each listed profile's addition, by its agent's file name: the account it
// matched, if any, and the avatar address GitHub named for that account.
const additions: Readonly<Record<string, Parameters<typeof pathChange>[3]>> = {
  "yui-chan.json": { login: "terryyin", avatarUrl: onAvatarHost("/u/301") },
  "akiho-chan.json": undefined,
  "yuma-chan.json": {
    login: "rae",
    avatarUrl: "https://avatars.example.com/u/302?v=4",
  },
  "sola-chan.json": {
    login: "hugh",
    avatarUrl: "http://avatars.githubusercontent.com/u/303?v=4",
  },
  "kirara-chan.json": {
    login: "quinn",
    avatarUrl: "https://avatars.githubusercontent.com/u/304?v=4&s=9999",
  },
  "mana-chan.json": { login: "fay", avatarUrl: onAvatarHost("/u/305") },
  "rina-chan.json": { login: "svg", avatarUrl: onAvatarHost("/u/306") },
  "nana-chan.json": { login: "big", avatarUrl: onAvatarHost("/u/307") },
  "maki-chan.json": { login: "moved", avatarUrl: onAvatarHost("/u/308") },
};

const oversized: AvatarAnswer = {
  status: 200,
  contentType: "image/png",
  body: Buffer.alloc(1024 * 1024 + 1),
};

const avatarHost = avatarsAt({
  "/u/301": avatarPng(4),
  "/u/302": avatarPng(4),
  "/u/303": avatarPng(4),
  "/u/304": avatarPng(4),
  "/u/305": avatarServerError,
  "/u/306": {
    status: 200,
    contentType: "image/svg+xml",
    body: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
  },
  "/u/307": oversized,
  "/u/308": {
    status: 302,
    contentType: "text/plain",
    body: Buffer.from("elsewhere"),
  },
});

function published() {
  const files: Record<string, string> = {};
  const history: Record<string, PathHistories[string]> = {};
  let n = 0x80;
  for (const [file, account] of Object.entries(additions)) {
    const name = file.split("-")[0] ?? "";
    const path = `${agents}/${file}`;
    files[path] = renderAgentProfile({
      name: `${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      identity: "SEED-avatar#story",
      activity: "preparation",
    });
    n += 1;
    history[path] = [pathChange(n, "added", "Some Human", account)];
  }
  return publishes({ revision, backlog, files, history });
}

test.describe("authenticated avatar read (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    server.github.serve(everyRepository, published());
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
  const profileQuery = (file: string) =>
    `source=open-dough&revision=${revision}&path=${encodeURIComponent(`${agents}/${file}`)}`;
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
    expect(again.headers["content-length"]).toBe(
      first.headers["content-length"],
    );
    expect(server.ghCalls()).toHaveLength(callsBefore);
    expect(avatarReads()).toEqual(["/u/301"]);
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

  const yui = encodeURIComponent(`${agents}/yui-chan.json`);
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
      case: "for a record that is not an agent profile",
      query: `source=open-dough&revision=${revision}&path=${encodeURIComponent(".planning/PRODUCT-BACKLOG.md")}`,
      status: 400,
    },
    {
      case: "at a moving ref",
      query: `source=open-dough&revision=main&path=${yui}`,
      status: 400,
    },
    {
      case: "for another repository",
      query: `source=${encodeURIComponent("someone/elses-repo")}&revision=${revision}&path=${yui}`,
      status: 404,
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
