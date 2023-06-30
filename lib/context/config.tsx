/* eslint-disable @typescript-eslint/no-empty-function */
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react';

import { ModelConfig } from '@/types/types';
import { useLocalStorage } from '../hooks/utils/use-localstorage';
import { DEFAULT_PROMPT_TEMPLATE } from '../prompt';

import {
  defaultTheme,
  findMatchingTheme,
  Theme,
  ThemeColorKeys,
  ThemeColors,
} from '../themes';
import useChatbot from '../hooks/use-chatbot';

export type State = {
  placeholder: string;
  modelConfig: ModelConfig;
  setPlaceholder: (placeholder: string) => void;
  setModelConfig: (modelConfig: ModelConfig) => void;
  resetModelConfigDefaults: () => void;
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'gpt-4',
  temperature: 0.1,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 500,
  promptTemplate: DEFAULT_PROMPT_TEMPLATE.template,
  sectionsMatchCount: 10,
  sectionsMatchThreshold: 0.5,
};

export const CONFIG_DEFAULT_VALUES = {
  placeholder: 'Ask me anything…',
};

const initialState: State = {
  placeholder: '',
  modelConfig: DEFAULT_MODEL_CONFIG,
  setPlaceholder: () => {},
  setModelConfig: () => {},
  resetModelConfigDefaults: () => {},
};

const ConfigContextProvider = (props: PropsWithChildren) => {
  const { chatbot } = useChatbot();
  const [placeholder, setPlaceholder] = useLocalStorage<string>(
    `${chatbot?.chatbot_id ?? 'undefined'}:config:placeholder`,
    CONFIG_DEFAULT_VALUES.placeholder,
  );
  const [modelConfig, setModelConfig] = useLocalStorage<ModelConfig>(
    `${chatbot?.chatbot_id ?? 'undefined'}:config:model-config`,
    initialState.modelConfig,
  );
  const resetModelConfigDefaults = useCallback(() => {
    setModelConfig(initialState.modelConfig);
  }, [setModelConfig]);

  return (
    <ConfigContext.Provider
      value={{
        placeholder,
        modelConfig,
        setPlaceholder,
        setModelConfig,
        resetModelConfigDefaults,
      }}
      {...props}
    ></ConfigContext.Provider>
  );
};

export const useConfigContext = (): State => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error(
      `useConfigContext must be used within a ConfigContextProvider`,
    );
  }
  return context;
};

export const ConfigContext = createContext<State>(initialState);
ConfigContext.displayName = 'ConfigContext';

export const ManagedConfigContext: FC<PropsWithChildren> = ({ children }) => (
  <ConfigContextProvider>{children}</ConfigContextProvider>
);
