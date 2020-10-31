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

// Notifications
function PlayerConnected(name: string) {
    toast({
        title: `${name} Joined`,
        message: `${name} has joined to the room.`,
        duration: 5,
        classes: "-green",
    });
    PlaySound("alert.wav");
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
    PlaySound("alert.wav");
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
function PlaySound(name:string){
    var audio = new Audio(`${location.origin}/sfx/${name}`);
    audio.play();
}
function Ping(x:number, y:number){
    var audio = new Audio(`${location.origin}/sfx/ping.mp3`);
    audio.volume = 0.75;
    audio.play();
    
    const el = document.createElement("div");
    el.className = "ping";
    el.style.cssText = `top:${y - 24}px;left:${x - 24}px;`;

    el.innerHTML = `
        <i>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info" class="svg-inline--fa fa-info fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path></svg>
        </i>
    `;

    document.body.appendChild(el);
    setTimeout(()=>{
        el.remove();
    }, 2000);
}

// Combat window
function StartCombatDrag(){
    const modal:HTMLElement = document.body.querySelector(".combat-modal");
    const el:HTMLElement = document.body.querySelector(".js-combat-modal");
    let dragging = false;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.addEventListener("mousedown", (e:MouseEvent)=>{
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        dragging = true;
    });
    document.addEventListener("mouseup", (e:Event)=>{
        e.preventDefault();
        dragging = false;
    });
    document.addEventListener("mousemove", (e:MouseEvent)=>{
        if (dragging){
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            modal.style.top = (modal.offsetTop - pos2) + "px";
            modal.style.left = (modal.offsetLeft - pos1) + "px";
        }
    });
}
function ResetCombatModal(){
    const modal:HTMLElement = document.body.querySelector(".combat-modal");
    modal.style.left = '0px';
    modal.style.top = "calc(36px + 0.5rem)";
}

// Messenger window
function StartChatDrag(){
    const modal:HTMLElement = document.body.querySelector(".chat-modal");
    const el:HTMLElement = document.body.querySelector(".js-chat-modal");
    let dragging = false;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.addEventListener("mousedown", (e:MouseEvent)=>{
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        dragging = true;
    });
    document.addEventListener("mouseup", (e:Event)=>{
        e.preventDefault();
        dragging = false;
    });
    document.addEventListener("mousemove", (e:MouseEvent)=>{
        if (dragging){
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            modal.style.top = (modal.offsetTop - pos2) + "px";
            modal.style.left = (modal.offsetLeft - pos1) + "px";
        }
    });
}
function ResetChatModal(){
    const modal:HTMLElement = document.body.querySelector(".chat-modal");
    modal.style.left = '0px';
    modal.style.top = "calc(36px + 0.5rem)";
}
function ResetChatMessage(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    textarea.value = "";
    textarea.innerHTML = "";
    textarea.style.height = `0px`;
}
function GetChatMessage(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    return textarea.value;
}
function AdjustChatMessageHeight(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    textarea.style.height = `${textarea.scrollHeight}px`;
}
function ScrollChatMessages(){
    const container:HTMLElement = document.body.querySelector(".js-chat-messages");
    if (container){
        container.scrollTo({
            top: container.scrollHeight,
            left: 0,
            behavior: "auto",
        });
    }
}