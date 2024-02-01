import { Request, Response } from "express";
import { selectMessages } from "../db/repo";
import { dbMessageToTextsMessage } from "../lib/helpers";
import { GetMessagesRequest } from "../lib/types";

export const getMessages = async (req: Request, res: Response) => {
  console.log("getMessages");
  
  const { threadID, pagination }: GetMessagesRequest = req.body;

  const dbMessages = await selectMessages(threadID);

  if (!dbMessages) {
    res.send({ data: [] });
    return;
  }

  const textsMessages = dbMessages.map((message) => {
    const textsData = dbMessageToTextsMessage(message);
    return textsData;
  });

  res.send({ data: textsMessages });
};
