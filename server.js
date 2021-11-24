const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const { v4: uuidV4 } = require('uuid');

const port = process.env.PORT || 3000;

app.set("views", path.join("./client/views"));  
app.set("view engine", "ejs");
app.use(express.static(path.join("./client/public")));

app.get("/", (req, res) => {
    // res.redirect(`/${uuidV4()}`)
    res.render("homepage");
});

app.get("/getNameInfo", (req, res) => {
    res.render("getInfo", { ROOM_ID: uuidV4() });
})

app.get("/JoinRoom", (req, res) => {
    res.render("joinRoom");
})

app.get("/:room", (req, res) => {
    res.render("index", { roomID: req.params.room });
});

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join-Room", ({ ROOM_ID, MY_ID, MY_NAME }) => {
        const userId = MY_ID, userName = MY_NAME;
        console.log(ROOM_ID, userId, userName);
        console.log("user joined the room");
        socket.join(ROOM_ID);
        socket.broadcast.to(ROOM_ID).emit("newUserJoined", { userName, userId });

        socket.on("code-changed", (code) => {
            socket.broadcast.to(ROOM_ID).emit("code-changed", code);
        });

        socket.on("messageSent", ({ message, user, time }) => {
            socket.broadcast
                .to(ROOM_ID)
                .emit("messageReceived", { message, user, time });
        });

        socket.on("disconnect", () => {
            socket.broadcast.to(ROOM_ID).emit("user-disconnected", { userId });
        })
    });
});

server.listen(port, () => {
    console.log("Server is listening on port " + port);
});
