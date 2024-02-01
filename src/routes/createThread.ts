import { Request, Response } from "express";
import { db } from "../db";
import { threads } from "../db/schema";
import { CreateThreadRequest, ThreadDBInsert } from "../lib/types";
import { randomUUID } from "crypto";
import { Message, Thread, ThreadType } from "@textshq/platform-sdk";

export const createThread = async (req: Request, res: Response) => {
  const { userIDs, title, messageText }: CreateThreadRequest = req.body;

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

  res.json({ data: thread });
};
