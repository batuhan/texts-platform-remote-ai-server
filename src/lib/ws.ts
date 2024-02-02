import WebSocket from "ws";
import http from "http";
import { ServerEvent } from "@textshq/platform-sdk";

let wss: WebSocket.Server;

export const usersMap = new Map<string, WebSocket>();

function initWebSocketServer(server: http.Server): WebSocket.Server {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, request) => {
    const userID = request.headers["user-id"] as string;

    if (!userID) {
      ws.close();
      return;
    }

    usersMap.set(userID, ws);
    ws.on("message", (message) => {
      console.log("Received message: %s", message);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}

function sendEvent(event: ServerEvent, userID: string) {
  const ws = usersMap.get(userID);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

export { initWebSocketServer, sendEvent, wss };
