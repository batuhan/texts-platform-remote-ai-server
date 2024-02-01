import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const moodEnum = pgEnum("mood", ["sad", "ok", "happy"]);
export const threadTypeEnum = pgEnum("type", [
  "single",
  "group",
  "channel",
  "broadcast",
]);

export const messageBehaviorEnum = pgEnum("message_behavior", [
  "silent",
  "keep_read",
  "dont_notify",
]);

export const table = pgTable("table", {
  mood: moodEnum("mood"),
});

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey(),
  title: varchar("title"),
  isUnread: boolean("is_unread").default(false),
  lastReadMessageID: varchar("last_read_message_id"),
  isReadOnly: boolean("is_read_only").default(false),
  isArchived: boolean("is_archived"),
  isPinned: boolean("is_pinned"),
  type: threadTypeEnum("type").default("single"),
  timestamp: timestamp("timestamp").defaultNow(),
  imgURL: varchar("img_url"),
  createdAt: timestamp("created_at").defaultNow(),
  description: text("description"),
  messageExpirySeconds: integer("message_expiry_seconds"),
});

export const threadsRelations = relations(threads, ({ many }) => ({
  messages: many(messages),
  participants: many(participants),
}));

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  editedTimestamp: timestamp("edited_timestamp"),
  expiresInSeconds: integer("expires_in_seconds"),
  senderID: varchar("sender_id"),
  text: varchar("text"),
  seen: boolean("seen"),
  isDelivered: boolean("is_delivered"),
  isHidden: boolean("is_hidden"),
  isSender: boolean("is_sender"),
  isAction: boolean("is_action"),
  isDeleted: boolean("is_deleted"),
  isErrored: boolean("is_errored"),
  behavior: messageBehaviorEnum("behavior"),
  accountID: varchar("account_id"),
  threadID: varchar("thread_id"),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  threadID: one(threads, {
    fields: [messages.threadID],
    references: [threads.id],
  }),
}));

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username"),
  phoneNumber: varchar("phone_number"),
  email: varchar("email"),
  fullName: varchar("full_name"),
  nickname: varchar("nickname"),
  imgURL: varchar("img_url"),
  isVerified: boolean("is_verified"),
  cannotMessage: boolean("cannot_message"),
  isSelf: boolean("is_self"),
});

export const usersRelations = relations(users, ({ many }) => ({
  participants: many(participants),
}));

export const participants = pgTable(
  "participants",
  {
    threadID: varchar("thread_id")
      .notNull()
      .references(() => threads.id),
    userID: varchar("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => ({
    pk: primaryKey(t.threadID, t.userID),
  })
);

export const usersToThreadsRelations = relations(participants, ({ one }) => ({
  thread: one(threads, {
    fields: [participants.threadID],
    references: [threads.id],
  }),
  participants: one(users, {
    fields: [participants.userID],
    references: [users.id],
  }),
}));
