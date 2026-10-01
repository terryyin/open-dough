// Retained receipts can be incomplete; only real Git allocation verifies continuation.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { keptStarts, launch, launchRequest } from "./agentLaunchBoundary.ts";
import { expect, test } from "./support/preparationPage.ts";
import { stored } from "./support/codexLaunch.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import type { EstablishedPreparation } from "../src/agentLaunch.ts";
import type { StartRecord } from "../server/startStore.ts";

test.use({ preparationHost: "codex" });

for (const evidence of ["legacy-sha", "lost-result"] as const) {
  test(`Codex retained ${evidence} continues only the workspace's verified allocation`, async ({
    dashboard,
    origin,
    codexProtocol,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Native fixture missing.");
    const request = {
      ...launchRequest,
      workflow: "refinement",
      host: "codex",
      identity: queuedIdentity,
      title: "Story A",
    };
    native.refuseCreation = true;
    expect((await launch(dashboard, request)).body).toContain(
      "Codex refused to create",
    );
    const profiles = await origin.takenProfiles();
    const publication = (await origin.originGit("rev-parse", "main")).trim();
    const startsFile = path.join(
      dashboard.home,
      ".open-dough/dashboard/refinement-starts.json",
    );
    const starts = JSON.parse(readFileSync(startsFile, "utf8")) as Record<
      string,
      Record<string, StartRecord & { preparation: EstablishedPreparation }>
    >;
    const retained = starts["open-dough"][queuedIdentity];
    const preparation = retained.preparation;
    if (evidence === "legacy-sha") delete preparation.publishedSha;
    else delete retained.preparation;
    writeFileSync(startsFile, JSON.stringify(starts));
    native.refuseCreation = false;
    expect((await launch(dashboard, request)).body).toContain(
      '"kind":"launched"',
    );
    expect(await origin.takenProfiles()).toEqual(profiles);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
      publication,
    );
    expect(stored(dashboard.home)[0]?.preparation).toMatchObject({
      agent: preparation.agent,
      workspace: preparation.workspace,
      branch: preparation.branch,
    });
    expect(await keptStarts(dashboard)).toEqual([]);
    expect(
      native.calls.filter(({ method }) => method === "thread/start"),
    ).toHaveLength(2);
    expect(
      native.calls.filter(({ method }) => method === "turn/start"),
    ).toHaveLength(1);
    expect(
      execFileSync(
        "git",
        [
          "-C",
          preparation.workspace,
          "rev-parse",
          "refs/worktree/dough/preparation-assignment",
        ],
        { encoding: "utf8" },
      ).trim(),
    ).toBe(publication);
  });
}
