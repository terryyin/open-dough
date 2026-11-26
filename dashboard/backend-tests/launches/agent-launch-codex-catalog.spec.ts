// Codex discovery uses the launch boundary's local origin and project rules.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { admitted } from "../../server/agentLaunchAdmission.ts";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { launchHostOptionsResponse } from "../../server/launchHostOptionsResponse.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { launchHostOptionsEndpoint } from "../../src/launchHostOptions.ts";
import { installFakeCodex } from "../../test-support/support/fakeCodex.ts";

const host = "127.0.0.1:4173";
const origin = "http://127.0.0.1:4173";

test("catalog read enforces same origin, project and method, and reads every native page", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-codex-catalog-"));
  const native = await installFakeCodex(root, process.env["PATH"] ?? "", true);
  const home = path.join(root, "home");
  mkdirSync(path.join(home, "git", "open-dough"), { recursive: true });
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", home);
  const unmount = mountProjectConfiguration("production");
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    unmount();
    vi.unstubAllEnvs();
    await native.close();
    rmSync(root, { recursive: true, force: true });
  });

  const discover = async (
    source = "open-dough",
    method = "GET",
    requestOrigin = origin,
  ) => {
    const url = new URL(launchHostOptionsEndpoint, origin);
    url.searchParams.set("source", source);
    url.searchParams.set("host", "codex");
    const socket = new Socket();
    Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
    const request = new IncomingMessage(socket);
    request.method = method;
    request.headers = { host, origin: requestOrigin };
    const choice = await admitted(request, url, launches);
    if (choice.kind !== "host-options")
      throw new Error("Expected host discovery.");
    return launchHostOptionsResponse(choice, new ServerResponse(request));
  };

  await expect(
    discover("open-dough", "GET", "http://another.example"),
  ).rejects.toMatchObject({ status: 403 });
  await expect(discover("open-dough", "POST")).rejects.toMatchObject({
    status: 405,
  });
  await expect(discover("doughnut")).rejects.toMatchObject({ status: 404 });
  await expect(discover("unknown")).rejects.toMatchObject({ status: 404 });
  expect(native.calls).toEqual([]);

  native.catalogError = { code: -32000, message: "Unavailable" };
  expect(await discover()).toMatchObject({
    status: 503,
    body: {
      error:
        "Codex model choices could not be read. Retry, or use the Codex setting.",
    },
  });

  native.catalogError = undefined;
  native.modelPageSize = 1;
  const since = native.calls.length;
  expect(await discover()).toMatchObject({
    status: 200,
    body: { models: native.models.map(({ model }) => ({ model })) },
  });
  expect(
    native.calls
      .slice(since)
      .filter(({ method }) => method === "model/list")
      .map(({ params }) => params),
  ).toEqual([
    { limit: 100, includeHidden: false },
    { limit: 100, includeHidden: false, cursor: "1" },
  ]);
});
