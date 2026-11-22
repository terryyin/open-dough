// @ts-check
// The Intent locations read answered as unreachable: the typed reply a reader
// receives when the local authenticated read could not be reached while
// reading the project's settings at a revision. It is the dashboard's own
// ReadProblem, so only pageMakeMe.mjs exposes it; makeMe.mjs stays within
// Distribution, whose modules native evidence identities hash.
import { ReadProblem } from "../../../dashboard/src/readProblem.ts";

export class UnreachableIntentReplyBuilder {
  #path = ".planning/open-dough.json";
  #revision = "";

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
