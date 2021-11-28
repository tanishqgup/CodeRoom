function redirectToEditor() {
    // window.location.href = ROOM_IDD + "/" + document.getElementById("name").value;
    if(sessionStorage.getItem("name")) {
        sessionStorage.removeItem("name");
    }
    sessionStorage.setItem("name", document.getElementById("name").value);
    window.location.href = ROOM_IDD;
}