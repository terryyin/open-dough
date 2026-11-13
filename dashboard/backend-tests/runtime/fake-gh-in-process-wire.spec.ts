// Raw argv, output bytes and invalid framing remain explicit contract inputs.
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { everyRepository, hangs } from "../../tests/support/fakeGitHub.ts";
import { withRestoredEnv } from "../../tests/support/testEnv.ts";
import { expect, test } from "../support/fakeGhInProcess.ts";

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

for (const frame of ["broken", "0\n99\nshort", "999\n0\n"]) {
  test(`rejects malformed fake frame ${JSON.stringify(frame)}`, async ({
    client,
  }) => {
    const server = createServer((request, response) => {
      request.resume();
      response.end(frame);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    try {
      const origin = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}/`;
      const result = await client.raw(["api"], {
        env: { FAKE_GH_ORIGIN: origin },
      });
      expect(result.error?.message).toBe(
        "fake gh: invalid test response frame",
      );
      expect(result.stdout).toEqual(Buffer.alloc(0));
      const restore = withRestoredEnv({ FAKE_GH_ORIGIN: origin });
      try {
        expect((await client.read(["api", "repos/test/repo"])).failure).toEqual(
          { kind: "failed" },
        );
        expect(client.apiLaunched()).toBe(false);
      } finally {
        restore();
      }
    } finally {
      await new Promise<void>((resolve) =>
        server.close(() => {
          resolve();
        }),
      );
    }
  });
}

test("missing and closed endpoints preserve the synthetic CLI diagnostic on stderr", async ({
  client,
}) => {
  const missing = await client.raw(["api"], { env: {} });
  expect(missing.stderr).toEqual(
    Buffer.from("fake gh: FAKE_GH_ORIGIN is not set\n"),
  );
  await client.github.close();
  const gone = await client.raw(["api"]);
  expect(gone.stderr).toEqual(
    Buffer.from("fake gh: the test's fake GitHub is gone\n"),
  );
});

test("missing, remote, closed and interrupted fake endpoints settle locally", async ({
  client,
}) => {
  expect(
    (await client.raw(["api"], { env: { FAKE_GH_ORIGIN: "" } })).error?.message,
  ).toBe("fake gh: FAKE_GH_ORIGIN is not set");
  expect(
    (
      await client.raw(["api"], {
        env: { FAKE_GH_ORIGIN: "https://api.github.com/" },
      })
    ).error?.message,
  ).toBe("fake gh: the test's fake GitHub must be local");
  client.github.serve(everyRepository, hangs);
  const held = client.read(["api", "repos/test/repo"]);
  await expect.poll(() => client.github.unansweredCalls).toBe(1);
  await client.github.close();
  expect((await held).failure).toEqual({ kind: "failed" });
  expect((await client.read(["api", "repos/test/closed"])).failure).toEqual({
    kind: "failed",
  });
  expect(client.apiLaunched()).toBe(false);
});
