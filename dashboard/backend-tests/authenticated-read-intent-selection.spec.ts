// Intent location selection for file-at admission
// (../../server/intentLocationSelection.ts): a matched path inside a pattern
// location is readable; an unmatched sibling is refused without reading its
// contents. Listing uses the same selection rule.

import { expect, test } from "../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../tests/support/fakeGitHub.ts";
import { rawRequest } from "../tests/support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const backlog = `# Product backlog

## Taken

## Backlog list
`;
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
          [settingsPath]: JSON.stringify({
            intent: {
              locations: [
                { path: "frontend/src", kind: "typescript", include },
              ],
            },
          }),
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
          files: [matchedPath],
        },
      ],
    });
  });
});
