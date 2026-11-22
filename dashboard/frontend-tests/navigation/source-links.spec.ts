// A story's canonical and plan links render as the production source links
// (../../src/WorkSourceLinks.tsx) from the links production resolves
// (../../src/sourceLink.ts): snapshot files name the inspected revision,
// external references stay apart, and refused targets are readable text that
// cannot be followed. The popup is ../../../e2e/navigation/source-navigation.spec.ts.
import { createElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { resolveSourceLink } from "../../src/sourceLink.ts";
import { WorkSourceLinks } from "../../src/WorkSourceLinks.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const revision = "9b1d4e6a2c8f0735be19d4c6a7f8e9d0c1b2a3f4";
const source = makeMe.aPublishedSource.openDough.please();
const resolved = (recorded: string) =>
  resolveSourceLink(recorded, source, revision);

// The source links of an entry recording CANONICAL and, if given, PLAN.
async function showLinks(canonical: string, plan?: string) {
  const entry = makeMe.aWorkEntry
    .with({
      identity: "SEED-021#see-published-work",
      title: "See the project's published work",
      canonical: resolved(canonical),
      ...(plan === undefined ? {} : { plan: resolved(plan) }),
    })
    .please();
  await mountComponent(
    createElement(
      "ul",
      { "aria-label": "Sources" },
      createElement(WorkSourceLinks, { entry }),
    ),
  );
  return page.getByRole("list", { name: "Sources" });
}

test("snapshot files are links at the inspected revision that leave the dashboard safely", async () => {
  const sources = await showLinks(
    "seeds/SEED-021-observe-published-story-progress.md#see-published-work",
    "./slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices",
  );
  const canonical = sources.getByRole("link", { name: /^Canonical record/ });
  const plan = sources.getByRole("link", { name: /^Slice plan/ });
  await expect
    .element(canonical)
    .toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/SEED-021-observe-published-story-progress.md#see-published-work`,
    );
  await expect
    .element(plan)
    .toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revision}/.planning/slice-plans/061-published-story-dashboard/PLAN.md#ordered-slices`,
    );
  for (const link of [canonical, plan]) {
    await expect.element(link).toHaveAttribute("target", "_blank");
    await expect.element(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  expect(
    sources
      .getByText(`File in this snapshot, at revision ${revision.slice(0, 7)}.`)
      .elements(),
  ).toHaveLength(2);
});

test("external references are links kept apart from the snapshot", async () => {
  const sources = await showLinks(
    "https://status.example.com/notes/2026-09?view=full#api",
    "http://plans.example.org/note-7",
  );
  await expect
    .element(sources.getByRole("link", { name: /^Canonical record/ }))
    .toHaveAttribute(
      "href",
      "https://status.example.com/notes/2026-09?view=full#api",
    );
  await expect
    .element(sources.getByRole("link", { name: /^Slice plan/ }))
    .toHaveAttribute("rel", "noopener noreferrer");
  expect(
    sources
      .getByText(
        "External reference. It is not a file in this snapshot and is not tied to the inspected revision.",
      )
      .elements(),
  ).toHaveLength(2);
  expect(sources.element().textContent).not.toContain("File in this snapshot");
  expect(sources.element().textContent).not.toContain(revision.slice(0, 7));
});

test("refused targets are readable text with their reason and no link", async () => {
  const sources = await showLinks(
    "javascript:document.title='canonical-ran'",
    "../../elsewhere/secret.md#top",
  );
  await expect
    .element(sources.getByText(/^Not offered as a link\. This does not/))
    .toBeVisible();
  const shown = sources.element().textContent;
  for (const text of [
    "Canonical record javascript:document.title='canonical-ran'",
    "Not offered as a link. Links that use “javascript:” are not opened from here.",
    "Slice plan ../../elsewhere/secret.md#top",
    "Not offered as a link. This does not name a file inside the observed repository.",
  ]) {
    expect(shown).toContain(text);
  }
  expect(sources.getByRole("link").elements()).toHaveLength(0);
});
