import {
  HUGGINGFACE_SVG_DATA_URI,
  META_BLACK_SVG_DATA_URI,
  META_BLUE_SVG_DATA_URI,
  OPENAI_GPT_4_SVG_DATA_URI,
  OPENAI_SVG_DATA_URI,
} from "./icons";
import { AIProviderModel, AIProvider, AIProviderID, AIModel } from "./types";

export const MODELS: AIProviderModel = {
  openai: [
    {
      id: "gpt-3.5-turbo",
      fullName: "GPT 3.5 Turbo",
      imgURL: OPENAI_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 250,
      },
    },
    {
      id: "gpt-3.5-turbo-16k",
      fullName: "GPT 3.5 Turbo 16K",
      imgURL: OPENAI_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 250,
      },
    },
    {
      id: "gpt-4",
      fullName: "GPT 4.0",
      imgURL: OPENAI_GPT_4_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 250,
      },
    },
    {
      id: "gpt-3.5-turbo-instruct",
      fullName: "GPT 3.5 Turbo Instruct",
      imgURL: OPENAI_SVG_DATA_URI,
      promptType: "default",
      modelType: "completion",
      options: {
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 250,
      },
    },
  ],
  huggingface: [
    {
      id: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
      fullName: "OpenAssistant Pythia 12B",
      imgURL: HUGGINGFACE_SVG_DATA_URI,
      promptType: "openassistant",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 0.9,
        max_new_tokens: 250,
      },
    },
    {
      id: "bigcode/starcoder",
      fullName: "Star Coder",
      imgURL: HUGGINGFACE_SVG_DATA_URI,
      promptType: "default",
      modelType: "completion",
      options: {
        temperature: 0.9,
        top_p: 0.9,
        max_new_tokens: 190,
      },
    },
    {
      id: "mistralai/Mistral-7B-v0.1",
      fullName: "Mistral 7B",
      imgURL: HUGGINGFACE_SVG_DATA_URI,
      promptType: "default",
      modelType: "completion",
      options: {
        temperature: 0.9,
        top_p: 0.9,
        max_new_tokens: 250,
      },
    },
  ],
  fireworks: [
    {
      id: "accounts/fireworks/models/llama-v2-7b-chat",
      fullName: "Llama v2 7B Chat",
      imgURL: META_BLACK_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        max_tokens: 250,
      },
    },
    {
      id: "accounts/fireworks/models/llama-v2-13b",
      fullName: "Llama v2 13B",
      imgURL: META_BLACK_SVG_DATA_URI,
      promptType: "default",
      modelType: "completion",
      options: {
        temperature: 0.9,
        top_p: 1,
        max_tokens: 20,
      },
    },
    {
      id: "accounts/fireworks/models/llama-v2-70b-chat",
      fullName: "Llama v2 70B Chat",
      imgURL: META_BLUE_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        max_tokens: 250,
      },
    },
    {
      id: "accounts/fireworks/models/llama-v2-13b-code-instruct",
      fullName: "Llama v2 13B Code Instruct",
      imgURL: META_BLACK_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        max_tokens: 250,
      },
    },
    {
      id: "accounts/fireworks/models/llama-v2-34b-code-instruct",
      fullName: "Llama v2 34B Code Instruct",
      imgURL: META_BLUE_SVG_DATA_URI,
      promptType: "default",
      modelType: "chat",
      options: {
        temperature: 0.9,
        top_p: 1,
        max_tokens: 250,
      },
    },
  ],
};

export const PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    fullName: "OpenAI",
    imgURL: OPENAI_SVG_DATA_URI,
  },
  {
    id: "fireworks",
    fullName: "Fireworks.ai",
    imgURL: "https://fireworks.ai/favicon.ico",
  },
  {
    id: "huggingface",
    fullName: "Hugging Face",
    imgURL: HUGGINGFACE_SVG_DATA_URI,
  },
];

export const PROVIDER_IDS: Record<string, AIProviderID> = {
  OPENAI: "openai",
  FIREWORKS: "fireworks",
  HUGGINGFACE: "huggingface",
};

export const TITLE_MODELS: Record<AIProviderID, AIModel> = {
  openai: {
    id: "gpt-3.5-turbo-instruct",
    fullName: "GPT 3.5 Turbo Instruct",
    imgURL: OPENAI_SVG_DATA_URI,
    promptType: "default",
    modelType: "completion",
    options: {
      temperature: 0.9,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 250,
    },
  },
  fireworks: {
    id: "accounts/fireworks/models/llama-v2-13b-code-instruct",
    fullName: "Llama v2 13B Code Instruct",
    imgURL: META_BLACK_SVG_DATA_URI,
    promptType: "default",
    modelType: "chat",
    options: {
      temperature: 0.9,
      top_p: 1,
      max_tokens: 250,
    },
  },
  huggingface: {
    id: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
    fullName: "OpenAssistant Pythia 12B",
    imgURL: HUGGINGFACE_SVG_DATA_URI,
    promptType: "openassistant",
    modelType: "chat",
    options: {
      temperature: 0.9,
      top_p: 0.9,
      max_new_tokens: 250,
    },
  },
};
