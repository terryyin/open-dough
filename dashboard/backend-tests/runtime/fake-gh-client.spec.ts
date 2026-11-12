// The installed synthetic CLI's transport contract. Exact argv, raw response
// bytes and process signals are the inputs under test, rather than domain data.
import {
  existsSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { everyRepository } from "../../tests/support/fakeGitHub.ts";
import { expect, test } from "../support/fakeGhClient.ts";

test("records exact argv and prints binary bytes without curl configuration or proxy effects", async ({
  client,
}) => {
  writeFileSync(
    path.join(client.gh.binDir, "node"),
    "#!/bin/sh\nprintf 'ordinary gh started Node' >&2\nexit 99\n",
    { mode: 0o755 },
  );
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
  const { child, result } = client.run(argv);
  expect(await result).toEqual({
    code: 0,
    signal: null,
    stdout: bytes,
    stderr: Buffer.alloc(0),
  });
  expect(client.github.calls.map((call) => call.argv)).toEqual([argv]);
  expect(readFileSync(client.gh.pidPath, "utf8")).toBe(String(child.pid));
  expect(readdirSync(client.scratch)).toEqual([]);
});

test("prints simultaneous UTF-8 stdout, stderr and nonzero status, and empty argv and streams", async ({
  client,
}) => {
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 403,
      contentType: "text/plain",
      body: "réponse\0終\n",
    }),
  );
  expect(await client.run([]).result).toEqual({
    code: 1,
    signal: null,
    stdout: Buffer.from("réponse\0終\n"),
    stderr: Buffer.from("gh: HTTP error (HTTP 403)\n"),
  });
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      status: 200,
      contentType: "text/plain",
      body: "",
    }),
  );
  expect(await client.run([""]).result).toEqual({
    code: 0,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
  });
  client.github.serve(everyRepository, () =>
    Promise.resolve({
      exitCode: 7,
      stderr: "échec\0終\n",
    }),
  );
  expect(await client.run(["api"]).result).toEqual({
    code: 7,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from("échec\0終\n"),
  });
  expect(client.github.calls.map((call) => call.argv)).toEqual([
    [],
    [""],
    ["api"],
  ]);
  expect(readdirSync(client.scratch)).toEqual([]);
});

for (const token of ["local café\n終", ""]) {
  test(`auth stays local with ${token === "" ? "empty" : "nonempty"} token and no ordinary PID setup`, async ({
    client,
  }) => {
    expect(
      await client.run(["auth", "token"], {
        GH_TOKEN: token,
        FAKE_GH_ORIGIN: undefined,
      }).result,
    ).toEqual({
      code: token === "" ? 1 : 0,
      signal: null,
      stdout: Buffer.from(token),
      stderr: Buffer.alloc(0),
    });
    expect(client.github.calls).toEqual([]);
    expect(existsSync(client.gh.pidPath)).toBe(false);
    expect(readdirSync(client.scratch)).toEqual([]);
  });
}

test("held auth records arrival and resumes when its hold file disappears", async ({
  client,
}) => {
  const hold = path.join(client.root, "auth.hold");
  writeFileSync(hold, "");
  const { child, result } = client.run(["auth", "token"], {
    GH_TOKEN: "held-token",
    FAKE_GH_AUTH_HOLD: hold,
  });
  await expect.poll(() => existsSync(`${hold}.reached`)).toBe(true);
  expect(child.exitCode).toBeNull();
  expect(existsSync(client.gh.pidPath)).toBe(false);
  expect(client.github.calls).toEqual([]);
  unlinkSync(hold);
  expect(await result).toEqual({
    code: 0,
    signal: null,
    stdout: Buffer.from("held-token"),
    stderr: Buffer.alloc(0),
  });
  expect(readdirSync(client.scratch)).toEqual([]);
});
