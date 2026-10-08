// A point the review compares or marks: its tree and the trunk baseline it
// was observed against. Marks and snapshot commit items supply these points.
export interface ReviewPoint {
  readonly tree: string;
  readonly baseline: string;
}

// The repository objects a point requires: a tree and a baseline commit.
export const reviewPointObjects = ({ tree, baseline }: ReviewPoint) => [
  `${tree}^{tree}`,
  `${baseline}^{commit}`,
];
