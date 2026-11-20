// A default launch reads its starting point from the checkout.
import { realpathSync, renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { defaultLaunchStartFacts } from "../../server/defaultLaunchStart.ts";
import { localFolder } from "../../server/projectFolders.ts";
import { aCheckout } from "../support/doneCaptureCase.ts";

test("a default launch records its start only while Git can read the checkout", async () => {
  const checkout = await aCheckout();
  const folder = localFolder(checkout.integration);
  const { request } = makeMe.aLaunchRecord.adHoc({ title: "Session" }).please();
  const gitDirectory = path.join(folder.path, ".git");

  expect(await defaultLaunchStartFacts(request, folder)).toEqual({
    defaultStart: {
      workspace: folder.path,
      startingRevision: checkout.base,
      repository: realpathSync(gitDirectory),
      branch: "refs/heads/main",
    },
  });

  renameSync(gitDirectory, path.join(folder.path, ".git-away"));
  expect(await defaultLaunchStartFacts(request, folder)).toEqual({});
});
