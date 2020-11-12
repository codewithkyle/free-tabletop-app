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

function SetPlayerUID(uid: string) {
    localStorage.setItem("PlayerUID", uid);
}
function GetPlayerUID() {
    return localStorage.getItem("PlayerUID");
}

function ClearStorage() {
    localStorage.clear();
    localStorage.clear();
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

async function GetGridSize(url: string, customSize:number) {
    let grid = [0, 0];
    if (url.length) {
        grid = await new Promise((resolve) => {
            const tempImg = document.createElement("img");
            tempImg.src = url;
            tempImg.className = "temp-image";
            tempImg.addEventListener("load", () => {
                const bounds = tempImg.getBoundingClientRect();
                const width = Math.floor(bounds.width / customSize);
                const height = Math.floor(bounds.height / customSize);
                tempImg.remove();
                resolve([width, height]);
            });
            tempImg.addEventListener("error", () => {
                tempImg.remove();
                resolve([0, 0]);
            });
            document.body.appendChild(tempImg);
        });
    }
    return grid;
}

function ClearHighlightedCells() {
    const cells = Array.from(document.body.querySelectorAll("td.highlight"));
    for (let i = 0; i < cells.length; i++) {
        cells[i].className = "";
    }
}

function PlaySound(name:string){
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
}

function Ping(x:number, y:number){
    if (!localStorage.getItem("pingDisabled")){
        var audio = new Audio(`${location.origin}/sfx/ping.mp3`);
        audio.volume = 0.75;
        audio.play();
    }

    // CSS selectors don't start at 0 because they're not cool like arrays
    x++;
    y++;
    const cell = document.body.querySelector(`.js-tabletop table tbody tr:nth-child(${y}) td:nth-child(${x})`);
    const cellBounds = cell.getBoundingClientRect();
    
    const el = document.createElement("div");
    el.className = "ping";
    el.style.cssText = `top:${cellBounds.top + cellBounds.height / 2 - 24}px;left:${cellBounds.left + cellBounds.width / 2 - 24}px;`;

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

function DragTabletop(){
    const tabletop:HTMLElement = document.body.querySelector(".js-tabletop");
    if (tabletop){
        let pos = { top: 0, left: 0, x: 0, y: 0 };
        let movingTabletop = false;
        tabletop.addEventListener("mousedown", (e:MouseEvent)=>{
            if (e.button === 0 && e.target instanceof HTMLTableCellElement){
                pos = {
                    left: tabletop.scrollLeft,
                    top: tabletop.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                };
                movingTabletop = true;
            }
        });
        tabletop.addEventListener("touchstart", (e:TouchEvent)=>{
            if (e.target instanceof HTMLTableCellElement){
                pos = {
                    left: tabletop.scrollLeft,
                    top: tabletop.scrollTop,
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                };
                movingTabletop = true;
            }
        });

        document.addEventListener('mousemove', (e:MouseEvent) => {
            if (movingTabletop){
                const dx = e.clientX - pos.x;
                const dy = e.clientY - pos.y;

                tabletop.scrollTo({
                    top: pos.top - dy,
                    left: pos.left - dx,
                    behavior: "auto",
                });
            }
        });
        document.addEventListener("touchmove", (e:TouchEvent) => {
            if (movingTabletop){
                const dx = e.touches[0].clientX - pos.x;
                const dy = e.touches[0].clientY - pos.y;

                tabletop.scrollTo({
                    top: pos.top - dy,
                    left: pos.left - dx,
                    behavior: "auto",
                });
            }
        });

        document.addEventListener('mouseup', (e:MouseEvent) => {
            movingTabletop = false;
        });
        document.addEventListener("touchend", (e:MouseEvent) => {
            movingTabletop = false;
        });
    }
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