// The two repository objects required at each end of a commit range.
export interface ReviewPoint {
  readonly tree: string;
  readonly baseline: string;
}

export const reviewPointObjects = ({ tree, baseline }: ReviewPoint) => [
  `${tree}^{tree}`,
  `${baseline}^{commit}`,
];
