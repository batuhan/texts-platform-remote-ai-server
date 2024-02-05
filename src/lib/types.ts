import { messages, threads, users } from "../db/schema";
import { selectThread } from "../db/repo";
import { CookieJar } from "tough-cookie";

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

interface UserIDProp {
  currentUserID: UserID;
}

export interface CreateThreadRequest extends UserIDProp {
  userIDs: UserID[];
  title?: string;
  messageText?: string;
}

export interface GetMessagesRequest extends UserIDProp {
  threadID: ThreadID;
  pagination?: PaginationArg;
}

export interface GetThreadRequest extends UserIDProp {
  threadID: ThreadID;
}

export interface GetThreadsRequest extends UserIDProp {
  inboxName: ThreadFolderName;
  pagination?: PaginationArg;
}

export interface SendMessageRequest extends UserIDProp {
  threadID: ThreadID;
  content: MessageContent;
  userMessage: Message;
  options?: MessageSendOptions;
}

export interface SearchUsersRequest extends UserIDProp {
  typed: string;
}

export interface LoginRequest extends UserIDProp {
  creds: LoginCreds;
}

export interface InitRequest {
  session: SerializedSession;
}

// Other Types
// Generics
export type Paginated<T extends CursorProp> = {
  items: T[];
  hasMore: boolean;
};
export type SerializedSession = any;
export type ID = string;
export type MessageID = ID;
export type ThreadID = ID;
export type UserID = ID;
export interface Identifiable {
  id: string;
}
export interface ExtraProp {
  extra?: any;
}
export interface OriginalProp {
  _original?: string;
}
export interface CursorProp extends Identifiable {
  cursor?: string;
}
export type ThreadFolderName = InboxName | string;
export type LoginCreds = {
  cookieJarJSON?: CookieJar.Serialized;
  jsCodeResult?: string;
  lastURL?: string;
  code?: string;
  custom?: any;
};
export type PaginationArg = {
  cursor: string;
  direction: "after" | "before";
};
export type PaginatedWithCursors<T> = {
  items: T[];
  hasMore: boolean;
  oldestCursor: string;
  newestCursor?: string;
};

// Message
export interface Message
  extends Identifiable,
    ExtraProp,
    OriginalProp,
    CursorProp {
  id: MessageID;
  timestamp: Date;
  editedTimestamp?: Date;
  expiresInSeconds?: number;
  senderID: "none" | "$thread" | string;
  text?: string;
  seen?: boolean;
  isDelivered?: boolean;
  isHidden?: boolean;
  isSender?: boolean;
  isAction?: boolean;
  isDeleted?: boolean;
  isErrored?: boolean;
  behavior?: MessageBehavior;
  accountID?: string;
  threadID?: ThreadID;
}
export type MessageContent = {
  text?: string;
};
export type MessageSendOptions = {
  /** random UUID for the sent message */
  pendingMessageID?: MessageID;
  /** thread ID of the quoted message, should be null if same thread as this message */
  quotedMessageThreadID?: ThreadID;
  /** message ID of the quoted message. also set `quotedMessageThreadID` if message belongs to a different thread */
  quotedMessageID?: MessageID;
};

// Thread
export type ThreadType = "single" | "group" | "channel" | "broadcast";
export interface Thread extends Identifiable, ExtraProp, OriginalProp {
  id: ThreadID;
  title?: string;
  isUnread: boolean;
  lastReadMessageID?: MessageID;
  isReadOnly: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  type: ThreadType;
  /** If null, thread won't be visible to the user in the UI unless they explicitly search for it  */
  timestamp?: Date;
  imgURL?: string;
  createdAt?: Date;
  description?: string;
  messageExpirySeconds?: number;
  messages: Paginated<Message>;
  participants: Paginated<Participant>;
}
export type Participant = User & {
  addedBy?: UserID;
  isAdmin?: boolean;
  hasExited?: boolean;
};

// User
export interface User extends Identifiable {
  id: UserID;
  username?: string;
  phoneNumber?: PhoneNumber;
  email?: string;
  fullName?: string;
  nickname?: string;
  imgURL?: string;
  isVerified?: boolean;
  cannotMessage?: boolean;
  isSelf?: boolean;
}
export type CurrentUser = User & {
  displayText?: string;
};
export type PhoneNumber = string;

// Events
export type StateSyncEvent =
  | UpsertStateSyncEvent
  | UpdateStateSyncEvent
  | DeleteStateSyncEvent
  | DeleteAllStateSyncEvent;
export type ThreadMessagesRefreshEvent = {
  type: ServerEventType.THREAD_MESSAGES_REFRESH;
  threadID: ThreadID;
};
export type SessionUpdatedEvent = {
  type: ServerEventType.SESSION_UPDATED;
};
export type RefreshAccountEvent = {
  type: ServerEventType.REFRESH_ACCOUNT;
};
export type ToastEvent = {
  type: ServerEventType.TOAST;
  toast: {
    id?: string;
    text: string;
    timeoutMs?: number;
    buttons?: Button[];
  };
};
export type UserActivityEvent = {
  type: ServerEventType.USER_ACTIVITY;
  activityType: ActivityType;
  threadID: ThreadID;
  participantID: UserID;
  /** ttl */
  durationMs?: number;
  /** used when `activityType` is ActivityType.CUSTOM */
  customLabel?: string;
};
export type UserPresence = {
  userID: UserID;
  status:
    | "online"
    | "offline"
    | "dnd"
    | "dnd_can_notify"
    | "idle"
    | "invisible"
    | "custom";
  /** used when `status` is custom */
  customStatus?: string;
  lastActive?: Date;
  /** ttl (how long should this status be active) */
  durationMs?: number;
};
export type PresenceMap = {
  [userID: string]: UserPresence;
};
export type UserPresenceEvent = {
  type: ServerEventType.USER_PRESENCE_UPDATED;
  presence: UserPresence;
};
type ObjectName =
  | "thread"
  | "message"
  | "message_reaction"
  | "message_seen"
  | "participant"
  | "custom_emoji";
type Object =
  | Thread
  | Message
  | Participant
  | MessageReaction
  | MessageSeen
  | CustomEmoji;
type StateSyncEventBase = {
  type: ServerEventType.STATE_SYNC;
  objectIDs: {
    threadID?: ThreadID;
    messageID?: MessageID;
  };
  objectName: ObjectName;
};
export type UpsertStateSyncEvent = StateSyncEventBase & {
  mutationType: "upsert";
  entries: Array<Object>;
};
export type PartialWithID<T> = Partial<T> & {
  id: string;
};
export type UpdateStateSyncEvent = StateSyncEventBase & {
  mutationType: "update";
  entries: Array<PartialWithID<Object>>;
};
export type DeleteStateSyncEvent = StateSyncEventBase & {
  mutationType: "delete";
  entries: string[];
};
export type DeleteAllStateSyncEvent = StateSyncEventBase & {
  mutationType: "delete-all";
};
export type ServerEvent =
  | StateSyncEvent
  | ThreadMessagesRefreshEvent
  | SessionUpdatedEvent
  | RefreshAccountEvent
  | ToastEvent
  | UserActivityEvent
  | UserPresenceEvent;
export type MessageSeen =
  | boolean
  | Date // for single threads
  | {
      [participantID: string]: boolean | Date;
    };
export interface MessageReaction extends Identifiable {
  id: ID;
  reactionKey: string;
  imgURL?: string;
  participantID: UserID;
  emoji?: boolean;
}
export interface CustomEmoji extends Identifiable {
  id: string;
  url: string;
}
export type Button = {
  label: string;
  linkURL: string;
};

// Enums
export enum ServerEventType {
  STATE_SYNC = "state_sync",
  TOAST = "toast",
  THREAD_MESSAGES_REFRESH = "thread_messages_refresh",
  USER_ACTIVITY = "user_activity",
  USER_PRESENCE_UPDATED = "user_presence_updated",
  SESSION_UPDATED = "session_updated",
  REFRESH_ACCOUNT = "refresh_account",
}
export enum ActivityType {
  /** when the user has stopped typing/recording */
  NONE = "none",
  /** when the user has focused the app */
  ONLINE = "online",
  /** when the user has unfocused the app */
  OFFLINE = "offline",
  TYPING = "typing",
  CUSTOM = "custom",
  RECORDING_VOICE = "recording_voice",
  RECORDING_VIDEO = "recording_video",
}
export enum InboxName {
  NORMAL = "normal",
  REQUESTS = "requests",
}
export enum MessageBehavior {
  SILENT = "silent",
  KEEP_READ = "keep_read",
  DONT_NOTIFY = "dont_notify",
}
