// The local boundaries' own rules, as every server that mounts them keeps
// them. The bundled boundary server entry starts and serves under every
// boundary-mode backend spec, such as
// ../observation/authenticated-read-diagnostics.spec.ts.
import type { IncomingMessage, ServerResponse } from "node:http";
import { expect, test } from "vitest";
import { boundaryMiddlewareChain } from "../../server/localBoundary.ts";
import { runnerArguments } from "../../server/hosts/cursor/runnerProcess.ts";

test("a request no boundary answers is not found, so no page is served", () => {
  const answered: { status?: number } = {};
  const response = {
    writeHead(status: number) {
      answered.status = status;
      return this;
    },
    end() {
      return this;
    },
  };
  boundaryMiddlewareChain().handle(
    { method: "GET", url: "/" } as IncomingMessage,
    response as unknown as ServerResponse,
  );
  expect(answered.status).toBe(404);
});

test("Node runs a bundled runner entry as it is and the source entry through its transform", () => {
  expect(runnerArguments("/bundle/runnerMain.mjs")).toEqual([
    "/bundle/runnerMain.mjs",
  ]);
  expect(runnerArguments("/src/runnerMain.ts")).toEqual([
    "--experimental-transform-types",
    "--no-warnings",
    "/src/runnerMain.ts",
  ]);
});
