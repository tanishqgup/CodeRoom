const USER_NAME = sessionStorage.getItem("name");

if(USER_NAME === null) {
    window.location.href = "/JoinRoom/" + ROOM_ID;
}

let totalUsers = 0;

const socket = io("/");
let MY_ID = undefined;

const myPeer = new Peer(undefined);

const peers = {};

myPeer.on("open", (id) => {
    MY_ID = id;
    sendJoinToServer();
});

const today = new Date();

const menuDescriptions = document.querySelector(".menuDescriptions"),
    menu = document.querySelector(".menu"),
    editor = document.querySelector(".editor"),
    videoOpenIcon = document.getElementById("video-open-icon"),
    videoClosedIcon = document.getElementById("video-close-icon"),
    audioOpenIcon = document.getElementById("audio-open-icon"),
    audioClosedIcon = document.getElementById("audio-close-icon"),
    settingMenu = document.querySelector(".settingMenu"),
    messageMenu = document.querySelector(".messageMenu"),
    inputOutputMenu = document.querySelector(".inputOutputMenu"),
    notificationsCointainer = document.querySelector(
        ".notificationsCointainer"
    ),
    input = document.getElementById("input"),
    output = document.getElementById("output"),
    messageInput = document.querySelector(".messageInput"),
    messageContainer = document.querySelector(".messageContainer"),
    videoTab = document.querySelector(".videotab");

var myVideoStream;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        stream.getAudioTracks()[0].enabled = true;
        myVideoStream = stream;
        const myVideoDiv = document.createElement("div");
        myVideoDiv.className = "videoDiv";
        const videoObject = document.createElement("video");
        videoObject.muted = "true";
        addVideoStream(videoObject, stream, myVideoDiv);
        myPeer.on("call", (call) => {
            call.answer(stream);
            const videoDiv = document.createElement("div");
            videoDiv.className = "videoDiv";
            const videoObject = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(videoObject, userVideoStream, videoDiv);
            });
        });
        socket.on("newUserJoined", ({ userName, userId }) => {
            totalUsers++;
            appendNotification(userName + " has joined the room. Please wait we are adding his video and audio.");
            setTimeout(() => {
                connectToNewUser(userId, stream);
            }, 3000);
        });
    });

function addVideoStream(video, stream, videoDiv) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoDiv.append(video);
    videoTab.append(videoDiv);
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const videoDiv = document.createElement("div");
    videoDiv.className = "videoDiv";
    const videoObject = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(videoObject, userVideoStream, videoDiv);
    });
    call.on("close", () => {
        videoDiv.remove();
    });
    peers[userId] = call;
}

const menuDescriptionsMappings = {
    editorSettings: settingMenu,
    messageMenu: messageMenu,
    inputOutputMenu: inputOutputMenu,
};

const menuButtonsMappings = {
    editorSettings: "option1",
    messageMenu: "option4",
    inputOutputMenu: "option5",
};

let currentLanguage = "cpp",
    currentTheme = "monokai",
    currentFontSize = "4",
    currentTabSpacing = "4",
    currentKeyMap = "",
    previouslyVisibleDescriptionMenu = settingMenu,
    previouslyVisibleMenuButton = null;

let ismenuDescriptionsClosed = true,
    isVideoOpen = false,
    isAudioOpen = true;

let activeNotificationIds = [];

const languageInEditor = {
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    python3: "python",
    java: "text/x-java",
    javascript: "javascript",
};

const codeInstance = CodeMirror(editor, {
    lineNumbers: true,
    tabSize: currentTabSpacing,
    value: "",
    mode: "text/c-c++src",
    theme: "monokai",
});

function closeMenuDescriptions() {
    if (ismenuDescriptionsClosed) throw null;
    menuDescriptions.style.width = "0px";
    ismenuDescriptionsClosed = true;
    editor.style.width = "calc(100% - 300px)";
    previouslyVisibleMenuButton.style.backgroundColor = "#30353e";
    previouslyVisibleMenuButton = null;
}

function openMenuDescription(e) {
    const selectedMenu = menuDescriptionsMappings[e.id];
    const selectedMenuButton = document.getElementById(e.id);
    if (
        !ismenuDescriptionsClosed &&
        selectedMenu === previouslyVisibleDescriptionMenu
    ) {
        selectedMenuButton.style.backgroundColor = "#30353e";
        closeMenuDescriptions();
        return;
    }
    selectedMenuButton.style.backgroundColor = "gray";
    previouslyVisibleDescriptionMenu.style.display = "none";
    if (previouslyVisibleMenuButton !== null) {
        previouslyVisibleMenuButton.style.backgroundColor = "#30353e";
    }
    selectedMenu.style.display = "block";
    editor.style.width = "calc(100% - 550px)";
    menuDescriptions.style.width = "250px";
    ismenuDescriptionsClosed = false;
    previouslyVisibleDescriptionMenu = selectedMenu;
    previouslyVisibleMenuButton = selectedMenuButton;
}

function downloadCode() {
    appendNotification("Starting download");
    download("HappyCoding-CodeRoom", codeInstance.getValue());
}

function download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function appendNotification(notification) {
    const div = document.createElement("div");
    div.classList.add("commonNotification");
    div.id = uuid();
    activeNotificationIds.push(div.id);
    const button = document.createElement("button");
    button.classList.add("closeNotification");
    button.classList.add(div.id);
    const i = document.createElement("i");
    button.setAttribute("onclick", "deleteNotification(this)");
    i.classList.add("fa");
    i.classList.add("fa-close");
    button.append(i);
    const p = document.createElement("p");
    p.classList.add("notificationText");
    p.innerText = notification;
    div.append(button);
    div.append(p);
    notificationsCointainer.append(div);
    setTimeout(() => {
        div.style.opacity = "0";
    }, 3000);
    setTimeout(() => {
        const success = removeIdFromActiveNotification(div.id);
        if (!success) return;
        notificationsCointainer.removeChild(div);
    }, 6000);
}

function appendMessageOfOther(message, user, time) {
    const otherMessageContainerDiv = document.createElement("div");
    otherMessageContainerDiv.classList.add("otherMessageContainer");
    const messageArrowDiv = document.createElement("div");
    messageArrowDiv.classList.add("messageArrow");
    const otherMessageDiv = document.createElement("div");
    otherMessageDiv.classList.add("otherMessage");
    const othermessageContentDiv = document.createElement("div");
    othermessageContentDiv.classList.add("othermessageContent");
    const messageP = document.createElement("p");
    messageP.innerText = message;
    const othermessageSenderDiv = document.createElement("div");
    othermessageSenderDiv.classList.add("othermessageSender");
    const otherMessageSenderP = document.createElement("p");
    otherMessageSenderP.innerText = user + " | " + time;
    othermessageSenderDiv.append(otherMessageSenderP);
    othermessageContentDiv.append(messageP);
    otherMessageDiv.append(othermessageContentDiv);
    otherMessageDiv.append(othermessageSenderDiv);
    otherMessageContainerDiv.append(messageArrowDiv);
    otherMessageContainerDiv.append(otherMessageDiv);
    messageContainer.append(otherMessageContainerDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendMessageOfMe(message, user, time) {
    const myMessageContainerDiv = document.createElement("div");
    myMessageContainerDiv.classList.add("myMessageContainer");
    const messageArrowDiv = document.createElement("div");
    messageArrowDiv.classList.add("messageArrow");
    const myMessageDiv = document.createElement("div");
    myMessageDiv.classList.add("myMessage");
    const messageContentDiv = document.createElement("div");
    messageContentDiv.classList.add("messageContent");
    const messageP = document.createElement("p");
    messageP.innerText = message;
    const messageSenderDiv = document.createElement("div");
    messageSenderDiv.classList.add("messageSender");
    const MessageSenderP = document.createElement("p");
    MessageSenderP.innerText = user + " | " + time;
    messageSenderDiv.append(MessageSenderP);
    messageContentDiv.append(messageP);
    myMessageDiv.append(messageContentDiv);
    myMessageDiv.append(messageSenderDiv);
    myMessageContainerDiv.append(myMessageDiv);
    myMessageContainerDiv.append(messageArrowDiv);
    messageContainer.append(myMessageContainerDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function removeIdFromActiveNotification(id) {
    let idx = -1;
    for (let i = 0; i < activeNotificationIds.length; i++) {
        if (id === activeNotificationIds[i]) {
            idx = i;
        }
    }
    if (idx === -1) return false;
    activeNotificationIds.splice(idx, 1);
    return true;
}

function deleteNotification(e) {
    const id = e.classList[1];
    const success = removeIdFromActiveNotification(id);
    if (!success) return;
    const div = document.getElementById(id);
    notificationsCointainer.removeChild(div);
}

function handleLanguageSelection(e) {
    currentLanguage = e;
    codeInstance.setOption("mode", languageInEditor[e]);
}

function sendMessage() {
    if (messageInput.value === "" || messageInput.value.trim() === "") {
        return;
    }
    appendMessageOfMe(
        messageInput.value,
        "You",
        today.getHours() + ":" + today.getMinutes()
    );
    sendMessageToServer(
        messageInput.value,
        USER_NAME,
        today.getHours() + ":" + today.getMinutes()
    );
    messageInput.value = "";
}

function handleFontSizeSelection(e) {
    currentFontSize = e;
    editor.style.fontSize = e + "px";
}

function handleTabSizeSelection(e) {
    currentTabSpacing = e;
    codeInstance.setOption("tabSize", currentTabSpacing);
}

function handleThemeSelection(e) {
    currentTheme = e;
    codeInstance.setOption("theme", currentTheme);
}

function handleKeyMapSelection(e) {
    currentKeyMap = e;
}

function toggleVideo() {
    if (isVideoOpen) {
        videoOpenIcon.style.display = "none";
        videoClosedIcon.style.display = "block";
    } else {
        videoOpenIcon.style.display = "block";
        videoClosedIcon.style.display = "none";
    }
    isVideoOpen = !isVideoOpen;
    myVideoStream.getVideoTracks()[0].stop();
}

function toggleAudio() {
    if (isAudioOpen) {
        audioOpenIcon.style.display = "none";
        audioClosedIcon.style.display = "block";
        appendNotification("Your mike is off. If you want to enable it then press audio button.")
    } else {
        audioOpenIcon.style.display = "block";
        audioClosedIcon.style.display = "none";
        appendNotification("Your mike is on. If you want to disable it then press audio button.")
    }
    isAudioOpen = !isAudioOpen;
    if(isAudioOpen) myVideoStream.getAudioTracks()[0].enabled = true;
    else myVideoStream.getAudioTracks()[0].enabled = false;
}

function handleCopyId() {
    navigator.clipboard.writeText(ROOM_ID);
    appendNotification("Room Id copied to clipboard");
}

function handleLeaveRoom() {
    sessionStorage.removeItem("name");
    appendNotification(USER_NAME + " have left the room");
    window.location.href = "/";
}

// eventlistners
messageInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector(".sendMessageButton").click();
    }
});

// Working with socketio Rooms

// 1. when a user joins room
function sendJoinToServer() {
    socket.emit("join-Room", { ROOM_ID, MY_ID, USER_NAME });
    appendNotification("Your mike is on. If you want to disable it then press audio button.")
}

// 2. Sending code to server
editor.addEventListener("keyup", () => {
    socket.emit("code-changed", codeInstance.getValue());
});

// 3. when a user send message
function sendMessageToServer(message, user, time) {
    socket.emit("messageSent", { message, user, time });
}

// Receiving data from servers
// 1. receive acknowledgement from server
// socket.on("newUserJoined", ({ USER_NAME, MY_ID }) => {
//     appendNotification(USER_NAME + " has landed in the room with id " + MY_ID);
// });
// 2. receive code from server
socket.on("code-changed", (code) => {
    codeInstance.setOption("value", code);
});
// 3. receive message from other users
socket.on("messageReceived", ({ message, user, time }) => {
    appendMessageOfOther(message, user, time);
    appendNotification(user + " has sent a message on in messages.");
});

socket.on("user-disconnected", ({ userName, userId }) => {
    appendNotification(userName + " have left the room");
    totalUsers--;
    if(peers[userId]) peers[userId].close();
})

socket.on("updateUsersCount", ({countOfUsersFromServer}) => {
    totalUsers = countOfUsersFromServer;
})

// Running Code
const runner = async () => {
    appendNotification("Code is running. Please be patient");
    var runnerid = "";
    await fetch(
        "https://api.paiza.io/runners/create?" +
            new URLSearchParams({
                source_code: codeInstance.getValue(),
                language: currentLanguage,
                input: input.value,
                longpoll: "true",
                api_key: "guest",
            }),
        { method: "POST" }
    )
        .then((response) => response.json())
        .then((json) => {
            runnerid = json.id;
        });

    var flag = true;
    while (flag) {
        await fetch(
            "https://api.paiza.io/runners/get_status?" +
                new URLSearchParams({
                    id: runnerid,
                    api_key: "guest",
                }),
            { method: "GET" }
        )
            .then((response) => response.json())
            .then((json) => {
                flag = json.status !== "completed";
            });
    }

    await fetch(
        "https://api.paiza.io/runners/get_details?" +
            new URLSearchParams({
                id: runnerid,
                api_key: "guest",
            }),
        { method: "GET" }
    )
        .then((response) => response.json())
        .then((json) => {
            var out = "";
            if (json.stdout !== null && json.stdout !== "") {
                out += json.stdout;
            }
            if (json.stderr !== null && json.stderr !== "") {
                out += json.stderr;
            }
            if (json.build_stderr !== null && json.build_stderr !== "") {
                out += json.build_stderr;
            }
            output.value = out;
            appendNotification(
                "Code successfully ran. Please see output in output tab"
            );
        });
};

// helper functions

function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}


window.onbeforeunload = function (e) {
    e = e || window.event;
    if (e) {e.returnValue = 'Sure?';}
    return 'Sure?';
};

function handleClosePopUp() {
    document.querySelector(".pop_up").style.display = "none";
}

function handleShowPopUp() {
    if(totalUsers === 1) {
        document.querySelector('.lastPP').innerText = "You are the last user in this room .If you will leave the room It will be expired";
    }
    else {
        document.querySelector(".lastPP").innerText = "";
    }
    document.querySelector(".pop_up").style.display = "flex";
}

function roomExpired() {
    window.location.href = "/";
}