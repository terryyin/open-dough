import { mkdtempSync, rmSync } from "node:fs";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { makeMe as pageMakeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import { admitted } from "../../server/agentLaunchAdmission.ts";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { codexHost } from "../../server/codexHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { agentAcceptEndpoint } from "../../src/agentLaunch.ts";
import { installFakeClaude } from "../../test-support/support/fakeClaude.ts";

const storyRequest = makeMe.aLaunchRequest.executing(storyA).please();
const draftRequest = makeMe.aLaunchRequest.adHoc().please();
const origin = "http://127.0.0.1:4173";

let root: string;
let claude: ReturnType<typeof installFakeClaude>["controls"];
let unmount: () => void;
let marks: NativeDoneMarks;
let launches: AgentLaunches;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "dough-model-admission-"));
  const native = installFakeClaude(
    root,
    { binDir: root, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = native.controls;
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  launches = new AgentLaunches(marks);
});

afterEach(async () => {
  launches.close();
  await marks.close();
  unmount();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(root, { recursive: true, force: true });
});

async function submit(body: unknown) {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.method = "POST";
  request.headers = {
    host: new URL(origin).host,
    origin,
    "content-type": "application/json",
  };
  request.push(Buffer.from(JSON.stringify(body)));
  request.push(null);
  const input = await admitted(
    request,
    new URL(agentAcceptEndpoint, origin),
    launches,
  );
  if (input.kind !== "accept") throw new Error("Expected launch admission.");
  return launches.accept(input.source, input.request, origin);
}

test("refuses an unsupported Claude effort before process start", async () => {
  await expect(
    submit({ ...storyRequest, effort: "extreme" }),
  ).rejects.toMatchObject({
    status: 400,
    message:
      "Claude Code reasoning effort must be one of low, medium, high, xhigh, max.",
  });
  expect(claude.claudeCalls()).toEqual([]);
});

for (const [kind, request] of [
  ["story", storyRequest],
  ["ad hoc", draftRequest],
] as const) {
  test.each([
    { label: "an unlisted alias", model: "haiku" },
    { label: "an unlisted model name", model: "gpt" },
    { label: "an empty string", model: "" },
    { label: "a number", model: 4 },
    { label: "null", model: null },
  ] as const)(
    `refuses $label as the ${kind} model before process start`,
    async ({ model }) => {
      await expect(submit({ ...request, model })).rejects.toMatchObject({
        status: 400,
      });
      expect(claude.claudeCalls()).toEqual([]);
    },
  );

  test(`refuses a Claude alias on the ${kind} Codex request before dispatch`, async () => {
    vi.spyOn(codexHost, "options").mockResolvedValue(
      pageMakeMe.aLaunchHostOptions.with({ models: [] }).please(),
    );
    await expect(
      submit({ ...request, host: "codex", model: "opus" }),
    ).rejects.toMatchObject({ status: 400 });
    expect(claude.claudeCalls()).toEqual([]);
    expect((await launches.attempts()).attempts).toEqual([]);
  });
}
