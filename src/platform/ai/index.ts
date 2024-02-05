import { ChatCompletionMessageParam } from "openai/resources";
import {
  Thread,
  UserID,
  Message,
  ServerEventType,
  ActivityType,
} from "../../lib/types";
import { AIOptions, AIProviderID, PromptType } from "../lib/types";
import {
  AIStreamCallbacksAndOptions,
  HuggingFaceStream,
  OpenAIStream,
  StreamingTextResponse,
} from "ai";
import { extraMap } from "../../lib/helpers";
import { PROVIDER_IDS, TITLE_MODELS } from "../lib/constants";
import OpenAI from "openai";
import { getMessages, getThread } from "..";
import { sendEvent } from "../../lib/ws";
import { randomUUID } from "crypto";
import { db } from "../../db";
import { messages, threads } from "../../db/schema";
import { HfInference } from "@huggingface/inference";
import { eq } from "drizzle-orm";
import { mapMessagesToPrompt, mapTextToPrompt } from "./mappers";

export async function aiChatCompletion(
  thread: Thread,
  currentUserID: UserID,
  callbacks: AIStreamCallbacksAndOptions
) {
  const userExtra = extraMap.get(currentUserID);

  if (!userExtra) {
    throw new Error(`User extra not found`);
  }

  const providerAPI = userExtra.provider;
  const providerID = userExtra.providerID;

  const options: AIOptions = thread.extra.options;
  const modelID: string = thread.extra.modelID;
  const promptType: PromptType = thread.extra.promptType;

  const paginatedMessages = await getMessages(thread.id, currentUserID);
  const messages = paginatedMessages.items;

  const msgs = mapMessagesToPrompt(
    messages,
    currentUserID,
    modelID,
    promptType
  );

  if (providerID === PROVIDER_IDS.OPENAI && providerAPI instanceof OpenAI) {
    const openaiResponse = await providerAPI.chat.completions.create({
      model: thread.extra.modelID,
      stream: true,
      messages: msgs as ChatCompletionMessageParam[],
      ...options,
    });

    const openaiStream = OpenAIStream(openaiResponse, callbacks);
    const openaiResult = new StreamingTextResponse(openaiStream);
    await openaiResult.text();
  } else if (
    providerID === PROVIDER_IDS.FIREWORKS &&
    providerAPI instanceof OpenAI
  ) {
    const fireworksResponse = await providerAPI.chat.completions.create({
      model: thread.extra.modelID,
      stream: true,
      messages: msgs as ChatCompletionMessageParam[],
      ...options,
    });

    const fireworksStream = OpenAIStream(fireworksResponse, callbacks);
    const fireworksResult = new StreamingTextResponse(fireworksStream);
    await fireworksResult.text();
  } else if (
    providerID === PROVIDER_IDS.HUGGINGFACE &&
    providerAPI instanceof HfInference
  ) {
    const huggingfaceResponse = providerAPI.textGenerationStream({
      model: thread.extra.modelID,
      inputs: msgs as string,
      parameters: {
        ...options,
      },
    });

    const huggingfaceStream = HuggingFaceStream(huggingfaceResponse, callbacks);
    const huggingfaceResult = new StreamingTextResponse(huggingfaceStream);
    await huggingfaceResult.text();
  } else {
    throw new Error(`Invalid provider option`);
  }
}

export async function aiCompletion(
  userText: string,
  thread: Thread,
  currentUserID: UserID,
  callbacks: AIStreamCallbacksAndOptions
) {
  const userExtra = extraMap.get(currentUserID);

  if (!userExtra) {
    throw new Error(`User extra not found`);
  }

  const providerAPI = userExtra.provider;
  const providerID = userExtra.providerID;

  const options: AIOptions = thread.extra.options;
  const modelID: string = thread.extra.modelID;

  const prompt = mapTextToPrompt(userText, modelID);

  if (providerID === PROVIDER_IDS.OPENAI && providerAPI instanceof OpenAI) {
    const openaiResponse = await providerAPI.completions.create({
      model: modelID,
      stream: true,
      prompt,
      ...options,
    });

    const openaiStream = OpenAIStream(openaiResponse, callbacks);
    const openaiResult = new StreamingTextResponse(openaiStream);
    await openaiResult.text();
  } else if (
    providerID === PROVIDER_IDS.FIREWORKS &&
    providerAPI instanceof OpenAI
  ) {
    const fireworksResponse = await providerAPI.completions.create({
      model: modelID,
      stream: true,
      prompt,
      ...options,
    });

    const fireworksStream = OpenAIStream(fireworksResponse, callbacks);
    const fireworksResult = new StreamingTextResponse(fireworksStream);
    await fireworksResult.text();
  } else if (
    providerID === PROVIDER_IDS.HUGGINGFACE &&
    providerAPI instanceof HfInference
  ) {
    const huggingfaceResponse = providerAPI.textGenerationStream({
      model: modelID,
      inputs: prompt,
      parameters: {
        ...options,
      },
    });

    const huggingfaceStream = HuggingFaceStream(huggingfaceResponse, callbacks);
    const huggingfaceResult = new StreamingTextResponse(huggingfaceStream);
    await huggingfaceResult.text();
  } else {
    throw new Error(`Invalid provider option`);
  }
}

export async function generateTitle(
  userText: string,
  thread: Thread,
  currentUserID: UserID
) {
  let generatedTitle: string[] = [];
  const prompt =
    "Generate a title for this conversation. Your response must be only the title. Consider the first message of user to be this :" +
    userText;

  const userExtra = extraMap.get(currentUserID);

  const callbacks = getTitleCallbacks(thread.id, generatedTitle, currentUserID);

  if (!userExtra) {
    throw new Error(`User extra not found`);
  }

  const providerAPI = userExtra.provider;
  const providerID = userExtra.providerID;

  const titleModel = TITLE_MODELS[providerID];

  if (providerID === PROVIDER_IDS.OPENAI && providerAPI instanceof OpenAI) {
    const openaiResponse = await providerAPI.completions.create({
      model: titleModel.id,
      stream: true,
      prompt,
      ...titleModel.options,
    });

    const openaiStream = OpenAIStream(openaiResponse, callbacks);
    const openaiResult = new StreamingTextResponse(openaiStream);
    await openaiResult.text();
  } else if (
    providerID === PROVIDER_IDS.FIREWORKS &&
    providerAPI instanceof OpenAI
  ) {
    const fireworksResponse = await providerAPI.completions.create({
      model: titleModel.id,
      stream: true,
      prompt,
      ...titleModel.options,
    });

    const fireworksStream = OpenAIStream(fireworksResponse, callbacks);
    const fireworksResult = new StreamingTextResponse(fireworksStream);
    await fireworksResult.text();
  } else if (
    providerID === PROVIDER_IDS.HUGGINGFACE &&
    providerAPI instanceof HfInference
  ) {
    const huggingfaceResponse = providerAPI.textGenerationStream({
      model: titleModel.id,
      inputs: prompt,
      parameters: {
        ...titleModel.options,
      },
    });

    const huggingfaceStream = HuggingFaceStream(huggingfaceResponse, callbacks);
    const huggingfaceResult = new StreamingTextResponse(huggingfaceStream);
    await huggingfaceResult.text();
  } else {
    throw new Error(`Invalid provider option`);
  }
}

export function getAIProvider(provider: AIProviderID, key: string) {
  if (provider === PROVIDER_IDS.OPENAI) {
    return new OpenAI({ apiKey: key });
  } else if (provider === PROVIDER_IDS.FIREWORKS) {
    return new OpenAI({
      apiKey: key,
      baseURL: "https://api.fireworks.ai/inference/v1",
    });
  } else if (provider === PROVIDER_IDS.HUGGINGFACE) {
    return new HfInference(key);
  } else {
    throw new Error(`Invalid provider option`);
  }
}

export function getCallbacks(
  threadID: string,
  modelID: string,
  currentUserID: UserID
): AIStreamCallbacksAndOptions {
  const aiMessage: Message = {
    id: randomUUID(),
    senderID: modelID,
    threadID: threadID,
    text: " ",
    timestamp: new Date(),
    isSender: false,
    seen: true,
    isDelivered: true,
  };

  return {
    onStart: async () => {
      sendEvent(
        {
          type: ServerEventType.STATE_SYNC,
          objectName: "message",
          mutationType: "upsert",
          objectIDs: { threadID },
          entries: [aiMessage],
        },
        currentUserID
      );
    },
    onToken: async (token) => {
      if (
        aiMessage.text &&
        aiMessage.text[0] === " " &&
        aiMessage.text.trimStart().length > 0
      ) {
        aiMessage.text = aiMessage.text.trimStart();
      }
      aiMessage.text += token;
      sendEvent(
        {
          type: ServerEventType.STATE_SYNC,
          objectName: "message",
          mutationType: "upsert",
          objectIDs: { threadID },
          entries: [aiMessage],
        },
        currentUserID
      );
    },
    onFinal: async (completion: string) => {
      sendEvent(
        {
          type: ServerEventType.USER_ACTIVITY,
          activityType: ActivityType.NONE,
          threadID,
          participantID: modelID,
        },
        currentUserID
      );
      const messageToInsert: Message = {
        ...aiMessage,
        text: completion,
      };
      await db.insert(messages).values(messageToInsert);
    },
  };
}

function getTitleCallbacks(
  threadID: string,
  generatedTitle: string[],
  currentUserID: UserID
): AIStreamCallbacksAndOptions {
  return {
    onStart: async () => {
      sendEvent(
        {
          type: ServerEventType.STATE_SYNC,
          mutationType: "update",
          objectName: "thread",
          objectIDs: {},
          entries: [
            {
              id: threadID,
              title: generatedTitle.join(""),
              timestamp: new Date(),
            },
          ],
        },
        currentUserID
      );
    },
    onToken: async (token) => {
      if (token.includes(`"`)) {
        token = token.replace(`"`, "");
      }
      generatedTitle.push(token);

      sendEvent(
        {
          type: ServerEventType.STATE_SYNC,
          mutationType: "update",
          objectName: "thread",
          objectIDs: {},
          entries: [
            {
              id: threadID,
              title: generatedTitle.join(""),
              timestamp: new Date(),
            },
          ],
        },
        currentUserID
      );
    },
    onFinal: async () => {
      sendEvent(
        {
          type: ServerEventType.STATE_SYNC,
          mutationType: "update",
          objectName: "thread",
          objectIDs: {},
          entries: [
            {
              id: threadID,
              title: generatedTitle.join(""),
              timestamp: new Date(),
            },
          ],
        },
        currentUserID
      );
      const thread = await getThread(threadID, currentUserID);
      const extra = {
        ...thread.extra,
        titleGenerated: true,
      };
      await db
        .update(threads)
        .set({ extra, title: generatedTitle.join("") })
        .where(eq(threads.id, threadID));
    },
  };
}
