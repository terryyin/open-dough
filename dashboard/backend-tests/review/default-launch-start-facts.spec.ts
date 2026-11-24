// A default launch reads its starting point from the checkout.
import { realpathSync, renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { defaultLaunchStartFacts } from "../../server/defaultLaunchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("a default launch records the common repository while Git can read the checkout", async () => {
  const { checkout } = await aDoneCaptureCase().please();
  const folder = localFolder(checkout.integration);
  const { request } = makeMe.aLaunchRecord.adHoc({ title: "Session" }).please();
  const gitDirectory = path.join(folder.path, ".git");

  expect(await defaultLaunchStartFacts(request, folder)).toEqual({
    defaultStart: {
      workspace: folder.path,
      repository: realpathSync(gitDirectory),
    },
  });

  renameSync(gitDirectory, path.join(folder.path, ".git-away"));
  expect(await defaultLaunchStartFacts(request, folder)).toEqual({});
});
