import { randomUUID } from "crypto";
import {
  MessageDBInsert,
  ThreadDBInsert,
  PaginatedWithCursors,
  ThreadWithMessagesAndParticipants,
  UserID,
  Thread,
  Message,
  ThreadType,
  PaginationArg,
  ThreadID,
  Paginated,
  ThreadFolderName,
  User,
  MessageContent,
  MessageSendOptions,
  CurrentUser,
  LoginCreds,
  ActivityType,
  ServerEventType,
  ServerEvent,
  SerializedSession,
  Participant,
  UserDBInsert,
} from "../lib/types";
import { messages, participants, threads, users } from "../db/schema";
import { db } from "../db";
import {
  selectMessages,
  selectThread,
  selectThreads,
  selectUsers,
} from "../db/repo";
import {
  extraMap,
  mapDbMessageToTextsMessage,
  mapDbThreadToTextsThread,
  mapDbUserToTextsUser,
} from "../lib/helpers";
import {
  AIOptions,
  AIProviderID,
  ModelType,
  ModelTypes,
  PromptType,
} from "./lib/types";
import { MODELS } from "./lib/constants";
import { sendEvent } from "../lib/ws";
import {
  aiChatCompletion,
  aiCompletion,
  generateTitle,
  getAIProvider,
  getCallbacks,
} from "./ai";

/*
    Creates a thread and returns the created thread
*/
export async function createThread(
  userIDs: UserID[],
  currentUserID: UserID,
  title?: string,
  messageText?: string
): Promise<Thread> {
  const userID = userIDs[0];

  const extra = extraMap.get(currentUserID);

  if (!extra) {
    throw new Error(`No extra found for user ${currentUserID}`);
  }

  const providerID = extra.providerID;
  const model = MODELS[providerID].find((m) => m.id === userID);

  if (!model) {
    throw new Error(`No model found for model id ${userID}`);
  }

  const type: ThreadType = "single";
  const threadID = randomUUID();
  const threadExtra = {
    modelID: userID,
    titleGenerated: false,
    promptType: model.promptType,
    modelType: model.modelType,
    options: model.options,
  };

  const threadCommon = {
    id: threadID,
    type,
    timestamp: new Date(),
    title: `Chat with ${userID}`,
    isUnread: false,
    isReadOnly: false,
    extra: threadExtra,
    userID: currentUserID,
    imgURL: model.imgURL,
  };

  const dbThread: ThreadDBInsert = {
    ...threadCommon,
  };

  await db.insert(threads).values(dbThread);

  const messages: Message[] = [];

  const aiParticipant: Participant = {
    id: model.id,
    fullName: model.fullName,
    imgURL: model.imgURL,
    isSelf: false,
  };

  const userParticipant: Participant = {
    id: currentUserID,
    isSelf: true,
  };

  await db.insert(participants).values([
    {
      userID: currentUserID,
      threadID,
    },
    {
      userID: model.id,
      threadID,
    },
  ]);

  const thread: Thread = {
    ...threadCommon,
    messages: {
      items: messages,
      hasMore: false,
    },
    participants: {
      hasMore: false,
      items: [aiParticipant, userParticipant],
    },
    isUnread: false,
    isReadOnly: false,
    extra: threadExtra,
  };

  return thread;
}

/* 
    Gets all messages for a threadID
*/
export async function getMessages(
  threadID: ThreadID,
  currentUserID: UserID,
  pagination?: PaginationArg
): Promise<Paginated<Message>> {
  const dbMessages = await selectMessages(threadID);

  if (!dbMessages) {
    return { items: [], hasMore: false };
  }

  const messages = dbMessages.map((message) => {
    const textsData = mapDbMessageToTextsMessage(message);
    return textsData;
  });

  return {
    items: messages,
    hasMore: false,
  };
}

/* 
    Gets a thread by threadID
*/
export async function getThread(
  threadID: ThreadID,
  currentUserID: UserID
): Promise<Thread> {
  const dbThread = await selectThread(threadID, currentUserID);
  const thread = mapDbThreadToTextsThread(dbThread);
  return thread;
}

/* 
    Get all threads
*/
export async function getThreads(
  inboxName: ThreadFolderName,
  currentUserID: UserID,
  pagination?: PaginationArg
): Promise<PaginatedWithCursors<Thread>> {
  const dbThreads = await selectThreads(currentUserID);

  if (!dbThreads) {
    return {
      items: [],
      hasMore: false,
      oldestCursor: "0",
    };
  }
  const threads = dbThreads.map(
    (threadData: ThreadWithMessagesAndParticipants) => {
      const textsData = mapDbThreadToTextsThread(threadData);
      return textsData;
    }
  );

  return {
    items: threads,
    hasMore: false,
    oldestCursor: "0",
  };
}

/* 
    Returns a list of users available
*/
export async function searchUsers(currentUserID: UserID): Promise<User[]> {
  const dbUsers = await selectUsers(currentUserID);

  if (!dbUsers) {
    return [];
  }

  const allUsers = dbUsers.map((user) => {
    const textsData = mapDbUserToTextsUser(user);
    return textsData;
  });

  return allUsers;
}

/* 
   Produces a response message.
*/
export async function sendMessage(
  userMessage: Message,
  threadID: ThreadID,
  content: MessageContent,
  currentUserID: UserID,
  options?: MessageSendOptions
): Promise<void> {
  if (!content.text) {
    throw new Error("No text in content");
  }

  const dbUserMessage: MessageDBInsert = {
    ...userMessage,
    timestamp: new Date(userMessage.timestamp),
    seen: true,
    threadID,
  };
  await db.insert(messages).values(dbUserMessage);

  const thread = await getThread(threadID, currentUserID);

  const modelID: string = thread.extra.modelID;
  const modelType: ModelType = thread.extra.modelType;
  const titleGenerated: boolean = thread.extra.titleGenerated;

  const thinkingEvent: ServerEvent = {
    type: ServerEventType.USER_ACTIVITY,
    activityType: ActivityType.CUSTOM,
    customLabel: "thinking",
    threadID,
    participantID: modelID,
    durationMs: 30_000,
  };

  sendEvent(thinkingEvent, currentUserID);
  const callbacks = getCallbacks(thread.id, modelID, currentUserID);

  if (modelType === ModelTypes.CHAT) {
    await aiChatCompletion(thread, currentUserID, callbacks);
  } else if (modelType === ModelTypes.COMPLETION) {
    await aiCompletion(content.text, thread, currentUserID, callbacks);
  } else {
    throw new Error(`Invalid modelType ${modelType}`);
  }

  if (!titleGenerated) {
    generateTitle(content.text, thread, currentUserID);
  }
  return undefined;
}

/* 
  Gets the loginCreds, adds the extra fields to a map of <userId,extra> and returns the currentUser
*/
export async function login(
  creds: LoginCreds,
  userID: UserID
): Promise<CurrentUser | undefined> {
  if ("custom" in creds) {
    const displayText: string = creds.custom.label;
    const providerID: AIProviderID = creds.custom.selectedProvider;
    const apiKey: string = creds.custom.apiKey;
    const currentUser: CurrentUser = {
      id: userID,
      username: "AI Playground",
      displayText,
    };

    const user: UserDBInsert = {
      id: userID,
      providerID,
      fullName: "AI Playground",
      isSelf: true,
    };

    await db.insert(users).values(user);

    const provider = getAIProvider(providerID, apiKey);

    const extra = {
      providerID: providerID,
      provider: provider,
      apiKey,
    };

    extraMap.set(userID, extra);

    return currentUser;
  } else {
    return undefined;
  }
}

export function initUser(session: SerializedSession) {
  const providerID: AIProviderID = session.extra.providerID;
  const apiKey: string = session.extra.apiKey;

  const userID: UserID = session.currentUser.id;

  const provider = getAIProvider(providerID, apiKey);

  const extra = {
    providerID: providerID,
    provider: provider,
    apiKey,
  };

  const currentExtra = extraMap.get(userID);

  if (!currentExtra) {
    extraMap.set(userID, extra);
  } else {
    console.log(`No user found with ID ${userID}`);
  }
}
