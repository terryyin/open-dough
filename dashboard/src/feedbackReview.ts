// The feedback review's due block: the shared-feedback cycle records, in the
// near-term watch list (`docs/maintainer/near-term-watch-list.md`), when it
// last reviewed and when its next review is due, as one fenced
// `json dough-feedback-review` block. This reader finds that block in the
// list's text and returns its two dates; it follows the story-state fence's
// shape (one versioned JSON object inside a named fence) and has no Node
// import, so the server and the browser read the same answer. Placement
// directly below the heading is the writer's rule; the reader accepts the one
// block wherever it sits.

export const feedbackWatchListPath = "docs/maintainer/near-term-watch-list.md";
export const feedbackReviewFence = "json dough-feedback-review";

const openFenceLine = `\`\`\`${feedbackReviewFence}`;
const closeFenceLine = "```";

// What the watch list says about the next review: its dates, no block, or a
// block that cannot be trusted and why.
export type FeedbackReview =
  | { kind: "scheduled"; reviewed: string; reviewAfter: string }
  | { kind: "absent" }
  | { kind: "invalid"; reason: string };

export function readFeedbackReview(text: string): FeedbackReview {
  const lines = text.split(/\r?\n/);
  const bodies: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index]?.trimEnd() !== openFenceLine) {
      continue;
    }
    const close = lines.findIndex(
      (line, cursor) => cursor > index && line.trimEnd() === closeFenceLine,
    );
    if (close === -1) {
      return invalid(`the block opened at line ${index + 1} is not closed`);
    }
    bodies.push(lines.slice(index + 1, close).join("\n"));
    index = close;
  }
  const [body, ...others] = bodies;
  if (body === undefined) {
    return { kind: "absent" };
  }
  if (others.length > 0) {
    return invalid(`the watch list holds ${bodies.length} blocks, not one`);
  }
  return parsePayload(body);
}

function parsePayload(body: string): FeedbackReview {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return invalid("the block is not valid JSON");
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return invalid("the block is not one JSON object");
  }
  const { schemaVersion, reviewed, reviewAfter } = value as Record<
    string,
    unknown
  >;
  if (schemaVersion !== 1) {
    return invalid(`schemaVersion ${JSON.stringify(schemaVersion)} is not 1`);
  }
  if (!isCalendarDate(reviewed)) {
    return invalid(`reviewed ${JSON.stringify(reviewed)} is not a date`);
  }
  if (!isCalendarDate(reviewAfter)) {
    return invalid(`reviewAfter ${JSON.stringify(reviewAfter)} is not a date`);
  }
  if (reviewAfter < reviewed) {
    return invalid(`reviewAfter ${reviewAfter} is before reviewed ${reviewed}`);
  }
  return { kind: "scheduled", reviewed, reviewAfter };
}

// A YYYY-MM-DD string naming a real calendar day.
function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) {
    return false;
  }
  const [year, month, day] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function invalid(reason: string): FeedbackReview {
  return { kind: "invalid", reason };
}
