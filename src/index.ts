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
  initRoute,
} from "./platform/routes/index";
import { initWebSocketServer } from "./lib/ws";

const app = express();
const server = http.createServer(app);

app.use(express.json());

initWebSocketServer(server);

app.post("/api/login", loginRoute);
app.post("/api/init", initRoute);
app.post("/api/searchUsers", searchUsersRoute);
app.post("/api/getMessages", getMessagesRoute);
app.post("/api/getThreads", getThreadsRoute);
app.post("/api/getThread", getThreadRoute);
app.post("/api/createThread", createThreadRoute);
app.post("/api/sendMessage", sendMessageRoute);

// Define the port and start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
