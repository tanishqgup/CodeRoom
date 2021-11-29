const currentlyActiveRooms = {};

function isValidRoomId(ROOM_ID) {
    return currentlyActiveRooms.ROOM_ID !== undefined;
}

function joinRoom(USER_NAME, USER_ID, ROOM_ID) {
    if(currentlyActiveRooms.ROOM_ID === undefined) {
        currentlyActiveRooms.ROOM_ID = {};
    }
    currentlyActiveRooms.ROOM_ID.USER_ID = USER_NAME;
}

function leaveRoom(USER_NAME, USER_ID, ROOM_ID) {
    if(currentlyActiveRooms.ROOM_ID === undefined) throw null;
    if(currentlyActiveRooms.ROOM_ID.USER_ID === undefined) throw null;
    if(currentlyActiveRooms.ROOM_ID.USER_ID !== USER_NAME) throw null;
    delete currentlyActiveRooms.ROOM_ID.USER_ID;
    if(Object.keys(currentlyActiveRooms.ROOM_ID).length === 0) {
        delete currentlyActiveRooms.ROOM_ID;
    }
}