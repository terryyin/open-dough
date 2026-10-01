// One session's policy: three independent choices a request composes, each
// with its default and the invocation flag that selects its other value.
// Tracking is the ordinary assignment lifecycle or explicitly selected
// one-shot work; workspace is an isolated owned checkout or the default
// checkout; landing waits for review or lands automatically. A flag selects
// only its own choice. Which combinations a workflow supports is that
// workflow's decision, not this module's. Policy spelling has one owner here.
// No filesystem, Git, or Node-only imports.

export const sessionPolicyChoices = Object.freeze({
  tracking: Object.freeze({
    values: Object.freeze(["standard", "one-shot"]),
    flag: "--one-shot",
    option: "oneShot",
  }),
  workspace: Object.freeze({
    values: Object.freeze(["isolated", "default-checkout"]),
    flag: "--default-main",
    option: "defaultMain",
  }),
  landing: Object.freeze({
    values: Object.freeze(["review", "auto-land"]),
    flag: "--auto-land",
    option: "autoLand",
  }),
});

// Each invocation flag and the request option it sets to true.
export const sessionPolicyToggles = Object.freeze(
  Object.fromEntries(
    Object.values(sessionPolicyChoices).map(({ flag, option }) => [
      flag,
      option,
    ]),
  ),
);

// The policy a request's options compose: an option set to true selects its
// choice's second value; anything else keeps the default first value.
export function sessionPolicy(options = {}) {
  return Object.fromEntries(
    Object.entries(sessionPolicyChoices).map(([choice, { values, option }]) => [
      choice,
      values[options[option] === true ? 1 : 0],
    ]),
  );
}
