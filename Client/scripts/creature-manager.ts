let dbWorker: Worker = null;
let lastDBWorkerUid = null;

function SyncMonsterData() {
    if (!dbWorker) {
        dbWorker = new Worker(`/js/db-worker.js`);
    }
}

function LookupCreature(query: string) {
    return new Promise((resolve) => {
        if (!dbWorker) {
            resolve([]);
        }
        lastDBWorkerUid = uid();
        dbWorker.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (data.messageUid === lastDBWorkerUid) {
                const creature = { ...data.creature };
                creature.BaseName = toUpper(creature.BaseName);
                resolve(JSON.stringify(creature));
            } else {
                resolve(JSON.stringify([]));
            }
        };
        dbWorker.postMessage({
            type: "lookup",
            query: query,
            messageUid: lastDBWorkerUid,
        });
    });
}

function AddCustomCreature(creature: string) {
    if (!dbWorker) {
        return;
    }
    dbWorker.postMessage({
        type: "add",
        creature: creature,
    });
}

function GetCreatures() {
    return new Promise((resolve) => {
        if (!dbWorker) {
            resolve([]);
        }
        lastDBWorkerUid = uid();
        dbWorker.onmessage = (e: MessageEvent) => {
            const data = e.data;
            if (data.messageUid === lastDBWorkerUid) {
                resolve(JSON.stringify(data.creatures));
            } else {
                resolve(JSON.stringify([]));
            }
        };
        dbWorker.postMessage({
            type: "get",
            messageUid: lastDBWorkerUid,
        });
    });
}

function uid(): string {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}