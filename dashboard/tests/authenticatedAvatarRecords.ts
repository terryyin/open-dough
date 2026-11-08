// The agent profiles and avatar images the authenticated avatar read spec
// (authenticated-avatar.spec.ts) publishes beside an empty backlog. At the
// first revision each listed profile's addition matched an account, or none,
// whose avatar source GitHub names usably or not, and whose image the avatar
// host serves or fails to. At a later revision GitHub names a newer version of
// Yui's human's avatar.

import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  publishes,
  type AvatarAnswer,
  type AvatarAnswerer,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import { pathChange, type PathChange } from "./pathHistoryAnswers.ts";
import {
  avatarPng,
  avatarServerError,
  avatarsAt,
  onAvatarHost,
} from "./avatarAnswers.ts";
import { backlogApart, describedRevision } from "./describedRevisions.ts";

export const revision = "f1".repeat(20);
export const laterRevision = "f2".repeat(20);
export const agents = ".planning/agents";

type Account = Parameters<typeof pathChange>[3];

// Each listed profile's addition, by its agent's file name: the account it
// matched, if any, and the avatar address GitHub named for that account.
export const additions: Readonly<Record<string, Account>> = {
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
  "airi-chan.json": { login: "held", avatarUrl: onAvatarHost("/u/309") },
};

// Yui's addition at the later revision: the same account, whose avatar
// GitHub now names at a newer version.
const newerVersion = 5;
const laterAdditions = {
  "yui-chan.json": {
    login: "terryyin",
    avatarUrl: onAvatarHost("/u/301", newerVersion),
  },
};

const oversized: AvatarAnswer = {
  status: 200,
  contentType: "image/png",
  body: Buffer.alloc(1024 * 1024 + 1),
};

const avatarsByPath = avatarsAt({
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
  "/u/309": avatarPng(6),
});

// The newer version of /u/301 is a wider image than the earlier one.
export const newerAvatar = avatarPng(5);
export const avatarHost: AvatarAnswerer = (requested) =>
  requested.startsWith(`/u/301?v=${String(newerVersion)}&`)
    ? newerAvatar
    : avatarsByPath(requested);

// The revision `at` publishing an empty backlog and a preparing profile for
// each agent in `profiles`, each added by its own commit from `firstCommit` on.
function publication(
  at: string,
  profiles: Readonly<Record<string, Account>>,
  firstCommit: number,
) {
  const history: Record<string, readonly PathChange[]> = {};
  const names = Object.keys(profiles).map((file) => {
    const name = file.split("-")[0] ?? "";
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  });
  Object.entries(profiles).forEach(([file, account], index) => {
    history[`${agents}/${file}`] = [
      pathChange(firstCommit + index + 1, "added", "Some Human", account),
    ];
  });
  const published = describedRevision(
    makeMe.aRepository
      .withRevision("avatars", {
        agentProfiles: names.map((name) =>
          makeMe.anAgentProfile
            .preparing({ name, identity: "SEED-avatar#story" })
            .please(),
        ),
      })
      .please(),
    at,
  );
  return { ...backlogApart(published), history };
}

// Each revision's own publication, told apart by the revision a request names
// or the addition commit it asks about.
export function publishedRevisions(): RepositoryAnswerer {
  const earlier = publication(revision, additions, 0x80);
  const later = publication(laterRevision, laterAdditions, 0xc0);
  const laterCommits = new Set(
    Object.values(later.history).flatMap((changes) =>
      changes.map(({ sha }) => sha),
    ),
  );
  const [answerEarlier, answerLater] = [publishes(earlier), publishes(later)];
  return (call) => {
    const { request } = call;
    const isLater =
      ("revision" in request && request.revision === laterRevision) ||
      (request.kind === "commit" && laterCommits.has(request.sha));
    return (isLater ? answerLater : answerEarlier)(call);
  };
}
