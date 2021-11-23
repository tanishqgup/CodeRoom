const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join("./client")));

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join-Room", ({ ROOM_ID, MY_ID, MY_NAME }) => {
        console.log(ROOM_ID, MY_ID, MY_NAME);
        console.log("user joined the room");
        socket.join(ROOM_ID);
        socket.broadcast.to(ROOM_ID).emit("newUserJoined", {MY_NAME, MY_ID});

        socket.on("code-changed", (code) => {
            socket.broadcast.to(ROOM_ID).emit("code-changed", code);
        });

        socket.on("messageSent", ({message, user, time}) => {
            socket.broadcast.to(ROOM_ID).emit("messageReceived", {message, user, time});
        });
    });
});

server.listen(port, () => {
    console.log("Server is listening on port " + port);
});
