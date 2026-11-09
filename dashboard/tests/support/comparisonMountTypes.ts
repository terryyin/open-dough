import type { PublishedWork } from "../../src/publishedWork.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";

export type ComparisonMount = {
  readonly source: PublishedSource;
  readonly work: PublishedWork;
  readonly identity: string;
};
export type ComparisonSelection = Pick<ComparisonMount, "work" | "identity">;

declare global {
  interface Window {
    mountCiComparison(facts: ComparisonMount): void;
    updateCiComparison(facts: ComparisonSelection): void;
    unmountCiComparison(): void;
  }
}
