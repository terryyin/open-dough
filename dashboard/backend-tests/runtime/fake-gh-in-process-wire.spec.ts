// Raw argv, output bytes and invalid framing remain explicit contract inputs.
import {
  everyRepository,
  hangs,
} from "../../test-support/support/fakeGitHub.ts";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { decodeFakeGhFrame } from "../../test-support/support/fakeGhTransport.mjs";
import { expect } from "vitest";
import { test } from "../support/fakeGhInProcess.ts";

test("preserves raw binary stdout and exact empty/UTF-8 argv without a call PID", async ({
  client,
}) => {
  const bytes = Buffer.from([0, 1, 255, 195, 40, 10, 0]);
  const argv = [
    "api",
    "repos/test/repo/contents/caf%C3%A9?ref=abc",
    "",
    'quote"\\tab\tline\n終',
  ];
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "application/octet-stream",
      encoding: "base64",
      body: bytes.toString("base64"),
    }),
  );
  expect(await client.raw(argv)).toEqual({
    error: null,
    stdout: bytes,
    stderr: Buffer.alloc(0),
    pid: undefined,
  });
  expect(client.github.calls.map(({ argv }) => argv)).toEqual([argv]);
});

test("preserves empty streams, UTF-8 stdout/stderr and nonzero exits", async ({
  client,
}) => {
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 403,
      contentType: "text/plain",
      body: "réponse\0終\n",
    }),
  );
  const failed = await client.raw([]);
  expect(failed.error?.code).toBe(1);
  expect(failed.stdout).toEqual(Buffer.from("réponse\0終\n"));
  expect(failed.stderr).toEqual(Buffer.from("gh: HTTP error (HTTP 403)\n"));
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "text/plain",
      body: "",
    }),
  );
  expect(await client.raw([""])).toEqual({
    error: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    pid: undefined,
  });
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      exitCode: 7,
      stderr: "échec\0終\n",
    }),
  );
  const exited = await client.raw(["api"]);
  expect(exited.error?.code).toBe(7);
  expect(exited.stdout).toEqual(Buffer.alloc(0));
  expect(exited.stderr).toEqual(Buffer.from("échec\0終\n"));
});

test("decodes a well-formed frame and rejects every malformed frame shape", () => {
  expect(decodeFakeGhFrame(Buffer.from("7\n3\nerrout"), 16)).toEqual({
    exitCode: 7,
    stderr: Buffer.from("err"),
    stdout: Buffer.from("out"),
  });
  for (const frame of [
    "broken",
    "0\n99\nshort",
    "999\n0\n",
    "\n0\n",
    "x\n0\n",
  ]) {
    expect(() => decodeFakeGhFrame(Buffer.from(frame), 16), frame).toThrow(
      "fake gh: invalid test response frame",
    );
  }
  expect(() => decodeFakeGhFrame(Buffer.from("0\n0\n12345"), 4)).toThrow(
    "fake gh: output exceeds maxBuffer",
  );
});

test("missing, remote, closed and interrupted endpoints settle locally with the synthetic diagnostic as a failed read", async ({
  client,
}) => {
  const gone = "fake gh: the test's fake GitHub is gone";
  client.github.serve(everyRepository, hangs);
  const held = client.raw(["api"]);
  await expect
    .poll(() => client.github.unansweredCalls, { interval: 5 })
    .toBe(1);
  const settled = [
    await client.raw(["api"], { env: {} }),
    await client.raw(["api"], { env: { FAKE_GH_ORIGIN: "" } }),
    await client.raw(["api"], {
      env: { FAKE_GH_ORIGIN: "https://api.github.com/" },
    }),
  ];
  await client.github.close();
  settled.push(await held, await client.raw(["api"]));
  expect(settled.map(({ stderr }) => stderr.toString())).toEqual(
    [
      "fake gh: FAKE_GH_ORIGIN is not set",
      "fake gh: FAKE_GH_ORIGIN is not set",
      "fake gh: the test's fake GitHub must be local",
      gone,
      gone,
    ].map((message) => `${message}\n`),
  );
  for (const { error, stdout, stderr } of settled) {
    expect(
      readAnswer(error, stdout.toString(), stderr.toString(), "asked").failure,
    ).toEqual({
      kind: "failed",
    });
  }
});
