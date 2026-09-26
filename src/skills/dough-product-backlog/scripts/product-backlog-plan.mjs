// What an entry's active plan link says and where it has to point. Claiming
// work writes that link and refreshing a reference repoints it, so both settle
// the question here rather than each spelling out what a plan path means.
//
// This owns no judgment about a plan's content: a link this accepts can still
// be refused by an operation that needs more of the document than its path.

import { resolve } from "node:path";
import { splitHref } from "./product-backlog-identity.mjs";
import { readFile } from "./product-backlog-store.mjs";

// How the established backlog spells an active plan link.
export const planLabel = "plan";

// The plan file a link names. A `#fragment` is navigation inside that plan,
// never part of which plan the link is.
function planFileOf(target) {
  return splitHref(target).path;
}

// Whether an entry's recorded plan link already links the plan `target`
// names: both name the same plan file, whichever section either points into.
export function linksPlan(link, target) {
  return planFileOf(link) === planFileOf(target);
}

// The check is mechanical and existence-only: the file the target names must
// resolve relative to the backlog's own directory. `hint` says what the caller of
// that particular operation can do about a plan that is not there, because
// claiming work and repointing an established link differ in that.
export function requireResolvedPlan(backlogDirectory, target, hint) {
  readFile(
    resolve(backlogDirectory, planFileOf(target)),
    `Unresolved plan: ${target} is not there, relative to the backlog. ${hint}`,
  );
}
