// Preconditions for the feedback maintenance check: a published watch list
// whose review block names a due date, and this machine's standing
// authorization written as the System settings section saves it.
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { localDate } from "../../src/feedbackMaintenanceDue.ts";
import { feedbackReviewFence } from "../../src/feedbackReview.ts";
import type { FeedbackMaintenanceChoice } from "../../src/feedbackMaintenanceSetting.ts";

// The local date `days` from today.
export function dayFromToday(days: number): string {
  const at = new Date();
  at.setDate(at.getDate() + days);
  return localDate(at);
}

// The watch list's text with its next review due on `reviewAfter`.
export function dueWatchList(
  reviewAfter: string,
  reviewed: string = reviewAfter,
): string {
  return [
    "# Near-term watch list",
    "",
    `\`\`\`${feedbackReviewFence}`,
    JSON.stringify({ schemaVersion: 1, reviewed, reviewAfter }),
    "```",
    "",
  ].join("\n");
}

const settingFile = (home: string) =>
  path.join(home, ".open-dough", "dashboard", "feedback-maintenance.json");

// Turns the standing authorization on in `home` with `choice`.
export function authorizeFeedbackMaintenance(
  home: string,
  choice: FeedbackMaintenanceChoice,
): void {
  const file = settingFile(home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(choice));
  chmodSync(file, 0o600);
}

// Turns the standing authorization off in `home`.
export function withdrawFeedbackMaintenance(home: string): void {
  rmSync(settingFile(home), { force: true });
}
