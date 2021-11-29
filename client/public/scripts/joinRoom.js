function redirectToEditor() {
    const roomid = document.getElementById("roomid").value;
    if(sessionStorage.getItem("name")) {
        sessionStorage.removeItem("name");
    }
    sessionStorage.setItem("name", document.getElementById("name").value);
    window.location.href = "/" + roomid;
}

document.getElementById("roomid").addEventListener('keydown', (e) => {
    if(e.keyCode === 13) {
        document.getElementById("name").focus();
    }
})

document.getElementById("name").addEventListener('keydown' , (e) => {
    if(e.keyCode === 13) {
        document.getElementById("enter-room").click();
    }
});