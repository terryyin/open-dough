// The shared page-test base (./support/pageTest.ts) finishes a page's
// intercepted reads before the context is torn down, so a spec needs no
// teardown of its own for them.
//
// The first test leaves one route handler in flight: it has fetched its
// answer and waits, without a deadline, for the test's teardown to begin.
// Its fixtures record the order of what follows. The second test, in the
// same worker once the first one's fixtures are gone, checks that order.

import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test as base } from "./support/pageTest.ts";

const events: string[] = [];

let server: Server;
let baseURL: string;
base.beforeAll(async () => {
  // The page opens at `/`; only the read it starts answers `ok`.
  server = createServer((request, response) => {
    response.end(request.url === "/read" ? "ok" : "");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
base.afterAll(
  () =>
    new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    }),
);

let beginTeardown!: () => void;
const teardownBegun = new Promise<void>((resolve) => {
  beginTeardown = resolve;
});

const test = base.extend<{ teardownBegins: undefined }>({
  context: async ({ context }, use) => {
    await use(context);
    // Every fixture built on the context, `page` among them, is gone.
    events.push("context teardown");
  },
  // Built on `page`, so it is torn down first: its teardown is the moment
  // the test's teardown begins, with the page and its handlers still open.
  teardownBegins: async ({ page }, use) => {
    await use(undefined);
    expect(page.isClosed()).toBe(false);
    events.push("teardown begins");
    beginTeardown();
  },
});

test.describe.configure({ mode: "serial" });

test("a route handler is still reading its answer when the test ends", async ({
  page,
  teardownBegins,
}) => {
  expect(teardownBegins).toBeUndefined();
  let fetched!: () => void;
  const answerFetched = new Promise<void>((resolve) => {
    fetched = resolve;
  });
  await page.route("**/read", async (route) => {
    const response = await route.fetch();
    fetched();
    await teardownBegun;
    try {
      events.push(`handler read ${await response.text()}`);
      await route.fulfill({ response });
    } catch (error) {
      events.push(`handler read failed: ${String(error)}`);
    }
  });
  await page.goto(baseURL);
  await page.evaluate(() => {
    void fetch("/read");
  });
  await answerFetched;
  expect(events).toEqual([]);
});

test("the shared base finished that read before the context was torn down", () => {
  expect(events).toEqual([
    "teardown begins",
    "handler read ok",
    "context teardown",
  ]);
});
