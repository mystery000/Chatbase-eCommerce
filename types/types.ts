export type FileData = { path: string; name: string; content: string };

export type Message = {
  type: 'AIMESSAGE' | 'CLIENTMESSAGE';
  message: string;
};

export type OpenAIChatCompletionsModelId =
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0301';

export type OpenAICompletionsModelId =
  | 'text-davinci-003'
  | 'text-davinci-002'
  | 'text-curie-001'
  | 'text-babbage-001'
  | 'text-ada-001'
  | 'davinci'
  | 'curie'
  | 'babbage'
  | 'ada';

export type OpenAIEmbeddingsModelId = 'text-embedding-ada-002';

export type OpenAIModelId =
  | OpenAIChatCompletionsModelId
  | OpenAICompletionsModelId
  | OpenAIEmbeddingsModelId;

export type ModelConfig = {
  model: OpenAIModelId;
  promptTemplate: string;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  sectionsMatchCount: number;
  sectionsMatchThreshold: number;
};

export type CrawledData = {
  characters: number;
  content: string;
};
