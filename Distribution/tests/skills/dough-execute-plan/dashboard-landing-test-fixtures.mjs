// A loopback landing receiver and the context file, with any shared-checkout
// note beside it, a dashboard prepares for a launch, shared by tests of the
// landing handoff.
import { createServer } from "node:http";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { makeMe } from "../../support/makeMe.mjs";
import { plantFirstLandingExpectation } from "../../../src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs";
import {
  sharedCheckoutNotePathBeside,
  sharedCheckoutNoteText,
} from "../../../src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";

// A receiver that keeps each request and answers its comparison as received,
// under a receipt of its own for each request: `prepared` for a preparation
// and `recorded` otherwise.
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
        JSON.stringify(
          makeMe.aLandingReceipt
            .answering(report)
            .underReceipt(
              `00000000-0000-4000-8000-${String(requests.length).padStart(12, "0")}`,
            )
            .inState(req.url.endsWith("/prepare") ? "prepared" : "recorded")
            .please(),
        ),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return { origin: `http://127.0.0.1:${server.address().port}`, requests };
}

// The landing context file (`makeMe.aLandingContext`) in its own directory.
// When `expectation` is set, also plant a first-landing expectation beside
// that management context for the named workspace/branch.
export async function landingContextFile(t, context, expectation) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "landing-context-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "landing-context.json");
  await writeFile(file, JSON.stringify(context));
  if (expectation !== undefined) {
    await mkdir(expectation.repository, { recursive: true });
    await plantFirstLandingExpectation({
      repository: expectation.repository,
      workspace: expectation.workspace,
      branch: expectation.branch,
      landingContext: file,
    });
  }
  return file;
}

// The Dashboard's shared-checkout note beside `landingContext`: another
// session was open in its checkout since `since`.
export const noteSharedCheckout = (landingContext, since) =>
  writeFile(
    sharedCheckoutNotePathBeside(landingContext),
    sharedCheckoutNoteText(since.toISOString()),
  );
