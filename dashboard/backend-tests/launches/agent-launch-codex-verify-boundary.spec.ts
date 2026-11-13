// The verification endpoint over raw HTTP: a direct verification request for
// an uncertain Codex start that is not a story launch is answered unresolved
// without asking the host, and its attempt is kept unchanged. Recheck on the
// page: ../../tests/launches/agent-launch-codex-recheck.spec.ts.
import { agentVerifyEndpoint } from "../../src/agentLaunch.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
import { attempts, launch } from "../../tests/agentLaunchBoundary.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { test, expect } from "../../tests/support/codexLaunch.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .please();
test.use({ projectFolders: ["open-dough"] });

test("direct verification refuses an uncertain Codex start and keeps its attempt", async ({
  dashboard,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("Missing native fixture.");
  const native = codexProtocol;
  native.refuseInput = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  const [before] = await attempts(dashboard);
  const answer = await rawRequest({
    url: `${dashboard.baseURL}${agentVerifyEndpoint}`,
    method: "POST",
    headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
    body: JSON.stringify({ source: "open-dough", attempt: before?.id }),
  });
  expect(answer.status).toBe(200);
  expect(JSON.parse(answer.body)).toEqual({
    kind: "unresolved",
    explanation:
      "This start is not a story launch whose session alone may or may not have started, so its host was not asked.",
  });
  expect(await attempts(dashboard)).toEqual([before]);
});
