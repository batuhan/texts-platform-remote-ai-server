import { Request, Response } from "express";
import {
  CreateThreadRequest,
  GetMessagesRequest,
  GetThreadRequest,
  GetThreadsRequest,
  SendMessageRequest,
} from "../lib/types";
import {
  createThread,
  getMessages,
  getThread,
  getThreads,
  searchUsers,
  sendMessage,
} from "../platform";

export const createThreadRoute = async (req: Request, res: Response) => {
  console.log("createThread");
  const { userIDs, title, messageText }: CreateThreadRequest = req.body;
  const thread = await createThread(userIDs, title, messageText);
  res.json({ data: thread });
};

export const getMessagesRoute = async (req: Request, res: Response) => {
  console.log("getMessages");
  const { threadID, pagination }: GetMessagesRequest = req.body;
  const messages = await getMessages(threadID);
  res.send({ data: messages });
};

export const getThreadRoute = async (req: Request, res: Response) => {
  console.log("getThread");
  const { threadID }: GetThreadRequest = req.body;
  const thread = await getThread(threadID);
  res.send({ data: thread });
};

export const getThreadsRoute = async (req: Request, res: Response) => {
  console.log("getThreads");
  const { inboxName, pagination }: GetThreadsRequest = req.body;
  const threads = await getThreads(inboxName, pagination);
  res.send({ data: threads });
};

export const searchUsersRoute = async (_: Request, res: Response) => {
  console.log("searchUsers");
  const users = await searchUsers();
  res.send({ data: users });
};

export const sendMessageRoute = async (req: Request, res: Response) => {
  console.log("sendMessage");
  const { threadID, content, options, userMessage }: SendMessageRequest =
    req.body;
  const message = await sendMessage(userMessage, threadID, content, options);
  res.json({ data: message });
};
