document.onkeydown = (event) => {
    const key = event.key.toLowerCase();
    if (key === "f5") {
        event.returnValue = false;
        return false;
    }
    else if (key === "r" && (event.ctrlKey || event.metaKey)) {
        event.returnValue = false;
        return false;
    }
};
function SetPlayerUID(uid) {
    localStorage.setItem("PlayerUID", uid);
}
function GetPlayerUID() {
    return localStorage.getItem("PlayerUID");
}
function ClearStorage() {
    localStorage.clear();
    localStorage.clear();
}
function CopyToClipboard(value) {
    if ("clipboard" in navigator) {
        navigator.clipboard.writeText(value);
    }
}
function ForceHome() {
    location.href = location.origin;
}
function FocusElement(selector) {
    const el = document.body.querySelector(selector);
    if (el) {
        el.focus();
    }
}
function Debug(thing) {
    console.log(thing);
}
async function GetGridSize(url) {
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
function ClearHighlightedCells() {
    const cells = Array.from(document.body.querySelectorAll("td.highlight"));
    for (let i = 0; i < cells.length; i++) {
        cells[i].className = "";
    }
}
function PlaySound(name) {
    switch (name) {
        case "alert.wav":
            if (!localStorage.getItem("alertDisabled")) {
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "loading.wav":
            if (!localStorage.getItem("loadingDisabled")) {
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "message.wav":
            if (!localStorage.getItem("notificationDisabled")) {
                var audio = new Audio(`${location.origin}/sfx/${name}`);
                audio.play();
            }
            break;
        case "ping.mp3":
            if (!localStorage.getItem("pingDisabled")) {
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
function Ping(x, y) {
    if (!localStorage.getItem("pingDisabled")) {
        var audio = new Audio(`${location.origin}/sfx/ping.mp3`);
        audio.volume = 0.75;
        audio.play();
    }
    const el = document.createElement("div");
    el.className = "ping";
    el.style.cssText = `top:${y - 24}px;left:${x - 24}px;`;
    el.innerHTML = `
        <i>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info" class="svg-inline--fa fa-info fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path></svg>
        </i>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 2000);
}
function DragTabletop() {
    const tabletop = document.body.querySelector(".js-tabletop");
    if (tabletop) {
        let pos = { top: 0, left: 0, x: 0, y: 0 };
        let movingTabletop = false;
        tabletop.addEventListener("mousedown", (e) => {
            if (e.button === 0 && e.target instanceof HTMLTableCellElement) {
                pos = {
                    left: tabletop.scrollLeft,
                    top: tabletop.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                };
                movingTabletop = true;
            }
        });
        tabletop.addEventListener("touchstart", (e) => {
            if (e.target instanceof HTMLTableCellElement) {
                pos = {
                    left: tabletop.scrollLeft,
                    top: tabletop.scrollTop,
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                };
                movingTabletop = true;
            }
        });
        document.addEventListener('mousemove', (e) => {
            if (movingTabletop) {
                const dx = e.clientX - pos.x;
                const dy = e.clientY - pos.y;
                tabletop.scrollTo({
                    top: pos.top - dy,
                    left: pos.left - dx,
                    behavior: "auto",
                });
            }
        });
        document.addEventListener("touchmove", (e) => {
            if (movingTabletop) {
                const dx = e.touches[0].clientX - pos.x;
                const dy = e.touches[0].clientY - pos.y;
                tabletop.scrollTo({
                    top: pos.top - dy,
                    left: pos.left - dx,
                    behavior: "auto",
                });
            }
        });
        document.addEventListener('mouseup', (e) => {
            movingTabletop = false;
        });
        document.addEventListener("touchend", (e) => {
            movingTabletop = false;
        });
    }
}
function ToggleSoundStatus(type, enabled) {
    if (enabled) {
        localStorage.removeItem(`${type}Disabled`);
    }
    else {
        localStorage.setItem(`${type}Disabled`, "true");
    }
}
function GetPingSoundSetting() {
    return localStorage.getItem("pingDisabled") ? false : true;
}
function GetNotificationSoundSetting() {
    return localStorage.getItem("notificationDisabled") ? false : true;
}
function GetAlertSoundSetting() {
    return localStorage.getItem("alertDisabled") ? false : true;
}
function GetLoadingSoundSetting() {
    return localStorage.getItem("loadingDisabled") ? false : true;
}
async function GetVersion() {
    const request = await fetch(`${location.origin}/app.json`, {
        headers: new Headers({
            "Accept": "application/json",
        }),
        cache: "no-cache",
    });
    if (request.ok) {
        const response = await request.json();
        document.title = `Free Tabletop v${response.build}`;
    }
    return;
}
GetVersion();
function Reinstall() {
    var _a, _b;
    const sw = (_b = (_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) !== null && _b !== void 0 ? _b : null;
    if (sw) {
        sw.postMessage({
            type: "reinstall",
        });
        setTimeout(() => {
            location.reload();
        }, 300);
    }
}
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
    deferredInstallPrompt = e;
});
function Install() {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
    });
}
async function CheckForUpdate() {
    var _a, _b;
    let latestVersion = null;
    const loadedVersion = localStorage.getItem("version");
    const request = await fetch(`${location.origin}/app.json`, {
        headers: new Headers({
            "Accept": "application/json",
        }),
        cache: "no-cache",
    });
    if (request.ok) {
        const response = await request.json();
        latestVersion = response.build;
        localStorage.setItem("version", latestVersion);
    }
    if (loadedVersion !== latestVersion && loadedVersion !== null) {
        const sw = (_b = (_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) !== null && _b !== void 0 ? _b : null;
        if (sw) {
            sw.postMessage({
                type: "reinstall",
            });
            snackbar({
                message: `Free Tabletop ${latestVersion} has been installed.`,
                buttons: [
                    {
                        label: "reload",
                        callback: () => { location.reload(); },
                    }
                ],
                duration: Infinity,
                force: true,
                closeable: false,
            });
        }
        else {
            console.log("no sw");
        }
    }
    else {
        localStorage.setItem("version", latestVersion);
    }
}
CheckForUpdate();
