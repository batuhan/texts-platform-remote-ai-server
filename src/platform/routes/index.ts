import { Request, Response } from "express";
import {
  CreateThreadRequest,
  GetMessagesRequest,
  GetThreadRequest,
  GetThreadsRequest,
  LoginRequest,
  SearchUsersRequest,
  SendMessageRequest,
} from "../../lib/types";
import {
  createThread,
  getMessages,
  getThread,
  getThreads,
  login,
  searchUsers,
  sendMessage,
} from "..";
import { ServerEvent, ServerEventType } from "@textshq/platform-sdk";
import { sendEvent } from "../../lib/ws";

export const loginRoute = async (req: Request, res: Response) => {
  console.log("login");
  const { creds }: LoginRequest = req.body;
  const user = login(creds);

  if (!user) {
    res.status(401).send({ data: undefined });
    return;
  }

  res.send({ data: user });
};

export const createThreadRoute = async (req: Request, res: Response) => {
  console.log("createThread");
  const {
    userIDs,
    title,
    messageText,
    userID,
    credential,
  }: CreateThreadRequest = req.body;
  const thread = await createThread(userIDs, title, messageText);
  res.send({ data: thread });
};

export const getMessagesRoute = async (req: Request, res: Response) => {
  console.log("getMessages");
  const { threadID, pagination, userID, credential }: GetMessagesRequest =
    req.body;
  const messages = await getMessages(threadID);
  res.send({ data: messages });
};

export const getThreadRoute = async (req: Request, res: Response) => {
  console.log("getThread");
  const { threadID, userID, credential }: GetThreadRequest = req.body;
  const thread = await getThread(threadID);
  res.send({ data: thread });
};

export const getThreadsRoute = async (req: Request, res: Response) => {
  console.log("getThreads");
  const { inboxName, pagination, userID, credential }: GetThreadsRequest =
    req.body;
  const threads = await getThreads(inboxName, pagination);
  res.send({ data: threads });
};

export const searchUsersRoute = async (req: Request, res: Response) => {
  console.log("searchUsers");
  const { typed, userID, credential }: SearchUsersRequest = req.body;
  const users = await searchUsers();
  res.send({ data: users });
};

/*
  There are two ways to return the response message from this route.
  1 - Return the response message in data key of the json response. Which will be state synced in the client.
  2 - Return undefined in data key of the json response, and instead emit a websocket event with the response message,
  using the sendEvent helper function with the userID. So the state is updated in the client.
*/
export const sendMessageRoute = async (req: Request, res: Response) => {
  console.log("sendMessage");
  const {
    threadID,
    content,
    options,
    userMessage,
    userID,
    credential,
  }: SendMessageRequest = req.body;
  const message = await sendMessage(userMessage, threadID, content, options);

  const event: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "message",
    mutationType: "upsert",
    objectIDs: { threadID },
    entries: [message],
  };
  /*
    Examples of how to return the response message.

    1 - Send back the message, returned in platform-sdk Message type
    res.json({ data: message });
  
    2 - First create a ServerEvent, then send the response message using sendEvent helper function through websocket.
    Return undefined from this function.
    const event: ServerEvent = {
      type: ServerEventType.STATE_SYNC,
      objectName: "message",
      mutationType: "upsert",
      objectIDs: { threadID },
      entries: [responseMessage],
    };

    sendEvent(event, userID);
  
    res.json({ data: undefined });
  */
  sendEvent(event, userID);
  res.send({ data: undefined });
};
