// this is for the client side
// get the messages from dom

// Import the qs library
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const socket = io();

// get the username and room from url

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// join chatroom

socket.emit("joinRoom", { username, room });

// connect to the server

// message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  // emit message to the server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// get room and users

socket.on("roomUsers", ({ room, users }) => {
  ouputRoomName(room);
  outputUsers(users);
});

// output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
      <p class="meta">${message.username} <span>9:12pm</span></p>
      <p class="text">
        ${message.text}
      </p>
    `;
  document.querySelector(".chat-messages").appendChild(div);
}

function ouputRoomName(room) {
  roomName.innerText = room;
}
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
