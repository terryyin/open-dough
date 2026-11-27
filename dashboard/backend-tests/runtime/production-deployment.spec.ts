// Selecting and verifying a published main commit
// (../../server/productionDeployment.mjs). Installing, building and serving
// the pinned commit, and ending a cancelled one, are proven by the production
// watcher journeys (../../../e2e/runtime/production-watcher*.spec.ts).
import { expect, test } from "vitest";
import {
  expectSelectedCommit,
  publishedMainFrom,
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

test("deployment refuses a checkout whose commit is not the selected one before running its code", () => {
  const selected = { origin, commit: published };
  expect(() => {
    expectSelectedCommit(published, selected);
  }).not.toThrow();
  expect(() => {
    expectSelectedCommit(later, selected);
  }).toThrow(`did not match selected main commit ${published}`);
});
