import {
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

export type CreateThreadRequest = {
  userIDs: UserID[];
  title?: string;
  messageText?: string;
};

export type GetMessagesRequest = {
  threadID: ThreadID;
  pagination?: PaginationArg;
};

export type GetThreadRequest = {
  threadID: ThreadID;
};

export type GetThreadsRequest = {
  inboxName: ThreadFolderName;
  pagination?: PaginationArg;
};

export type SendMessageRequest = {
  threadID: ThreadID;
  content: MessageContent;
  userMessage: Message;
  options?: MessageSendOptions;
};
