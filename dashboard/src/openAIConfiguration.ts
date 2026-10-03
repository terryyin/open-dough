// General machine-local OpenAI access; browser reads contain status only.
export const openAIConfigurationEndpoint = "/__openai-configuration";
export const openAISaveEndpoint = `${openAIConfigurationEndpoint}/save`;
export const openAIRemoveEndpoint = `${openAIConfigurationEndpoint}/remove`;
export type OpenAIConfigurationStatus = { readonly configured: boolean };
