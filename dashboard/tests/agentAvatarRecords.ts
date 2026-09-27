// The profile histories and avatar images the credited-human avatar journey
// (agent-roster-avatar.spec.ts) publishes beside the attribution journey's
// files (agentAttributionRecords.ts). At the first revision, the Taken
// profile's addition is committed by an account whose avatar the avatar host
// serves, after an older allocation by another account and before a
// modification by a third; the Preparing profile's addition matches no
// account; one profile's account names an avatar off GitHub's avatar host;
// and one account's avatar cannot be fetched. At the second revision the
// Taken agent was allocated again by an account with another avatar, and the
// Preparing agent by the first revision's credited account.

import { firstRevision as attributedFiles } from "./agentAttributionRecords.ts";
import {
  avatarPng,
  avatarServerError,
  avatarsAt,
  onAvatarHost,
} from "./avatarAnswers.ts";
import { pathChange, type PathHistories } from "./pathHistoryAnswers.ts";

const agents = ".planning/agents";

export const credited = "Terry Yin";
export const unmatched = "Pat Preparer";
export const offHost = "Rae Rejected";
export const unfetched = "Fay Failed";
export const reallocator = "Nova Newcomer";

// Each account's avatar path on GitHub's avatar host.
export const creditedAvatar = "/u/101";
const offHostAvatar = "/u/102";
export const unfetchedAvatar = "/u/103";
export const reallocatorAvatar = "/u/104";
export const modifierAvatar = "/u/105";
export const olderAvatar = "/u/106";

// The widths the avatar host's images have, telling them apart on the page.
export const creditedWidth = 3;
export const reallocatorWidth = 5;

const akihoHistory = [
  pathChange(0x41, "modified", "Mo Modifier", {
    login: "mo-modifier",
    avatarUrl: onAvatarHost(modifierAvatar),
  }),
  pathChange(0x42, "added", credited, {
    login: "terryyin",
    avatarUrl: onAvatarHost(creditedAvatar),
  }),
  pathChange(0x43, "removed", "Olde Allocator"),
  pathChange(0x44, "added", "Olde Allocator", {
    login: "olde",
    avatarUrl: onAvatarHost(olderAvatar),
  }),
];

const history: PathHistories = {
  [`${agents}/akiho-chan.json`]: akihoHistory,
  [`${agents}/kirara-chan.json`]: [pathChange(0x51, "added", unmatched)],
  [`${agents}/yuma-chan.json`]: [
    pathChange(0x61, "added", offHost, {
      login: "rae",
      avatarUrl: `https://avatars.example.com${offHostAvatar}?v=4`,
    }),
  ],
  [`${agents}/sola-chan.json`]: [
    pathChange(0x71, "added", unfetched, {
      login: "fay",
      avatarUrl: onAvatarHost(unfetchedAvatar),
    }),
  ],
};

export const firstRevision = {
  ...attributedFiles,
  revision: "c1".repeat(20),
  history,
};

export const secondRevision = {
  ...firstRevision,
  revision: "c2".repeat(20),
  history: {
    ...history,
    [`${agents}/akiho-chan.json`]: [
      pathChange(0x45, "added", reallocator, {
        login: "nova",
        avatarUrl: onAvatarHost(reallocatorAvatar),
      }),
      pathChange(0x46, "removed", credited),
      ...akihoHistory,
    ],
    [`${agents}/kirara-chan.json`]: [
      pathChange(0x52, "added", credited, {
        login: "terryyin",
        avatarUrl: onAvatarHost(creditedAvatar),
      }),
      pathChange(0x53, "removed", unmatched),
      pathChange(0x51, "added", unmatched),
    ],
  },
};

// What GitHub's avatar host answers; the off-host avatar would be found if
// it were ever asked for, so only its refusal keeps it off the page.
export const avatarHost = avatarsAt({
  [creditedAvatar]: avatarPng(creditedWidth),
  [offHostAvatar]: avatarPng(7),
  [unfetchedAvatar]: avatarServerError,
  [reallocatorAvatar]: avatarPng(reallocatorWidth),
  [modifierAvatar]: avatarPng(9),
  [olderAvatar]: avatarPng(11),
});
