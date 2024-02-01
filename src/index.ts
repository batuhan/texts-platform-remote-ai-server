import express from "express";
import http from "http";
import "dotenv/config";
import { searchUsers } from "./routes/searchUsers";
import { getMessages } from "./routes/getMessages";
import { getThreads } from "./routes/getThreads";
import { getThread } from "./routes/getThread";
import { createThread } from "./routes/createThread";
import { sendMessage } from "./routes/sendMessage";
import { db } from "./db";
import { users } from "./db/schema";
import { ServerEvent, ServerEventType, Thread } from "@textshq/platform-sdk";
import { randomUUID } from "crypto";
import { initWebSocketServer, wss } from "./lib/ws";
import WebSocket from "ws";

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

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
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

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
  res.send("Got a POST request");
});

app.post("/api/searchUsers", searchUsers);
app.post("/api/getMessages", getMessages);
app.post("/api/getThreads", getThreads);
app.post("/api/getThread", getThread);
app.post("/api/createThread", createThread);
app.post("/api/sendMessage", sendMessage);

// Define the port and start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
