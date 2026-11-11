import type { ScopeHistoryEndpoint } from "../../src/ciScopeHistory.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import type { ReviewedFile } from "../../src/storyReviewFiles.ts";

export type ComparisonScope = {
  readonly locations: readonly IntentLocation[];
  readonly changed: readonly ReviewedFile[];
  readonly revision: string;
  // Serializable selection DTO; the browser hands it to the public callbacks.
  readonly selection: {
    readonly path: string;
    readonly scope?: "location" | "folder" | "file";
    readonly caseTarget?: string;
  };
};

export type ComparisonMount = {
  readonly source: PublishedSource;
  readonly work: PublishedWork;
  readonly identity: string | undefined;
  readonly scope?: ComparisonScope | undefined;
  readonly doneEndpoint?: ScopeHistoryEndpoint;
  readonly shown?: boolean;
};
export type ComparisonSelection = Pick<
  ComparisonMount,
  "work" | "identity" | "scope" | "doneEndpoint" | "shown"
>;

declare global {
  interface Window {
    mountCiComparison(facts: ComparisonMount): void;
    updateCiComparison(facts: ComparisonSelection): void;
    unmountCiComparison(): void;
  }
}
