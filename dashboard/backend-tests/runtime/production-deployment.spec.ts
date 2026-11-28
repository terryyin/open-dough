// Selecting and verifying a published main commit
// (../../server/productionDeployment.mjs). Installing, building and serving
// the pinned commit, and ending a cancelled one, are proven by the production
// watcher journeys (../../../e2e/runtime/production-watcher*.spec.ts).
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, vi } from "vitest";
import {
  publishedMainFrom,
  stageDeployment,
} from "../../server/productionDeployment.mjs";

const origin = "/machine/origin.git";
const published = "a".repeat(40);
const later = "b".repeat(40);

test("deployment selects only the commit origin's main names", () => {
  const refusedListings = [
    {
      listing: "origin without a main branch",
      listed: "",
      refusal: `Origin ${origin} has no published main branch.`,
    },
    {
      listing: "a reference other than main",
      listed: `${published}\trefs/heads/local`,
      refusal: "Malformed published main reference",
    },
    {
      listing: "an abbreviated commit",
      listed: `${published.slice(0, 12)}\trefs/heads/main`,
      refusal: "Malformed published main reference",
    },
  ];
  for (const { listing, listed, refusal } of refusedListings) {
    expect(() => publishedMainFrom(origin, listed), listing).toThrow(refusal);
  }
  expect(publishedMainFrom(origin, `${published}\trefs/heads/main`)).toEqual({
    origin,
    commit: published,
  });
});

test("deployment refuses a mismatched checkout before installing or building", async ({
  onTestFinished,
}) => {
  const root = await mkdtemp(path.join(tmpdir(), "dough-stage-deployment-"));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  const selected = publishedMainFrom(origin, `${published}\trefs/heads/main`);
  const runCommand = vi.fn((executable: string, args: string[]) =>
    Promise.resolve(
      executable === "git" && args.join(" ") === "rev-parse HEAD" ? later : "",
    ),
  );

  await expect(
    stageDeployment({
      developmentRoot: path.join(root, "development"),
      deploymentsRoot: path.join(root, "deployments"),
      published: selected,
      runCommand,
    }),
  ).rejects.toThrow(
    `Fetched commit ${later} did not match selected main commit ${selected.commit}.`,
  );
  expect(runCommand.mock.calls.map(([executable]) => executable)).not.toContain(
    "npm",
  );
});
