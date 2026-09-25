// The complete production read path for every catalog project: a real
// browser page, served by a real Vite dev or built-preview server, requesting
// the local authenticated read boundary (`../server/authenticatedRead.ts`),
// which launches a synthetic `gh` on this test's own isolated PATH
// (./support/dashboardServer.ts) answering from this test's fake GitHub
// (./support/fakeGitHub.ts). Nothing here stubs the boundary or hands the
// page a prebuilt `PublishedWork`: opening, selecting, and refreshing each of
// Open Dough, Doughnut, and Pygardon must resolve that project's `main`, read
// its backlog and reachable records pinned to that exact revision, and render
// them -- with no read of GitHub from the browser itself.

import { readFileSync } from "node:fs";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, openDirection, parts } from "./dashboardPage.ts";
import {
  notLoggedIn,
  publishFiles,
  type ObservedRequest,
} from "./publishedOrigin.ts";
import {
  expectPinnedGhCalls,
  filesOf,
  projects,
} from "./catalogProjectRecords.ts";
import {
  assertNoCredentialMarker,
  collectFiles,
} from "./support/credentialAbsence.ts";
import { startDashboardServer } from "./support/dashboardServer.ts";

// Shaped like a real GitHub token and placed only in the spawned server
// process's own environment, where the production `gh` invocation would see
// it, so a regression forwarding environment, stderr, or process state into
// a browser-visible surface would be caught here.
const credentialMarker = "gho_should-never-reach-a-browser-4c3b2a1f0e9d";

// Each case starts its own dev or preview server below and opens it by its
// full URL, so the fixture's own preview server is never started.
test.use({ baseURL: undefined });

for (const mode of ["dev", "preview"] as const) {
  test(`authenticated project overview: Open Dough, Doughnut, and Pygardon each open, refresh, and fail without gh login through the one local boundary (${mode} launch mode)`, async ({
    page,
    github,
  }) => {
    const browserRequests: string[] = [];
    const responseBodies: string[] = [];
    page.on("request", (request) => {
      browserRequests.push(
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
          // A non-text body carries no text a credential marker could hide in.
        });
    });
    const observed = new Map<string, ObservedRequest[]>();
    for (const published of projects) {
      observed.set(
        published.repository,
        await publishFiles(page, {
          repository: published.repository,
          revision: published.revision,
          files: filesOf(published),
        }),
      );
    }
    const server = await startDashboardServer({
      mode,
      github,
      extraEnv: { GH_TOKEN: credentialMarker },
    });
    try {
      await page.goto(server.baseURL);
      const {
        project: selector,
        direction,
        source,
        refresh,
        problem,
      } = parts(page);

      for (const published of projects) {
        const calls = observed.get(published.repository) ?? [];
        await test.step(`${published.label} renders its own backlog, detail, and source evidence read through local gh`, async () => {
          await selector
            .getByRole("radio", { name: published.label, exact: true })
            .check();
          await expectMembership(page, {
            taken: [published.taken],
            backlog: [published.queued],
          });
          await openDirection(page);
          await expect(direction).toContainText(published.direction);
          await expect(source).toContainText(published.repository);
          await expect(source).toContainText(published.revision);
          for (const other of projects.filter((p) => p !== published)) {
            await expect(page.locator("body")).not.toContainText(other.taken);
            await expect(source).not.toContainText(other.revision);
          }

          const takenCard = page.getByRole("article", {
            name: published.taken,
          });
          await expect(
            takenCard.getByRole("link", { name: /^Canonical record/ }),
          ).toHaveAttribute(
            "href",
            `https://github.com/${published.repository}/blob/${published.revision}/${published.takenPath}`,
          );
          const queuedCard = page.getByRole("article", {
            name: published.queued,
          });
          await expect(
            queuedCard.getByRole("link", { name: /^Canonical record/ }),
          ).toHaveAttribute(
            "href",
            `https://github.com/${published.repository}/blob/${published.revision}/${published.queuedPath}#queued`,
          );
          await expect(page.getByText("Reading preparation…")).toHaveCount(0);
          await expect(
            takenCard.getByText("Not recorded", { exact: true }),
          ).toBeVisible();
          await queuedCard
            .getByRole("button", { name: "Inspect story" })
            .click();
          const detail = queuedCard.getByRole("region", {
            name: `Detail for ${published.queued}`,
          });
          await expect(detail).toContainText(published.purpose);
        });

        await test.step(`${published.label}'s gh calls name only its catalog repository, its resolved revision, and reachable records`, () => {
          expectPinnedGhCalls(calls, published);
        });

        await test.step(`refreshing ${published.label} resolves main again through local gh`, async () => {
          const before = calls.length;
          await refresh.click();
          await expect(source).toContainText(published.revision);
          await expect.poll(() => calls.length).toBeGreaterThan(before);
          expect(calls[before]?.argv).toEqual([
            "api",
            `repos/${published.repository}/commits/main`,
            "--jq",
            ".sha",
          ]);
        });
      }

      await test.step("without a gh login, the selected project reports its own actionable failure and no snapshot", async () => {
        github.serve("nerds-odd-e/doughnut", () =>
          Promise.resolve(notLoggedIn),
        );
        await selector
          .getByRole("radio", { name: "Doughnut", exact: true })
          .check();
        await expect(problem).toContainText(
          "The local GitHub CLI is not logged in, so main of nerds-odd-e/doughnut could not be read. Run `gh auth login` (check with `gh auth status`), then press Retry.",
        );
        await expect(page.getByRole("article")).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
      });

      await test.step("the browser only ever asked its own server; nothing credential-like reached it", async () => {
        const requestedUrls = browserRequests.map(
          (snapshot) => new URL(snapshot.split(" ")[0] ?? "").origin,
        );
        expect(new Set(requestedUrls)).toEqual(new Set([server.origin]));
        expect(browserRequests.join("\n")).not.toContain("api.github.com");
        const storage = await page.evaluate<{
          local: string;
          session: string;
        }>(
          "({ local: JSON.stringify(window.localStorage), session: JSON.stringify(window.sessionStorage) })",
        );
        assertNoCredentialMarker(credentialMarker, [
          ...browserRequests,
          ...responseBodies,
          storage.local,
          storage.session,
          await page.content(),
        ]);
      });

      if (mode === "preview") {
        await test.step("no credential-like marker was written into the built preview's static assets", () => {
          const outDir = server.outDir;
          if (!outDir) {
            throw new Error("preview-mode server did not report its outDir");
          }
          assertNoCredentialMarker(
            credentialMarker,
            collectFiles(outDir).map((file) =>
              readFileSync(file).toString("utf8"),
            ),
          );
        });
      }
    } finally {
      await server.close();
    }
  });
}
