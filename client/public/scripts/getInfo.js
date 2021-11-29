function redirectToEditor() {
    // window.location.href = ROOM_IDD + "/" + document.getElementById("name").value;
    const nameValue = document.getElementById("name").value;
    if(nameValue === "") return;
    if(sessionStorage.getItem("name")) {
        sessionStorage.removeItem("name");
    }
    sessionStorage.setItem("name", nameValue);
    window.location.href = ROOM_IDD;
}

document.getElementById("name").addEventListener('keydown' , (e) => {
    if(e.keyCode === 13) {
        document.getElementById("enter-room").click();
    }
});