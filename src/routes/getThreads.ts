import { Request, Response } from "express";
import { selectThreads } from "../db/repo";
import { dbThreadToTextsThread } from "../lib/helpers";
import {
  GetThreadsRequest,
  ThreadWithMessagesAndParticipants,
} from "../lib/types";

export const getThreads = async (req: Request, res: Response) => {
  const { pagination }: GetThreadsRequest = req.body;

  const dbThreads = await selectThreads();

  if (!dbThreads) {
    res.send({ data: [] });
    return;
  }

  const textsThreads = dbThreads.map(
    (threadData: ThreadWithMessagesAndParticipants) => {
      const textsData = dbThreadToTextsThread(threadData);
      return textsData;
    }
  );

  res.send({ data: textsThreads });
};
