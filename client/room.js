const socket = io("http://localhost:3000", {
    transports: ["websocket"],
});
// const socket = io();

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
    messageContainer = document.querySelector(".messageContainer");

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
    isAudioOpen = false;

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
        previouslyVisibleMenuButton = null;
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
    appendMessageOfMe(messageInput.value, "You", today.getHours() + ":" + today.getMinutes());
    sendMessageToServer(messageInput.value, "Tanishq", today.getHours() + ":" + today.getMinutes());
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
}

function toggleAudio() {
    if (isAudioOpen) {
        audioOpenIcon.style.display = "none";
        audioClosedIcon.style.display = "block";
    } else {
        audioOpenIcon.style.display = "block";
        audioClosedIcon.style.display = "none";
    }
    isAudioOpen = !isAudioOpen;
}

// eventlistners
messageInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector(".sendMessageButton").click();
    }
});

// Working with socketio Rooms
const roomId = 1; //prompt("Enter your roomId");
const userName = "tanishq"; //prompt("Enter your Name");

// 1. when a user joins room
socket.emit("join-Room", { roomId, userName });

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
socket.on("newUserJoined", (userName) => {
    console.log(userName + " has joined the room");
    appendNotification(userName + " has landed in the room");

});
// 2. receive code from server
socket.on("code-changed", (code) => {
    codeInstance.setOption("value", code);
});
// 3. receive message from other users
socket.on("messageReceived", ({ message, user, time }) => {
    appendMessageOfOther(message, user, time);
});

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
