// execFile may report cancellation before an ignoring child actually closes.
// A named-ref mutation must retain ownership through that separate event.
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { runGitUntilClosed } from "../../server/gitRunner.ts";
import { expect, test } from "../../tests/support/pageTest.ts";

test("an aborted Git mutation settles only after its child actually closes", async () => {
  let entered!: () => void;
  let signalled!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const aborted = new Promise<void>((resolve) => {
    signalled = resolve;
  });
  let held: ServerResponse | undefined;
  const server = createServer((request, response) => {
    if (request.url === "/aborted") {
      response.end();
      signalled();
    } else {
      held = response;
      entered();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("No test address");
  const bin = await mkdtemp(path.join(tmpdir(), "dough-held-git-"));
  const wrapper = path.join(bin, "git");
  await writeFile(
    wrapper,
    [
      `#!${process.execPath}`,
      'const {request} = require("node:http");',
      `const origin = "http://127.0.0.1:${String(address.port)}";`,
      'const notify = request(origin + "/started", response => { response.resume(); response.on("end", () => process.exit(0)); });',
      'process.on("SIGTERM", () => { const note = request(origin + "/aborted", response => response.resume()); note.end(); });',
      "notify.end();",
      "",
    ].join("\n"),
  );
  await chmod(wrapper, 0o755);
  const controller = new AbortController();
  let settled = false;
  const read = runGitUntilClosed(["fetch", "origin", "main"], {
    signal: controller.signal,
    maxBuffer: 1024,
    env: { PATH: `${bin}${path.delimiter}${process.env["PATH"] ?? ""}` },
  });
  const result = read.then(
    () => {
      settled = true;
    },
    (error: unknown) => {
      settled = true;
      return error;
    },
  );
  try {
    await started;
    controller.abort();
    await aborted;
    expect(settled).toBe(false);
    held?.end();
    expect(await result).toBeInstanceOf(Error);
    expect(settled).toBe(true);
  } finally {
    held?.end();
    await result;
    await new Promise<void>((resolve) =>
      server.close(() => {
        resolve();
      }),
    );
    await rm(bin, { recursive: true, force: true });
  }
});
