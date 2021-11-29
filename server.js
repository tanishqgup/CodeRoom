// const path = require("path");
// const express = require("express");
// const app = express();
// const server = require("http").createServer(app);
// const socketio = require("socket.io");
// const io = socketio(server);
// const { v4: uuidV4 } = require('uuid');

// var createdRooms = [];

// const port = process.env.PORT || 3000;

// app.set("views", path.join("./client/views"));  
// app.set("view engine", "ejs");
// app.use(express.static(path.join("./client/public")));

// app.get("/", (req, res) => {
//     res.render("homepage");
// });

// app.get("/getNameInfo", (req, res) => {
//     const ROOM_ID = uuidV4();
//     createdRooms.push(ROOM_ID);
//     res.render("getInfo", { ROOM_ID });
// })

// app.get("/JoinRoom", (req, res) => {
//     res.render("joinRoom", { roomID : "NO_ID" });
// })

// app.get("/JoinRoom/:id", (req, res) => {
//     res.render("joinRoom", { roomID : req.params.id });
// })

// app.get("/:room", (req, res) => {
//     const idx = createdRooms.find(currentRoomID => currentRoomID === req.params.room);
//     if(idx === undefined) {
//         res.render("idNotFound");
//     }
//     else {
//         res.render("index", { roomID: req.params.room});
//     }
// });

// io.on("connection", (socket) => {
//     socket.on("join-Room", ({ ROOM_ID, MY_ID, USER_NAME }) => {
//         const userId = MY_ID, userName = USER_NAME;
//         socket.join(ROOM_ID);
//         socket.broadcast.to(ROOM_ID).emit("newUserJoined", { userName, userId });

//         socket.on("code-changed", (code) => {
//             socket.broadcast.to(ROOM_ID).emit("code-changed", code);
//         });

//         socket.on("messageSent", ({ message, user, time }) => {
//             socket.broadcast
//                 .to(ROOM_ID)
//                 .emit("messageReceived", { message, user, time });
//         });

//         socket.on("disconnect", () => {
//             socket.broadcast.to(ROOM_ID).emit("user-disconnected", { userName, userId });
//         })
//     });
// });

// server.listen(port, () => {
//     console.log("Server is listening on port " + port);
// });

// after change

const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const { v4: uuidV4 } = require('uuid');

const currentlyActiveRooms = {};
const port = process.env.PORT || 3000;

app.set("views", path.join("./client/views"));  
app.set("view engine", "ejs");
app.use(express.static(path.join("./client/public")));

app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/getNameInfo", (req, res) => {
    const ROOM_ID = uuidV4();
    // createdRooms.push(ROOM_ID);
    addRoom(ROOM_ID);
    res.render("getInfo", { ROOM_ID });
})

app.get("/JoinRoom", (req, res) => {
    res.render("joinRoom", { roomID : "NO_ID" });
})

app.get("/JoinRoom/:id", (req, res) => {
    res.render("joinRoom", { roomID : req.params.id });
})

app.get("/:room", (req, res) => {
    if(!isValidRoomId(req.params.room)) {
        res.render("idNotFound");
    }
    else {
        res.render("index", { roomID: req.params.room});
    }
});

io.on("connection", (socket) => {
    socket.on("join-Room", ({ ROOM_ID, MY_ID, USER_NAME }) => {
        joinRoom(USER_NAME, MY_ID, ROOM_ID);
        const userId = MY_ID, userName = USER_NAME;
        socket.join(ROOM_ID);
        socket.broadcast.to(ROOM_ID).emit("newUserJoined", { userName, userId });
        socket.emit("updateUsersCount", { countOfUsersFromServer: usersInRoomId(ROOM_ID) });

        socket.on("code-changed", (code) => {
            socket.broadcast.to(ROOM_ID).emit("code-changed", code);
        });

        socket.on("messageSent", ({ message, user, time }) => {
            socket.broadcast
                .to(ROOM_ID)
                .emit("messageReceived", { message, user, time });
        });

        socket.on("disconnect", () => {
            leaveRoom(userName, userId, ROOM_ID);
            socket.broadcast.to(ROOM_ID).emit("user-disconnected", { userName, userId });
        })
    });
});

server.listen(port, () => {
    console.log("Server is listening on port " + port);
});

function addRoom(ROOM_ID) {
    currentlyActiveRooms[ROOM_ID] = {};
    console.log(currentlyActiveRooms);
}

function isValidRoomId(ROOM_ID) {
    return currentlyActiveRooms[ROOM_ID] !== undefined;
}

function joinRoom(USER_NAME, USER_ID, ROOM_ID) {
    if(currentlyActiveRooms[ROOM_ID] === undefined) {
        currentlyActiveRooms[ROOM_ID] = {};
    }
    currentlyActiveRooms[ROOM_ID][USER_ID] = USER_NAME;
    console.log(currentlyActiveRooms);
}

function leaveRoom(USER_NAME, USER_ID, ROOM_ID) {
    if(currentlyActiveRooms[ROOM_ID] === undefined) throw null;
    if(currentlyActiveRooms[ROOM_ID][USER_ID] === undefined) throw null;
    if(currentlyActiveRooms[ROOM_ID][USER_ID] !== USER_NAME) throw null;
    delete currentlyActiveRooms[ROOM_ID][USER_ID];
    if(Object.keys(currentlyActiveRooms[ROOM_ID]).length === 0) {
        delete currentlyActiveRooms[ROOM_ID];
    }
    console.log(currentlyActiveRooms);
}

function usersInRoomId(ROOM_ID) {
    return Object.keys(currentlyActiveRooms[ROOM_ID]).length;
}