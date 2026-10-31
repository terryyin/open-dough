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

  test("marks empty, missing, and unsupported locations while listing usable ones", async () => {
    const revision = revisionOf("a4");
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        backlog,
        files: {
          [settingsPath]: JSON.stringify({
            intent: {
              locations: [
                { path: "e2e_test/features", kind: "gherkin" },
                { path: "no_such_dir", kind: "gherkin" },
                { path: "empty_features", kind: "gherkin" },
                { path: "frontend/src", kind: "typescript" },
              ],
            },
          }),
          [featurePath]: featureText,
          "empty_features/README.md": "# none\n",
          "frontend/src/app.ts": "export {}\n",
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
        {
          path: "no_such_dir",
          kind: "gherkin",
          files: [],
          problem: "no-features",
        },
        {
          path: "empty_features",
          kind: "gherkin",
          files: [],
          problem: "no-features",
        },
        {
          path: "frontend/src",
          kind: "typescript",
          files: [],
          problem: "unsupported-kind",
        },
      ],
    });
  });

  test("answers malformed and unreadable settings distinctly from not-configured", async () => {
    const malformedRevision = revisionOf("a5");
    server.github.serve(
      everyRepository,
      publishes({
        revision: malformedRevision,
        backlog,
        files: { [settingsPath]: "{not json\n" },
      }),
    );
    const malformed = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${malformedRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(malformed.status).toBe(200);
    expect(JSON.parse(malformed.body)).toEqual({
      revision: malformedRevision,
      locations: null,
      settingsProblem: "malformed",
    });

    const unreadableRevision = revisionOf("a6");
    const published = publishes({
      revision: unreadableRevision,
      backlog,
      files: { [settingsPath]: "{}\n" },
    });
    server.github.serve(everyRepository, async (call) => {
      if (
        call.request.kind === "content" &&
        call.request.path === settingsPath
      ) {
        return { exitCode: 1, stderr: "connection reset" };
      }
      return published(call);
    });
    const unreadable = await rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${unreadableRevision}&intent=locations`,
      headers: { Origin: server.origin },
    });
    expect(unreadable.status).toBe(200);
    expect(JSON.parse(unreadable.body)).toEqual({
      revision: unreadableRevision,
      locations: null,
      settingsProblem: "unreadable",
    });
  });
});
