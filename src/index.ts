import express from "express";
import http from "http";
import WebSocket from "ws";
import { searchUsers } from "./routes/searchUsers";
import { getMessages } from "./routes/getMessages";
import { getThreads } from "./routes/getThreads";
import { getThread } from "./routes/getThread";
import { createThread } from "./routes/createThread";
import { sendMessage } from "./routes/sendMessage";

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received message: %s", message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Test
app.get("/", (req, res) => res.send("Hello World!"));
app.post("/", (req, res) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
    }
  });
  res.send("Got a POST request");
});

app.post("/searchUsers", searchUsers);
app.post("/getMessages", getMessages);
app.post("/getThreads", getThreads);
app.post("/getThread", getThread);
app.post("/createThread", createThread);
app.post("/sendMessage", sendMessage);

// Define the port and start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
