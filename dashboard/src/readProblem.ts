// A read that did not produce published work. Its message is written for the
// person looking at the dashboard; it never stands in for an empty backlog.
// When GitHub's rate limit stopped the read, it carries when the page's
// limit (`./readingLimit.ts`) lets reading resume.
export class ReadProblem extends Error {
  readonly resumesAt: Date | undefined;
  constructor(message: string, resumesAt?: Date) {
    super(message);
    this.name = "ReadProblem";
    this.resumesAt = resumesAt;
  }
}
