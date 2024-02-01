import { Request, Response } from "express";
import { selectThread } from "../db/repo";
import { dbThreadToTextsThread } from "../lib/helpers";
import { GetThreadRequest } from "../lib/types";

export const getThread = async (req: Request, res: Response) => {
  console.log("getThread");
  
  const { threadID }: GetThreadRequest = req.body;

  const dbThread = await selectThread(threadID);
  const textsThread = dbThreadToTextsThread(dbThread);

  res.send({ data: textsThread });
};
