// The complete production read path for every catalog project: a real
// browser page, served by the fixture's built-preview server (the dev server
// mounts the same boundaries: ../../dashboard/backend-tests/runtime/serving-modes.spec.ts), requesting
// the local authenticated read boundary (`../../dashboard/server/authenticatedRead.ts`),
// which launches a synthetic `gh` on this test's own isolated PATH
// (../../dashboard/tests/support/dashboardServer.ts) answering from this test's fake GitHub
// (../../dashboard/tests/support/fakeGitHub.ts). Nothing here stubs the boundary or hands the
// page a prebuilt `PublishedWork`: opening, selecting, and reloading a project
// must resolve its configured ref, read its backlog and reachable records
// pinned to that exact revision, and render
// them -- with no read of GitHub from the browser itself.

import { readFileSync } from "node:fs";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  shortRevision,
  expectMembership,
  expectProjectChoice,
  expectSettledPage,
  openDirection,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  notLoggedIn,
  publishFiles,
  type ObservedRequest,
} from "../../dashboard/tests/publishedOrigin.ts";
import {
  catalogExpectations,
  expectPinnedGhCalls,
} from "../../dashboard/tests/catalogProjectExpectations.ts";
import { catalogPublications } from "../../dashboard/tests/catalogProjectRecords.ts";
import {
  assertNoCredentialMarker,
  collectFiles,
} from "../../dashboard/tests/support/credentialAbsence.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

// Shaped like a real GitHub token and placed only in the spawned server
// process's own environment, where the production `gh` invocation would see
// it, so a regression forwarding environment, stderr, or process state into
// a browser-visible surface would be caught here.
const credentialMarker = "gho_should-never-reach-a-browser-4c3b2a1f0e9d";

test.use({ extraEnv: { GH_TOKEN: credentialMarker } });

test("authenticated project observation: each catalog project opens and reloads through the local boundary; missing gh login reports a read failure that a reload after restored access recovers", async ({
  page,
  github,
  dashboard: server,
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
  for (const published of Object.values(catalogPublications)) {
    observed.set(published.repository, await publishFiles(page, published));
  }
  await page.goto(server.baseURL);
  const { project: selector, direction, problem, readRevision } = parts(page);

  for (const expected of Object.values(catalogExpectations)) {
    const calls = observed.get(expected.repository) ?? [];
    await test.step(`${expected.label} renders its own backlog and detail read through local gh`, async () => {
      await selector
        .getByRole("radio", { name: expected.label, exact: true })
        .check();
      await expectMembership(page, {
        taken: [expected.taken],
        backlog: [expected.queued],
      });
      await openDirection(page);
      await expect(direction).toContainText(expected.direction);
      await expectProjectChoice(page, expected.label);
      await expect(readRevision).toContainText(
        shortRevision(expected.revision),
      );
      for (const other of Object.values(catalogExpectations).filter(
        (p) => p !== expected,
      )) {
        await expect(page.locator("body")).not.toContainText(other.taken);
        await expect(readRevision).not.toContainText(
          shortRevision(other.revision),
        );
      }

      const takenStoryCard = page.getByRole("article", {
        name: expected.taken,
      });
      const queuedCard = page.getByRole("article", {
        name: expected.queued,
      });
      await expectSettledPage(page);
      await expect(
        takenStoryCard.getByText("Not recorded", { exact: true }),
      ).toBeVisible();
      // Each story's source links are read in its detail.
      await takenStoryCard
        .getByRole("button", { name: "Inspect story" })
        .click();
      await expect(
        takenStoryCard.getByRole("link", { name: /^Canonical record/ }),
      ).toHaveAttribute(
        "href",
        `https://github.com/${expected.repository}/blob/${expected.revision}/${expected.takenPath}`,
      );
      await queuedCard.getByRole("button", { name: "Inspect story" }).click();
      const detail = queuedCard.getByRole("region", {
        name: `Detail for ${expected.queued}`,
      });
      await expect(
        detail.getByRole("link", { name: /^Canonical record/ }),
      ).toHaveAttribute(
        "href",
        `https://github.com/${expected.repository}/blob/${expected.revision}/${expected.queuedPath}#queued`,
      );
      await expect(detail).toContainText(expected.purpose);
    });

    await test.step(`${expected.label}'s gh calls name only its catalog repository, its resolved revision, and reachable records`, () => {
      expectPinnedGhCalls(calls, expected);
    });

    await test.step(`reloading ${expected.label} resolves ${expected.ref} again through local gh`, async () => {
      const before = calls.length;
      await reloadUntilRead(page);
      await expect(readRevision).toContainText(
        shortRevision(expected.revision),
      );
      await expect.poll(() => calls.length).toBeGreaterThan(before);
      expect(calls[before]?.argv).toEqual([
        "api",
        "--include",
        `repos/${expected.repository}/commits/${expected.ref}`,
        "--jq",
        ".sha",
      ]);
    });
  }

  await test.step("without a gh login, the selected project reports its own actionable failure and no snapshot", async () => {
    github.serve("nerds-odd-e/doughnut", () => Promise.resolve(notLoggedIn));
    await selector
      .getByRole("radio", { name: "Doughnut", exact: true })
      .check();
    await expect(problem).toContainText(
      "The local GitHub CLI is not logged in, so main of nerds-odd-e/doughnut could not be read. Run `gh auth login` (check with `gh auth status`), then reload the page.",
    );
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(problem).toContainText("Reload the page to read again.");
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
  });

  await test.step("after access is restored, reloading shows the selected project's published work", async () => {
    const { doughnut } = catalogExpectations;
    await publishFiles(page, catalogPublications.doughnut);
    await page.reload();
    await expectMembership(page, {
      taken: [doughnut.taken],
      backlog: [doughnut.queued],
    });
    await expect(readRevision).toContainText(shortRevision(doughnut.revision));
    await expect(problem).toHaveCount(0);
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

  await test.step("no credential-like marker was written into the built preview's static assets", () => {
    const outDir = server.outDir;
    if (!outDir) {
      throw new Error("preview-mode server did not report its outDir");
    }
    assertNoCredentialMarker(
      credentialMarker,
      collectFiles(outDir).map((file) => readFileSync(file).toString("utf8")),
    );
  });
});
