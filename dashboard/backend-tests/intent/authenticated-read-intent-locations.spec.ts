// Intent locations and location-selected file-at admission for the local
// authenticated read boundary. The selected Gherkin files are listed and
// file-at requests outside that selection are refused.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  backlog,
  featurePath,
  featureText,
  knownSourceId,
  outsidePath,
  revisionOf,
  settings,
  settingsPath,
} from "../../tests/intentLocationsBoundaryFixtures.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { intentSettingsText } from "../../tests/support/intentSettingsFile.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test.describe.configure({ mode: "serial" });

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
          [settingsPath]: intentSettingsText(
            makeMe.intentSettings
              .withLocations(
                makeMe.anIntentLocation
                  .at("e2e_test/features")
                  .labelled(" Feature scenarios ")
                  .ofKind("gherkin")
                  .please(),
              )
              .please(),
          ),
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
          label: "Feature scenarios",
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
          [settingsPath]: intentSettingsText(settings),
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
          // A non-string label is ignored; a blank one trims away.
          [settingsPath]: JSON.stringify({
            intent: {
              locations: [
                makeMe.anIntentLocation
                  .at("e2e_test/features")
                  .ofKind("gherkin")
                  .please(),
                { path: "no_such_dir", kind: "gherkin", label: 42 },
                makeMe.anIntentLocation
                  .at("empty_features")
                  .labelled(" ")
                  .ofKind("gherkin")
                  .please(),
                makeMe.anIntentLocation
                  .at("frontend/src")
                  .ofKind("unfamiliar-language")
                  .please(),
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
          problem: "no-matching-files",
        },
        {
          path: "empty_features",
          kind: "gherkin",
          files: [],
          problem: "no-matching-files",
        },
        {
          path: "frontend/src",
          kind: "unfamiliar-language",
          files: [],
          problem: "unsupported-kind",
        },
      ],
    });
  });
});
