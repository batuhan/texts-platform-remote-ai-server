import express from "express";
import http from "http";
import "dotenv/config";
import {
  sendMessageRoute,
  createThreadRoute,
  getThreadRoute,
  searchUsersRoute,
  getMessagesRoute,
  getThreadsRoute,
  loginRoute,
} from "./platform/routes/index";
import { db } from "./db";
import { users } from "./db/schema";
import { ServerEvent, ServerEventType, Thread } from "@textshq/platform-sdk";
import { randomUUID } from "crypto";
import { initWebSocketServer, sendEvent } from "./lib/ws";

const app = express();
const server = http.createServer(app);

app.use(express.json());

initWebSocketServer(server);

// Test
app.get("/", async (req, res) => {
  const allUsers = await db.select().from(users);

  console.log(allUsers);

  res.send({
    message: "Hello world!",
    allUsers,
  });
});
app.post("/", (req, res) => {
  const event: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "message",
    mutationType: "upsert",
    objectIDs: { threadID: "98938bc5-2a07-4408-8963-950888dc5dc5" },
    entries: [
      {
        id: randomUUID(),
        timestamp: new Date(),
        text: `text`,
        senderID: "1",
        isSender: false,
      },
    ],
  };

  sendEvent(event, "1");
  res.send("Got a POST request");
});
app.post("/thread", (req, res) => {
  const thread: Thread = {
    id: "test2",
    type: "single",
    title: "Chat Test2",
    isUnread: false,
    isReadOnly: false,
    timestamp: new Date(),
    messages: {
      items: [],
      hasMore: false,
    },
    participants: {
      hasMore: false,
      items: [],
    },
  };
  const event: ServerEvent = {
    type: ServerEventType.STATE_SYNC,
    objectName: "thread",
    mutationType: "upsert",
    objectIDs: {},
    entries: [thread],
  };

  sendEvent(event, "1");
  res.send("Got a POST request");
});

app.post("/api/login", loginRoute);
app.post("/api/searchUsers", searchUsersRoute);
app.post("/api/getMessages", getMessagesRoute);
app.post("/api/getThreads", getThreadsRoute);
app.post("/api/getThread", getThreadRoute);
app.post("/api/createThread", createThreadRoute);
app.post("/api/sendMessage", sendMessageRoute);

// Define the port and start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
