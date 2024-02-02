import {
  LoginCreds,
  Message,
  MessageContent,
  MessageSendOptions,
  PaginationArg,
  Thread,
  ThreadFolderName,
  ThreadID,
  User,
  UserID,
} from "@textshq/platform-sdk";
import { messages, threads, users } from "../db/schema";
import { selectThread } from "../db/repo";

export type ThreadDBInsert = typeof threads.$inferInsert;
export type UserDBInsert = typeof users.$inferInsert;
export type MessageDBInsert = typeof messages.$inferInsert;

export type ThreadDBSelect = typeof threads.$inferSelect;
export type UserDBSelect = typeof users.$inferSelect;
export type MessageDBSelect = typeof messages.$inferSelect;

export type DBData =
  | ThreadWithMessagesAndParticipants
  | UserDBSelect
  | MessageDBSelect;

export type TextsData = Thread | User | Message;

export type ThreadWithMessagesAndParticipants = Awaited<
  ReturnType<typeof selectThread>
>;

interface CredentialProp {
  credential?: string;
}

interface UserIDProp {
  userID: UserID;
}

export interface CreateThreadRequest extends CredentialProp, UserIDProp {
  userIDs: UserID[];
  title?: string;
  messageText?: string;
}

export interface GetMessagesRequest extends CredentialProp, UserIDProp {
  threadID: ThreadID;
  pagination?: PaginationArg;
}

export interface GetThreadRequest extends CredentialProp, UserIDProp {
  threadID: ThreadID;
}

export interface GetThreadsRequest extends CredentialProp, UserIDProp {
  inboxName: ThreadFolderName;
  pagination?: PaginationArg;
}

export interface SendMessageRequest extends CredentialProp, UserIDProp {
  threadID: ThreadID;
  content: MessageContent;
  userMessage: Message;
  options?: MessageSendOptions;
}

export interface SearchUsersRequest extends CredentialProp, UserIDProp {
  typed: string;
}

export interface LoginRequest {
  creds: LoginCreds;
}
