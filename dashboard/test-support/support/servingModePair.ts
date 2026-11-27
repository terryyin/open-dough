// A dev and a preview Dashboard serving one publication, for checking that
// both serving modes mount the same local boundaries. Both servers start in
// whichever case first asks for them, within that case's time limit, and
// close when the caller closes the pair after its last case. Any case may
// run first, so each allows for the start.
import { defaultRepository } from "../publishedOriginBasics.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
  type DashboardServerMode,
} from "./dashboardServer.ts";
import type { publishes } from "./fakeGitHub.ts";
import { routeServedHomesToPublication } from "./fixtureOriginRoute.ts";
import {
  boundaryAnswerOf,
  type BoundaryAnswer,
  type RawResponse,
} from "./rawHttp.ts";

export type ViteMode = Extract<DashboardServerMode, "dev" | "preview">;
export const servingModes = ["dev", "preview"] as const;
export const servingModeStartAllowance = 30_000;

export type ServingModePair = {
  servers: () => Promise<Record<ViteMode, DashboardServer>>;
  // Sends the same request to each server and returns both answers, the
  // request having seen only its own server.
  asked: (
    request: (server: DashboardServer) => Promise<RawResponse>,
  ) => Promise<Record<ViteMode, BoundaryAnswer>>;
  close: () => Promise<void>;
};

export function servingModePair(
  published: ReturnType<typeof publishes>,
): ServingModePair {
  let started: Promise<Record<ViteMode, DashboardServer>> | undefined;
  const servers = () => {
    started ??= Promise.all(
      servingModes.map(async (mode) => {
        const server = await startDashboardServer({
          mode,
          projectFolders: ["open-dough"],
          prebuilt: sharedDashboardBuild,
        });
        server.github.serve(defaultRepository, published);
        routeServedHomesToPublication(server.github, defaultRepository);
        return [mode, server] as const;
      }),
    ).then(
      (pair) => Object.fromEntries(pair) as Record<ViteMode, DashboardServer>,
    );
    return started;
  };
  return {
    servers,
    asked: async (request) => {
      const { dev, preview } = await servers();
      const [devAnswer, previewAnswer] = await Promise.all([
        request(dev),
        request(preview),
      ]);
      return {
        dev: boundaryAnswerOf(devAnswer),
        preview: boundaryAnswerOf(previewAnswer),
      };
    },
    close: async () => {
      if (started === undefined) return;
      const pair = await started;
      await Promise.all(Object.values(pair).map((server) => server.close()));
    },
  };
}
