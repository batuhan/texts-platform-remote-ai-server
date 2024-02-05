import {
  experimental_buildLlama2Prompt,
  experimental_buildOpenAssistantPrompt,
  experimental_buildStarChatBetaPrompt,
} from "ai/prompts";
import { ChatCompletionMessageParam } from "openai/resources";
import { Message, UserID } from "../../lib/types";

export function mapTextToPrompt(userInput: string, modelID: string) {
  if (modelID === "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5") {
    return `<|prompter|>${userInput}<|endoftext|><|assistant|>`;
  } else {
    return userInput;
  }
}

export function mapMessagesToPrompt(
  messages: Message[],
  currentUserID: UserID,
  aiID: string,
  promptType: string = "default"
): string | ChatCompletionMessageParam[] {
  const filteredMessages = (messages || []).filter((msg) => {
    return msg.senderID === currentUserID || msg.senderID === aiID;
  });

  const msgs = filteredMessages.map((m) => ({
    role:
      m.senderID === currentUserID
        ? "user"
        : ("assistant" as "user" | "assistant"),
    content: m.text ?? "",
  }));

  switch (promptType) {
    case "openassistant":
      return experimental_buildOpenAssistantPrompt(msgs);
    case "llama2":
      return experimental_buildLlama2Prompt(msgs);
    case "starchat":
      return experimental_buildStarChatBetaPrompt(msgs);
    case "default":
      return msgs;
    default:
      return msgs;
  }
}
