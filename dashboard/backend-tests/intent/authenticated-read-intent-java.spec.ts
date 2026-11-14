// Java membership and pinned file admission share the same configured selector
// as Intent's real published listing; JUnit names and annotations add no filter.
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { everyRepository, publishes } from "../../tests/support/fakeGitHub.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { describedRevision } from "../../tests/describedRevisions.ts";
import { intentSettingsText } from "../../tests/support/intentSettingsFile.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const root = "backend/src/test/java";
const testPath = "backend/src/test/java/com/example/CalculatorTest.java";
const helperPath = "backend/src/test/java/com/example/Fixture.java";
const examplesPath =
  "backend/src/test/java/com/example/CalculatorExamples.java";
const text = `package com.example;
import org.junit.jupiter.api.Test;
class CalculatorExamples { @Test void adds() { String value = "two"; } }
`;

test.describe("authenticated Java source selection", () => {
  let server: DashboardServer;
  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });
  test.afterAll(async () => {
    await server.close();
  });

  const cases = [
    {
      title: "Java kind with include lists only matched .java files",
      location: makeMe.anIntentLocation
        .at(root)
        .ofKind("java", ["**/*Test.java"])
        .please(),
      selected: [testPath],
      refused: [
        helperPath,
        examplesPath,
        "backend/src/test/java/com/example/Notes.txt",
      ],
      declaration: { path: root, kind: "java", include: ["**/*Test.java"] },
    },
    {
      title:
        "Java kind without include lists helpers and unfamiliar test names",
      location: makeMe.anIntentLocation.at(root).ofKind("java").please(),
      selected: [testPath, helperPath, examplesPath],
      refused: ["backend/src/test/java/com/example/Notes.txt"],
      declaration: { path: root, kind: "java" },
    },
    {
      title:
        "explicit Java sources select an unfamiliar filename without JUnit discovery",
      location: makeMe.anIntentLocation
        .at(root)
        .withSources({ include: ["**/*Examples.java"], syntax: "java" })
        .please(),
      selected: [examplesPath],
      refused: [
        testPath,
        helperPath,
        "backend/src/test/java/com/example/Notes.txt",
      ],
      declaration: {
        path: root,
        sources: [{ include: ["**/*Examples.java"], syntax: "java" }],
      },
    },
  ];
  for (const [index, scenario] of cases.entries()) {
    test(scenario.title, async () => {
      const revision = `a${index + 1}`.repeat(20);
      const repository = makeMe.aRepository
        .withRevision("pinned", {
          files: {
            ".planning/open-dough.json": intentSettingsText(
              makeMe.intentSettings.withLocations(scenario.location).please(),
            ),
            [testPath]: text,
            [helperPath]: "class Fixture {}\n",
            [examplesPath]: text,
            "backend/src/test/java/com/example/Notes.txt": "not Java\n",
          },
        })
        .please();
      server.github.serve(
        everyRepository,
        publishes(describedRevision(repository, revision)),
      );
      const read = (query: string) =>
        rawRequest({
          url: `${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&${query}`,
          headers: { Origin: server.origin },
        });
      const listing = await read("intent=locations");
      expect(listing.status).toBe(200);
      expect(JSON.parse(listing.body)).toEqual({
        revision,
        locations: [{ ...scenario.declaration, files: scenario.selected }],
      });
      for (const path of scenario.selected) {
        const file = await read(`path=${encodeURIComponent(path)}`);
        expect(file.status).toBe(200);
        expect(JSON.parse(file.body)).toMatchObject({
          revision,
          path,
          text: path === helperPath ? "class Fixture {}\n" : text,
        });
      }
      for (const path of [...scenario.refused, "other/Test.java"]) {
        const before = server.ghCalls().length;
        const file = await read(`path=${encodeURIComponent(path)}`);
        expect(file.status).toBe(404);
        expect(
          server
            .ghCalls()
            .slice(before)
            .every((argv) => !argv.join(" ").includes(`/contents/${path}`)),
        ).toBe(true);
      }
      const unsafe = await read(
        `path=${encodeURIComponent("backend/src/test/java/../secret.java")}`,
      );
      expect(unsafe.status).toBe(400);
    });
  }
});
