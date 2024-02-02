import {
  Message,
  MessageBehavior,
  Thread,
  User,
} from "@textshq/platform-sdk";
import {
  MessageDBSelect,
  ThreadWithMessagesAndParticipants,
  UserDBSelect,
} from "./types";

export function mapDbThreadToTextsThread(
  obj: ThreadWithMessagesAndParticipants
) {
  const thread: Thread = {
    id: obj.id,
    title: obj.title || undefined,
    isUnread: obj.isUnread || false,
    lastReadMessageID: obj.lastReadMessageID || undefined,
    isReadOnly: obj.isReadOnly || false,
    isArchived: obj.isArchived || undefined,
    isPinned: obj.isPinned || undefined,
    type: obj.type || "single",
    timestamp: obj.timestamp || undefined,
    imgURL: obj.imgURL || undefined,
    createdAt: obj.createdAt || undefined,
    description: obj.description || undefined,
    messageExpirySeconds: obj.messageExpirySeconds || undefined,
    participants: {
      items: obj.participants.map((userId) => {
        return {
          id: userId.participants.id,
          fullName: userId.participants.fullName || undefined,
          imgURL: userId.participants.imgURL || undefined,
        };
      }),
      hasMore: false,
    },
    messages: {
      items: obj.messages.map((message) => {
        return {
          id: message.id,
          threadID: message.threadID ? message.threadID : undefined,
          text: message.text ? message.text : undefined,
          timestamp: message.timestamp ? message.timestamp : new Date(),
          senderID: message.senderID || "",
        };
      }),
      hasMore: false,
    },
  };

  return thread;
}

export function mapDbMessageToTextsMessage(obj: MessageDBSelect) {
  const message: Message = {
    id: obj.id,
    timestamp: obj.timestamp || new Date(),
    editedTimestamp: obj.editedTimestamp || undefined,
    expiresInSeconds: obj.expiresInSeconds || undefined,
    senderID: obj.senderID || "",
    text: obj.text || undefined,
    seen: obj.seen || undefined,
    threadID: obj.threadID || undefined,
    isDelivered: obj.isDelivered || undefined,
    isHidden: obj.isHidden || undefined,
    isSender: obj.isSender || undefined,
    isAction: obj.isAction || undefined,
    isDeleted: obj.isDeleted || undefined,
    isErrored: obj.isErrored || undefined,
    behavior: obj.behavior ? (obj.behavior as MessageBehavior) : undefined,
    accountID: obj.accountID || undefined,
  };

  return message;
}

export function mapDbUserToTextsUser(obj: UserDBSelect) {
  const user: User = {
    id: obj.id,
    username: obj.username || undefined,
    phoneNumber: obj.phoneNumber || undefined,
    email: obj.email || undefined,
    fullName: obj.fullName || undefined,
    nickname: obj.nickname || undefined,
    imgURL: obj.imgURL || undefined,
    isVerified: obj.isVerified || undefined,
    cannotMessage: obj.cannotMessage || undefined,
    isSelf: obj.isSelf || undefined,
  };

  return user;
}