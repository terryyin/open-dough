import { existsSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import { installReviewInitialSyncMiddleware } from "../../server/reviewInitialSyncBoundary.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { reviewInitialSyncEndpoint } from "../../src/reviewInitialSync.ts";

test("the initial-sync route refuses a cross-site start before touching the configured Review repository", async () => {
  const { project } = await configuredFixtureProject(
    makeMe.aRepository.please(),
  );
  const owner = new ReviewInitialSync();
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.url = `${reviewInitialSyncEndpoint}?source=${project.id}`;
  request.method = "POST";
  request.headers = {
    host: "127.0.0.1:4173",
    origin: "http://cross-site.example",
    "sec-fetch-site": "cross-site",
  };
  const response = new ServerResponse(request);
  // Exercise the registered route's request admission without a server.
  let closeRequests: (() => void) | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      vi.spyOn(response, "end").mockImplementation(() => {
        resolve();
        return response;
      });
      closeRequests = installReviewInitialSyncMiddleware(
        {
          use(handler) {
            handler(request, response, reject);
          },
        },
        owner,
      );
    });
    expect(response.statusCode).toBe(403);
    expect(existsSync(reviewRepositoryPath(project))).toBe(false);
  } finally {
    closeRequests?.();
    await owner.close();
  }
});
