function redirectToEditor() {
    const roomid = document.getElementById("roomid").value;
    if(sessionStorage.getItem("name")) {
        sessionStorage.removeItem("name");
    }
    sessionStorage.setItem("name", document.getElementById("name").value);
    // window.location.href = roomid + "/" + document.getElementById("name").value;
    window.location.href = roomid;
}