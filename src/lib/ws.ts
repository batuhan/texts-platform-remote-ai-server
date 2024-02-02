import WebSocket from "ws";
import http from "http";
import { ServerEvent } from "./types";

let wss: WebSocket.Server;

export const wsMap = new Map<string, WebSocket>();

function initWebSocketServer(server: http.Server): WebSocket.Server {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, request) => {
    const userID = request.headers["user-id"] as string;

    if (!userID) {
      ws.close();
      return;
    }

    wsMap.set(userID, ws);
    ws.on("message", (message) => {
      console.log("Received message: %s", message);
    });

    ws.on("close", () => {
      wsMap.delete(userID);
      console.log("Client disconnected");
    });
  });

  return wss;
}

function sendEvent(event: ServerEvent, userID: string) {
  const ws = wsMap.get(userID);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

export { initWebSocketServer, sendEvent, wss };
