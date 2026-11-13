// Real development StrictMode and hooks, with the external HTTP boundary replaced.
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { test, expect } from "../../tests/support/pageTest.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import type { StrictCiReadingFacts } from "../../tests/support/strictCiReadingTypes.ts";

test("StrictMode reattaches comparison and proof reads after effect cleanup", async ({
  page,
}, testInfo) => {
  const facts = preparedComparison();
  const input: StrictCiReadingFacts = {
    source: facts.source,
    identity: facts.identity,
    answer: facts.answer,
  };
  const [{ createServer }, { default: react }] = await Promise.all([
    import("vite"),
    import("@vitejs/plugin-react"),
  ]);
  const server = await createServer({
    configFile: false,
    cacheDir: testInfo.outputPath("vite-cache"),
    root: fileURLToPath(
      new URL("../../tests/comparison-mount/", import.meta.url),
    ),
    plugins: [react()],
    logLevel: "error",
    server: {
      host: "127.0.0.1",
      port: 0,
      hmr: false,
      ws: false,
      fs: { allow: [fileURLToPath(new URL("../../../", import.meta.url))] },
    },
  });
  try {
    await server.listen();
    const address = server.httpServer?.address() as AddressInfo;
    await page.addInitScript(() => {
      window.strictCiReads = [];
      const fetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        const record = { url, aborted: false };
        window.strictCiReads.push(record);
        init?.signal?.addEventListener(
          "abort",
          () => {
            record.aborted = true;
          },
          { once: true },
        );
        return fetch(input, init);
      };
    });
    await page.route("**/__authenticated-read?**", async (route) => {
      const query = new URL(route.request().url()).searchParams;
      await route.fulfill({
        json:
          query.get("intent") === "ci-comparison"
            ? facts.answer
            : facts.proof(Number(query.get("run"))),
      });
    });
    await page.goto(`http://127.0.0.1:${String(address.port)}/strict.html`);
    await page.evaluate((value) => {
      window.mountStrictCiReading(value);
    }, input);
    await expect(page.getByTestId("comparison")).toHaveText("SEED-A#a");
    await expect(page.getByTestId("proofs")).toHaveText(
      '["summary","summary","summary"]',
    );
    await expect(
      page.getByRole("button", { name: "Check again" }),
    ).toBeEnabled();
    const reads = await page.evaluate(() => window.strictCiReads);
    const comparisons = reads.filter(({ url }) =>
      url.includes("intent=ci-comparison"),
    );
    const proofs = reads.filter(({ url }) => url.includes("intent=ci-proof"));
    expect(comparisons.map(({ aborted }) => aborted)).toEqual([true, false]);
    expect(proofs.map(({ aborted }) => aborted)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ]);
    await page.evaluate(() => {
      if (window.unmountStrictCiReading === undefined)
        throw new Error("StrictMode reading did not mount");
      window.unmountStrictCiReading();
    });
    expect(
      await page.evaluate(() =>
        window.strictCiReads.every(({ aborted }) => aborted),
      ),
    ).toBe(true);
  } finally {
    if (!page.isClosed())
      await page.evaluate(() => {
        window.unmountStrictCiReading?.();
      });
    await server.close();
  }
});
