import { Request, Response } from "express";
import {
  ActivityType,
  CreateThreadRequest,
  GetMessagesRequest,
  GetThreadRequest,
  GetThreadsRequest,
  InitRequest,
  LoginRequest,
  SearchUsersRequest,
  SendMessageRequest,
  ServerEvent,
  ServerEventType,
  UserID,
} from "../../lib/types";
import {
  createThread,
  getMessages,
  getThread,
  getThreads,
  initUser,
  login,
  searchUsers,
  sendMessage,
} from "..";
import { sendEvent } from "../../lib/ws";
import { extraMap, getExtra } from "../../lib/helpers";
import { AIProviderID } from "../lib/types";
import { getAIProvider } from "../ai";

/*
  @route /api/login
  @method POST
  @body { creds: Creds, currentUserID: UserID }
  @response { data: { currentUser: CurrentUser, extra: any } }
*/
export const loginRoute = async (req: Request, res: Response) => {
  console.log("login");
  const { creds, currentUserID }: LoginRequest = req.body;

  const user = await login(creds, currentUserID);

  if (!user) {
    res.status(401).send({ data: undefined });
    return;
  }

  const extra = getExtra(currentUserID);
  const filteredExtra = extra
    ? { providerID: extra.providerID, apiKey: extra.apiKey }
    : undefined;

  res.send({ data: { currentUser: user, extra: filteredExtra } });
};

/* 
  @route /api/init
  @method POST
  @body { session: SerializedSession }
  @response { data: string }
*/
export const initRoute = async (req: Request, res: Response) => {
  console.log("init");
  const { session }: InitRequest = req.body;

  initUser(session);

  res.send({ data: "success" });
};

/* 
  @route /api/createThread
  @method POST
  @body { userIDs: UserID[], currentUserID: UserID, title?: string, messageText?: string }
  @response { data: Thread }
*/
export const createThreadRoute = async (req: Request, res: Response) => {
  console.log("createThread");
  const { userIDs, title, messageText, currentUserID }: CreateThreadRequest =
    req.body;
  const thread = await createThread(userIDs, currentUserID, title, messageText);
  res.send({ data: thread });
};

/* 
  @route /api/getMessages
  @method POST
  @body { threadID: ThreadID, currentUserID: UserID, pagination?: PaginationArg }
  @response { data: Paginated<Message> }
*/
export const getMessagesRoute = async (req: Request, res: Response) => {
  console.log("getMessages");
  const { threadID, pagination, currentUserID }: GetMessagesRequest = req.body;
  const messages = await getMessages(threadID, currentUserID);
  res.send({ data: messages });
};

/* 
  @route /api/getThread
  @method POST
  @body { threadID: ThreadID, currentUserID: UserID }
  @response { data: Thread }
*/
export const getThreadRoute = async (req: Request, res: Response) => {
  console.log("getThread");
  const { threadID, currentUserID }: GetThreadRequest = req.body;
  const thread = await getThread(threadID, currentUserID);
  res.send({ data: thread });
};

/* 
  @route /api/getThreads
  @method POST
  @body { inboxName: ThreadFolderName, currentUserID: UserID, pagination?: PaginationArg }
  @response { data: PaginatedWithCursors<Thread> }
*/
export const getThreadsRoute = async (req: Request, res: Response) => {
  console.log("getThreads");
  const { inboxName, pagination, currentUserID }: GetThreadsRequest = req.body;
  const threads = await getThreads(inboxName, currentUserID, pagination);
  res.send({ data: threads });
};

/* 
  @route /api/searchUsers
  @method POST
  @body { typed: string, currentUserID: UserID }
  @response { data: User[] }
*/
export const searchUsersRoute = async (req: Request, res: Response) => {
  console.log("searchUsers");
  const { typed, currentUserID }: SearchUsersRequest = req.body;
  const users = await searchUsers(currentUserID);
  res.send({ data: users });
};

/*
  @route /api/sendMessage
  @method POST
  @body { threadID: ThreadID, content: MessageContent, options?: MessageSendOptions, userMessage: Message, currentUserID: UserID }
  @response { data: undefined | Message } 
*/
export const sendMessageRoute = async (req: Request, res: Response) => {
  console.log("sendMessage");
  const {
    threadID,
    content,
    options,
    userMessage,
    currentUserID,
  }: SendMessageRequest = req.body;

  const userMessageEvent: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "message",
    mutationType: "upsert",
    objectIDs: { threadID },
    entries: [userMessage],
  };

  sendEvent(userMessageEvent, currentUserID);

  await sendMessage(userMessage, threadID, content, currentUserID, options);

  res.send({ data: "success" });
};
