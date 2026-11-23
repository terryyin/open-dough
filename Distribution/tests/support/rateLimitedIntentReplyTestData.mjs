// @ts-check
// An Intent read answered as rate limited: the typed reply a reader receives
// for what it was reading (the Intent locations unless told), resuming a
// number of seconds after it is built. It is the
// dashboard's own ReadProblem, so only pageMakeMe.mjs exposes it; makeMe.mjs
// stays within Distribution, whose modules native evidence identities hash.
import { ReadProblem } from "../../../dashboard/src/readProblem.ts";

export class RateLimitedIntentReplyBuilder {
  #message = "GitHub limited the rate";
  #reading = "locations";
  #seconds = 60;

  /** @param {string} message */
  saying(message) {
    this.#message = message;
    return this;
  }

  /** @param {string} reading */
  reading(reading) {
    this.#reading = reading;
    return this;
  }

  /** @param {number} seconds */
  resumingIn(seconds) {
    this.#seconds = seconds;
    return this;
  }

  please() {
    return new ReadProblem(this.#message, {
      reading: this.#reading,
      resumesAt: new Date(Date.now() + this.#seconds * 1000),
    });
  }
}
