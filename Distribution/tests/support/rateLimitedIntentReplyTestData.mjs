// @ts-check
// The Intent locations read answered as rate limited: the typed reply a
// reader receives, resuming a number of seconds after it is built. It is the
// dashboard's own ReadProblem, so only pageMakeMe.mjs exposes it; makeMe.mjs
// stays within Distribution, whose modules native evidence identities hash.
import { ReadProblem } from "../../../dashboard/src/readProblem.ts";

export class RateLimitedIntentReplyBuilder {
  #message = "GitHub limited the rate";
  #seconds = 60;

  /** @param {string} message */
  saying(message) {
    this.#message = message;
    return this;
  }

  /** @param {number} seconds */
  resumingIn(seconds) {
    this.#seconds = seconds;
    return this;
  }

  please() {
    return new ReadProblem(this.#message, {
      reading: "locations",
      resumesAt: new Date(Date.now() + this.#seconds * 1000),
    });
  }
}
