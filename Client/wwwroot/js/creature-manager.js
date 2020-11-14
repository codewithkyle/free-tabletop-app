let dbWorker = null;
let lastDBWorkerUid = null;
async function SyncMonsterData() {
    if (!dbWorker) {
        dbWorker = new Worker(`/js/db-worker.js`);
    }
    return;
}
function LookupCreature(query) {
    return new Promise((resolve) => {
        if (!dbWorker) {
            resolve([]);
        }
        lastDBWorkerUid = uid();
        dbWorker.onmessage = (e) => {
            const data = e.data;
            if (data.messageUid === lastDBWorkerUid) {
                const creature = { ...data.creature };
                creature.BaseName = toUpper(creature.BaseName);
                resolve(JSON.stringify(creature));
            }
            else {
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
async function AddCustomCreature(creature) {
    if (!dbWorker) {
        return;
    }
    dbWorker.postMessage({
        type: "add",
        creature: creature,
    });
    return;
}
function GetCreatures() {
    return new Promise((resolve) => {
        if (!dbWorker) {
            resolve([]);
        }
        lastDBWorkerUid = uid();
        dbWorker.onmessage = (e) => {
            const data = e.data;
            if (data.messageUid === lastDBWorkerUid) {
                resolve(JSON.stringify(data.creatures));
            }
            else {
                resolve(JSON.stringify([]));
            }
        };
        dbWorker.postMessage({
            type: "get",
            messageUid: lastDBWorkerUid,
        });
    });
}
function uid() {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}
