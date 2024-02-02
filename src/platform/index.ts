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
} from "../lib/types";
import { messages, threads, users } from "../db/schema";
import { db } from "../db";
import { selectMessages, selectThread, selectThreads } from "../db/repo";
import {
  extraMap,
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
*/
export async function sendMessage(
  userMessage: Message,
  threadID: ThreadID,
  content: MessageContent,
  options?: MessageSendOptions
): Promise<Message> {
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

  return responseMessage;
}

/* 
  Gets the loginCreds, adds the extra fields to a map of <userId,extra> and returns the currentUser
*/
export function login(
  creds: LoginCreds,
  userID: string
): CurrentUser | undefined {
  if ("custom" in creds) {
    const displayText = creds.custom.label;
    const currentUser: CurrentUser = {
      id: userID,
      username: "test",
      displayText,
    };

    const extra = creds.custom;
    delete extra.baseURL;

    if (extra) {
      extraMap.set(userID, extra);
    } else {
      console.log(`No user found with ID ${userID}`);
    }

    return currentUser;
  } else {
    return undefined;
  }
}
