let creatureWorker: Worker = null;
let lastCreatureWorkerMessageUID = null;

async function SyncMonsterData() {
    if (!creatureWorker) {
        creatureWorker = new Worker(`/js/creature-worker.js`);
    }
    return;
}

function LookupCreature(query: string) {
    return new Promise((resolve) => {
        if (!creatureWorker) {
            resolve([]);
        }
        lastCreatureWorkerMessageUID = uid();
        creatureWorker.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (data.messageUid === lastCreatureWorkerMessageUID) {
                const creature = { ...data.creature };
                creature.BaseName = toUpper(creature.BaseName);
                resolve(JSON.stringify(creature));
            } else {
                resolve(JSON.stringify([]));
            }
        };
        creatureWorker.postMessage({
            type: "lookup",
            query: query,
            messageUid: lastCreatureWorkerMessageUID,
        });
    });
}

async function AddCustomCreature(creature: string) {
    if (!creatureWorker) {
        return;
    }
    creatureWorker.postMessage({
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
        lastCreatureWorkerMessageUID = uid();
        creatureWorker.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (data.messageUid === lastCreatureWorkerMessageUID) {
                resolve(JSON.stringify(data.creatures));
            } else {
                resolve(JSON.stringify([]));
            }
        };
        creatureWorker.postMessage({
            type: "get",
            messageUid: lastCreatureWorkerMessageUID,
        });
    });
}