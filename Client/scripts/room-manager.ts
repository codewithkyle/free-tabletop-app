let roomWorker: Worker = new Worker(`${location.origin}/js/room-worker.js`);;
let lastRoomWorkerMessageUID = null;
let roomCode = null;
let isRoomWorkerReady = false;
let isRoomWorkerLive = false;
let promiseCallbacks = {};
const messageQueue:Array<Message> = [];
const imageQueue:Array<{
    url: string;
    label: string;
}> = [];

roomWorker.onmessage = (e:MessageEvent) => {
    const {type, data, messageUid} = e.data;
    switch(type){
        case "ready":
            isRoomWorkerReady = true;
            AttemptRoomDatabaseInit();
            break;
        case "live":
            isRoomWorkerLive = true;
            FlushQueues();
            SendRoomWorkerMessage("cleanup", JSON.parse(localStorage.getItem("rooms")));
            break;
        case "get":
            handleDataFromRoomWorker(messageUid, data);
            break;
        default:
            console.warn(`Unhandled room worker message type: ${type}`);
            break;
    }
}

function handleDataFromRoomWorker(messageId, data){
    const callback = promiseCallbacks?.[messageId] ?? null;
    if (callback){
        if (data.type === "error"){
            promiseCallbacks[messageId].reject(data);
        } else {
            promiseCallbacks[messageId].resolve(data);
        }
        delete promiseCallbacks[messageId];
    }
}

function stashRoomWorkerMessageCallback(messageId, resolve, reject){
    promiseCallbacks[`${messageId}`] = {
        resolve: resolve,
        reject: reject,
    };
}

function FlushQueues(){
    for (let i = messageQueue.length - 1; i >= 0; i--){
        SendRoomWorkerMessage("add-message", messageQueue[i]);
        messageQueue.splice(i, 1);
    }
    for (let i = imageQueue.length - 1; i >= 0; i--){
        SendRoomWorkerMessage("add-image", imageQueue[i]);
        imageQueue.splice(i, 1);
    }
}

function SendRoomWorkerMessage(type: string, data:any = null, resolve = null, reject = () => {}){
    const messageUid = uid();
    if (resolve !== null){
        stashRoomWorkerMessageCallback(messageUid, resolve, reject);
    }
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
            SendRoomWorkerMessage("get-messages", null, resolve, reject);
        }else{
            reject();
        }
    });
}

function StoreMessage(message:Message){
    if (isRoomWorkerLive){
        SendRoomWorkerMessage("add-message", message);
    }else{
        messageQueue.push(message);
    }
}

function StoreImage(url:string, label:string){
    if (isRoomWorkerLive){
        SendRoomWorkerMessage("add-image", {
            url: url,
            label: label ?? url
        });
    }else{
        imageQueue.push({
            url: url,
            label: label ?? url
        });
    }
}

function GetImages(){
    return new Promise((resolve, reject) => {
        if (isRoomWorkerLive){
            SendRoomWorkerMessage("get-images", null, resolve, reject);
        }else{
            reject();
        }
    });
}