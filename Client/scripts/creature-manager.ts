let creatureWorker: Worker = null;
const promises = {};
let messageId = 0;
let queue = [];
let creatureWorkerReady = false;

function stashMessageCallback(messageId, resolve, reject){
    promises[`${messageId}`] = {
        resolve: resolve,
        reject: reject,
    };
}

function flushQueue(){
    queue.reverse();
    for (let i = queue.length - 1; i >= 0 ; i--){
        const resolve = queue[i].resolve;
        const data = queue[i];
        delete data?.resolve;
        sendDataToWorker(data, resolve);
        queue.splice(i, 1);
    }
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
    } else {
        if (data?.type === "ready"){
            creatureWorkerReady = true;
            flushQueue();
        }
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
        if (!creatureWorkerReady) {
            queue.push({
                type: "lookup",
                name: name,
                resolve: resolve
            });
        } else {
            sendDataToWorker({
                type: "lookup",
                name: name,
            }, resolve);
        }
    });
}

async function AddCustomCreature(creature: object) {
    if (!creatureWorkerReady) {
        queue.push({
            type: "add",
            creature: creature,
        });
    } else {
        sendDataToWorker({
            type: "add",
            creature: creature,
        });
    }
    return;
}

function GetCreatures() {
    return new Promise((resolve) => {
        if (!creatureWorkerReady) {
            queue.push({
                type: "get",
                resolve: resolve
            });
        } else {
            sendDataToWorker({
                type: "get",
            }, resolve);
        }
    });
}

function CreatureSearch(query:string){
    return new Promise((resolve) => {
        if (!creatureWorkerReady) {
            queue.push({
                type: "search",
                query: query,
                resolve: resolve
            });
        } else {
            sendDataToWorker({
                type: "search",
            query: query,
            }, resolve);
        }
    });
}

function MonsterManualSearch(query:string):Promise<Array<Creature>>{
    return new Promise((resolve) => {
        if (!creatureWorkerReady) {
            queue.push({
                type: "monster-manual-search",
                query: query,
                resolve: resolve
            });
        } else {
            sendDataToWorker({
                type: "monster-manual-search",
                query: query,
            }, resolve);
        }
    });
}

function DeleteCreature(index:string){
    if (!creatureWorkerReady) {
        queue.push({
            type: "delete",
            index: index,
        });
    } else {
        sendDataToWorker({
            type: "delete",
            index: index,
        });
    }
}