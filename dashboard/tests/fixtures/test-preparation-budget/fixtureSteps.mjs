// Records each case's start and every fixture step's interval, so the outer
// proof can place held preparation against case time.
import { appendFileSync } from "node:fs";

const file = process.env["OPEN_DOUGH_PREPARATION_PROOF_STEPS"];
const write = (entry) => {
  if (file !== undefined) appendFileSync(file, `${JSON.stringify(entry)}\n`);
};

export default class FixtureSteps {
  onTestBegin(test, result) {
    write({ event: "case", title: test.title, at: result.startTime.getTime() });
  }
  onStepEnd(test, ...[, step]) {
    if (step.category !== "fixture") return;
    write({
      event: "fixture",
      case: test.title,
      title: step.title,
      start: step.startTime.getTime(),
      end: step.startTime.getTime() + step.duration,
    });
  }
  onTestEnd(test, result) {
    write({
      event: "end",
      title: test.title,
      duration: result.duration,
      status: result.status,
    });
  }
}
