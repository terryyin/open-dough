// A saved preparation belongs to the selected start only when its checkout,
// branch and published source match. Real paths recognize checkout aliases.
import { realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { EstablishedPreparation } from "../src/agentLaunch.ts";

export async function matchesPreparation(
  preparation: EstablishedPreparation,
  start: {
    readonly workspace: string;
    readonly branch: string;
    readonly identity: string;
    readonly remote: string;
    readonly target: string;
  },
): Promise<boolean> {
  const paths = await Promise.all(
    [start.workspace, preparation.workspace].map((file) =>
      realpath(file).catch(() => resolve(file)),
    ),
  );
  return (
    paths[0] === paths[1] &&
    preparation.branch === start.branch &&
    preparation.identity === start.identity &&
    preparation.remote === start.remote &&
    preparation.target === start.target
  );
}
