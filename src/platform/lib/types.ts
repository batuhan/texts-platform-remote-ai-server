import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources";

export type AIProviderID =
  | "openai"
  | "fireworks"
  | "huggingface";

export type AIProvider = {
  id: AIProviderID;
  fullName: string;
  imgURL: string;
};

export type AIProviderModel = Record<AIProviderID, AIModel[]>;

export type AIModel = {
  id: string;
  fullName: string;
  imgURL: string;
  promptType: PromptType;
  modelType: ModelType;
  options: AIOptions;
};

export type ModelType = "chat" | "completion";

export type PromptType =
  | "openassistant"
  | "llama2"
  | "starchat"
  | "default";

export type AIOptions =
  | {
      temperature: number;
      top_p: number;
      frequency_penalty: number;
      presence_penalty: number;
      max_tokens: number;
    }
  | {
      temperature: number;
      top_p: number;
      max_new_tokens: number;
    }
  | {
      temperature: number;
      top_p: number;
      max_tokens: number;
    }
  | {
      temperature: number;
      max_tokens: number;
      frequency_penalty: number;
      presence_penalty: number;
      k: number;
      p: number;
    }
  | {
      temperature: number;
      max_new_tokens: number;
      top_p: number;
      top_k: number;
    };

export type ThreadExtra = {
  modelID: string;
  titleGenerated: boolean;
  promptType: PromptType;
  modelType: ModelType;
};

export enum ModelTypes {
  CHAT = "chat",
  COMPLETION = "completion",
}

export type ProviderAPI = OpenAI | HfInference;
