// One versioned story-state block inside a canonical home: preparation facts
// for refinement and approach. Reading and writing the block from already-
// loaded text lives here so CLI and browser share one meaning without a
// second Markdown status grammar and without importing filesystem access.
//
// Assessment (ready / not-ready, basis digests, reasons) is owned by a later
// slice; this module records and returns only preparation facts. Missing
// structured fields are Not recorded — never inferred from free-form Status
// prose. Unsupported schema version and legacy absence are distinct results.

import { namedIdentity, readHome } from "./product-backlog-home-reader.mjs";
import { BacklogError, requireField } from "./product-backlog-refusal.mjs";
import { joinSource } from "./product-backlog-source.mjs";
import {
  findStoryStateBlocks,
  parseStoryStatePayload,
  storyStateBlockLines,
  storyStateSourceLocation,
} from "./product-backlog-story-state-block.mjs";
import {
  normalizeRecordedPreparation,
  preparationPayload,
  requirePreparationIdentity,
  storyStateSchemaVersion,
} from "./product-backlog-story-state-preparation.mjs";

export { storyStateFence } from "./product-backlog-story-state-block.mjs";
export { storyStateSchemaVersion };

function insertionIndex(home) {
  if (home.recorded) {
    return home.recorded.index + 1;
  }
  return home.region.heading + 1;
}

// Reads preparation facts from already-loaded canonical-home text. Legacy
// absence and unsupported version stay distinct from recorded facts.
export function readStoryState(source, href) {
  const home = readHome(source, href);
  const blocks = findStoryStateBlocks(home.document.lines, home.region);
  if (blocks.length === 0) {
    return {
      status: "not-recorded",
      identity: namedIdentity(home),
      href: home.href,
      key: home.key,
      source: { path: home.relative, href: home.href },
    };
  }
  if (blocks.length > 1) {
    throw new BacklogError(
      `${home.key} holds ${blocks.length} story-state blocks at lines ` +
        `${blocks.map((block) => block.open + 1).join(" and ")}; a human ` +
        `decides which one this story keeps.`,
    );
  }
  const [block] = blocks;
  const location = `lines ${block.open + 1}-${block.close + 1} of ${home.relative}`;
  const payload = parseStoryStatePayload(block.body, location);
  const sourceInfo = storyStateSourceLocation(home, block.open, block.close);
  const normalized = normalizeRecordedPreparation(payload, sourceInfo);
  return {
    ...normalized,
    identity: namedIdentity(home),
    href: home.href,
    key: home.key,
  };
}

// Applies one preparation record to already-loaded canonical-home text,
// replacing only the selected story's state block. Leaves other stories and
// prose intact. Refuses duplicate blocks, unsupported existing schema, and
// identity mismatch without returning a candidate document.
export function recordStoryState(source, request) {
  requireField(request.href, "link");
  const home = readHome(source, request.href);
  requirePreparationIdentity(home, request.identity);
  const payload = preparationPayload(request);
  const blocks = findStoryStateBlocks(home.document.lines, home.region);
  if (blocks.length > 1) {
    throw new BacklogError(
      `${home.key} holds ${blocks.length} story-state blocks at lines ` +
        `${blocks.map((block) => block.open + 1).join(" and ")}; a human ` +
        `decides which one this story keeps. Nothing was written.`,
    );
  }
  if (blocks.length === 1) {
    const existing = parseStoryStatePayload(
      blocks[0].body,
      `lines ${blocks[0].open + 1}-${blocks[0].close + 1} of ${home.relative}`,
    );
    if (existing.schemaVersion !== storyStateSchemaVersion) {
      throw new BacklogError(
        `${home.key} already holds story-state schema version ` +
          `${JSON.stringify(existing.schemaVersion)}, which this recorder ` +
          `does not support. Nothing was written.`,
      );
    }
  }

  const lines = [...home.document.lines];
  const written = storyStateBlockLines(payload);
  if (blocks.length === 1) {
    const { open, close } = blocks[0];
    lines.splice(open, close - open + 1, ...written);
  } else {
    lines.splice(insertionIndex(home), 0, "", ...written);
  }

  const next = joinSource({ ...home.document, lines });
  const readBack = readStoryState(next, request.href);
  if (readBack.status !== "recorded") {
    throw new BacklogError(
      `Recorded story-state for ${home.key} did not read back as recorded ` +
        `preparation facts.`,
    );
  }
  if (
    readBack.refinement !== payload.refinement ||
    readBack.approach.kind !== payload.approach ||
    (payload.approach === "planned" && readBack.approach.plan !== payload.plan)
  ) {
    throw new BacklogError(
      `Recorded story-state for ${home.key} did not read back as supplied.`,
    );
  }

  return {
    source: next,
    result: blocks.length === 0 ? "recorded" : "replaced",
    state: readBack,
  };
}
