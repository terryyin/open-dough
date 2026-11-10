import type { PublishedSource } from "../../src/publishedSource.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";

export type StrictCiReadingFacts = {
  readonly source: PublishedSource;
  readonly identity: string;
  readonly answer: StoryCiComparisonAnswer;
};

declare global {
  interface Window {
    mountStrictCiReading(facts: StrictCiReadingFacts): void;
    unmountStrictCiReading?(): void;
    strictCiReads: { url: string; aborted: boolean }[];
  }
}
