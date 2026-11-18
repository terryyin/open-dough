// The local origin guard (../../server/localOrigin.ts) as a served dashboard's
// authenticated read boundary answers it: a read from the dashboard's own
// origin reaches the boundary, which refuses an unknown source, while a read
// without an Origin or from a foreign origin is refused before any read.
import type { APIRequestContext } from "@playwright/test";
import { expect } from "./pageTest.ts";

export async function expectOwnOriginReadsOnly(
  request: APIRequestContext,
  url: string,
) {
  const read = `${url}/__authenticated-read?source=unknown`;
  const sameOrigin = await request.get(read, { headers: { Origin: url } });
  expect(sameOrigin.status()).toBe(404);
  expect(await sameOrigin.text()).toContain("Unknown catalog source");
  expect((await request.get(read)).status()).toBe(403);
  expect(
    (
      await request.get(read, {
        headers: { Origin: "https://example.invalid" },
      })
    ).status(),
  ).toBe(403);
}
