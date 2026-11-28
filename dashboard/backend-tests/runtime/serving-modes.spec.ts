// Dev and preview mount the same local boundaries: one Vite configuration
// serves both, and each boundary's plugin installs the same boundary on
// whichever server the mode starts. Vite's HMR, which only dev has, is
// observed by e2e/runtime/production-watcher.spec.ts editing development
// source beside production.

import type { Plugin, PluginOption } from "vite";
import { expect, test, vi } from "vitest";
import viteConfig from "../../vite.config.mts";
import { localBoundaries } from "../../server/localBoundaries.ts";
import { localBoundaryPlugin } from "../../server/localBoundaryPlugin.ts";
import type {
  BoundaryInstall,
  BoundaryMiddlewares,
} from "../../server/localBoundary.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

// These cases compare registrations and install a stand-in boundary without recording incidents.
vi.mock(import("../../server/incidentRecord.ts"), () => ({}));

const pluginNames = (plugins: PluginOption[] | undefined): string[] =>
  (plugins ?? [])
    .flat(Infinity as 1)
    .flatMap((plugin) =>
      plugin !== null && typeof plugin === "object" && "name" in plugin
        ? [plugin.name]
        : [],
    );

test("the one serving configuration delivers the brand icons and mounts every local boundary, in table order", () => {
  if (typeof viteConfig !== "function") throw new Error("A mode-aware config");
  const config = viteConfig({ command: "serve", mode: "development" });
  const names = pluginNames(config.plugins);
  expect(names).toContain("open-dough-brand-assets");
  expect(names.filter((name) => name.startsWith("dough-"))).toEqual(
    localBoundaries.map(({ name }) => name),
  );
});

type ServerHook = (server: never) => Promise<void>;

test("each mode installs the same boundary on its own server and opens its own project environment", async () => {
  const installed: { middlewares: unknown; httpServer: unknown }[] = [];
  const opened: ProjectEnvironment[] = [];
  let closed = 0;
  const install: BoundaryInstall = (middlewares, httpServer) => {
    installed.push({ middlewares, httpServer });
    return () => {
      closed += 1;
    };
  };
  const serverOf = (label: string) => ({
    middlewares: { use: () => undefined } satisfies BoundaryMiddlewares,
    httpServer: { label },
  });
  const dev = serverOf("dev");
  const preview = serverOf("preview");
  const hook = (plugin: Plugin, named: keyof Plugin) =>
    plugin[named] as unknown as ServerHook;
  const open = (environment: ProjectEnvironment) => {
    opened.push(environment);
  };
  const devPlugin = localBoundaryPlugin({ name: "dough-x", install }, open);
  const previewPlugin = localBoundaryPlugin({ name: "dough-x", install }, open);

  await hook(devPlugin, "configureServer")(dev as never);
  await hook(previewPlugin, "configurePreviewServer")(preview as never);
  await (devPlugin.closeServer as () => Promise<void>)();
  await (previewPlugin.closePreviewServer as () => Promise<void>)();

  expect(installed).toEqual([dev, preview]);
  expect(opened).toEqual(["development", "production"]);
  expect(closed).toBe(2);
});
