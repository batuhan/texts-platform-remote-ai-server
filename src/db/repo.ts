import { db } from ".";
import { ThreadWithMessagesAndParticipants } from "../lib/types";
import { eq } from "drizzle-orm";
import { messages, threads, users } from "./schema";

export async function selectThread(threadID: string) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.id, threadID),
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

export async function selectThreads(): Promise<
  ThreadWithMessagesAndParticipants[]
> {
  const threads = await db.query.threads.findMany({
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
  return threads;
}
export async function selectUsers() {
  const dbUsers = await db.select().from(users);

  return dbUsers;
}
export async function selectMessages(threadID: string) {
  const threadMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.threadID, threadID));

  return threadMessages;
}
