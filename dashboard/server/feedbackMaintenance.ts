// The feedback-maintenance setting, kept in one file under this machine's
// home so dev and preview share it. The file holds the On choice (host and
// optional model and effort); no file means Off. Read afresh for every use and
// replaced atomically, private to its owner (`0600`) because it authorizes
// sessions no developer asked for; it is a plain setting, not a credential.
// A read never writes: an unreadable or malformed file stays as it is until
// an explicit save replaces it or Off removes it.
import { mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import {
  feedbackMaintenanceChoiceSchema,
  type FeedbackMaintenanceChoice,
  type FeedbackMaintenanceSetting,
} from "../src/feedbackMaintenanceSetting.ts";
import { replaceFile } from "./fileReplacement.ts";
import { machineDashboardPath } from "./machineHome.ts";

export class FeedbackMaintenanceProblem extends Error {}

export function feedbackMaintenanceFile(): string {
  return machineDashboardPath("feedback-maintenance.json");
}

export function readFeedbackMaintenance(): FeedbackMaintenanceSetting {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(feedbackMaintenanceFile(), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { enabled: false };
    throw new FeedbackMaintenanceProblem(
      "The saved feedback maintenance setting could not be read. Check its file permissions, or turn feedback maintenance on or off to replace it.",
    );
  }
  const choice = feedbackMaintenanceChoiceSchema.safeParse(value);
  if (!choice.success)
    throw new FeedbackMaintenanceProblem(
      "The saved feedback maintenance setting is not one this dashboard knows, so nothing is authorized. Turn feedback maintenance on or off to replace it.",
    );
  return { enabled: true, choice: choice.data };
}

export function saveFeedbackMaintenance(
  choice: FeedbackMaintenanceChoice,
): void {
  const file = feedbackMaintenanceFile();
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    replaceFile(file, `${JSON.stringify(choice)}\n`, 0o600);
  } catch {
    throw new FeedbackMaintenanceProblem(
      "The feedback maintenance setting could not be saved. Check the dashboard folder permissions and retry; the previous setting was kept.",
    );
  }
}

export function removeFeedbackMaintenance(): void {
  try {
    unlinkSync(feedbackMaintenanceFile());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw new FeedbackMaintenanceProblem(
      "Feedback maintenance could not be turned off. Check the dashboard folder permissions and retry; the previous setting was kept.",
    );
  }
}
