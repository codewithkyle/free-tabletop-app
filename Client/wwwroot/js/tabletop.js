let tabletop = null;
class Tabletop extends HTMLElement {
    constructor() {
        super();
        this.down = (e) => {
            this.mouseDown = true;
            let x = 0;
            let y = 0;
            if (e instanceof MouseEvent) {
                if (e.button === 0) {
                    x = e.clientX;
                    y = e.clientY;
                }
            }
            else if (e instanceof TouchEvent) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }
            if (this.paintMode === "None" && e.currentTarget instanceof Tabletop) {
                this.pos = {
                    left: this.scrollLeft,
                    top: this.scrollTop,
                    x: x,
                    y: y,
                };
                this.movingTabletop = true;
            }
            if (this.paintMode !== "None") {
                this.paintCell(this.convertViewportToTabletopPosition(x, y));
            }
        };
        this.move = (e) => {
            let x = 0;
            let y = 0;
            if (e instanceof MouseEvent) {
                x = e.clientX;
                y = e.clientY;
            }
            else if (e instanceof TouchEvent) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }
            if (this.movingTabletop) {
                this.scrollTo({
                    top: this.pos.top - (y - this.pos.y),
                    left: this.pos.left - (x - this.pos.x),
                    behavior: "auto",
                });
            }
            else if (this.paintMode !== "None" && this.mouseDown) {
                this.paintCell(this.convertViewportToTabletopPosition(x, y));
            }
        };
        this.end = () => {
            this.movingTabletop = false;
            this.mouseDown = false;
        };
        this.pos = { top: 0, left: 0, x: 0, y: 0 };
        this.movingTabletop = false;
        this.cells = [];
        this.image = null;
        this.cellSize = 32;
        this.paintMode = "None";
        this.render = false;
        this.mutatedCells = [];
        this.renderer();
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
    paintCell(position) {
        const cellPosition = this.convertTabletopPositionToCell(position);
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].position[0] === cellPosition[0] && this.cells[i].position[1] === cellPosition[1]) {
                switch (this.paintMode) {
                    case "Fog":
                        this.cells[i].style = "fog";
                        break;
                    case "Highlighter":
                        this.cells[i].style = "highlight";
                        break;
                    default:
                        if (this.isGM || this.cells[i].style === "highlight") {
                            this.cells[i].style = "clear";
                        }
                        break;
                }
                this.mutatedCells.push({
                    index: i,
                    style: this.cells[i].style,
                });
                break;
            }
        }
    }
    renderer() {
        if (this.render) {
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
        }
        window.requestAnimationFrame(this.renderer.bind(this));
    }
    setCellSize(size) {
        this.cellSize = size;
    }
    async loadImage(url, size) {
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
            await audio.play();
        }
        this.image = new Image();
        this.image.onload = () => {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
            const bounds = this.getBoundingClientRect();
            this.scrollTo({
                top: (size[1] - bounds.height) / 2,
                left: (size[0] - bounds.width) / 2,
                behavior: "auto"
            });
            if (audio) {
                audio.pause();
            }
            this.render = true;
            this.setAttribute("state", "loaded");
        };
        this.image.src = url;
    }
    setCells(cells) {
        this.cells = cells;
    }
    clearImage() {
        this.setAttribute("state", "waiting");
    }
    convertViewportToTabletopPosition(clientX, clientY) {
        const tabletop = this.getBoundingClientRect();
        const x = Math.round(clientX - tabletop.left + this.scrollLeft);
        const y = Math.round(clientY - tabletop.top + this.scrollTop);
        return [x, y];
    }
    convertTabletopPositionToCell(position) {
        const cellX = Math.floor(position[0] / this.cellSize);
        const cellY = Math.floor(position[1] / this.cellSize);
        return [cellX, cellY];
    }
    setPaintMode(mode) {
        switch (mode) {
            case 1:
                this.paintMode = "Eraser";
                break;
            case 2:
                this.paintMode = "Fog";
                break;
            case 3:
                this.paintMode = "Highlighter";
                break;
            default:
                this.paintMode = "None";
                break;
        }
        if (this.paintMode === "None") {
            this.setAttribute("painter", "inactive");
        }
        else {
            this.setAttribute("painter", "active");
        }
    }
    getMutatedCells() {
        const output = [...this.mutatedCells];
        this.mutatedCells = [];
        return output;
    }
    connectedCallback() {
        tabletop = this;
        this.addEventListener("mousedown", this.down);
        this.addEventListener("touchstart", this.down);
        document.addEventListener('mousemove', this.move);
        document.addEventListener("touchmove", this.move);
        document.addEventListener('mouseup', this.end);
        document.addEventListener("touchend", this.end);
    }
    disconnectedCallback() {
        this.removeEventListener("mousedown", this.down);
        this.removeEventListener("touchstart", this.down);
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener("touchmove", this.move);
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
        tabletop.setCells(cells);
    }
}
function SyncCells(cells) {
    if (tabletop) {
        tabletop.setCells(cells);
    }
}
function SyncCell(index, style) {
    if (tabletop) {
        tabletop.cells[index].style = style;
    }
}
function ClearImage() {
    if (tabletop) {
        tabletop.clearImage();
    }
}
async function CalculateNewPawnLocation(event) {
    if (tabletop) {
        const pos = tabletop.convertViewportToTabletopPosition(event.clientX, event.clientY);
        return pos;
    }
    else {
        return [0, 0];
    }
}
async function GetCellPosition(x, y) {
    let output = [0, 0];
    if (tabletop) {
        const relativePosition = tabletop.convertViewportToTabletopPosition(x, y);
        output = tabletop.convertTabletopPositionToCell(relativePosition);
    }
    return output;
}
async function CalculateLocalPosition(x, y) {
    let pos = [0, 0];
    if (tabletop) {
        pos = tabletop.convertViewportToTabletopPosition(x, y);
    }
    return pos;
}
function Ping(x, y) {
    if (tabletop) {
        tabletop.ping(x, y);
    }
}
function SetPaintMode(mode) {
    if (tabletop) {
        tabletop.setPaintMode(mode);
    }
}
async function GetCells() {
    let output = [];
    if (tabletop) {
        output = tabletop.getMutatedCells();
    }
    return output;
}
