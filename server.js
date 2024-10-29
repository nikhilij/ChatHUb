const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();

// Create server
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botname = "ChatHub Bot";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    if (!user) {
      console.error("User join failed");
      return;
    }

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botname, "Welcome to ChatHub"));

    // Broadcast when a user connects to the room
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    if (!user) {
      console.error("User not found for message:", msg);
      return;
    }

    // Emit the message to the specific room
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );

      // Send updated users and room info only if the user exists
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
