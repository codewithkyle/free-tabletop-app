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

function ClearInput(selector:string){
    const el:HTMLInputElement = document.body.querySelector(selector);
    if (el) {
        el.value = "";
    }
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
                if (audio.canPlayType)
                audio.play().catch(e => {});
            }
            break;
        case "loading.wav":
            if (!localStorage.getItem("loadingDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play().catch(e => {});
            }
            break;
        case "message.wav":
            if (!localStorage.getItem("notificationDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play().catch(e => {});
            }
            break;
        case "ping.mp3":
            if (!localStorage.getItem("pingDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.volume = 0.75;
                audio.play().catch(e => {});
            }
            break;
        case "death-celebration.mp3":
            if (!localStorage.getItem("deathCelebrationSoundDisabled") && !localStorage.getItem("deathCelebrationsDisabled")){
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.volume = 0.75;
                audio.play().catch(e => {});
            }
            break;
        default:
            var audio = new Audio(`${location.origin}/sfx/${name}`);
            audio.play().catch(e => {});
            break;
    }
    return;
}

function ToggleSetting(type:string, enabled:boolean){
    if (enabled){
        localStorage.removeItem(`${type}`);
    }else{
        localStorage.setItem(`${type}`, "true");
    }
}

async function GetSetting(key:string){
    return localStorage.getItem(key) ? false : true;
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

function RenderPopupImage(url:string, label:string = null){
    const el = document.createElement("moveable-modal");
    el.className = "popup-image-modal";
    el.style.zIndex = "1001";
    el.innerHTML = `
        <moveable-handle>
            <span class="inline-block font-xs font-grey-100 font-medium">${label ?? url}</span>
            <div>
                <button class="modal-expand js-expand-button" tooltip="Expand" aria-label="expand popup image">
                    <svg class="-expand" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M198.829 275.515l5.656 5.656c4.686 4.686 4.686 12.284 0 16.971L54.627 448H116c6.627 0 12 5.373 12 12v8c0 6.627-5.373 12-12 12H12c-6.627 0-12-5.373-12-12V364c0-6.627 5.373-12 12-12h8c6.627 0 12 5.373 12 12v61.373l149.858-149.858c4.687-4.687 12.285-4.687 16.971 0zM436 32H332c-6.627 0-12 5.373-12 12v8c0 6.627 5.373 12 12 12h61.373L243.515 213.858c-4.686 4.686-4.686 12.284 0 16.971l5.656 5.656c4.686 4.686 12.284 4.686 16.971 0L416 86.627V148c0 6.627 5.373 12 12 12h8c6.627 0 12-5.373 12-12V44c0-6.627-5.373-12-12-12z"></path></svg>
                    <svg class="-shrink" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M9.171 476.485l-5.656-5.656c-4.686-4.686-4.686-12.284 0-16.971L169.373 288H108c-6.627 0-12-5.373-12-12v-8c0-6.627 5.373-12 12-12h100c8.837 0 16 7.163 16 16v100c0 6.627-5.373 12-12 12h-8c-6.627 0-12-5.373-12-12v-61.373L26.142 476.485c-4.687 4.687-12.285 4.687-16.971 0zM240 256h100c6.627 0 12-5.373 12-12v-8c0-6.627-5.373-12-12-12h-61.373L444.485 58.142c4.686-4.686 4.686-12.284 0-16.971l-5.656-5.656c-4.686-4.686-12.284-4.686-16.971 0L256 201.373V140c0-6.627-5.373-12-12-12h-8c-6.627 0-12 5.373-12 12v100c0 8.837 7.163 16 16 16z"></path></svg>
                </button>
                <button class="modal-close js-close-button" tooltip="Close" aria-label="close popup image">
                    <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="times" class="svg-inline--fa fa-times fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"></path></svg>
                </button>
            </div>
        </moveable-handle>
        <div class="container">
            <i style="width: 48px;height: 48px;display: flex;justify-content: center;align-items: center;" class="font-grey-600 mx-auto spinner absolute center">
                <svg style="width: 36px;height:36px;" aria-hidden="true" focusable="false" data-prefix="fad" data-icon="spinner-third" class="svg-inline--fa fa-spinner-third fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="fa-group"><path class="fa-secondary" fill="currentColor" d="M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z" opacity="0.4"></path><path class="fa-primary" fill="currentColor" d="M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z"></path></g></svg>
            </i>
            <img onload="style.opacity = '1';" src="${url}" draggable="false" oncontextmenu="return false;">
        </div>
    `;
    const game = document.body.querySelector(".game") || document.body;
    game.appendChild(el);
}


function Reload(){
    location.reload();
}

function uid(): string {
    return new Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join("-");
}

const noop:any = ()=>{};

function PromptReload(){
    PlaySound("alert.wav");
    snackbar({
        message: `You have lost connection with the server.`,
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
}
window.onerror = () => {
    PlaySound("alert.wav");
    snackbar({
        message: `You have lost connection with the server.`,
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
    return false;
 };
 window.addEventListener("error", () => {
    PlaySound("alert.wav");
    snackbar({
        message: `You have lost connection with the server.`,
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
    return false;
 });
 window.addEventListener('unhandledrejection', (e) => {
    PlaySound("alert.wav");
    snackbar({
        message: `You have lost connection with the server.`,
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
    return false;
});

function debounce(func: Function, wait: number, immediate: boolean): Function {
	let timeout;
	return function () {
		const context = this,
			args = arguments;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}