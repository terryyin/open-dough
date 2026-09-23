// Slice 10: private Pygardon story readiness through synthetic gh and real
// Vite servers. CLI-committed bytes feed fake-gh; this file owns badges and
// detail. Boundary refusal, credentials, lifecycle, and public switching
// share the suite's other private specs.

import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { expectMembership, parts } from "./dashboardPage";
import {
  buildOpenDoughReadinessRepo,
  plannedBlocked,
  plannedReady,
  unrefined,
} from "./storyReadinessFixture";
import {
  expectAgreeingFragment,
  expectQueuedPlanCardAndDetail,
} from "./queuedPlanNavigation";
import { publishTwoSlicesDone } from "./storyReadinessPublications";
import {
  assertNoCredentialMarker,
  collectFiles,
} from "./support/credentialAbsence";
import {
  startPrivateReadServer,
  type PrivateReadServer,
} from "./support/privateReadServer";
import {
  contentsPathFromGhArgv,
  openDoughRevision,
  openDoughTitle,
  publishPublicNeighbor,
  readinessPaths,
  runningAt,
  setPygardonRevision,
} from "./support/storyReadinessPrivate";

const pygardonRepository = "terryyin/pygardon";
const credentialMarker =
  "gho_should-never-reach-a-browser-private-ready-7c6b5a";

function runScenario(mode: "dev" | "preview", port: number): void {
  test(`story readiness private: selecting Pygardon shows CLI-committed preparation badges and detail through synthetic gh (${mode} launch mode)`, async ({
    page,
  }) => {
    const cleanups: Array<() => void> = [];
    const after = (cleanup: () => void) => {
      cleanups.push(cleanup);
    };
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
          // Non-text bodies cannot hide a credential marker as text.
        });
    });

    try {
      const repo = buildOpenDoughReadinessRepo(after, {
        canonicalOnlyQueued: true,
      });
      server = await startPrivateReadServer({
        mode,
        port,
        extraEnv: { GH_TOKEN: credentialMarker },
      });
      setPygardonRevision(server, repo, repo.revision);
      await publishPublicNeighbor(page);

      await page.goto(runningAt(server));
      const { project, source, taken, backlog, refresh } = parts(page);

      await test.step("selecting Pygardon shows membership then labeled preparation from CLI-committed bytes", async () => {
        await project
          .getByRole("radio", { name: "Pygardon", exact: true })
          .check();
        await expectMembership(page, {
          taken: [plannedReady.title],
          backlog: [unrefined.title, plannedBlocked.title],
        });
        await expect(source).toContainText(pygardonRepository);
        await expect(source).toContainText(repo.revision);

        const readyCard = taken.getByRole("article", {
          name: plannedReady.title,
        });
        const unrefinedCard = backlog.getByRole("article", {
          name: unrefined.title,
        });
        const blockedCard = backlog.getByRole("article", {
          name: plannedBlocked.title,
        });
        await expect(
          readyCard.getByText("Slice planned", { exact: true }),
        ).toBeVisible();
        await expect(
          readyCard.getByText("Ready for execution", { exact: true }),
        ).toBeVisible();
        await expect(
          unrefinedCard.getByText("Not refined", { exact: true }),
        ).toBeVisible();
        await expect(
          blockedCard.getByText("Slice planned", { exact: true }),
        ).toBeVisible();
        await expect(
          blockedCard.getByText("Not ready", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText("Unpushed local edit that must stay invisible"),
        ).toHaveCount(0);
      });

      await expectQueuedPlanCardAndDetail(
        backlog,
        pygardonRepository,
        repo,
        () => requestSnapshots.length,
      );
      await expectAgreeingFragment(taken, pygardonRepository, repo.revision);

      await test.step("detail shows purpose and zero of five recorded complete without inventing accepted evidence", async () => {
        const before = requestSnapshots.length;
        const readyCard = taken.getByRole("article", {
          name: plannedReady.title,
        });
        await readyCard.getByRole("button", { name: "Inspect story" }).click();
        const detail = readyCard.getByRole("region", {
          name: `Detail for ${plannedReady.title}`,
        });
        await expect(detail).toBeVisible();
        await expect(
          detail.getByRole("heading", { name: "Purpose" }),
        ).toBeVisible();
        await expect(detail).toContainText(
          "Show recorded slice progress for a Taken story",
        );
        await expect(detail).toContainText("0 of 5 recorded complete");
        await expect(detail.getByText("Accepted evidence:")).toHaveCount(0);
        expect(requestSnapshots.length).toBe(before);
      });

      await test.step("after publishing two done slices, Refresh shows two of five with accepted evidence", async () => {
        const nextRevision = publishTwoSlicesDone(repo);
        if (server === undefined) {
          throw new Error("private read server missing");
        }
        setPygardonRevision(server, repo, nextRevision);
        await refresh.click();
        await expect(source).toContainText(nextRevision);
        const readyCard = taken.getByRole("article", {
          name: plannedReady.title,
        });
        const detail = readyCard.getByRole("region", {
          name: `Detail for ${plannedReady.title}`,
        });
        if (!(await detail.isVisible())) {
          await readyCard
            .getByRole("button", { name: "Inspect story" })
            .click();
        }
        await expect(detail).toContainText("2 of 5 recorded complete");
        await expect(detail).toContainText("Accepted evidence:");
        await expect(detail).toContainText(
          "Shared plan reader unit checks passed",
        );
      });

      await test.step("gh contents calls stay on allowlisted readiness paths at the pinned revision", () => {
        const contentPaths = (server?.ghCalls() ?? [])
          .filter((argv) => argv.join(" ").includes("/contents/"))
          .map(contentsPathFromGhArgv);
        for (const filePath of contentPaths) {
          expect(
            filePath === ".planning/PRODUCT-BACKLOG.md" ||
              readinessPaths.includes(
                filePath as (typeof readinessPaths)[number],
              ),
          ).toBe(true);
        }
        expect(contentPaths).toContain(".planning/seeds/SEED-075-readiness.md");
        expect(contentPaths).toContain(".planning/quick/075-ready/PLAN.md");
      });

      await test.step("switching to a public project remains usable", async () => {
        await project
          .getByRole("radio", { name: "Open Dough", exact: true })
          .check();
        await expectMembership(page, {
          taken: [],
          backlog: [openDoughTitle],
        });
        await expect(source).toContainText(openDoughRevision);
        await expect(page.locator("body")).not.toContainText(
          plannedReady.title,
        );
      });

      await test.step("no credential-like marker reaches the browser", async () => {
        const storage = await page.evaluate<{
          local: string;
          session: string;
        }>(
          "({ local: JSON.stringify(window.localStorage), session: JSON.stringify(window.sessionStorage) })",
        );
        assertNoCredentialMarker(credentialMarker, [
          ...requestSnapshots,
          ...responseBodies,
          storage.local,
          storage.session,
          await page.content(),
        ]);
      });

      if (mode === "preview") {
        await test.step("no credential-like marker was written into built preview assets", () => {
          const outDir = server?.outDir;
          if (!outDir) {
            throw new Error(
              "preview-mode server did not report its build outDir",
            );
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
      await server?.close();
      for (const cleanup of cleanups.reverse()) {
        cleanup();
      }
    }
  });
}

test.describe("story readiness private", () => {
  test.describe.configure({ mode: "serial" });
  runScenario("dev", 4300);
  runScenario("preview", 4301);
});
