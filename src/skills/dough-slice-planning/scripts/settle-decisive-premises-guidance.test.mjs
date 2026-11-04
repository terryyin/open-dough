import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Guidance proof that a decisive premise settles only in the form and profile
// its slice uses, and that its plan row records the fields readiness and
// execution read. Per ADR 0005 section 2 these assertions check
// meaning-bearing phrases, not exact sentences.

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
// Collapsed to single spaces so line wrapping does not affect matching.
const flat = (text) => text.replace(/\s+/g, " ");

const premises = () =>
  flat(read("dough-slice-planning/references/settle-decisive-premises.md"));

test("a premise settles only in the same form and profile the slice uses", () => {
  assert.match(
    premises(),
    /settled only when[^.]*consuming operation in the same form and profile the slice uses/i,
  );
  assert.match(premises(), /flags or interpreter mode, the named input/i);
});

test("a different form or profile is a proxy that leaves the unverified condition named", () => {
  assert.match(premises(), /different form or profile is a proxy/i);
  assert.match(
    premises(),
    /proxy settles the premise only when the plan records why the difference cannot change the outcome/i,
  );
  assert.match(
    premises(),
    /otherwise leave the premise open and name the unverified input or host condition/i,
  );
});

test("a premise row records operation, form and profile, time or revision, result and remainder", () => {
  assert.match(
    premises(),
    /consuming operation, the form and profile observed[^.]*when or at which revision, the result, and any unverified remainder/i,
  );
});

test("a matching retained observation settles by citation until its paths move", () => {
  assert.match(
    premises(),
    /retained observation that already reached the same form and profile/i,
  );
  assert.match(premises(), /cited with its time or revision and result/i);
  assert.match(premises(), /no re-run/i);
  assert.match(
    premises(),
    /moved past that revision on the paths[^.]*reopens the premise/i,
  );
});

test("a promised selected set derives a premise from the selecting code", () => {
  assert.match(premises(), /names a selected set or restriction/i);
  assert.match(premises(), /read the selecting code before sizing the slice/i);
});
