// Sends a real revision check's headers and first body byte, holding the
// remaining bytes until release. This distinguishes receiving headers from
// the page being able to read the changed heads in the complete answer.
import { createServer } from "node:http";
import type { Page, Route } from "@playwright/test";
import { isCheck } from "../pageRequestNotes.ts";

export async function holdNextRevisionCheckBody(page: Page) {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let target = "";
  const server = createServer((...[, response]) => {
    void (async () => {
      const answer = await fetch(target, {
        headers: { "sec-fetch-site": "same-origin" },
      });
      const body = Buffer.from(await answer.arrayBuffer());
      response.writeHead(answer.status, {
        "content-type": "application/json",
        "content-length": body.length,
      });
      response.write(body.subarray(0, 1));
      await released;
      response.end(body.subarray(1));
    })().catch(() => {
      response.destroy();
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The held revision check did not bind a port.");
  }
  const check = (url: URL) => isCheck(url.href);
  const forward = async (route: Route) => {
    target = route.request().url();
    const redirected = new URL(target);
    redirected.host = `127.0.0.1:${address.port}`;
    await route.continue({ url: redirected.href });
  };
  await page.route(check, forward, { times: 1 });
  return {
    headersReceived: page.waitForResponse((answer) => isCheck(answer.url())),
    release,
    async close() {
      release();
      await page.unroute(check, forward);
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
        server.closeAllConnections();
      });
    },
  };
}
