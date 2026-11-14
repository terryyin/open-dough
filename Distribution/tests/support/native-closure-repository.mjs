// @ts-check
// The closure fixture's initial published revision. Product programs, ignore
// rules, workflow YAML and installed harness layers are already at the target;
// competing commits, worktrees and publication remain real shell operations.
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const [target, name, email] = process.argv.slice(2);
if (!target || !name || !email)
  throw new Error("usage: native-closure-repository.mjs TARGET AUTHOR EMAIL");
const description = makeMe.aRepository
  .withCheckoutIdentity({ name, email })
  .withRevision("base", { backlog: null })
  .please();
await materializeLocalCheckout(undefined, description, { at: target });
