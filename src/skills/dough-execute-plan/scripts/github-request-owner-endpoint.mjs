// The private endpoint of this machine's one GitHub request owner
// (`./github-request-owner.mjs`): where it stands and who may reach it; what
// is said there is `./github-request-owner-wire.mjs`'s. It stands in a
// directory only this user can enter, under `/tmp/dough-github-requests-UID/`
// unless `DOUGH_GITHUB_REQUEST_OWNER_ROOT` names another -- beside the CI
// mailboxes (`./ci-mailbox-location.mjs`), where every host that can run an
// observer can write, and short enough for a socket path -- one directory
// for each `gh` and `gh` login settings a consumer runs with, so no consumer
// is answered with another's login. The owner standing there is the one its
// highest-numbered record names; a record is claimed once and never reused.
import { createHmac, randomBytes } from "node:crypto";
import {
  accessSync,
  constants,
  linkSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { delimiter, join } from "node:path";

export function endpointRoot(env = process.env) {
  return (
    env.DOUGH_GITHUB_REQUEST_OWNER_ROOT ??
    join("/tmp", `dough-github-requests-${process.getuid?.() ?? "user"}`)
  );
}

// Why a directory cannot hold the endpoint for the user `uid`; undefined when
// it is that user's alone.
/**
 * @param {{ isDirectory(): boolean; readonly uid: number; readonly mode: number }} entry
 * @param {number | undefined} uid
 */
export function privacyRefusal(entry, uid) {
  if (!entry.isDirectory()) return "not a directory";
  if (entry.uid !== uid) return "owned by another user";
  if ((entry.mode & 0o077) !== 0) return "open to other users";
  return undefined;
}

function privateDirectory(path) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  const refusal = privacyRefusal(lstatSync(path), process.getuid?.());
  if (refusal !== undefined)
    throw new Error(`GitHub request endpoint is ${refusal}`);
  return path;
}

// Writes `text` at `file` unless a file already stands there: complete for
// every reader, and written by one writer only. Whether this write stands.
function writtenOnce(file, text) {
  const draft = `${file}.${process.pid}.${randomBytes(4).toString("hex")}`;
  writeFileSync(draft, text, { mode: 0o600, flag: "wx" });
  try {
    linkSync(draft, file);
    return true;
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    return false;
  } finally {
    rmSync(draft, { force: true });
  }
}

// This user's secret under `root`, which names endpoint directories without
// keeping any login setting in a name.
function namingSecret(root) {
  const file = join(root, "key");
  try {
    return readFileSync(file, "utf8");
  } catch {
    writtenOnce(file, randomBytes(32).toString("hex"));
    return readFileSync(file, "utf8");
  }
}

function installedGh(env) {
  for (const directory of (env.PATH ?? "").split(delimiter)) {
    const candidate = join(directory || ".", "gh");
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }
  return "";
}

// What decides whose answers `gh` gives besides the `gh` run.
const loginSettings = [
  "GH_HOST",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "GH_ENTERPRISE_TOKEN",
  "GITHUB_ENTERPRISE_TOKEN",
  "GH_CONFIG_DIR",
  "XDG_CONFIG_HOME",
  "HOME",
];

// The longest path a socket may be bound at on every supported system.
const socketPathBytes = 103;

// The directory holding the endpoint a process with `env` asks through,
// created private when missing; throws when it is not this user's alone or
// lies too deep for a socket.
export function endpointDirectory(env = process.env) {
  const root = privateDirectory(endpointRoot(env));
  const settings = [
    installedGh(env),
    ...loginSettings.map((name) => env[name] ?? null),
  ];
  const name = createHmac("sha256", namingSecret(root))
    .update(JSON.stringify(settings))
    .digest("hex")
    .slice(0, 12);
  const directory = privateDirectory(join(root, name));
  if (Buffer.byteLength(join(directory, newSocketName())) > socketPathBytes)
    throw new Error("GitHub request endpoint is too deep for a socket path");
  return directory;
}

const recordName = /^owner\.(\d+)\.json$/;
const socketName = /^[0-9a-f]{8}\.s$/;
const recordFile = (directory, generation) =>
  join(directory, `owner.${generation}.json`);

export const newSocketName = () => `${randomBytes(4).toString("hex")}.s`;

function generations(directory) {
  return readdirSync(directory)
    .map((name) => Number(recordName.exec(name)?.[1]))
    .filter(Number.isSafeInteger)
    .sort((a, b) => a - b);
}

// The record of the owner standing in `directory`: its generation and, when
// readable, its process, protocol, caller token and socket path.
/**
 * @returns {{
 *   readonly generation: number;
 *   readonly pid?: number;
 *   readonly protocol?: number;
 *   readonly token?: string;
 *   readonly socket?: string;
 * } | undefined}
 */
export function standingRecord(directory) {
  const generation = generations(directory).at(-1);
  if (generation === undefined) return undefined;
  try {
    const {
      pid,
      protocol: spoken,
      token,
      socket,
    } = JSON.parse(readFileSync(recordFile(directory, generation), "utf8"));
    return {
      generation,
      pid,
      protocol: spoken,
      token,
      ...(socketName.test(socket) ? { socket: join(directory, socket) } : {}),
    };
  } catch {
    return { generation };
  }
}

// Claims `generation` for the owner `record` describes, unless it was
// claimed already. The claimant then stands and removes what earlier owners
// left.
export function claimedRecord(directory, generation, record) {
  if (!writtenOnce(recordFile(directory, generation), JSON.stringify(record)))
    return false;
  for (const earlier of generations(directory)) {
    if (earlier >= generation) break;
    const file = recordFile(directory, earlier);
    try {
      const { socket } = JSON.parse(readFileSync(file, "utf8"));
      if (socketName.test(socket)) rmSync(join(directory, socket));
    } catch {
      // Nothing of that owner's is left to remove.
    }
    rmSync(file, { force: true });
  }
  return true;
}
