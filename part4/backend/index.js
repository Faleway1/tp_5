const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const port = Number(process.env.PORT || 8080);
const redisUrl = process.env.REDIS_URL || "redis://redis:6379";
const socketPath = process.env.SOCKET_PATH || "/socket/";

const server = http.createServer();
const io = new Server(server, {
  path: socketPath,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = ["meow", "purr", "hiss"];
let connectedCount = 0;

async function start() {
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    connectedCount += 1;
    console.log("Client connected:", socket.id);
    io.emit("user_count", connectedCount);

    socket.on("join_room", (room) => {
      if (!rooms.includes(room)) {
        return;
      }

      if (socket.data.room) {
        socket.leave(socket.data.room);
      }

      socket.join(room);
      socket.data.room = room;
    });

    socket.on("chat", (msg) => {
      console.log(`Message received: ${msg}`);

      const room = socket.data.room;
      if (room) {
        io.to(room).emit("chat", msg);
      } else {
        io.emit("chat", msg);
      }
    });

    socket.on("disconnect", () => {
      connectedCount = Math.max(0, connectedCount - 1);
      console.log("Client disconnected:", socket.id);
      io.emit("user_count", connectedCount);
    });
  });

  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
