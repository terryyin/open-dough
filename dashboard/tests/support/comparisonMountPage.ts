// Fresh browser providers and HTTP answers for each production-component case.
import type { Page } from "@playwright/test";
import { test as base, expect } from "./pageTest.ts";
import {
  startFrontendAppServer,
  type FrontendAppServer,
} from "./frontendAppServer.ts";
import { comparisonMountBuild } from "./comparisonMountArtifact.ts";
import type { ComparisonMount } from "./comparisonMountTypes.ts";

export type ComparisonReply = {
  readonly status?: number;
  readonly json: unknown;
};
export type ComparisonServices = {
  comparisons: number;
  proofs: number;
  comparison(
    params: URLSearchParams,
  ): Promise<ComparisonReply> | ComparisonReply;
  proof(params: URLSearchParams): Promise<ComparisonReply> | ComparisonReply;
  hold(): {
    readonly promise: Promise<ComparisonReply>;
    resolve(reply: ComparisonReply): void;
  };
  releaseAll(): void;
};

let bundle: string;
export const test = base.extend<{
  comparisonServer: FrontendAppServer;
  comparisonServices: ComparisonServices;
}>({
  // eslint-disable-next-line no-empty-pattern
  comparisonServer: async ({}, use) => {
    const server = await startFrontendAppServer(bundle);
    await use(server);
    await server.close();
  },
  // eslint-disable-next-line no-empty-pattern
  comparisonServices: async ({}, use) => {
    const unarranged = () => {
      throw new Error("An authenticated comparison answer was not arranged");
    };
    const releases: ((reply: ComparisonReply) => void)[] = [];
    await use({
      comparisons: 0,
      proofs: 0,
      comparison: unarranged,
      proof: unarranged,
      hold() {
        let release: ((reply: ComparisonReply) => void) | undefined;
        const promise = new Promise<ComparisonReply>((resolve) => {
          release = resolve;
          releases.push(resolve);
        });
        return {
          promise,
          resolve(reply) {
            if (release === undefined) {
              throw new Error("No held comparison read");
            }
            release(reply);
          },
        };
      },
      releaseAll() {
        for (const release of releases) {
          release({
            status: 503,
            json: { error: "The test's held read ended" },
          });
        }
      },
    });
  },
  page: async ({ page, comparisonServices }, use, testInfo) => {
    await page.route("**/__authenticated-read?**", async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const intent = params.get("intent");
      let reply: ComparisonReply;
      if (intent === "ci-comparison") {
        Object.assign(comparisonServices, {
          comparisons: comparisonServices.comparisons + 1,
        });
        reply = await comparisonServices.comparison(params);
      } else if (intent === "ci-proof") {
        Object.assign(comparisonServices, {
          proofs: comparisonServices.proofs + 1,
        });
        reply = await comparisonServices.proof(params);
      } else {
        throw new Error(`Unarranged Intent read: ${String(intent)}`);
      }
      await route.fulfill({ status: reply.status ?? 200, json: reply.json });
    });
    let cleanupFailure: { readonly error: unknown } | undefined;
    try {
      await use(page);
    } finally {
      const bodyFailed =
        testInfo.status !== undefined && testInfo.status !== "passed";
      try {
        if (!page.isClosed()) {
          await page.evaluate(() => {
            if (typeof window.unmountCiComparison === "function") {
              window.unmountCiComparison();
            }
          });
        }
      } catch (error) {
        if (!bodyFailed) {
          cleanupFailure = { error };
        }
      } finally {
        comparisonServices.releaseAll();
      }
    }
    if (cleanupFailure !== undefined) throw cleanupFailure.error;
  },
});
test.beforeAll(async () => {
  bundle = await comparisonMountBuild();
});
export { expect };

export async function mountComparison(
  page: Page,
  server: FrontendAppServer,
  facts: ComparisonMount,
) {
  await page.goto(server.baseURL);
  await page.evaluate(
    (value) => {
      window.mountCiComparison(value);
    },
    { source: facts.source, work: facts.work, identity: facts.identity },
  );
  return page.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
}

export async function updateComparison(page: Page, facts: ComparisonMount) {
  await page.evaluate(
    (value) => {
      window.updateCiComparison(value);
    },
    { work: facts.work, identity: facts.identity },
  );
}
