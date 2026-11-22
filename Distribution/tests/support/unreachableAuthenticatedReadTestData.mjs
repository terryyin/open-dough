// @ts-check
// The local authenticated read answered as unreachable: the typed reply a
// reader receives when that read could not be reached while reading a file
// (the project's Intent settings unless told) at a revision. It is the
// dashboard's own ReadProblem, so only pageMakeMe.mjs exposes it; makeMe.mjs
// stays within Distribution, whose modules native evidence identities hash.
import { ReadProblem } from "../../../dashboard/src/readProblem.ts";

export class UnreachableAuthenticatedReadBuilder {
  #path = ".planning/open-dough.json";
  #revision = "";

  /** @param {string} path */
  reading(path) {
    this.#path = path;
    return this;
  }

  /** @param {string} revision */
  at(revision) {
    this.#revision = revision;
    return this;
  }

  please() {
    const reading =
      this.#revision === "" ? this.#path : `${this.#path} at ${this.#revision}`;
    return new ReadProblem(
      `The local authenticated read could not be reached while reading ${reading}.`,
      undefined,
      "transient",
    );
  }
}
