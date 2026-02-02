const socket = io("http://localhost:8080");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const roomButtons = document.querySelectorAll(".rooms button");

let activeRoom = null;

socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
});

socket.on("chat", (msg) => {
  console.log("Message received:", msg);
  const line = document.createElement("div");
  line.textContent = activeRoom ? `[${activeRoom}] ${msg}` : msg;
  chat.appendChild(line);
  chat.scrollTop = chat.scrollHeight;
});

socket.on("user_count", (count) => {
  status.textContent = `Connected users: ${count}`;
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeRoom = button.dataset.room;
    socket.emit("join_room", activeRoom);
  });
});

function send() {
  const input = document.getElementById("msg");

  if (input.value.trim() !== "") {
    socket.emit("chat", input.value);
    input.value = "";
  }
}
