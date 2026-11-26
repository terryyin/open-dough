// Intent fills the height below the banner; the location browser meets the
// page column's left edge; it and the reading pane reach the viewport bottom
// and scroll on their own while the outer region stays stationary
// (./intent-ci-page-mount.ts, ../../src/IntentBrowser.tsx,
// ../../src/configuredDashboardContent.tsx).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { intentScopeTree } from "./intent-scope-tree-page.ts";

const featuresPath = "e2e_test/features";
const longPath = `${featuresPath}/area/case_00.feature`;

// Forty features, the first long enough to scroll the reading pane.
const files: Readonly<Record<string, string>> = Object.fromEntries(
  [...Array(40).keys()].map((n) => [
    `${featuresPath}/area/case_${String(n).padStart(2, "0")}.feature`,
    n === 0
      ? `Feature: Long\n${"  Scenario: A step\n    Given a step\n".repeat(60)}`
      : `Feature: Case ${n}\n`,
  ]),
);

const element = (selector: string) => {
  const found = document.querySelector<HTMLElement>(selector);
  if (found === null) throw new Error(`Intent shows no ${selector}`);
  return found;
};

test("Intent fills the height below the banner; the location browser meets the left edge and it and the reading pane scroll on their own", async () => {
  const work = makeMe.aPublishedWork
    .of(makeMe.aPublishedSource.pygardon.please())
    .at("f8".repeat(20))
    .please();
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at(featuresPath)
        .ofKind("gherkin")
        .selecting(...Object.keys(files))
        .please(),
    )
    .please();
  const intent = intentReadsPublishing(locations, files);
  await mountIntentCiPage({
    work,
    viewport: { width: 1280, height: 600 },
    reads: { intent, ci: unreadCiReads },
  });
  const tree = intentScopeTree();
  await tree.toggle("e2e_test").click();
  await tree.toggle(featuresPath).click();
  await tree.toggle("area").click();
  await (await tree.openFile(longPath)).shows("Feature: Long");

  const region = element(".intent-scroll");
  const browser = element(".intent-locations");
  const reading = element(".intent-reading");
  expect(
    region.scrollHeight > region.clientHeight,
    "the page below the banner does not scroll",
  ).toBe(false);

  const column = element(".page-column").getBoundingClientRect();
  const browserBox = browser.getBoundingClientRect();
  const readingBox = reading.getBoundingClientRect();
  expect(browserBox.x).toBe(column.x);
  expect(browserBox.bottom).toBe(window.innerHeight);
  expect(readingBox.bottom).toBe(window.innerHeight);

  const tops = () => [browser.scrollTop, reading.scrollTop];
  browser.scrollTo({ top: 200 });
  await expect.poll(tops).toEqual([200, 0]);
  reading.scrollTo({ top: 300 });
  await expect.poll(tops).toEqual([200, 300]);
  expect(
    region.scrollHeight > region.clientHeight,
    "the outer region stays stationary while the panes scroll",
  ).toBe(false);
  expect([region.scrollTop, browser.scrollTop, reading.scrollTop]).toEqual([
    0, 200, 300,
  ]);
});
