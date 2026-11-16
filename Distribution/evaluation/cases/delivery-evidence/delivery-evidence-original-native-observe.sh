#!/usr/bin/env bash
# Retain host-attributed operations and actual product results for explicit
# review. No string recognizer judges whether the original promise was found.
# shellcheck disable=SC2154,SC2312

delivery_evidence_original_product_observation() {
  local workspace=$1
  (
    cd -- "${workspace}" || exit
    node --input-type=module << 'JS'
import { reviewStory, readinessView } from './lib/readiness.mjs';
import { waitingStory, resolved } from './tests/readiness-fixture.mjs';
const story = waitingStory();
const observations = {};
for (const format of ['current', 'legacy']) {
  const review = reviewStory(story, format);
  observations[format] = {
    unchanged: readinessView(review, story),
    supplierResolved: readinessView(review, resolved(story)),
    goalEdited: readinessView(review, { ...story, goal: 'Edited goal.' }),
  };
}
console.log(JSON.stringify(observations, null, 2));
JS
  )
}

delivery_evidence_original_observe() {
  delivery_evidence_observe_source_acceptance "$@" \
    delivery_evidence_original_product_observation node --test tests/readiness.test.mjs
}

delivery_evidence_original_retain_review_artifacts() {
  delivery_evidence_retain_source_acceptance lib tests
}
