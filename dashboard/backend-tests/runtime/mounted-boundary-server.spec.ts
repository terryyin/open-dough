import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  refusedResponse,
  terminalUrl,
} from "../../test-support/agentTerminalBoundary.ts";
import { expectCursorRunnerStandIn } from "../../test-support/support/cursorRunnerJourney.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

const mounted = { mode: "boundary", mountBoundary: true } as const;

test("the mounted HTTP server has no boundary server child process", async () => {
  const server = await startDashboardServer(mounted);
  try {
    const response = await rawRequest({ url: server.origin });
    expect(response.status).toBe(404);
    const children = execFileSync("ps", ["-ax", "-o", "ppid=,command="], {
      encoding: "utf8",
    });
    expect(children).not.toMatch(
      new RegExp(
        `^\\s*${String(process.pid)}\\s+.*boundaryServer\\.(?:ts|mjs)\\b`,
        "m",
      ),
    );
  } finally {
    await server.close();
  }
});

test("the mounted server omits the incident lifecycle boundary", async () => {
  const server = await startDashboardServer({
    ...mounted,
    extraEnv: { DOUGH_TEST_EVENT_LOOP_BLOCK: "allow" },
  });
  try {
    const response = await rawRequest({
      url: `${server.origin}/__test/event-loop-block?ms=0`,
      method: "POST",
    });
    expect(response.status).toBe(404);
  } finally {
    await server.close();
  }
});

test("the mounted boundary answers terminal upgrades", async () => {
  const server = await startDashboardServer(mounted);
  try {
    expect(
      await refusedResponse(
        terminalUrl(server, "not-a-real-project", undefined),
        { origin: server.origin },
      ),
    ).toMatchObject({ status: 404 });
  } finally {
    await server.close();
  }
});

test("the mount owns and withdraws its stand-in on the caller's machine", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-mount-machine-"));
  const home = path.join(machine, "home");
  try {
    const server = await startDashboardServer({ ...mounted, machine });
    try {
      expectCursorRunnerStandIn(home);
    } finally {
      await server.close();
    }
    expect(readCursorRunnerAddress(home)).toBeUndefined();
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});

test("an unexpected runner request fails the mount after cleanup", async () => {
  const server = await startDashboardServer(mounted);
  const address = readCursorRunnerAddress(server.home);
  try {
    expect(address).toBeDefined();
    await rawRequest({
      url: `http://127.0.0.1:${String(address?.port)}/keep`,
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
  } finally {
    await expect(server.close()).rejects.toThrow(
      "Unexpected Cursor protocol work on the runner stand-in: POST /keep",
    );
  }
  expect(readCursorRunnerAddress(server.home)).toBeUndefined();
});

test("a second mounted start is refused even while the first starts", async () => {
  const pending = startDashboardServer(mounted);
  try {
    await expect(startDashboardServer(mounted)).rejects.toThrow(
      /already has a mounted dashboard server.*liveServer/,
    );
  } finally {
    await (await pending).close();
  }
});

test("a mount refused at a live server's port releases the worker", async () => {
  const live = await startDashboardServer({
    ...mounted,
    liveServer: "connection",
  });
  try {
    await expect(
      startDashboardServer({
        ...mounted,
        port: Number(new URL(live.origin).port),
      }),
    ).rejects.toThrow(/EADDRINUSE/);
    const next = await startDashboardServer(mounted);
    await next.close();
  } finally {
    await live.close();
  }
});

test("process-only observations name the live-server request", async () => {
  const server = await startDashboardServer(mounted);
  try {
    expect(() => server.pid).toThrow(/no pid.*liveServer/);
    expect(() => server.output()).toThrow(/no output.*liveServer/);
  } finally {
    await server.close();
  }
});

test("the worker and its child commands recover their environment at close", async () => {
  const before = { home: process.env["HOME"], path: process.env["PATH"] };
  const setting = "DOUGH_TEST_MOUNTED_SERVER_SENTINEL";
  const previousSetting = process.env[setting];
  const server = await startDashboardServer({
    ...mounted,
    extraEnv: { [setting]: "mounted" },
  });
  try {
    expect(process.env["HOME"]).toBe(server.home);
    expect(process.env["PATH"]?.split(path.delimiter)[0]).toBe(
      server.codex.binDir,
    );
    expect(process.env[setting]).toBe("mounted");
  } finally {
    await server.close();
  }
  const childEnv = execFileSync(
    process.execPath,
    ["-p", "JSON.stringify({ home: process.env.HOME })"],
    { encoding: "utf8" },
  );
  expect((JSON.parse(childEnv) as { home?: string }).home).toBe(before.home);
  expect(process.env["PATH"]).toBe(before.path);
  expect(process.env[setting]).toBe(previousSetting);
});

test("the mounted server accepts the control that ends a pending launch wait", async () => {
  const server = await startDashboardServer({
    ...mounted,
    projectFolders: ["open-dough"],
    installedCatalog: "claude",
    launchTimeoutMs: 20_000,
    launchWaitEnd: true,
  });
  try {
    server.claudeScenario("hang");
    const response = launch(server, makeMe.aLaunchRequest.adHoc().please());
    await expect.poll(() => server.heldClaudePid()).toBeDefined();
    await server.endLaunchWait();
    expect(JSON.parse((await response).body)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
    });
  } finally {
    await server.close();
  }
});
