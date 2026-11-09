// @ts-check
// The simplest MakeMe builder (./makeMe.mjs): it answers exactly the facts
// a case states, whole, for a product value with no meaningful defaults.

/**
 * @template {object} Facts
 * @typedef {{ with(facts: Facts): { please(): Facts } }} FactBuilder
 */

/**
 * @template {object} Facts
 * @param {Facts} facts
 */
export function copyFacts(facts) {
  return { please: () => ({ ...facts }) };
}
