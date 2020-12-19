document.onkeydown = (event: KeyboardEvent) => {
    if (event instanceof KeyboardEvent){
        const key = event.key.toLowerCase();
        if (key === "f5") {
            event.returnValue = false;
            return false;
        } else if (key === "r" && (event.ctrlKey || event.metaKey)) {
            event.returnValue = false;
            return false;
        }
    }
};

async function SetPlayerUID(uid: string) {
    localStorage.setItem("PlayerUID", uid);
    return;
}
function GetPlayerUID() {
    return localStorage.getItem("PlayerUID");
}

async function ClearStorage() {
    localStorage.clear();
    sessionStorage.clear();
    return;
}

async function CopyToClipboard(value: string) {
    if ("clipboard" in navigator) {
        navigator.clipboard.writeText(value);
    }
    return;
}

function ForceHome() {
    location.href = location.origin;
}

async function FocusElement(selector: string) {
    const el: HTMLElement = document.body.querySelector(selector);
    if (el) {
        el.focus();
    }
    return;
}

function Debug(thing: any) {
    console.log(thing);
}

async function GetGridSize(url: string, customSize:number) {
    let grid = [0, 0, 300, 300];
    if (url.length) {
        grid = await new Promise((resolve) => {
            const tempImg = document.createElement("img");
            tempImg.className = "temp-image";
            tempImg.addEventListener("load", () => {
                const bounds = tempImg.getBoundingClientRect();
                const width = Math.floor(bounds.width / customSize);
                const height = Math.floor(bounds.height / customSize);
                tempImg.remove();
                resolve([width, height, bounds.width, bounds.height]);
            });
            tempImg.addEventListener("error", () => {
                tempImg.remove();
                resolve([0, 0, 300, 300]);
            });
            tempImg.src = url;
            document.body.appendChild(tempImg);
        });
    }
    return grid;
}

async function PlaySound(name:string){
    switch(name){
        case "alert.wav":
            if (!localStorage.getItem("alertDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "loading.wav":
            if (!localStorage.getItem("loadingDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "message.wav":
            if (!localStorage.getItem("notificationDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "ping.mp3":
            if (!localStorage.getItem("pingDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.volume = 0.75;
                audio.play();
            }
            break;
        default:
            var audio = new Audio(`${location.origin}/sfx/${name}`);
            audio.play();
            break;
    }
    return;
}

class PingComponent extends HTMLElement{
    connectedCallback(){
        if (!localStorage.getItem("pingDisabled")){
            var audio = new Audio(`${location.origin}/sfx/ping.mp3`);
            audio.volume = 0.75;
            audio.play();
        }
        setTimeout(this.remove.bind(this), 2000);
    }
}
customElements.define("ping-icon", PingComponent);

function Ping(x:number, y:number){
    const cell = document.body.querySelector(`tabletop-cell[data-x="${x}"][data-y="${y}"]`);
    const cellBounds = cell.getBoundingClientRect();
    
    const el = document.createElement("ping-icon");
    el.className = "ping";
    el.style.cssText = `top:${cellBounds.top + cellBounds.height / 2 - 24}px;left:${cellBounds.left + cellBounds.width / 2 - 24}px;`;

    el.innerHTML = `
        <i>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info" class="svg-inline--fa fa-info fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path></svg>
        </i>
    `;

    document.body.appendChild(el);
}

function ToggleSoundStatus(type:string, enabled:boolean){
    if (enabled){
        localStorage.removeItem(`${type}Disabled`);
    }else{
        localStorage.setItem(`${type}Disabled`, "true");
    }
}

function GetPingSoundSetting(){
    return localStorage.getItem("pingDisabled") ? false : true;
}
function GetNotificationSoundSetting(){
    return localStorage.getItem("notificationDisabled") ? false : true;
}
function GetAlertSoundSetting(){
    return localStorage.getItem("alertDisabled") ? false : true;
}
function GetLoadingSoundSetting(){
    return localStorage.getItem("loadingDisabled") ? false : true;
}

async function SetVersionDisplay(){
    let version = localStorage.getItem("version");
    if (!version){
        const request = await fetch(`${location.origin}/app.json`, {
            headers: new Headers({
                "Accept": "application/json",
            }),
            cache: "no-cache",
        });
        if (request.ok){
            const response = await request.json();
            document.title = `Free Tabletop v${response.build}`;
            localStorage.setItem("version", response.build);
        }
    }else{
        document.title = `Free Tabletop v${version}`;
    }
}
SetVersionDisplay();

function Reinstall(){
    const sw:ServiceWorker = navigator?.serviceWorker?.controller ?? null;
    if (sw){
        sw.postMessage({
            type: "reinstall",
        });
        setTimeout(()=>{
            location.reload();
        }, 300);
    }
}

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    deferredInstallPrompt = e;
});
function Install(){
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
    });
}

async function CheckForUpdate(){
    let latestVersion = null;
    const loadedVersion = localStorage.getItem("version");
    const request = await fetch(`${location.origin}/app.json`, {
        headers: new Headers({
            "Accept": "application/json",
        }),
        cache: "no-cache",
    });
    if (request.ok){
        const response = await request.json();
        latestVersion = response.build;
        localStorage.setItem("version", latestVersion);
    }
    if (loadedVersion !== latestVersion && loadedVersion !== null){
        const sw:ServiceWorker = navigator?.serviceWorker?.controller ?? null;
        if (sw){
            sw.postMessage({
                type: "reinstall",
            });
            snackbar({
                message: `An update for Free Tabletop has been installed.`,
                buttons: [
                    {
                        label: "reload",
                        callback: ()=>{location.reload();},
                    }
                ],
                duration: Infinity,
                force: true,
                closeable: false,
            });
            const app:HTMLElement = document.body.querySelector("app");
            app.style.display = "none";
        }else{
            setTimeout(()=>{
                location.reload();
            }, 1000);
        }
    }else{
        localStorage.setItem("version", latestVersion);
    }
}
CheckForUpdate();

function ClearFogCell(index:number){
    const cell:HTMLElement = document.body.querySelector(`.js-fog[data-index="${index}"]`);
    if (cell){
        cell.style.background = "transparent";
    }
}

function UpdateEntityPosition(uid:string, position:Array<number>, cellSize:number){
    const pawn:HTMLElement = document.body.querySelector(`tabletop-pawn[data-uid="${uid}"]`);
    if (pawn){
        // @ts-expect-error
        pawn.UpdatePosition(position[0], position[1], cellSize);
    }
}