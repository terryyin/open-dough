// Published repository facts shared by browser and server. The local dashboard
// server owns the configured list and its local checkout paths.
export type PublishedSource = {
  readonly id: string;
  readonly label: string;
  readonly repository: string;
  readonly ref: string;
  readonly backlogPath: string;
};
