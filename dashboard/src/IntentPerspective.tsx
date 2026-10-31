import type { PublishedSource } from "./publishedSource.ts";
import "./intent-perspective.css";

// The Intent perspective of the selected project, before any Intent reader
// exists. It says what is forthcoming and claims nothing about the project's
// tests: this dashboard has not read them, so no count, result or absence of
// tests or Proof is shown. Near-future direction, stories and sessions stay
// in Development.
export function IntentPerspective({
  source,
}: {
  readonly source: PublishedSource;
}) {
  return (
    <main className="intent-perspective" aria-labelledby="intent-heading">
      <h2 id="intent-heading" tabIndex={-1}>
        Intent
      </h2>
      <p className="intent-forthcoming">
        Intent for {source.label} is forthcoming.
      </p>
      <p>
        Intent will let you read what {source.label}'s tests say the product
        should do, its Purpose, beside what running them observed, its Proof.
        This dashboard does not read {source.label}'s tests yet, so nothing
        about them is shown here.
      </p>
      <p>Stories, sessions and near-future direction stay in Development.</p>
    </main>
  );
}
