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
        creatureWorker = new Worker(`/js/workers/creature-worker.js`);
        creatureWorker.onmessage = handleDataFromWorker;
    }
    return;
}

function LookupCreature(name: string) {
    return new Promise((resolve) => {
        new Promise((resolveFirst) => {
            if (!creatureWorkerReady) {
                queue.push({
                    type: "lookup",
                    name: name,
                    resolve: resolveFirst
                });
            } else {
                sendDataToWorker({
                    type: "lookup",
                    name: name,
                }, resolveFirst);
            }
        }).then((creature:Creature) => {
            resolve({
                BaseHP: creature.hp,
                BaseAC: creature.ac,
                BaseName: creature.name,
                HP: creature.hp,
                AC: creature.ac,
            });
        });
    });
}

async function AddCustomCreature(creature: {baseName: string; baseAC: string; baseHP: string;}) {
    if (!creatureWorkerReady) {
        queue.push({
            type: "add",
            creature: {
                name: creature.baseName,
                ac: creature.baseAC,
                hp: creature.baseHP,
            },
        });
    } else {
        sendDataToWorker({
            type: "add",
            creature: {
                name: creature.baseName,
                ac: creature.baseAC,
                hp: creature.baseHP,
            },
        });
    }
    return;
}

async function AddCreature(creature:Creature) {
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

function CreatureSearch(query:string){
    return new Promise((resolve) => {
        new Promise((resolveFirst) => {
            if (!creatureWorkerReady) {
                queue.push({
                    type: "search",
                    query: query,
                    resolve: resolveFirst
                });
            } else {
                sendDataToWorker({
                    type: "search",
                    query: query,
                }, resolveFirst);
            } 
        }).then((data:Array<Creature>) => {
            const names = [];
            for (let i = 0; i < data.length; i++){
                names.push(data[i].name);
            }
            resolve(names);
        });
    });
}

function MonsterManualSearch(query:string):Promise<Array<Creature>>{
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