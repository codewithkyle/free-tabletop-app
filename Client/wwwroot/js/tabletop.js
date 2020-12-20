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
        this.cells = [];
        this.image = null;
        this.cellSize = 32;
    }
    ping(x, y) {
        const el = document.createElement("ping-icon");
        el.className = "ping";
        el.style.cssText = `top:${y - 24}px;left:${x - 24}px;`;
        el.innerHTML = `
            <i>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info" class="svg-inline--fa fa-info fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path></svg>
            </i>
        `;
        this.appendChild(el);
    }
    generateCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth / 2;
        this.canvas.height = window.innerHeight / 2;
        this.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);
        if (this.gridType !== 3) {
            for (let i = 0; i < this.cells.length; i++) {
                switch (this.cells[i].style) {
                    case "highlight":
                        this.ctx.fillStyle = "rgba(255, 13, 65, 0.15)";
                        break;
                    case "fog":
                        this.ctx.fillStyle = `rgba(25,25,25,${this.isGM ? "0.6" : "1"})`;
                        break;
                    default:
                        this.ctx.fillStyle = "transparent";
                        break;
                }
                const x = this.cells[i].position[0] * this.cellSize;
                const y = this.cells[i].position[1] * this.cellSize;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                if (this.gridType === 1) {
                    this.ctx.strokeStyle = "rgba(0,0,0,0.6)";
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x, y + this.cellSize);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                    this.ctx.stroke();
                }
            }
        }
        this.setAttribute("state", "loaded");
    }
    setCellSize(size) {
        this.cellSize = size;
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
        this.image = new Image();
        this.image.onload = () => {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
            this.render();
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
        this.image.src = url;
    }
    renderCells(cells) {
        this.cells = cells;
        this.render();
    }
    clearImage() {
        this.setAttribute("state", "waiting");
    }
    calcNewPawnLocation(clientX, clientY) {
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
class PingComponent extends HTMLElement {
    connectedCallback() {
        if (!localStorage.getItem("pingDisabled")) {
            var audio = new Audio(`${location.origin}/sfx/ping.mp3`);
            audio.volume = 0.75;
            audio.play();
        }
        setTimeout(this.remove.bind(this), 2000);
    }
}
customElements.define("ping-icon", PingComponent);
function LoadImage(url, cellSize, tabletopSize, cells, isGM, gridType) {
    if (tabletop) {
        tabletop.isGM = isGM;
        tabletop.gridType = parseInt(gridType);
        tabletop.setCellSize(cellSize);
        tabletop.loadImage(url, tabletopSize);
        tabletop.renderCells(cells);
    }
}
function ClearImage() {
    if (tabletop) {
        tabletop.clearImage();
    }
}
async function CalculateNewPawnLocation(event) {
    if (tabletop) {
        const pos = tabletop.calcNewPawnLocation(event.clientX, event.clientY);
        return pos;
    }
    else {
        return [0, 0];
    }
}
async function GetCellPosition(x, y, cellSize) {
    let output = [0, 0];
    if (tabletop) {
        const relativePosition = tabletop.calcNewPawnLocation(x, y);
        const cellX = Math.floor(relativePosition[0] / cellSize);
        const cellY = Math.floor(relativePosition[1] / cellSize);
        output = [cellX, cellY];
    }
    return output;
}
async function CalculateLocalPosition(x, y) {
    let pos = [0, 0];
    if (tabletop) {
        pos = tabletop.calcNewPawnLocation(x, y);
    }
    return pos;
}
function Ping(x, y) {
    if (tabletop) {
        tabletop.ping(x, y);
    }
}
