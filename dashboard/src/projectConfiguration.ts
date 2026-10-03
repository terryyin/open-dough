export const projectListEndpoint = "/__project-configuration";
export const projectAddEndpoint = `${projectListEndpoint}/add`;
export const projectRemoveEndpoint = `${projectListEndpoint}/remove`;

// Local configuration facts for the machine settings view only.
export const projectSettingsEndpoint = `${projectListEndpoint}/settings`;
export type ProjectSettings = {
  readonly id: string;
  readonly localPath: string;
};
