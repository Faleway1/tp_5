const WebSocket = require("ws");

const port = Number(process.env.PORT || 8080);

const wss = new WebSocket.Server({ port });
let connectedCount = 0;

console.log(`Backend running on ws://localhost:${port}`);

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  connectedCount += 1;
  console.log("Client connected");
  broadcast({ type: "user_count", count: connectedCount });

  ws.on("message", (data) => {
    const message = data.toString();
    console.log(`Message received: ${message}`);

    broadcast({ type: "chat", message });
  });

  ws.on("close", () => {
    connectedCount = Math.max(0, connectedCount - 1);
    console.log("Client disconnected");
    broadcast({ type: "user_count", count: connectedCount });
  });
});
