import WebSocket from "ws";
import http from "http";

let wss: WebSocket.Server;

function initWebSocketServer(server: http.Server): WebSocket.Server {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
      console.log("Received message: %s", message);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}

export { initWebSocketServer, wss };
