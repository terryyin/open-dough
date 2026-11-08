// One published preparation step at a time on a local bare origin, through
// the production commands: the preparation-assignment CLI's start and release,
// the canonical preparation recorder, and the Dough Land Git model for landing.
// Each step fails loudly, so a journey built from them holds only steps that
// actually published.

import { landWorktree } from "../../src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  createPreparationTrunk,
  createWorkspace,
  identityC,
  linkC,
  lsRemoteSha,
  recorder,
  releasePreparation,
  startPreparation,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

type Receipt = { status: string; agent: string };
export type Trunk = Awaited<ReturnType<typeof createPreparationTrunk>>;

export async function remoteMain(trunk: Trunk): Promise<string> {
  const sha = await lsRemoteSha(trunk.origin, "refs/heads/main");
  if (sha === undefined) throw new Error("origin has no main");
  return sha;
}

export function expectOk(
  step: string,
  result: { code: number; receipt: unknown },
) {
  if (result.code !== 0) {
    throw new Error(`${step} failed: ${JSON.stringify(result)}`);
  }
  return result.receipt as Receipt;
}

// Announces preparation of `identity` from a new workspace. The receipt names
// the assigned agent; `name` is that agent's known name.
export async function start(
  trunk: Trunk,
  workspaceName: string,
  identity: string,
  extra: string[] = [],
) {
  const { workspace, branch } = await createWorkspace(trunk, workspaceName);
  const receipt = expectOk(
    `start ${workspaceName}`,
    await startPreparation(trunk, workspace, identity, extra),
  );
  const name = agentNameOf(receipt.agent);
  if (receipt.status !== "announced" || name === undefined) {
    throw new Error(`start ${workspaceName}: ${JSON.stringify(receipt)}`);
  }
  return {
    workspace,
    branch,
    agent: receipt.agent,
    name,
    publication: await remoteMain(trunk),
  };
}

// Releases the workspace's assignment and lands its preparation on trunk.
export async function keep(
  trunk: Trunk,
  prepared: { workspace: string; branch: string },
  identity: string,
) {
  expectOk("release", await releasePreparation(prepared.workspace, identity));
  const landing = await landWorktree({
    worktree: prepared.workspace,
    branch: prepared.branch,
    defaultCheckout: trunk.integration,
    message: `Keep ${identity} preparation`,
    beforePush: undefined,
  });
  if (landing.stopped !== null) {
    throw new Error(`landing stopped: ${JSON.stringify(landing)}`);
  }
}

// Records Story C as refined, plus the given facts.
export const record = (workspace: string, ...facts: string[]) =>
  recorder(
    workspace,
    "record-state",
    "--identity",
    identityC,
    "--link",
    linkC,
    "--refinement",
    "refined",
    ...facts,
  );
