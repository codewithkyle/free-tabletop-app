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
