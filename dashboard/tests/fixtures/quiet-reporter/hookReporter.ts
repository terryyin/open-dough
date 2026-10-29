// A separate observer exposes actual Playwright hook events to reporter tests.
import type {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";
import { writeFileSync } from "node:fs";

export default class HookReporter implements Reporter {
  private readonly hooks: { title: string; duration: number }[] = [];

  constructor(private readonly options: { destination: string }) {}

  onStepEnd(...[, , step]: [TestCase, TestResult, TestStep]): void {
    if (step.category === "hook") {
      this.hooks.push({ title: step.title, duration: step.duration });
    }
  }

  onEnd(): void {
    writeFileSync(this.options.destination, JSON.stringify(this.hooks));
  }
}
