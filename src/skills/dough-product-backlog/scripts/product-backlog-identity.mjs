// What a work item's identity is. An identity is spelled from the canonical
// home its entry links, so reading one off a written entry, composing one for
// a new entry, and checking that a supplied one is actually named by the link
// are all the same question asked from different sides. They are asked here,
// so the spelling has one owner and a link and an identity that disagree are
// always handed to a human in the same words.

import { BacklogError } from "./product-backlog-refusal.mjs";

export const adoptionHint =
  "Identities are never allocated here; take one from the work item's " +
  "canonical home or from the separate identity-adoption operation.";

export function ambiguousHome(reason) {
  return new BacklogError(
    `Ambiguous canonical home: ${reason} ${adoptionHint}`,
  );
}

// A backlog link names a canonical home and, when that home holds more than
// one story, the anchor of the story inside it. Everything that reads or
// records an identity takes a link apart here.
export function splitHref(href) {
  const marker = href.indexOf("#");
  return marker === -1
    ? { path: href, anchor: "" }
    : { path: href.slice(0, marker), anchor: href.slice(marker + 1) };
}

// How an identity is spelled: the ID the canonical home carries, narrowed by
// the story anchor when there is one. Deriving and adopting an identity both
// compose it here, so the spelling has one owner.
export function composeIdentity(token, anchor) {
  return anchor ? `${token}#${anchor}` : token;
}

// The identity a written entry reads as: its recorded token narrowed by the
// link's anchor, or the bare link when no identity has been adopted yet.
export function identityFor(href, token) {
  if (!token) {
    return href;
  }
  return composeIdentity(token, splitHref(href).anchor);
}

// An identity must already be named by the canonical home it points at. This
// establishes which token, if any, the written entry carries.
export function tokenFor(identity, href) {
  const { path, anchor } = splitHref(href);

  if (identity.includes("#")) {
    const { path: token, anchor: expected } = splitHref(identity);
    if (expected !== anchor) {
      throw ambiguousHome(
        `identity "${identity}" names anchor "${expected}" but the link ` +
          `names "${anchor || "no anchor"}".`,
      );
    }
    if (token === "" || !path.includes(token)) {
      throw ambiguousHome(
        `identity "${identity}" names "${token}" but the link path ` +
          `"${path}" does not.`,
      );
    }
    return token;
  }

  if (identity.includes("/")) {
    if (identity !== href) {
      throw ambiguousHome(
        `path identity "${identity}" does not match the link "${href}".`,
      );
    }
    return "";
  }

  if (anchor !== "") {
    throw ambiguousHome(
      `identity "${identity}" names no anchor but the link names ` +
        `"${anchor}".`,
    );
  }
  if (!path.includes(identity)) {
    throw ambiguousHome(
      `identity "${identity}" is not named by the link path "${path}".`,
    );
  }
  return identity;
}
