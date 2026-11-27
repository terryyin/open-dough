// The local origin guard (../../server/localOrigin.ts) as a served dashboard's
// authenticated read boundary answers it: a read from the dashboard's own
// origin reaches the boundary, which refuses an unknown source, while a read
// without an Origin or from a foreign origin is refused before any read.
// Fetched with Node's own fetch() and checked with node:assert, so both the
// Vitest and the Playwright runner use it.

import assert from "node:assert/strict";

export async function expectOwnOriginReadsOnly(url: string): Promise<void> {
  const read = `${url}/__authenticated-read?source=unknown`;
  const sameOrigin = await fetch(read, { headers: { Origin: url } });
  assert.equal(sameOrigin.status, 404);
  assert.match(await sameOrigin.text(), /Unknown catalog source/);
  assert.equal((await fetch(read)).status, 403);
  assert.equal(
    (await fetch(read, { headers: { Origin: "https://example.invalid" } }))
      .status,
    403,
  );
}
