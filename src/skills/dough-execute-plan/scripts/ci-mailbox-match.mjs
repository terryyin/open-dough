// Locate a live execution observer that already matches repository, target
// branch, and checkout. Ended or dead workers are not reusable owners.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  checkoutRoot,
  mailboxRoot,
  mailboxWorkerLoss,
  readMailbox,
  readWorkerIdentity,
} from "./ci-mailbox.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";

export function listMailboxDirectories(storage = mailboxRoot) {
  if (!existsSync(storage)) return [];
  return readdirSync(storage)
    .filter((name) => /^watch-/.test(name))
    .map((name) => join(storage, name));
}

export function isLiveMatchingMailbox(
  directory,
  { repo, branch, root = checkoutRoot, storage = mailboxRoot } = {},
) {
  let request;
  try {
    request = readMailbox(directory, root, storage);
  } catch {
    return false;
  }
  if (request.probe) return false;
  if (request.mode !== "execution") return false;
  if (request.repo !== repo || request.branch !== branch) return false;
  if (existsSync(join(directory, "result.json"))) return false;
  if (mailboxWorkerLoss(directory)) return false;
  let identity;
  try {
    identity = readWorkerIdentity(directory);
  } catch {
    return false;
  }
  return checkMailboxWorkerLiveness(identity, directory) === "alive";
}

export function findLiveMatchingMailbox({
  repo,
  branch,
  root = checkoutRoot,
  storage = mailboxRoot,
} = {}) {
  return listMailboxDirectories(storage).find((directory) =>
    isLiveMatchingMailbox(directory, { repo, branch, root, storage }),
  );
}
