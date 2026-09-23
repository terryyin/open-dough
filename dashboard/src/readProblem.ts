// A read that did not produce published work. Its message is written for the
// person looking at the dashboard; it never stands in for an empty backlog.
// When GitHub asked the local `gh` login to wait before asking again, the
// wait comes along, so automatic checks (`./publishedObservation.ts`) honor it.
export class ReadProblem extends Error {
  readonly retryAfterSeconds: number | undefined;
  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ReadProblem";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
