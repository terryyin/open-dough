// One immutable Vite module graph and actual app CSS; every case renders afresh.
// Each renderer owns a private Vite optimizer cache so concurrent Playwright
// workers never race on the shared default under node_modules/.vite.
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Page } from "@playwright/test";
import { sharedDashboardBuild } from "./dashboardBuild.ts";
import { repoRoot } from "./repositoryRoot.ts";
import type { ColumnSort } from "../../src/ciProofSort.ts";
import type { IntentCiStatus } from "../../src/authenticatedIntentCiStatusRead.ts";
export type ComparisonRenderOptions = {
  readonly showPercent?: boolean;
  readonly sort?: ColumnSort;
  readonly liveStatus?: IntentCiStatus;
};
export type ComparisonMarkup = (
  facts: ComparisonRenderFacts,
  options?: ComparisonRenderOptions,
) => string;
import type { ComparisonRenderFacts } from "./comparisonRenderFacts.ts";

export type ComparisonRenderer = {
  readonly markup: ComparisonMarkup;
  readonly treeMarkup: (facts: ComparisonRenderFacts) => string;
  readonly css: string;
  /** Private Vite optimizer cache for this renderer; removed by close(). */
  readonly viteCacheDir: string;
  close(): Promise<void>;
};

const renderedPages = new WeakSet<Page>();

async function releaseComparisonVite(
  compiler: { close(): Promise<void> } | undefined,
  viteCacheDir: string,
) {
  try {
    if (compiler !== undefined) await compiler.close();
  } finally {
    await rm(viteCacheDir, { recursive: true, force: true });
  }
}

export async function createComparisonRenderer(): Promise<ComparisonRenderer> {
  const { createServer } = await import("vite");
  const viteCacheDir = await mkdtemp(
    path.join(tmpdir(), "dough-comparison-vite-"),
  );
  let compiler: Awaited<ReturnType<typeof createServer>> | undefined;
  try {
    compiler = await createServer({
      configFile: path.join(repoRoot, "dashboard/vite.config.mts"),
      cacheDir: viteCacheDir,
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "custom",
      logLevel: "error",
    });
    const loaded = await compiler.ssrLoadModule(
      path.join(repoRoot, "dashboard/tests/comparison-mount/render.tsx"),
    );
    const tree = await compiler.ssrLoadModule(
      path.join(repoRoot, "dashboard/tests/comparison-mount/tree-render.tsx"),
    );
    const built = await sharedDashboardBuild();
    const index = readFileSync(path.join(built, "index.html"), "utf8");
    const css = [...index.matchAll(/href="([^"]+\.css)"/g)]
      .map(([, url]) => {
        if (url === undefined)
          throw new Error("The stylesheet link has no path");
        return readFileSync(path.join(built, url), "utf8");
      })
      .join("\n");
    if (css === "") throw new Error("The production app emitted no stylesheet");
    const owned = compiler;
    return {
      markup: loaded["comparisonMarkup"] as ComparisonMarkup,
      treeMarkup: tree[
        "comparisonTreeMarkup"
      ] as ComparisonRenderer["treeMarkup"],
      css,
      viteCacheDir,
      close: () => releaseComparisonVite(owned, viteCacheDir),
    };
  } catch (error) {
    await releaseComparisonVite(compiler, viteCacheDir);
    throw error;
  }
}

export async function renderComparison(
  page: Page,
  renderer: ComparisonRenderer,
  facts: ComparisonRenderFacts,
  options?: ComparisonRenderOptions,
) {
  await presentComparison(page, renderer, renderer.markup(facts, options));
  return page.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
}

async function presentComparison(
  page: Page,
  renderer: ComparisonRenderer,
  markup: string,
) {
  const replaced =
    renderedPages.has(page) &&
    (await page.evaluate(
      ({ css, content }) => {
        const stylesheet = document.querySelector(
          "style[data-intent-comparison-css]",
        );
        const root = document.getElementById("root");
        if (stylesheet?.textContent !== css || root === null) return false;
        root.innerHTML = content;
        return true;
      },
      { css: renderer.css, content: markup },
    ));
  if (replaced) return;
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><style data-intent-comparison-css>${renderer.css}</style></head><body><div id="root">${markup}</div></body></html>`,
  );
  renderedPages.add(page);
}

export async function renderComparisonTree(
  page: Page,
  renderer: ComparisonRenderer,
  facts: ComparisonRenderFacts,
) {
  await presentComparison(page, renderer, renderer.treeMarkup(facts));
}
