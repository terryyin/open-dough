// Preconditions for the feedback maintenance check: a published watch list
// whose review block names a due date, and this machine's standing
// authorization written as the System settings section saves it.
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { localDate } from "../../src/feedbackMaintenanceDue.ts";
import { feedbackReviewFence } from "../../src/feedbackReview.ts";
import type { FeedbackMaintenanceChoice } from "../../src/feedbackMaintenanceSetting.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { feedbackReviewPayload } from "../../../tests/support/feedbackTestData.mjs";

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
    JSON.stringify(
      feedbackReviewPayload(
        makeMe.aFeedbackReview.with({ reviewed, reviewAfter }).please(),
      ),
    ),
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
  writeFileSync(
    file,
    JSON.stringify(makeMe.aFeedbackMaintenanceChoice.with(choice).please()),
  );
  chmodSync(file, 0o600);
}

// Turns the standing authorization off in `home`.
export function withdrawFeedbackMaintenance(home: string): void {
  rmSync(settingFile(home), { force: true });
}
