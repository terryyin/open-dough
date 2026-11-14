// Exact bytes/argv and deliberately invalid frames are contract inputs, not
// domain fixtures. Real GitHubRequests and the owner retain admission/lifetime.
import { existsSync, readdirSync } from "node:fs";
import { everyRepository, hangs } from "../../tests/support/fakeGitHub.ts";
import { processAlive } from "../../tests/support/processGroup.ts";
import { startInProcessAuthenticatedRead } from "../../tests/support/inProcessAuthenticatedRead.ts";
import { expect, test, inProcessFixture } from "../support/fakeGhInProcess.ts";

test("the real owner receives exact argv and binary stdout without a call PID", async ({
  client,
}) => {
  const bytes = Buffer.from([0, 1, 255, 195, 40, 10, 0]);
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "application/octet-stream",
      encoding: "base64",
      body: bytes.toString("base64"),
    }),
  );
  const argv = [
    "api",
    "repos/test/repo/contents/caf%C3%A9?ref=abc",
    "-H",
    'Custom: quote"\\tab\tline\n終',
  ];
  const answer = await client.read(argv);
  expect(client.github.calls.map(({ argv }) => argv)).toEqual([
    ["api", "--include", ...argv.slice(1)],
  ]);
  expect(answer).toMatchObject({
    status: 200,
    bodyEncoding: "base64",
    body: bytes.toString("base64"),
    failure: undefined,
  });
  expect(client.apiLaunched()).toBe(false);
  expect(existsSync(client.gh.pidPath)).toBe(false);
  expect(client.owners()).toHaveLength(1);
  expect(
    client
      .owners()
      .flatMap(({ directory }) =>
        readdirSync(directory).filter((name) => name.startsWith("call.")),
      ),
  ).toEqual([]);
});

test("the real owner interprets status, headers and rate limits before admitting later reads", async ({
  client,
}) => {
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 429,
      contentType: "application/json",
      headers: { "Retry-After": "60", "X-Custom": "retained" },
      body: '{"message":"rate limit"}',
    }),
  );
  const requests = client.consumer();
  const first = await requests.request(
    ["api", "repos/test/repo"],
    new AbortController().signal,
  );
  expect(first).toMatchObject({
    status: 429,
    body: '{"message":"rate limit"}',
    failure: { kind: "rate-limited", status: 429, waitSeconds: 60 },
  });
  expect([...first.headers]).toEqual([
    ["content-type", "application/json"],
    ["retry-after", "60"],
    ["x-custom", "retained"],
  ]);
  expect(
    (
      await requests.request(
        ["api", "repos/test/other"],
        new AbortController().signal,
      )
    ).failure,
  ).toMatchObject({ kind: "held-back" });
  expect(client.github.calls).toHaveLength(1);
  expect(client.apiLaunched()).toBe(false);
});

test("a held shared read survives one departure and ends after its last waiter leaves", async ({
  client,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  client.github.serve(everyRepository, async ({ argv }) => {
    if (!argv.includes("repos/test/marker")) {
      await held;
    }
    return { status: 200, contentType: "text/plain", body: "released" };
  });
  const first = client.consumer();
  const second = client.consumer();
  const leaving = new AbortController();
  const left = first
    .request(["api", "repos/test/repo"], leaving.signal)
    .catch(() => "left");
  const staying = second.request(
    ["api", "repos/test/repo"],
    new AbortController().signal,
  );
  // A distinct answered route on the second connection follows its shared request.
  expect(
    (
      await second.request(
        ["api", "repos/test/marker"],
        new AbortController().signal,
      )
    ).body,
  ).toBe("released");
  await expect.poll(() => client.github.calls.length).toBe(2);
  await expect.poll(() => client.owners().length).toBe(1);
  leaving.abort();
  await left;
  expect(client.github.unansweredCalls).toBe(1);
  release();
  expect(await staying).toMatchObject({ body: "released", failure: undefined });
  expect(client.github.calls).toHaveLength(2);
  client.github.serve(everyRepository, hangs);
  const last = new AbortController();
  const ended = second
    .request(["api", "repos/test/last"], last.signal)
    .catch(() => "left");
  await expect.poll(() => client.github.unansweredCalls).toBe(1);
  last.abort();
  await ended;
  await expect.poll(() => client.github.unansweredCalls).toBe(0);
  const owners = client.owners().map(({ pid }) => pid);
  await client.close();
  expect(owners.every((pid) => !processAlive(pid))).toBe(true);
});

test("closing the authenticated boundary cancels its held in-process API call", async () => {
  const boundary = await startInProcessAuthenticatedRead({
    ghTransport: "in-process",
  });
  try {
    boundary.github.serve(everyRepository, hangs);
    const reading = fetch(
      `${boundary.origin}/__authenticated-read?source=open-dough`,
      { headers: { Origin: boundary.origin } },
    ).catch(() => undefined);
    await expect.poll(() => boundary.github.unansweredCalls).toBe(1);
    expect(existsSync(boundary.gh.pidPath)).toBe(false);
    await boundary.closeBoundary();
    await reading;
    await expect.poll(() => boundary.github.unansweredCalls).toBe(0);
  } finally {
    await boundary.close();
  }
});

for (const stream of ["stdout", "stderr"] as const) {
  test(`bounds oversized ${stream} through the real owner`, async ({
    client,
  }) => {
    client.github.serve(everyRepository, () =>
      Promise.resolve(
        stream === "stderr"
          ? { exitCode: 7, stderr: "x".repeat(2048) }
          : { status: 200, contentType: "text/plain", body: "x".repeat(2048) },
      ),
    );
    expect(
      (await client.read(["api", "repos/test/repo"], { maxBufferBytes: 1024 }))
        .failure,
    ).toEqual({ kind: "output-bound" });
    await expect.poll(() => client.github.unansweredCalls).toBe(0);
  });
}

test("isolated installations keep different request owners and answers", async ({
  client,
}) => {
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "text/plain",
      body: "first",
    }),
  );
  expect((await client.read(["api", "repos/test/repo"])).body).toBe("first");
  const firstPid = client.owners()[0]?.pid;
  const second = await inProcessFixture();
  try {
    second.github.serve(everyRepository, () =>
      Promise.resolve({
        status: 200,
        contentType: "text/plain",
        body: "second",
      }),
    );
    expect((await second.read(["api", "repos/test/repo"])).body).toBe("second");
    expect(second.gh.requestOwnerRoot).not.toBe(client.gh.requestOwnerRoot);
    expect(second.owners()[0]?.pid).not.toBe(firstPid);
    expect(client.github.calls).toHaveLength(1);
    expect(second.github.calls).toHaveLength(1);
  } finally {
    await second.close();
  }
  expect((await client.read(["api", "repos/test/repo"])).body).toBe("first");
});

test("the real owner admits eight fast calls and queues the ninth until a turn ends", async ({
  client,
}) => {
  const releases: Array<() => void> = [];
  client.github.serve(everyRepository, async () => {
    await new Promise<void>((resolve) => releases.push(resolve));
    return { status: 200, contentType: "text/plain", body: "admitted" };
  });
  const requests = client.consumer();
  const read = (id: number) =>
    requests.request(
      ["api", `repos/test/repo${String(id)}`],
      new AbortController().signal,
    );
  const first = [...Array<unknown>(8).keys()].map(read);
  await expect.poll(() => client.github.calls.length).toBe(8);
  const ninth = read(8);
  // This refused operation crosses the same owner connection after the ninth.
  await requests.request(["api", "--unknown"], new AbortController().signal);
  expect(client.github.calls).toHaveLength(8);
  releases.shift()?.();
  await expect.poll(() => client.github.calls.length).toBe(9);
  for (const release of releases) {
    release();
  }
  expect(
    (await Promise.all([...first, ninth])).map(({ body }) => body),
  ).toEqual(Array<string>(9).fill("admitted"));
});
