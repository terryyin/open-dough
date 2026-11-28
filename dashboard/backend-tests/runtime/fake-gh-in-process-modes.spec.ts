// Every serving mode starts from one composed environment, so a caller's
// NODE_OPTIONS probe and the default fast owner preload are one rule.
import { expect, test } from "vitest";
import { dashboardServerEnvironment } from "../../test-support/support/dashboardServerEnvironment.ts";
import { fakeGhEnv } from "../../test-support/support/fakeGh.ts";

test("a server's environment keeps the default fast owner alongside a caller's preload", () => {
  const ghEnv = fakeGhEnv(
    {
      transport: "in-process",
      binDir: "/gh/bin",
      pidPath: "/gh/pid",
      requestOwnerRoot: "/owners",
    },
    "http://127.0.0.1:1/",
  );
  for (const mode of ["boundary", "dev", "preview"] as const) {
    const env = dashboardServerEnvironment(
      {
        mode,
        requestOwnerRoot: "/owners",
        extraEnv: { NODE_OPTIONS: "--import=probe.mjs" },
      },
      ghEnv,
      {},
      { binDir: "/codex/bin", env: {} },
      "http://127.0.0.1:1/",
    );
    expect(env["NODE_OPTIONS"]).toMatch(/--import="file:.*fakeGhPreload\.mjs"/);
    expect(env["NODE_OPTIONS"]?.endsWith(" --import=probe.mjs")).toBe(true);
    expect(env).toMatchObject({
      FAKE_GH_TRANSPORT: "in-process",
      FAKE_GH_ORIGIN: "http://127.0.0.1:1/",
      DOUGH_GITHUB_REQUEST_OWNER_ROOT: "/owners",
    });
  }
});

test("each fake gh installation directs its calls to its own request owner root", () => {
  const installation = (root: string) =>
    fakeGhEnv({
      transport: "in-process",
      binDir: `${root}/bin`,
      pidPath: `${root}/pid`,
      requestOwnerRoot: `${root}/owners`,
    })["DOUGH_GITHUB_REQUEST_OWNER_ROOT"];
  expect([installation("/a"), installation("/b")]).toEqual([
    "/a/owners",
    "/b/owners",
  ]);
});
