import { Request, Response } from "express";
import { MessageDBInsert, SendMessageRequest } from "../lib/types";
import { randomUUID } from "crypto";
import { messages } from "../db/schema";
import { db } from "../db";
import { Message, ServerEvent, ServerEventType } from "@textshq/platform-sdk";
import { wss } from "../lib/ws";

export const sendMessage = async (req: Request, res: Response) => {
  const { threadID, content, options, userMessage }: SendMessageRequest =
    req.body;

  const dbUserMessage: MessageDBInsert = {
    ...userMessage,
    seen: true,
  };
  await db.insert(messages).values(dbUserMessage);

  const responseMessage: Message = {
    id: randomUUID(),
    timestamp: new Date(),
    text: `Response`,
    senderID: "2",
    isSender: false,
  };

  const dbResponseMessage: MessageDBInsert = {
    ...responseMessage,
    seen: false,
  };

  await db.insert(messages).values(dbResponseMessage);

  /*
  You can either send back the message, which will be STATE_SYNCed to the client,
  or you can send the data as undefined and send the event directly through websocket.

  1 - Send back the message
  res.json({ data: responseMessage });

  2 - Send back through ws

  const event: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "message",
    mutationType: "upsert",
    objectIDs: { threadID },
    entries: [responseMessage],
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });

  res.json({ data: undefined });
  */

  res.json({ data: responseMessage });
};
