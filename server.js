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
    socket.on("join-Room", ({ roomId, userName }) => {
        console.log("user joined the room");
        
        socket.join(roomId);

        socket.broadcast.to(roomId).emit("newUserJoined", userName);

        socket.on("code-changed", (code) => {
            socket.broadcast.to(roomId).emit("code-changed", code);
        });

        socket.on("messageSent", ({message, user, time}) => {
            socket.broadcast.to(roomId).emit("messageReceived", {message, user, time});
        });
    });
});

server.listen(port, () => {
    console.log("Server is listening on port " + port);
});
