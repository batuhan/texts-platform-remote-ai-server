import { db } from ".";
import { ThreadWithMessagesAndParticipants, UserID } from "../lib/types";
import { and, eq } from "drizzle-orm";
import { messages, threads, users } from "./schema";
import { extraMap } from "../lib/helpers";

export async function selectThread(threadID: string, currentUserID: string) {
  const thread = await db.query.threads.findFirst({
    where: and(eq(threads.id, threadID), eq(threads.userID, currentUserID)),
    with: {
      messages: true,
      participants: {
        columns: {},
        with: {
          participants: true,
        },
      },
    },
  });

  if (!thread) throw new Error("Thread not found");

  return thread;
}
export async function selectThreads(
  currentUserID: UserID
): Promise<ThreadWithMessagesAndParticipants[]> {
  const selectedThreads = await db.query.threads.findMany({
    where: eq(threads.userID, currentUserID),
    with: {
      messages: true,
      participants: {
        columns: {},
        with: {
          participants: true,
        },
      },
    },
  });
  return selectedThreads;
}
export async function selectUsers(currentUserID: UserID) {
  const extra = extraMap.get(currentUserID);

  if (!extra) {
    throw new Error(`No extra found for user ${currentUserID}`);
  }

  const dbUsers = await db
    .select()
    .from(users)
    .where(
      and(eq(users.providerID, extra.providerID), eq(users.isSelf, false))
    );
  console.log(dbUsers);

  return dbUsers;
}
export async function selectMessages(threadID: string) {
  const threadMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadID, threadID));

  return threadMessages;
}
