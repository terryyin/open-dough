// The profile histories and avatar images the credited-human journey
// (agent-roster-avatar.spec.ts) publishes beside the agent roster's records
// (agentRosterRecords.ts), whose names profile-addition-latency.spec.ts also
// credits. At the first revision, the Taken profile's current allocation was
// added by an account whose avatar the avatar host serves, after an older
// allocation of the same rotating name by another account and before a
// modification by a third; the Preparing profile's addition matches no
// account; one account names an avatar off GitHub's avatar host; one
// account's avatar cannot be fetched; one history reaches an older
// allocation without an addition of its own; and one history is explicitly
// unpublished (`null`, answered as a lost connection). At the second revision
// the Taken agent was released and
// allocated again by an account with another avatar, and the Preparing agent
// by the first revision's credited account.

import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  openDough,
  openDoughFiles,
  takenIdentity,
} from "./agentRosterRecords.ts";
import {
  avatarPng,
  avatarServerError,
  avatarsAt,
  onAvatarHost,
} from "./avatarAnswers.ts";
import { pathChange, type PathHistories } from "./pathHistoryAnswers.ts";

const agents = ".planning/agents";

export const credited = "Terry Yin";
export const preparer = "Pat Preparer";
export const offHost = "Rae Rejected";
export const unfetched = "Fay Failed";
export const reallocator = "Nova Newcomer";
export const modifier = "Mo Modifier";
export const olderAllocator = "Olde Allocator";

// Each account's avatar path on GitHub's avatar host.
export const creditedAvatar = "/u/101";
export const offHostAvatar = "/u/102";
export const unfetchedAvatar = "/u/103";
export const reallocatorAvatar = "/u/104";
export const modifierAvatar = "/u/105";
export const olderAvatar = "/u/106";

// The widths the avatar host's images have, telling them apart on the page.
export const creditedWidth = 3;
export const reallocatorWidth = 5;

// The profiles naming work the backlog does not list, beside the roster's.
const retired = (name: string) =>
  renderAgentProfile({
    name,
    identity: "SEED-098#another-retired-story",
    mode: "trunk",
    branch: "origin/main",
  });

// Akiho's allocation for the Taken work, after an older allocation of the
// same name was added by someone else and released.
const akihoHistory = [
  pathChange(0x41, "modified", modifier, {
    login: "mo-modifier",
    avatarUrl: onAvatarHost(modifierAvatar),
  }),
  pathChange(0x42, "added", credited, {
    login: "terryyin",
    avatarUrl: onAvatarHost(creditedAvatar),
  }),
  pathChange(0x43, "removed", olderAllocator),
  pathChange(0x44, "added", olderAllocator, {
    login: "olde",
    avatarUrl: onAvatarHost(olderAvatar),
  }),
];

const history: PathHistories = {
  [`${agents}/akiho-chan.json`]: akihoHistory,
  [`${agents}/kirara-chan.json`]: [pathChange(0x51, "added", preparer)],
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
  // Only a modification is found before an older allocation's removal.
  [`${agents}/rina-chan.json`]: [
    pathChange(0x81, "modified", modifier),
    pathChange(0x82, "removed", olderAllocator),
    pathChange(0x83, "added", olderAllocator),
  ],
  [`${agents}/nana-chan.json`]: null,
};

export const firstRevision = {
  ...openDough,
  revision: "c1".repeat(20),
  files: {
    ...openDoughFiles,
    [`${agents}/sola-chan.json`]: retired("Sola"),
    [`${agents}/rina-chan.json`]: retired("Rina"),
    [`${agents}/nana-chan.json`]: retired("Nana"),
  },
  history,
};

export const secondRevision = {
  ...firstRevision,
  revision: "c2".repeat(20),
  files: {
    ...firstRevision.files,
    [`${agents}/akiho-chan.json`]: renderAgentProfile({
      name: "Akiho",
      identity: takenIdentity,
      mode: "trunk",
      branch: "origin/main",
      host: "codex",
    }),
  },
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
      pathChange(0x53, "removed", preparer),
      pathChange(0x51, "added", preparer),
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
