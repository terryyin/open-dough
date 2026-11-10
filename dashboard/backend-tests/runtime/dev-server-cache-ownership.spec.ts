// Independent development servers must not overwrite the optimized modules
// another server is still serving to its page.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, test } from "../../tests/support/pageTest.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";

test("one dev server's optimized module survives another server's cache write", async ({
  request,
}) => {
  const servers = await Promise.all([
    startDashboardServer({ mode: "dev" }),
    startDashboardServer({ mode: "dev" }),
  ]);
  let restore: { file: string; bytes: Buffer } | undefined;
  try {
    const dependencies = await Promise.all(
      servers.map(async (server) => {
        const source = await request.get(
          `${server.baseURL}/src/sourceHighlight.ts`,
        );
        expect(source.status()).toBe(200);
        const importPath = /"([^"]*shiki_core\.js\?v=[^"]+)"/.exec(
          await source.text(),
        )?.[1];
        if (importPath === undefined)
          throw new Error("No optimized Shiki import");
        const url = new URL(importPath, server.baseURL);
        const module = await request.get(url.href);
        expect(module.status()).toBe(200);
        if (!url.pathname.startsWith("/@fs/"))
          throw new Error(`No cache file path: ${url.pathname}`);
        return {
          url: url.href,
          file: decodeURIComponent(url.pathname.slice(4)),
          hash: createHash("sha256")
            .update(await module.body())
            .digest("hex"),
        };
      }),
    );
    const [first, second] = dependencies;
    if (first === undefined || second === undefined)
      throw new Error("Two servers required");
    restore = { file: second.file, bytes: readFileSync(second.file) };
    writeFileSync(
      second.file,
      "export const rewrittenBySecondServer = true;\n",
    );
    // A fresh module request observes the backing file rather than a transform
    // Vite already holds in memory. The extra query changes no module bytes.
    const retained = await request.get(`${first.url}&isolation-probe`);
    expect(retained.status()).toBe(200);
    expect(
      createHash("sha256")
        .update(await retained.body())
        .digest("hex"),
    ).toBe(first.hash);
  } finally {
    if (restore !== undefined) writeFileSync(restore.file, restore.bytes);
    await Promise.all(servers.map((server) => server.close()));
  }
});
