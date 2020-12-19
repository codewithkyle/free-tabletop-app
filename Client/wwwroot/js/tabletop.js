let tabletop = null;
class Tabletop extends HTMLElement {
    constructor() {
        super();
        this.mouseDown = (e) => {
            if (e.button === 0 && e.target instanceof HTMLTableCellElement) {
                this.pos = {
                    left: this.scrollLeft,
                    top: this.scrollTop,
                    x: e.clientX,
                    y: e.clientY,
                };
                this.movingTabletop = true;
            }
        };
        this.touchDown = (e) => {
            if (e.target instanceof HTMLTableCellElement) {
                this.pos = {
                    left: this.scrollLeft,
                    top: this.scrollTop,
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                };
                this.movingTabletop = true;
            }
        };
        this.mouseMove = (e) => {
            if (this.movingTabletop) {
                const dx = e.clientX - this.pos.x;
                const dy = e.clientY - this.pos.y;
                this.scrollTo({
                    top: this.pos.top - dy,
                    left: this.pos.left - dx,
                    behavior: "auto",
                });
            }
        };
        this.touchMove = (e) => {
            if (this.movingTabletop) {
                const dx = e.touches[0].clientX - this.pos.x;
                const dy = e.touches[0].clientY - this.pos.y;
                this.scrollTo({
                    top: this.pos.top - dy,
                    left: this.pos.left - dx,
                    behavior: "auto",
                });
            }
        };
        this.end = () => {
            this.movingTabletop = false;
        };
        this.pos = { top: 0, left: 0, x: 0, y: 0 };
        this.movingTabletop = false;
    }
    generateCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth / 2;
        this.canvas.height = window.innerHeight / 2;
        this.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    loadImage(url, size) {
        if (!this.canvas) {
            this.generateCanvas();
        }
        this.setAttribute("state", "loading");
        this.canvas.width = 400;
        this.canvas.height = 250;
        let audio = null;
        if (!localStorage.getItem("loadingDisabled")) {
            audio = new Audio(`${location.origin}/sfx/loading.wav`);
            audio.loop = true;
            audio.play();
        }
        const img = new Image();
        img.onload = () => {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            this.setAttribute("state", "loaded");
            const bounds = this.getBoundingClientRect();
            this.scrollTo({
                top: (size[1] - bounds.height) / 2,
                left: (size[0] - bounds.width) / 2,
                behavior: "auto"
            });
            if (audio) {
                audio.pause();
            }
        };
        img.src = url;
    }
    clearImage() {
        this.setAttribute("state", "waiting");
    }
    caclNewPawnLocation(clientX, clientY, entityUid) {
        const tabletop = this.getBoundingClientRect();
        const x = Math.round(clientX - tabletop.left + this.scrollLeft);
        const y = Math.round(clientY - tabletop.top + this.scrollTop);
        return [x, y];
    }
    connectedCallback() {
        tabletop = this;
        this.addEventListener("mousedown", this.mouseDown);
        this.addEventListener("touchstart", this.touchDown);
        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener("touchmove", this.touchMove);
        document.addEventListener('mouseup', this.end);
        document.addEventListener("touchend", this.end);
    }
    disconnectedCallback() {
        this.removeEventListener("mousedown", this.mouseDown);
        this.removeEventListener("touchstart", this.touchDown);
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener("touchend", this.end);
    }
}
customElements.define('tabletop-component', Tabletop);
function LoadImage(url, cellSize, tabletopSize) {
    if (tabletop) {
        tabletop.loadImage(url, tabletopSize);
    }
}
function ClearImage() {
    if (tabletop) {
        tabletop.clearImage();
    }
}
function CalculateNewPawnLocation(event, entityUid) {
    if (tabletop) {
        const pos = tabletop.caclNewPawnLocation(event.clientX, event.clientY, entityUid);
        return pos;
    }
    else {
        return [0, 0];
    }
}
