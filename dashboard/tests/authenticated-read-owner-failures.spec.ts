// Endpoint failures reach both a browser's existing notice and the local
// diagnostic history. The fixture supplies actual directory/socket faults.
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ownerSecret,
  refusingOwner,
} from "../../src/skills/dough-execute-plan/scripts/github-request-owner-refusal-test-fixtures.mjs";
import { ownerlessRequestRoot } from "../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { endFakeGh, fakeGhEnv, installFakeGh } from "./support/fakeGh.ts";
import { expect, test } from "./support/pageTest.ts";
import {
  inspect,
  knownSourceId,
  startDashboardServer,
} from "./support/readDiagnostics.ts";
import { rawRequest } from "./support/rawHttp.ts";

for (const [fault, ownerCause, message] of [
  ["privacy", "not-private", "endpoint is open to other users"],
  ["path", "path-too-long", "endpoint path is too long"],
  ["incompatible", "incompatible", "explicitly refused the protocol"],
  ["unauthenticated", "unauthenticated", "explicitly refused this caller"],
  ["unknown", "unknown", "gave no usable answer"],
] as const) {
  test(`the browser and diagnostic history name observed owner ${fault} with safe endpoint recovery`, async ({
    page,
  }) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-owner-notice-"));
    const gh = installFakeGh(machine);
    const cleanups: (() => Promise<void>)[] = [];
    const root = gh.requestOwnerRoot;
    let requestOwnerRoot = root;
    if (fault === "privacy") chmodSync(root, 0o755);
    else if (fault === "path") requestOwnerRoot = ownerlessRequestRoot(root);
    else
      await refusingOwner(
        {
          env: { ...process.env, ...fakeGhEnv(gh), GH_TOKEN: ownerSecret },
          teardown: {
            defer: (cleanup: () => Promise<void>) => cleanups.push(cleanup),
          },
        },
        { refused: fault === "unknown" ? ownerSecret : fault },
      );
    const server = await startDashboardServer({
      mode: "dev",
      requestOwnerRoot,
      extraEnv: { GH_TOKEN: ownerSecret },
    });
    try {
      const response = await rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(502);
      expect(response.body).toContain(message);
      expect(JSON.parse(response.body)).not.toHaveProperty("recovery");
      const before = await inspect(server);
      expect(before.failures).toHaveLength(1);
      expect(before.failures[0]).toMatchObject({
        cause: "owner-unavailable",
        ownerCause,
        category: "ref",
        source: knownSourceId,
      });
      expect(before.failures[0]?.status).toBeUndefined();
      await page.goto(server.baseURL);
      const notice = page.getByText(new RegExp(message)).first();
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(
        "Check the local request-owner endpoint configuration",
      );
      const seen = await inspect(server);
      expect(
        seen.failures.every((entry) => entry.ownerCause === ownerCause),
      ).toBe(true);
      for (const secret of [root, ownerSecret, "gh auth", "gh failed"]) {
        expect(response.body).not.toContain(secret);
        expect(seen.body).not.toContain(secret);
        expect(await notice.textContent()).not.toContain(secret);
      }
      expect(server.ghCalls()).toEqual([]);
    } finally {
      await server.close();
      for (const cleanup of cleanups.reverse()) await cleanup();
      await endFakeGh(gh);
      rmSync(machine, { recursive: true, force: true });
    }
  });
}
