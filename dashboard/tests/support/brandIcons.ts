// Open Dough's supplied icon exports (../../../assets/brand/favicon/) that the
// dashboard page declares (../browser-identity.spec.ts), and the answer every
// serving mode gives for each: that canonical file's exact bytes as an image.

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { APIRequestContext, APIResponse } from "@playwright/test";
import { expect } from "./pageTest.ts";
import { repoRoot } from "./repositoryRoot.ts";

const declaredBrandIcons = [
  "favicon.ico",
  "icon-32.png",
  "icon-16.png",
  "icon-180.png",
] as const;

// Expects the answer at an icon's URL to be the export its file name names.
export async function expectSuppliedIcon(response: APIResponse): Promise<void> {
  const name = path.basename(new URL(response.url()).pathname);
  expect(
    {
      status: response.status(),
      contentType: response.headers()["content-type"],
      body: await response.body(),
    },
    response.url(),
  ).toEqual({
    status: 200,
    contentType: name.endsWith(".ico") ? "image/x-icon" : "image/png",
    body: await readFile(path.join(repoRoot, "assets/brand/favicon", name)),
  });
}

// Expects a server at `baseURL` to answer every declared icon so.
export async function expectSuppliedIcons(
  request: APIRequestContext,
  baseURL: string,
): Promise<void> {
  for (const name of declaredBrandIcons) {
    await expectSuppliedIcon(await request.get(`${baseURL}/${name}`));
  }
}
