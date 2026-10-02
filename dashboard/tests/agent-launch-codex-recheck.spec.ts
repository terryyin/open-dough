// Codex Recheck rereads startup evidence without requesting native verification;
// a direct verification request is refused without changing the attempt.
import { agentVerifyEndpoint } from "../src/agentLaunch.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  notRefinedIdentity,
  notRefinedStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { attempts, launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { test, expect } from "./support/codexLaunch.ts";

const request = {
  ...refinementRequest,
  host: "codex",
  identity: notRefinedIdentity,
  title: notRefinedStory,
};
const subject = `${notRefinedStory} (${notRefinedIdentity})`;
test.use({ projectFolders: ["open-dough"] });
let journey: LaunchJourney | undefined;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => journey?.cleanup());

test("Recheck rereads evidence and published state without verifying a Codex start", async ({
  dashboard,
  page,
  codexProtocol,
}) => {
  if (journey === undefined || codexProtocol === undefined)
    throw new Error("Missing launch fixture.");
  await openTakenBacklog(page, journey);
  const native = codexProtocol;
  native.refuseInput = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
    reason: "unconfirmed",
  });
  const [before] = await attempts(dashboard);
  await page.reload();
  const recovery = page.getByRole("region", { name: "Startup recovery" });
  const recheck = recovery.getByRole("button", { name: `Recheck ${subject}` });
  await expect(recheck).toBeEnabled();
  const verifications: string[] = [];
  page.on("request", (sent) => {
    if (new URL(sent.url()).pathname === agentVerifyEndpoint)
      verifications.push(sent.url());
  });
  const reread = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/__agent-launch",
  );
  const published = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/__authenticated-read" &&
      !url.searchParams.has("revision")
    );
  });
  await recheck.click();
  await Promise.all([reread, published]);
  expect(verifications).toEqual([]);
  await expect(recovery).not.toContainText("offers no session listing");
  await expect(
    recovery.getByRole("button", {
      name: `Continue refinement start of ${subject}`,
    }),
  ).toBeEnabled();
  expect(await attempts(dashboard)).toEqual([before]);
  expect(
    codexProtocol.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    codexProtocol.calls.filter((call) => call.method === "turn/start"),
  ).toHaveLength(1);
});

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
