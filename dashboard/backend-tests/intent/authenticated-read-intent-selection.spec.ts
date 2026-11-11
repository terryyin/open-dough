// Intent location selection for file-at admission
// (../../server/intentLocationSelection.ts): a matched path inside a pattern
// location is readable; an unmatched sibling is refused without reading its
// contents. Listing uses the same selection rule, for a location declared by
// a kind with include patterns or by source entries.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { describedBacklog } from "../../tests/describedRevisions.ts";
import { intentSettingsText } from "../../tests/support/intentSettingsFile.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
// An empty project's backlog.
const backlog = describedBacklog(makeMe.aRepository.please());
const settingsPath = ".planning/open-dough.json";
const revisionOf = (byte: string) => byte.repeat(20);

test.describe("authenticated Intent location selection (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("admits file-at for a selected path and refuses an unmatched file inside a pattern location", async () => {
    const revision = revisionOf("a7");
    const matchedPath = "frontend/src/pages/AspyPage.devices.spec.tsx";
    const unmatchedPath = "frontend/src/pages/AspyPage.tsx";
    const matchedText = "export const devices = true;\n";
    const unmatchedText = "export function AspyPage() { return null; }\n";
    const include = [
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
    ];
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: intentSettingsText(
            makeMe.intentSettings
              .withLocations(
                makeMe.anIntentLocation
                  .at("frontend/src")
                  .ofKind("typescript", include)
                  .withRules({ makeMe: false, pageObjects: true })
                  .please(),
              )
              .please(),
          ),
          [matchedPath]: matchedText,
          [unmatchedPath]: unmatchedText,
        },
      }),
    );

    const matched = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(matchedPath)}`,
      headers: { Origin: server.origin },
    });
    expect(matched.status).toBe(200);
    expect(JSON.parse(matched.body)).toMatchObject({
      revision,
      path: matchedPath,
      text: matchedText,
    });

    const callsBefore = server.ghCalls().length;
    const unmatched = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(unmatchedPath)}`,
      headers: { Origin: server.origin },
    });
    expect(unmatched.status).toBe(404);
    expect(JSON.parse(unmatched.body)).toMatchObject({
      error: "That path is not reachable from this source revision.",
    });
    const after = server.ghCalls().slice(callsBefore);
    expect(
      after.every(
        (argv) => !argv.join(" ").includes(`/contents/${unmatchedPath}`),
      ),
    ).toBe(true);

    // Discrimination: folder-only admission would accept the unmatched path.
    // Re-check listing so the shared selection rule (not folder containment)
    // is what refused it.
    const listed = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(listed.status).toBe(200);
    expect(JSON.parse(listed.body)).toEqual({
      revision,
      locations: [
        {
          path: "frontend/src",
          kind: "typescript",
          include,
          makeMe: false,
          pageObjects: true,
          files: [matchedPath],
        },
      ],
    });
  });

  test("a sources location lists and admits each file an entry's pattern matches, with no extension filter, and answers its entries without a kind", async () => {
    const revision = revisionOf("a8");
    const matchedPath = "checks/a.check";
    const neighborPath = "checks/notes.md";
    const matchedText = "check a\n";
    const checks = makeMe.anIntentLocation
      .at("checks")
      .withSources({ include: ["**/*.check"] })
      .please();
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: intentSettingsText(
            makeMe.intentSettings.withLocations(checks).please(),
          ),
          [matchedPath]: matchedText,
          [neighborPath]: "# Notes\n",
        },
      }),
    );

    const listed = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(listed.status).toBe(200);
    expect(JSON.parse(listed.body)).toEqual({
      revision,
      locations: [
        {
          path: "checks",
          sources: [{ include: ["**/*.check"] }],
          files: [matchedPath],
        },
      ],
    });

    const matched = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(matchedPath)}`,
      headers: { Origin: server.origin },
    });
    expect(matched.status).toBe(200);
    expect(JSON.parse(matched.body)).toMatchObject({
      revision,
      path: matchedPath,
      text: matchedText,
    });

    const neighbor = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(neighborPath)}`,
      headers: { Origin: server.origin },
    });
    expect(neighbor.status).toBe(404);
  });

  test("sources alone select when present, and a malformed sources list drops its location", async () => {
    const revision = revisionOf("a9");
    const shellTest = "scripts/test/worktree_setup.sh.test";
    const nodeTest = "scripts/ci/ci-proof-outcomes.test.mjs";
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: JSON.stringify({
            intent: {
              locations: [
                // `kind` and `include` beside `sources` are not read.
                {
                  path: "scripts",
                  kind: "javascript",
                  include: ["**/*.mjs"],
                  sources: [
                    { include: ["**/*.test"], syntax: "shell" },
                    { include: ["**/*.test.mjs"], syntax: "javascript" },
                  ],
                },
                { path: "empty", sources: [] },
                { path: "no-include", sources: [{ include: [] }] },
                { path: "unsafe", sources: [{ include: ["../*.test"] }] },
                { path: "not-a-list", sources: { include: ["*.test"] } },
                {
                  path: "bad-syntax",
                  sources: [{ include: ["*"], syntax: 7 }],
                },
                { path: "kind-only", kind: "shell", sources: null },
              ],
            },
          }),
          [shellTest]: "echo ok\n",
          [nodeTest]: "export {};\n",
          "scripts/ci/ci-proof-fixtures.mjs": "export {};\n",
          "empty/a.test": "",
          "no-include/a.test": "",
          "kind-only/a.sh": "",
        },
      }),
    );
    const listed = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(listed.status).toBe(200);
    expect(JSON.parse(listed.body)).toEqual({
      revision,
      locations: [
        {
          path: "scripts",
          sources: [
            { include: ["**/*.test"], syntax: "shell" },
            { include: ["**/*.test.mjs"], syntax: "javascript" },
          ],
          files: [shellTest, nodeTest],
        },
      ],
    });
  });
});
