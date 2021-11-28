const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const { v4: uuidV4 } = require('uuid');

var createdRooms = [];

const port = process.env.PORT || 3000;

app.set("views", path.join("./client/views"));  
app.set("view engine", "ejs");
app.use(express.static(path.join("./client/public")));

app.get("/", (req, res) => {
    res.render("homepage");
    return;
});

app.get("/getNameInfo", (req, res) => {
    const ROOM_ID = uuidV4();
    createdRooms.push(ROOM_ID);
    res.render("getInfo", { ROOM_ID });
})

app.get("/JoinRoom", (req, res) => {
    res.render("joinRoom");
})

// app.get("/:room/:name", (req, res) => {
//     console.log(req.params);
//     const idx = createdRooms.find(currentRoomID => currentRoomID === req.params.room);
//     if(idx === undefined) {
//         res.render("idNotFound");
//         return;
//     }
//     res.render("index", { roomID: req.params.room, userName: req.params.name });
//     // res.redirect("index", { roomID: req.params.room, userName: req.params.name });
// });

app.get("/:room", (req, res) => {
    console.log(req.params, " hello");
    const idx = createdRooms.find(currentRoomID => currentRoomID === req.params.room);
    if(idx === undefined) {
        res.render("idNotFound");
        return;
    }
    res.render("index", { roomID: req.params.room});
    // res.redirect("index", { roomID: req.params.room, userName: req.params.name });
});

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("join-Room", ({ ROOM_ID, MY_ID, USER_NAME }) => {
        const userId = MY_ID, userName = USER_NAME;
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
            socket.broadcast.to(ROOM_ID).emit("user-disconnected", { userName });
        })
    });
});

server.listen(port, () => {
    console.log("Server is listening on port " + port);
});
