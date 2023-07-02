/* eslint-disable @typescript-eslint/no-empty-function */
import { ModelConfig } from '@/types/types';

export const DEFAULT_PROMPT_TEMPLATE = {
  name: 'Default',
  template: `I want you to act as a document that I have a conversation with.\nYour name is "AI Assistant."You will give me answers from the given information.\nIf the answer is not there, say exactly, "I didn't find anything about that." and then stop.Refuse to answer a question that doesn't pertain to the info.Never break character.\nAnswer only in German unless otherwise requested, and please do not give general medical advice from your basic data, but limit the information to the given document.\n\n{context}\n\nQuestion: {question}\nHelpful answer in markdown:`,
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 500,
  promptTemplate: DEFAULT_PROMPT_TEMPLATE.template,
  sectionsMatchCount: 10,
  sectionsMatchThreshold: 0.5,
};

const initial_messages = ['Hi! What can I help you with?'];

export const DEFAULT_CONFIG_VALUES = {
  visibility: 'public',
  ip_limit: 20,
  ip_limit_message: 'Too many messages in a row',
  ip_limit_timeframe: 240,
  initial_messages: initial_messages,
};

export const DEFAULT_CONTACT_INFO = {
  title: 'Let us know how to contact you',
  name: { active: false, label: 'Name' },
  email: { active: false, label: 'Email' },
  phone: { active: false, label: 'Phone Number' },
};
