// Native Claude UUIDs are scoped by session and worker transcript.
export const claudeWorkerKey = (session: string, agent: string) =>
  JSON.stringify([session, agent]);
export const claudeNodeKey = (
  session: string,
  agent: string | undefined,
  uuid: string,
) => JSON.stringify([session, agent ?? "", uuid]);
