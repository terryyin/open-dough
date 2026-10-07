// A read that did not produce published work. Its message is written for the
// person looking at the dashboard; it never stands in for an empty backlog.
// When GitHub's rate limit stopped the read, it carries what was being read
// and when the page's limit (`./readingLimit.ts`) lets reading resume.
export type LimitedReading = {
  readonly reading: string;
  readonly resumesAt: Date;
};

export class ReadProblem extends Error {
  readonly limited: LimitedReading | undefined;
  constructor(message: string, limited?: LimitedReading) {
    super(message);
    this.name = "ReadProblem";
    this.limited = limited;
  }
}
