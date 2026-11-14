// @ts-check
// Counts and optional time shared by canonical CI proof evidence construction.
/** @typedef {import("../../../dashboard/src/ciProof.ts").CiProofFigures} CiProofFigures */
/** @typedef {import("./ciProofEvidenceTestData.mjs").ResultFacts} ResultFacts */

/** @param {ResultFacts} facts @returns {CiProofFigures} */
export function figuresOf({
  passed = 1,
  failed = 0,
  other = 0,
  durationMs,
  untimed,
}) {
  const notTimed =
    untimed ?? (durationMs === undefined ? passed + failed + other : 0);
  return {
    passed,
    failed,
    other,
    ...(durationMs === undefined ? {} : { durationMs }),
    ...(notTimed > 0 ? { untimed: notTimed } : {}),
  };
}

/** @param {readonly number[]} values */
const sum = (values) => values.reduce((total, value) => total + value, 0);

/** @param {readonly CiProofFigures[]} figures @returns {CiProofFigures & { untimed: number }} */
export function summed(figures) {
  const durations = figures.flatMap(({ durationMs }) =>
    durationMs === undefined ? [] : [durationMs],
  );
  return {
    passed: sum(figures.map(({ passed }) => passed)),
    failed: sum(figures.map(({ failed }) => failed)),
    other: sum(figures.map(({ other }) => other)),
    ...(durations.length === 0 ? {} : { durationMs: sum(durations) }),
    untimed: sum(figures.map(({ untimed = 0 }) => untimed)),
  };
}
