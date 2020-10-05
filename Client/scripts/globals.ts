function SetPlayerUID(uid: string) {
    localStorage.setItem("PlayerUID", uid);
}
function GetPlayerUID() {
    return localStorage.getItem("PlayerUID");
}
function ClearStorage() {
    localStorage.clear();
    sessionStorage.clear();
}
function CopyToClipboard(value: string) {
    if ("clipboard" in navigator) {
        navigator.clipboard.writeText(value);
    }
}
function ForceHome() {
    location.href = location.origin;
}
function FocusElement(selector: string) {
    const el: HTMLElement = document.body.querySelector(selector);
    if (el) {
        el.focus();
    }
}
function Debug(thing: any) {
    console.log(thing);
}
async function GetGridSize(url: string) {
    let grid = [0, 0];
    if (url.length) {
        grid = await new Promise((resolve) => {
            const tempImg = document.createElement("img");
            tempImg.src = url;
            tempImg.className = "temp-image";
            tempImg.addEventListener("load", () => {
                const bounds = tempImg.getBoundingClientRect();
                const width = Math.floor(bounds.width / 32);
                const height = Math.floor(bounds.height / 32);
                resolve([width, height]);
            });
            tempImg.addEventListener("error", () => {
                resolve([0, 0]);
            });
            document.body.appendChild(tempImg);
        });
    }
    return grid;
}
document.onkeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (key === "f5") {
        event.returnValue = false;
        return false;
    } else if (key === "r" && (event.ctrlKey || event.metaKey)) {
        event.returnValue = false;
        return false;
    }
};
function ClearHighlightedCells() {
    const cells = Array.from(document.body.querySelectorAll("td.highlight"));
    for (let i = 0; i < cells.length; i++) {
        cells[i].className = "";
    }
}
function uid(): string {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}

// DB Worker
let dbWorker: Worker = null;
let lastDBWorkerUid = null;
function SyncMonsterData() {
    if (!dbWorker) {
        dbWorker = new Worker(`${location.origin}/js/db-worker.js`);
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
                const creature = {
                    BaseName: toUpper(data.creature.name),
                    BaseHP: data.creature.hp,
                    BaseAC: data.creature.ac,
                };
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

// Notifications
function PlayerConnected(name: string) {
    toast({
        title: `${name} Joined`,
        message: `${name} has joined to the room.`,
        duration: 5,
        classes: "-green",
    });
}
function PlayerDisconnected(name: string) {
    toast({
        title: `${name} Disconnected`,
        message: `${name} has disconnected from the room.`,
        duration: 5,
        classes: "-red",
    });
}
function PlayerReconnected(name: string) {
    toast({
        title: `${name} Reconnected`,
        message: `${name} has reconnected to the room.`,
        duration: 5,
        classes: "-green",
    });
}
function PlayerKicked(name: string) {
    toast({
        title: `${name} Disconnected`,
        message: `${name} was kicked from the room.`,
        duration: 5,
        classes: "-red",
    });
}
function TakeTurn() {
    toast({
        title: `You're Up`,
        message: `It's your turn for combat, use it wisely.`,
        duration: 5,
    });
}
function OnDeck() {
    toast({
        title: `On Deck`,
        message: `You're up next for combat. Start planning your turn.`,
        duration: 5,
    });
}
function toUpper(str: string) {
    return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(" ");
}
function EntityOnDeck(name: string) {
    const fixedName = toUpper(name);
    toast({
        title: `${fixedName} Is On Deck`,
        message: `${fixedName} is up next for combat.`,
        duration: 5,
    });
}
