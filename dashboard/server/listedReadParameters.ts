// Parameter names shared by listed, Done and Intent request parsing.
// Parsing these names never loads the acquisition for the records they name.
export const listedReadParameterNames = {
  agentProfiles: "agents",
  done: "done",
  intent: "intent",
} as const;

export const listedReadParameters: string[] = Object.values(
  listedReadParameterNames,
);
