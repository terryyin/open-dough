// Shell fixtures pipe arranged seed membership into the same renderer.
import { readFileSync } from "node:fs";
import { makeMe } from "./makeMe.mjs";
import { renderStorySection, renderStorySeed } from "./published-seed.mjs";

const {
  entry,
  body = "",
  goal,
  documentTitle,
  document,
  sections,
  id,
} = JSON.parse(readFileSync(0, "utf8"));

if (sections !== undefined) {
  const heading = document ?? "# Seed";
  const rendered = sections
    .map(({ entry: facts, goal: sectionGoal, body: sectionBody }) =>
      renderStorySection(makeMe.aBacklogEntry.with(facts).please(), {
        goal: sectionGoal,
        body: sectionBody,
      }),
    )
    .join("\n");
  const prefix = id === undefined ? "" : `---\nid: ${id}\n---\n\n`;
  process.stdout.write(`${prefix}${heading}\n\n${rendered}`);
} else if (entry === undefined) {
  throw new Error("render-published-seed: missing entry or sections");
} else {
  const membership = makeMe.aBacklogEntry.with(entry).please();
  if (documentTitle !== undefined || body !== "" || goal === undefined) {
    process.stdout.write(
      renderStorySeed(
        membership,
        goal === undefined
          ? body
          : `**Goal:** ${goal}${body ? `\n\n${body}` : ""}`,
        documentTitle,
      ),
    );
  } else {
    process.stdout.write(renderStorySection(membership, { goal, body }));
  }
}
