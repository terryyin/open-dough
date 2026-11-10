export const projectListEndpoint = "/__project-configuration";
export const projectAddEndpoint = `${projectListEndpoint}/add`;
export const projectRemoveEndpoint = `${projectListEndpoint}/remove`;
export const projectVisibilityEndpoint = `${projectListEndpoint}/visibility`;

// Local configuration facts for the machine settings view only.
export const projectSettingsEndpoint = `${projectListEndpoint}/settings`;

// On-disk Client configuration text for one project's checkout, or why it
// cannot be shown. Settings never invent defaults as if they were the file.
export type ClientConfigurationInspection =
  | { readonly status: "readable"; readonly text: string }
  | { readonly status: "absent" }
  | { readonly status: "unreadable" };

export type ProjectSettings = {
  readonly id: string;
  readonly localPath: string;
  readonly clientConfiguration: ClientConfigurationInspection;
};
