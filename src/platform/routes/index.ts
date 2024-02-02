import { Request, Response } from "express";
import {
  CreateThreadRequest,
  GetMessagesRequest,
  GetThreadRequest,
  GetThreadsRequest,
  LoginRequest,
  SearchUsersRequest,
  SendMessageRequest,
  ServerEvent,
  ServerEventType,
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
import { sendEvent } from "../../lib/ws";
import { getExtra } from "../../lib/helpers";

/*
  @route /api/login
  @method POST
  @body { creds: Creds, currentUserID: UserID }
  @response { data: { currentUser: CurrentUser, extra: any } }
*/
export const loginRoute = async (req: Request, res: Response) => {
  console.log("login");
  const { creds, currentUserID }: LoginRequest = req.body;
  const user = login(creds, currentUserID);

  if (!user) {
    res.status(401).send({ data: undefined });
    return;
  }

  const extra = getExtra(currentUserID);
  res.send({ data: { currentUser: user, extra } });
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
  const thread = await createThread(userIDs, title, messageText);
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
  const messages = await getMessages(threadID);
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
  const thread = await getThread(threadID);
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
  const threads = await getThreads(inboxName, pagination);
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
  const users = await searchUsers();
  res.send({ data: users });
};

/*
  There are two ways to return the response message from this route.
  1 - Return the response message in data key of the json response. Which will be state synced in the client.
  2 - Return undefined in data key of the json response, and instead emit a websocket event with the response message,
  using the sendEvent helper function with the userID. So the state is updated in the client.
 
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
  sendEvent(event, currentUserID);
  res.send({ data: undefined });
};
