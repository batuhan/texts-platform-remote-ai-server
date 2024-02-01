import {
  UserID,
  Thread,
  Message,
  ThreadType,
  PaginationArg,
  ThreadID,
  Paginated,
  ThreadFolderName,
  PaginatedWithCursors,
  User,
  MessageContent,
  MessageSendOptions,
} from "@textshq/platform-sdk";
import { randomUUID } from "crypto";
import {
  MessageDBInsert,
  ThreadDBInsert,
  ThreadWithMessagesAndParticipants,
} from "../lib/types";
import { messages, threads, users } from "../db/schema";
import { db } from "../db";
import { selectMessages, selectThread, selectThreads } from "../db/repo";
import {
  mapDbMessageToTextsMessage,
  mapDbThreadToTextsThread,
  mapDbUserToTextsUser,
} from "../lib/helpers";

/*
    Creates a thread and returns the created thread
*/
export async function createThread(
  userIDs: UserID[],
  title?: string,
  messageText?: string
): Promise<Thread> {
  const userId = userIDs[0];

  const type: ThreadType = "single";

  const threadCommon = {
    id: randomUUID(),
    type,
    timestamp: new Date(),
    title: title || undefined,
    isUnread: false,
    isReadOnly: false,
  };

  const dbThread: ThreadDBInsert = {
    ...threadCommon,
  };

  await db.insert(threads).values(dbThread);

  const messages: Message[] = [];

  const thread: Thread = {
    ...threadCommon,
    messages: {
      items: messages,
      hasMore: false,
    },
    participants: {
      hasMore: false,
      items: [
        {
          id: userId,
        },
      ],
    },
    isUnread: false,
    isReadOnly: false,
  };

  return thread;
}

/* 
    Gets all messages for a threadID
*/
export async function getMessages(
  threadID: string,
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
export async function getThread(threadID: ThreadID): Promise<Thread> {
  const dbThread = await selectThread(threadID);
  const thread = mapDbThreadToTextsThread(dbThread);
  return thread;
}

/* 
    Get all threads
*/
export async function getThreads(
  inboxName: ThreadFolderName,
  pagination?: PaginationArg
): Promise<PaginatedWithCursors<Thread>> {
  const dbThreads = await selectThreads();

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
export async function searchUsers(): Promise<User[]> {
  const dbUsers = await db.select().from(users);

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
   User message will automatically return in platform's sendMessage function, 
   so this function just produces a response, and returns it in 2 ways so the state is updated.
   1 - After saving user and response message to the database, just return the response message in Message type.
   Platform will automatically update the state with this message.
   2 - Return undefined from this function, and instead emit a websocket event with the response message, 
   so the state is updated in the client. 
*/
export async function sendMessage(
  userMessage: Message,
  threadID: ThreadID,
  content: MessageContent,
  options?: MessageSendOptions
): Promise<Message | undefined> {
  const dbUserMessage: MessageDBInsert = {
    ...userMessage,
    timestamp: new Date(userMessage.timestamp),
    seen: true,
    threadID,
  };

  const responseMessage: Message = {
    id: randomUUID(),
    timestamp: new Date(),
    text: `Response`,
    senderID: "2",
    isSender: false,
    threadID,
  };

  const dbResponseMessage: MessageDBInsert = {
    ...responseMessage,
    seen: false,
  };

  await db.insert(messages).values([dbUserMessage, dbResponseMessage]);

  /*
    Examples of how to return the response message.

    1 - Send back the message, returned in platform-sdk Message type
    return responseMessage;
  
    2 - First create a ServerEvent, then send the response message using sendEvent helper function through websocket.
    Return undefined from this function.
    const event: ServerEvent = {
      type: ServerEventType.STATE_SYNC,
      objectName: "message",
      mutationType: "upsert",
      objectIDs: { threadID },
      entries: [responseMessage],
    };

    sendEvent(event);
  
    return undefined;
  */

  return responseMessage;
}
