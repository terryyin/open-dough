import { localSettingRequest } from "./localSettingRequest.ts";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
  type OpenAIConfigurationStatus,
} from "./openAIConfiguration.ts";

export const openAIUpdateFailure =
  "OpenAI configuration could not be updated. Retry the operation.";

export type OpenAIConfigurationSource = {
  readonly read: () => Promise<OpenAIConfigurationStatus>;
  readonly save: (apiKey: string) => Promise<OpenAIConfigurationStatus>;
  readonly remove: () => Promise<OpenAIConfigurationStatus>;
};

async function configurationRequest(
  endpoint: string,
  body?: { readonly apiKey?: string },
): Promise<OpenAIConfigurationStatus> {
  const answer = await localSettingRequest(endpoint, body, openAIUpdateFailure);
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("configured" in answer) ||
    typeof answer.configured !== "boolean"
  )
    throw new Error(
      "OpenAI configuration could not be read. Retry the operation.",
    );
  return { configured: answer.configured };
}

export const pageOpenAIConfigurationSource: OpenAIConfigurationSource = {
  read: () => configurationRequest(openAIConfigurationEndpoint),
  save: (apiKey) => configurationRequest(openAISaveEndpoint, { apiKey }),
  remove: () => configurationRequest(openAIRemoveEndpoint, {}),
};
