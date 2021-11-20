const socket = io("http://localhost:3000", {
    transports: ["websocket", "polling", "flashsocket"],
});

const menuDescriptions = document.querySelector(".menuDescriptions"),
    menu = document.querySelector(".menu"),
    editor = document.querySelector(".editor"),
    videoOpenIcon = document.getElementById("video-open-icon"),
    videoClosedIcon = document.getElementById("video-close-icon"),
    audioOpenIcon = document.getElementById("audio-open-icon"),
    audioClosedIcon = document.getElementById("audio-close-icon"),
    settingMenu = document.querySelector(".settingMenu"),
    messageMenu = document.querySelector(".messageMenu");

const menuDescriptionsMappings = {
    editorSettings: settingMenu,
    messageMenu: messageMenu,
};

let currentLanguage = "cpp",
    currentTheme = "monokai",
    currentFontSize = "4",
    currentTabSpacing = "4",
    currentKeyMap = "",
    previouslyVisibleDescriptionMenu = settingMenu;

let ismenuDescriptionsClosed = true,
    isVideoOpen = false,
    isAudioOpen = false;

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
}

function openMenuDescription(e) {
    const selectedMenu = menuDescriptionsMappings[e.id];
    if (!ismenuDescriptionsClosed && (selectedMenu === previouslyVisibleDescriptionMenu)) {
        closeMenuDescriptions();
        return;
    }
    previouslyVisibleDescriptionMenu.style.display = "none";
    selectedMenu.style.display = "block";
    editor.style.width = "calc(100% - 550px)";
    menuDescriptions.style.width = "250px";
    ismenuDescriptionsClosed = false;
    previouslyVisibleDescriptionMenu = selectedMenu;
}

function downloadCode() {
    download("HappyCoding-CodeRoom", codeInstance.getValue());
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function handleLanguageSelection(e) {
    currentLanguage = e;
    codeInstance.setOption("mode", languageInEditor[e]);
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
    console.log("Changed " + e);
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

// Working with socketio Rooms
const roomId = "1";
const userId = "Tanishq";

// when a user joins room
socket.emit("join-Room", { roomId, userId });

// 1. receive acknowledgement from server
socket.on("newUserJoined", (userId) => {
    console.log(userId + " has joined the room");
});
// 2. Sending code to server
editor.addEventListener("keyup", () => {
    socket.emit("code-changed", codeInstance.getValue());
});

// Receiving data from servers
// 1. receive acknowledgement from server
socket.on("newUserJoined", (userId) => {
    console.log(userId + " has joined the room");
});
// 2. receive code from server
socket.on("code-changed", (code) => {
    codeInstance.setOption("value", code);
});

// Running Code
const runner = async () => {
    var runnerid = "";
    await fetch(
        "https://api.paiza.io/runners/create?" +
            new URLSearchParams({
                source_code: codeInstance.getValue(),
                language: currentLanguage,
                input: "",
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
            var output = "";
            if (json.stdout !== null && json.stdout !== "") {
                output += json.stdout;
            }
            if (json.stderr !== null && json.stderr !== "") {
                output += json.stderr;
            }
            if (json.build_stderr !== null && json.build_stderr !== "") {
                output += json.build_stderr;
            }
            // outputeditor1.setValue(output, 1);
            console.log(output);
        });
};
