// The shared session-policy contract: three independent choices, their
// defaults, and the invocation flags that select their other values.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  needsPublicationAuthority,
  sessionPolicy,
  sessionPolicyChoices,
  sessionPolicyFlags,
  sessionPolicyToggles,
  withSelectedLanding,
} from "./session-policy.mjs";

test("absent options compose standard tracking in an isolated workspace that waits for review", () => {
  const expected = {
    tracking: "standard",
    workspace: "isolated",
    landing: "review",
  };
  assert.deepEqual(sessionPolicy(), expected);
  assert.deepEqual(sessionPolicy({}), expected);
});

test("one-shot alone keeps isolation and review", () => {
  assert.deepEqual(sessionPolicy({ oneShot: true }), {
    tracking: "one-shot",
    workspace: "isolated",
    landing: "review",
  });
});

test("each option selects only its own choice", () => {
  assert.deepEqual(sessionPolicy({ defaultMain: true }), {
    tracking: "standard",
    workspace: "default-checkout",
    landing: "review",
  });
  assert.deepEqual(sessionPolicy({ autoLand: true }), {
    tracking: "standard",
    workspace: "isolated",
    landing: "auto-land",
  });
  assert.deepEqual(
    sessionPolicy({ oneShot: true, defaultMain: true, autoLand: true }),
    {
      tracking: "one-shot",
      workspace: "default-checkout",
      landing: "auto-land",
    },
  );
});

test("only an explicit true selects a choice", () => {
  assert.deepEqual(
    sessionPolicy({ oneShot: "true", defaultMain: 1, autoLand: false }),
    sessionPolicy(),
  );
});

test("the invocation flags map one-to-one onto the request options", () => {
  assert.deepEqual(sessionPolicyToggles, {
    "--one-shot": "oneShot",
    "--default-main": "defaultMain",
    "--auto-land": "autoLand",
  });
  for (const [flag, option] of Object.entries(sessionPolicyToggles)) {
    const selected = Object.entries(sessionPolicy({ [option]: true })).filter(
      ([choice, value]) => value !== sessionPolicyChoices[choice].values[0],
    );
    assert.equal(selected.length, 1, flag);
  }
  assert.ok(Object.isFrozen(sessionPolicyChoices));
  assert.ok(Object.isFrozen(sessionPolicyChoices.landing.values));
});

test("a policy renders back to the flags that select it, in choice order", () => {
  assert.deepEqual(sessionPolicyFlags(sessionPolicy()), []);
  assert.deepEqual(sessionPolicyFlags(), []);
  for (const options of [
    { oneShot: true },
    { oneShot: true, defaultMain: true },
    { oneShot: true, autoLand: true },
    { oneShot: true, defaultMain: true, autoLand: true },
  ]) {
    const flags = sessionPolicyFlags(sessionPolicy(options));
    assert.deepEqual(
      Object.fromEntries(
        flags.map((flag) => [sessionPolicyToggles[flag], true]),
      ),
      options,
    );
  }
  assert.deepEqual(
    sessionPolicyFlags({
      landing: "auto-land",
      tracking: "one-shot",
      workspace: "default-checkout",
    }),
    ["--one-shot", "--default-main", "--auto-land"],
  );
});

test("only tracked work or an automatically landed one-shot result needs publication authority", () => {
  assert.equal(needsPublicationAuthority(sessionPolicy()), true);
  assert.equal(
    needsPublicationAuthority(sessionPolicy({ oneShot: true })),
    false,
  );
  assert.equal(
    needsPublicationAuthority(sessionPolicy({ oneShot: true, autoLand: true })),
    true,
  );
});

test("a successful start receipt reports only a selected automatic landing", () => {
  const prepared = { ok: true, status: "prepared" };
  const autoLand = sessionPolicy({ oneShot: true, autoLand: true });
  assert.deepEqual(withSelectedLanding(prepared, autoLand), {
    ...prepared,
    landing: "auto-land",
  });
  assert.deepEqual(
    withSelectedLanding(prepared, sessionPolicy({ oneShot: true })),
    prepared,
  );
  const refused = { ok: false, status: "source-refused" };
  assert.deepEqual(withSelectedLanding(refused, autoLand), refused);
});

test("the module imports nothing, so a browser can share it", () => {
  const source = readFileSync(new URL("./session-policy.mjs", import.meta.url));
  assert.doesNotMatch(String(source), /^\s*import\b/m);
});
