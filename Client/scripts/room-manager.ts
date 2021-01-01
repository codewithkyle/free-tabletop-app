let roomWorker: Worker = new Worker(`${location.origin}/js/room-worker.js`);;
let lastRoomWorkerMessageUID = null;
let roomCode = null;
let isRoomWorkerReady = false;
let isRoomWorkerLive = false;
let promiseCallback:Function = noop;
const messageQueue:Array<Message> = [];

roomWorker.onmessage = (e:MessageEvent) => {
    const {type, data, messageUid} = e.data;
    switch(type){
        case "ready":
            isRoomWorkerReady = true;
            AttemptRoomDatabaseInit();
            break;
        case "live":
            isRoomWorkerLive = true;
            FlushMessageQueue();
            SendRoomWorkerMessage("cleanup", JSON.parse(localStorage.getItem("rooms")));
            break;
        case "get":
            promiseCallback(data);
            break;
        default:
            console.warn(`Unhandled room worker message type: ${type}`);
            break;
    }
}

function FlushMessageQueue(){
    for (let i = messageQueue.length - 1; i >= 0; i--){
        SendRoomWorkerMessage("add", messageQueue[i]);
        messageQueue.splice(i, 1);
    }
}

function SendRoomWorkerMessage(type: string, data:any = null){
    const messageUid = uid();
    lastRoomWorkerMessageUID = messageUid;
    roomWorker.postMessage({
        type: type,
        messageUid: messageUid,
        data: data
    });
}

function AttemptRoomDatabaseInit(){
    if (roomCode && isRoomWorkerReady){
        SendRoomWorkerMessage("init", roomCode);
    }
}

function SetActiveRoomCode(currentRoomCode:string){
    roomCode = currentRoomCode;
    let savedRoomCodes;
    if (localStorage.getItem("rooms")){
        savedRoomCodes = JSON.parse(localStorage.getItem("rooms"));
    }else{
        savedRoomCodes = {};
    }
    for (const key in savedRoomCodes){
        savedRoomCodes[key] = 0;
    }
    savedRoomCodes[roomCode] = 1;
    localStorage.setItem("rooms", JSON.stringify(savedRoomCodes));
    AttemptRoomDatabaseInit();
}

function GetMessages(){
    return new Promise((resolve, reject) => {
        if (isRoomWorkerLive){
            promiseCallback = resolve;
            SendRoomWorkerMessage("get");
        }else{
            reject();
        }
    });
}

function StoreMessage(message:Message){
    if (isRoomWorkerLive){
        SendRoomWorkerMessage("add", message);
    }else{
        messageQueue.push(message);
    }
}