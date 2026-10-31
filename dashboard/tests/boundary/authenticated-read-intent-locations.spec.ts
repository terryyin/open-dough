// Intent locations and location-contained file-at admission for the local
// authenticated read boundary (../../server/intentLocationsRead.ts): a
// configured Gherkin location lists nested `.feature` files; a `file-at`
// outside those locations is refused without reading its contents.

import { expect, test } from "../support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import { everyRepository, publishes } from "../support/fakeGitHub.ts";
import { rawRequest } from "../support/rawHttp.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const backlog = `# Product backlog

## Taken

## Backlog list
`;
const settingsPath = ".planning/open-dough.json";
const featurePath = "e2e_test/features/recall/note.feature";
const outsidePath = "README.md";
const featureText = "Feature: Note\n";
const settings = JSON.stringify({
  intent: {
    locations: [{ path: "e2e_test/features", kind: "gherkin" }],
  },
});

const revisionOf = (byte: string) => byte.repeat(20);

test.describe("authenticated Intent locations read (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("lists nested .feature files under a configured gherkin location", async () => {
    const revision = revisionOf("a1");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: settings,
          [featurePath]: featureText,
          "e2e_test/features/recall/__image_snapshots__/x.png": "png",
        },
      }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      locations: [
        {
          path: "e2e_test/features",
          kind: "gherkin",
          files: [featurePath],
        },
      ],
    });
  });

  test("answers not-configured when the settings omit intent locations", async () => {
    const revision = revisionOf("a2");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: { [settingsPath]: "{}\n" },
      }),
    );
    const response = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      revision,
      locations: null,
    });
  });

  test("admits file-at for a path inside a configured location and refuses one outside", async () => {
    const revision = revisionOf("a3");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: settings,
          [featurePath]: featureText,
          [outsidePath]: "# Outside\n",
        },
      }),
    );
    const inside = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(featurePath)}`,
      headers: { Origin: server.origin },
    });
    expect(inside.status).toBe(200);
    expect(JSON.parse(inside.body)).toMatchObject({
      revision,
      path: featurePath,
      text: featureText,
    });

    const callsBefore = server.ghCalls().length;
    const outside = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&path=${encodeURIComponent(outsidePath)}`,
      headers: { Origin: server.origin },
    });
    expect(outside.status).toBe(404);
    expect(JSON.parse(outside.body)).toMatchObject({
      error: "That path is not reachable from this source revision.",
    });
    const after = server.ghCalls().slice(callsBefore);
    expect(
      after.every(
        (argv) => !argv.join(" ").includes(`/contents/${outsidePath}`),
      ),
    ).toBe(true);
  });
});
