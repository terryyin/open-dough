// A loopback landing receiver and the context file a dashboard prepares for a
// launch, shared by tests of the landing handoff.
import { createServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const landingReference = "6f0e3c0e-6a0c-4b54-9d0b-0d3a3f0f4c11";

// A receiver that keeps each request and answers its comparison as received.
export async function landingReceiver(t) {
  const requests = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const report = JSON.parse(body);
      requests.push({ url: req.url, report });
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ...report,
          receipt: `receipt-${requests.length}`,
          state: req.url.endsWith("/prepare") ? "prepared" : "recorded",
        }),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return { origin: `http://127.0.0.1:${server.address().port}`, requests };
}

// The context file for `origin`, in its own directory; `identity` names the
// story, when given.
export async function landingContextFile(t, origin, identity) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "landing-context-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "landing-context.json");
  await writeFile(
    file,
    JSON.stringify({
      origin,
      source: "open-dough",
      host: "claude",
      reference: landingReference,
      ...(identity === undefined ? {} : { identity }),
      remote: "origin",
      target: "refs/heads/main",
    }),
  );
  return file;
}
