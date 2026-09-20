// A read that did not produce published work. Its message is written for the
// person looking at the dashboard; it never stands in for an empty backlog.
export class ReadProblem extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadProblem";
  }
}
