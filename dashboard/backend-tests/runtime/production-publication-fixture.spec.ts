// A published-main snapshot copies the live working tree. Its real clone and
// publication are exercised by the production watcher journeys, which build
// and serve from the published application source, and by
// e2e/runtime/production-watcher-updates.spec.ts "npm watcher skips an
// excluded-only main range…", which checks origin received only the
// documentation paths it published.
import { expect, test } from "vitest";
import {
  liveSourceFiles,
  materializePublishedMainSource,
} from "../../test-support/support/publishedMainSource.ts";

test("a snapshot copies tracked and new files, without deletions or local avatars", () => {
  const listed = [
    "dashboard/index.html",
    "deleted.txt",
    "new-source.ts",
    "dashboard/public/agent-avatars/excluded.webp",
  ];

  expect(liveSourceFiles(listed, ["deleted.txt"])).toEqual([
    "dashboard/index.html",
    "new-source.ts",
  ]);
});

test.for([
  { file: "dashboard/server/new-runtime.ts", kept: true },
  { file: "dashboard/index.html", kept: true },
  { file: "dashboard/tsconfig.app.json", kept: true },
  { file: ".github/workflows/ci.yml", kept: true },
  { file: "package-lock.json", kept: true },
  { file: ".github/workflows/other.yml", kept: false },
  { file: "tests/maintainer.spec.ts", kept: false },
  { file: "docs/maintainer.md", kept: false },
  { file: ".planning/maintainer.md", kept: false },
  { file: "dashboard/backend-tests/case.spec.ts", kept: false },
])("the application profile keeps $file: $kept", ({ file, kept }) => {
  expect(liveSourceFiles([file], [], "application")).toEqual(
    kept ? [file] : [],
  );
});

test("with no run owner answering, a fixture prepares its source itself", async () => {
  const prepared: unknown[][] = [];

  await materializePublishedMainSource(
    "/fixture/development",
    {},
    "application",
    {
      requestSnapshot: () => Promise.resolve(undefined),
      prepare: (...args) => {
        prepared.push(args);
        return Promise.resolve();
      },
    },
  );

  expect(prepared).toEqual([
    ["/fixture/development", expect.any(String), {}, undefined, "application"],
  ]);
});
