const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

app.use(express.static(path.join("../client")));

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join-Room", ({ roomId, userId }) => {
        console.log("user joined the room");
        
        socket.join(roomId);

        socket.broadcast.to(roomId).emit("newUserJoined", userId);

        socket.on("code-changed", (code) => {
            socket.broadcast.to(roomId).emit("code-changed", code);
        });
    });
});

server.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
