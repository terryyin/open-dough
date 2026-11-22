// Which tracked session record files beside the backlog a record commit
// removes: only readable records at their own UUID's path whose close time is
// readable and outside the shared retention window at `now`. Anything else in
// the directory stays for a person to inspect.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { git } from "./publication-git.mjs";
import {
  isCurrentSessionRecord,
  isSessionId,
  sessionRecordDirectoryBeside,
  sessionRecordPathBeside,
} from "./session-record.mjs";

async function readableRecord(workspace, backlogPath, path) {
  try {
    const record = JSON.parse(await readFile(join(workspace, path), "utf8"));
    const atOwnPath =
      isSessionId(record?.sessionId) &&
      sessionRecordPathBeside(backlogPath, record.sessionId) === path;
    const closed =
      typeof record.closedAt === "string" &&
      Number.isFinite(Date.parse(record.closedAt));
    return atOwnPath && closed ? record : undefined;
  } catch {
    return undefined;
  }
}

// The workspace-relative paths of expired session records at `now` (a Date).
export async function expiredSessionRecordPaths(workspace, backlogPath, now) {
  const tracked = (
    await git(
      workspace,
      "ls-files",
      "-z",
      "--",
      `${sessionRecordDirectoryBeside(backlogPath)}/`,
    )
  ).stdout
    .split("\0")
    .filter(Boolean);
  const expired = [];
  for (const path of tracked) {
    const record = await readableRecord(workspace, backlogPath, path);
    if (record && !isCurrentSessionRecord(record, now)) expired.push(path);
  }
  return expired;
}
