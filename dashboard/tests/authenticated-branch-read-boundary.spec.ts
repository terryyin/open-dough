// The local authenticated read boundary (../server/authenticatedRead.ts) on
// a story branch, tested directly against real HTTP and a synthetic `gh` on
// this suite's own isolated server process's PATH that answers from a fake
// GitHub recording every invocation. A branch is read only as a Taken
// entry's agent profile records it at the pinned revision, and a file only at
// a head this boundary resolved; malformed branch parameters are covered in
// ./authenticated-read-refusal.spec.ts, and what the page shows from branch
// reads in ./branch-slice-progress.spec.ts. Shares this suite's harness
// (./support/dashboardServer.ts) and ./authenticated-read-boundary.spec.ts's
// approach.

import { expect, test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import { everyRepository, publishes } from "./support/fakeGitHub";
import { branchRefAnswer } from "./originAnswers";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { rawRequest } from "./support/rawHttp";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const knownRepository = "terryyin/open-dough";

test.describe("authenticated read boundary on a story branch (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("reads on a story branch only as a Taken entry's profile records it at the pinned revision, at a head it resolved, and refuses anything else before asking GitHub", async () => {
    const revision = "a7".repeat(20);
    const head = "b8".repeat(20);
    const seedPath = ".planning/seeds/SEED-branch.md";
    const planPath = ".planning/quick/092-branch/PLAN.md";
    const planText = "# Plan\n\n## Slices\n";
    const backlogTaken = `# Product backlog

## Taken

- [Branch story](seeds/SEED-branch.md#story) — SEED-branch#story
- [Trunk story](seeds/SEED-branch.md#trunk) — SEED-branch#trunk

## Backlog list
`;
    const profile = (
      name: string,
      identity: string,
      mode: "trunk" | "story-branch",
      branch: string,
    ) =>
      renderAgentProfile({
        name,
        identity,
        mode,
        branch,
        host: undefined,
        model: undefined,
      });
    const published = publishes({
      revision,
      backlog: backlogTaken,
      files: {
        ".planning/PRODUCT-BACKLOG.md": backlogTaken,
        [seedPath]: `# Seed

<a id="story"></a>

### Branch story

**Identity:** SEED-branch#story
\`\`\`json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/092-branch/PLAN.md"}
\`\`\`
`,
        [planPath]: planText,
        ".planning/agents/yui-chan.json": profile(
          "Yui",
          "SEED-branch#story",
          "story-branch",
          "story/recorded",
        ),
        ".planning/agents/akiho-chan.json": profile(
          "Akiho",
          "SEED-branch#trunk",
          "trunk",
          "origin/main",
        ),
      },
    });
    server.github.serve(everyRepository, (call) =>
      call.request.kind === "branch"
        ? Promise.resolve(branchRefAnswer(call.request.branch, head))
        : published(call),
    );
    const read = (query: string) =>
      rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}${query}`,
        headers: { Origin: server.origin },
      });
    // The records deciding what a branch may be read for are read first, as
    // the page reads them: membership, the canonical record, and profiles.
    expect((await read("")).status).toBe(200);
    expect(
      (await read(`&revision=${revision}&path=${encodeURIComponent(seedPath)}`))
        .status,
    ).toBe(200);
    expect((await read(`&revision=${revision}&agents=profiles`)).status).toBe(
      200,
    );

    const onBranch = (branch: string, path: string) =>
      `&revision=${revision}&branch=${encodeURIComponent(branch)}&head=${head}&path=${encodeURIComponent(path)}`;
    let callsBefore = server.ghCalls().length;
    for (const branch of ["story/unrecorded", "origin/main"]) {
      const refused = await read(
        `&revision=${revision}&branch=${encodeURIComponent(branch)}`,
      );
      expect(refused.status).toBe(404);
      expect(JSON.parse(refused.body)).toEqual({
        error:
          "That branch is not recorded by a Taken entry's agent profile at this source revision.",
      });
    }
    const unresolved = await read(onBranch("story/recorded", planPath));
    expect(unresolved.status).toBe(409);
    expect(JSON.parse(unresolved.body)).toEqual({
      error: "That branch head was not resolved by this read boundary.",
    });
    expect(server.ghCalls()).toHaveLength(callsBefore);

    const resolved = await read(
      `&revision=${revision}&branch=${encodeURIComponent("story/recorded")}`,
    );
    expect(resolved.status).toBe(200);
    expect(JSON.parse(resolved.body)).toEqual({
      revision,
      branch: "story/recorded",
      head,
    });
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        `repos/${knownRepository}/git/ref/heads/story/recorded`,
        "--jq",
        ".object.sha",
      ],
    ]);

    callsBefore = server.ghCalls().length;
    const notThePlan = await read(onBranch("story/recorded", seedPath));
    expect(notThePlan.status).toBe(404);
    expect(server.ghCalls()).toHaveLength(callsBefore);

    const plan = await read(onBranch("story/recorded", planPath));
    expect(plan.status).toBe(200);
    expect(JSON.parse(plan.body)).toEqual({
      revision: head,
      path: planPath,
      text: planText,
    });
    expect(server.ghCalls().slice(callsBefore)).toEqual([
      [
        "api",
        "-H",
        "Accept: application/vnd.github.raw+json",
        `repos/${knownRepository}/contents/.planning/quick/092-branch/PLAN.md?ref=${head}`,
      ],
    ]);
  });
});
