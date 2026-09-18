// The one rule this whole reconciliation is made of, asked of one value, of
// one work item, and of one list's order.
//
// A value a branch left as the ancestor wrote it accepts the other branch's
// change; a change both branches made the same way is applied once; and two
// different changes to one value are a decision this tool does not make and
// hands back instead. Nothing here prefers a branch or unions what survives: a
// value that is unchanged on one side is no evidence at all about the other
// side's change, which is what keeps an entry no branch touched from bringing
// back an entry a branch removed.

import { stateOf, valueNames } from "./product-backlog-version.mjs";

// The one rule, on one value.
export function mergeValue(ancestor, one, other) {
  if (one === other) {
    return { value: one };
  }
  if (one === ancestor) {
    return { value: other };
  }
  if (other === ancestor) {
    return { value: one };
  }
  return {};
}

export function sameState(one, other) {
  if (one === null || other === null) {
    return one === other;
  }
  return Object.keys(valueNames).every((name) => one[name] === other[name]);
}

// The same rule on one work item. Membership is not a value apart from the
// rest: a branch that removed an item and a branch that changed it have stated
// different intentions about the same work, and no lifecycle order decides
// between them, so that is handed back rather than resolved.
export function mergeWork(group, versions) {
  const [ancestor, one, other] = versions.map((version) =>
    stateOf(group.states.get(version.label)),
  );
  const named = (one ?? other ?? ancestor).identity;

  if (sameState(one, ancestor)) {
    return { state: other };
  }
  if (sameState(other, ancestor)) {
    return { state: one };
  }
  if (sameState(one, other)) {
    return { state: one };
  }

  if (one === null || other === null) {
    const removed = one === null ? versions[1] : versions[2];
    const changed = one === null ? versions[2] : versions[1];
    return {
      conflict:
        `"${named}": ${removed.label} removes it while ${changed.label} ` +
        `changes it. Removing work and changing it are different intentions, ` +
        `and which one applies is not established by these versions.`,
    };
  }

  const state = {};
  const clashes = new Set();
  for (const name of Object.keys(valueNames)) {
    const merged = mergeValue(ancestor?.[name], one[name], other[name]);
    if ("value" in merged) {
      state[name] = merged.value;
    } else {
      clashes.add(
        `"${named}": the versions give it different ${valueNames[name]} — ` +
          `${versions[1].label} has "${one[name]}" and ${versions[2].label} ` +
          `has "${other[name]}".`,
      );
    }
  }
  return clashes.size > 0 ? { conflict: [...clashes].join("\n") } : { state };
}

// Two orderings agree when the items both of them hold come in the same
// sequence. Comparing only what they share is what keeps an item one branch
// took, added, or removed from reading as the other branch reordering a list
// it never touched.
export function sameOrder(one, other) {
  const shared = new Set(one.filter((key) => other.includes(key)));
  const held = one.filter((key) => shared.has(key));
  const also = other.filter((key) => shared.has(key));
  return (
    held.length === also.length && held.every((key, at) => key === also[at])
  );
}

// The same rule again, on a list's order. This establishes only the relative
// order the versions already agree on; where a newly listed item belongs among
// the others is a priority decision, not an ordering this can infer.
export function mergeOrder(ancestor, one, other) {
  if (sameOrder(one, ancestor)) {
    return { value: other };
  }
  if (sameOrder(other, ancestor)) {
    return { value: one };
  }
  if (sameOrder(one, other)) {
    return { value: one };
  }
  return {};
}
