// The complete production path for Pygardon, this dashboard's private third
// project: a real browser page, served by a real Vite dev or built-preview
// server, requesting the local authenticated read boundary
// (`../server/privateRead.ts`) which itself launches a controlled `gh` on
// this suite's own isolated PATH (`./support/privateReadServer.ts`, shared
// with ./private-read-boundary.spec.ts and
// ./private-read-subprocess-lifecycle.spec.ts). Nothing here stubs the
// `/__private-read` endpoint or hands the page a prebuilt `PublishedWork`:
// selecting Pygardon must resolve the ref, read the backlog pinned to that
// exact revision, and render it through the same overview every other
// project already uses.
//
// This spec's servers are not the shared webServer (playwright.config.ts)
// the parallel public-origin specs use: each is a separate process, on its
// own port, with its own PATH and its own fake `gh`, so nothing here can
// leak into -- or race with -- those tests.

import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expectMembership, openDirection, parts } from "./dashboardPage";
import {
  assertNoCredentialMarker,
  collectFiles,
} from "./support/credentialAbsence";
import {
  startPrivateReadServer,
  type PrivateReadServer,
} from "./support/privateReadServer";

const pygardonRepository = "terryyin/pygardon";
const revision = "c1".repeat(20);

const takenTitle = "Pygardon's own taken story";
const takenIdentity = "PYG-1#story";
const queuedTitle = "Pygardon's own queued story";
const queuedIdentity = "PYG-2#queued";
const directionText =
  "Show Pygardon's own published direction, read through existing local authentication.";
const takenPath = ".planning/quick/100-pygardon-story/PLAN.md";
const queuedPath = ".planning/seeds/SEED-100-pygardon.md";

const takenRecord = `# Taken story

**Identity:** ${takenIdentity}

Whole-document correction home without a story-state block.
`;

const queuedRecord = `# Queued seed

<a id="queued"></a>

### Queued story

**Identity:** ${queuedIdentity}

Legacy seed without a story-state block.
`;

const backlog = `# Product backlog

## Near-future direction

${directionText}

## Taken

- [${takenTitle}](quick/100-pygardon-story/PLAN.md) — ${takenIdentity}

## Backlog list

- [${queuedTitle}](seeds/SEED-100-pygardon.md#queued) — ${queuedIdentity}
`;

// Shaped like a real GitHub personal access token, and placed only in the
// spawned server process's own environment (never this suite's own), so a
// regression that forwarded raw environment, stderr, or process state into
// a browser-visible surface would be caught here. The fake `gh` fixture
// never reads or echoes this value; a real `gh` invocation would carry
// something like it without ever needing to.
const credentialMarker = "gho_should-never-reach-a-browser-9f8e7d6c5b4a";

function runScenario(mode: "dev" | "preview", port: number): void {
  test(`private project overview: selecting Pygardon renders its direction, Taken, queue, and source links through existing gh authentication (${mode} launch mode)`, async ({
    page,
  }) => {
    let server: PrivateReadServer | undefined;
    const requestSnapshots: string[] = [];
    const responseBodies: string[] = [];
    page.on("request", (request) => {
      requestSnapshots.push(
        `${request.url()} ${JSON.stringify(request.headers())} ${request.postData() ?? ""}`,
      );
    });
    page.on("response", (response) => {
      void response
        .text()
        .then((text) => {
          responseBodies.push(text);
        })
        .catch(() => {
          // A non-text (or already-consumed) body carries no text a
          // credential marker could hide in.
        });
    });

    try {
      server = await startPrivateReadServer({
        mode,
        port,
        extraEnv: { GH_TOKEN: credentialMarker },
      });
      server.setControl({
        mode: "normal",
        revision,
        backlog,
        files: {
          ".planning/PRODUCT-BACKLOG.md": backlog,
          [takenPath]: takenRecord,
          [queuedPath]: queuedRecord,
        },
      });

      await page.goto(server.baseURL);
      const { project, direction, source } = parts(page);

      await test.step("selecting Pygardon reads it through the local authenticated boundary and renders its overview", async () => {
        await project.selectOption("pygardon");
        await expectMembership(page, {
          taken: [takenTitle],
          backlog: [queuedTitle],
        });
        await openDirection(page);
        await expect(direction).toContainText(directionText);
        await expect(source).toContainText(pygardonRepository);
        await expect(source).toContainText(revision);
      });

      await test.step("the rendered cards carry the recorded identities and pinned source links", async () => {
        const takenCard = page.getByRole("article", { name: takenTitle });
        await expect(takenCard).toContainText(takenIdentity);
        const takenLink = takenCard.getByRole("link", {
          name: /^Canonical record/,
        });
        await expect(takenLink).toHaveAttribute(
          "href",
          `https://github.com/${pygardonRepository}/blob/${revision}/.planning/quick/100-pygardon-story/PLAN.md`,
        );

        const queuedCard = page.getByRole("article", { name: queuedTitle });
        await expect(queuedCard).toContainText(queuedIdentity);
        const queuedLink = queuedCard.getByRole("link", {
          name: /^Canonical record/,
        });
        await expect(queuedLink).toHaveAttribute(
          "href",
          `https://github.com/${pygardonRepository}/blob/${revision}/.planning/seeds/SEED-100-pygardon.md#queued`,
        );
        // Wait until allowlisted record reads finish before asserting gh calls.
        await expect(page.getByText("Reading preparation…")).toHaveCount(0);
        await expect(
          takenCard.getByText("Not recorded", { exact: true }),
        ).toBeVisible();
      });

      await test.step("gh resolve and contents calls stay pinned to the catalog repository and allowlisted paths only", () => {
        const calls = server?.ghCalls() ?? [];
        expect(calls[0]).toEqual([
          "api",
          `repos/${pygardonRepository}/commits/main`,
          "--jq",
          ".sha",
        ]);
        const contentArgs = calls.slice(1).map((argv) => argv.join(" "));
        for (const joined of contentArgs) {
          expect(joined).toContain(`repos/${pygardonRepository}/contents/`);
          expect(joined).toContain(`?ref=${revision}`);
          expect(joined).not.toContain("repos/evil/");
        }
        const contentPaths = contentArgs.map((joined) => {
          const match = /\/contents\/([^?\s]+)/.exec(joined);
          if (match === null || match[1] === undefined) {
            throw new Error(`expected contents path in: ${joined}`);
          }
          return decodeURIComponent(match[1]);
        });
        expect(contentPaths).toContain(".planning/PRODUCT-BACKLOG.md");
        expect(contentPaths).toContain(takenPath);
        expect(contentPaths).toContain(queuedPath);
        expect(
          contentPaths.every(
            (path) =>
              path === ".planning/PRODUCT-BACKLOG.md" ||
              path === takenPath ||
              path === queuedPath,
          ),
        ).toBe(true);
      });

      await test.step("no credential-like marker reaches the browser's requests, responses, or storage", async () => {
        const storage = await page.evaluate<{
          local: string;
          session: string;
        }>(
          "({ local: JSON.stringify(window.localStorage), session: JSON.stringify(window.sessionStorage) })",
        );
        const pageContent = await page.content();
        assertNoCredentialMarker(credentialMarker, [
          ...requestSnapshots,
          ...responseBodies,
          storage.local,
          storage.session,
          pageContent,
        ]);
      });

      if (mode === "preview") {
        await test.step("no credential-like marker was written into the built preview's static assets", () => {
          const outDir = server?.outDir;
          if (!outDir) {
            throw new Error(
              "preview-mode server did not report its build outDir",
            );
          }
          const fileContents = collectFiles(outDir).map((file) =>
            readFileSync(file).toString("utf8"),
          );
          assertNoCredentialMarker(credentialMarker, fileContents);
        });
      }
    } finally {
      await server?.close();
    }
  });
}

test.describe("private project overview", () => {
  test.describe.configure({ mode: "serial" });
  runScenario("dev", 4296);
  runScenario("preview", 4297);
});
