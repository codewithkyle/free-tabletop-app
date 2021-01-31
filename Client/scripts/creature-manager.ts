let creatureWorker: Worker = null;
const promises = {};
let messageId = 0;

function stashMessageCallback(messageId, resolve, reject){
    promises[`${messageId}`] = {
        resolve: resolve,
        reject: reject,
    };
}

function sendDataToWorker(data, resolve = null, reject = () => {}){
    messageId++;
    if (resolve !== null){
        stashMessageCallback(messageId, resolve, reject);
    }
    data.messageId = messageId;
    creatureWorker.postMessage(data);
}

function handleDataFromWorker(e:MessageEvent){
    const { data } = e;
    const callback = promises?.[data.messageId] ?? null;
    if (callback){
        if (data?.type === "error"){
            promises[data.messageId].reject(data.error);
        } else {
            promises[data.messageId].resolve(data?.data ?? null);
        }
        delete promises[data.messageId];
    }
}

async function SyncMonsterData() {
    if (!creatureWorker) {
        creatureWorker = new Worker(`/js/creature-worker.js`);
        creatureWorker.onmessage = handleDataFromWorker;
    }
    return;
}

function LookupCreature(name: string) {
    return new Promise((resolve) => {
        if (!creatureWorker) {
            resolve([]);
        }
        sendDataToWorker({
            type: "lookup",
            name: name,
        }, resolve);
    });
}

async function AddCustomCreature(creature: string) {
    if (!creatureWorker) {
        return;
    }
    sendDataToWorker({
        type: "add",
        creature: creature,
    });
    return;
}

function GetCreatures() {
    return new Promise((resolve) => {
        if (!creatureWorker) {
            resolve([]);
        }
        sendDataToWorker({
            type: "get",
        }, resolve);
    });
}

function CreatureSearch(query:string){
    return new Promise((resolve) => {
        if (!creatureWorker) {
            resolve([]);
        }
        sendDataToWorker({
            type: "search",
            query: query,
        }, resolve);
    });
}