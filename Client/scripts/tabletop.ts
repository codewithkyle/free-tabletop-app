type PaintMode = "Eraser" | "Highlighter" | "Fog" | "None";
type CellStyle = "fog" | "clear" | "highlight";
type Cell = {
    position: Array<number>;
    style: CellStyle;
};

let tabletop:Tabletop = null;

class Tabletop extends HTMLElement{
    private pos: {
        top: number;
        left: number;
        x: number;
        y: number;
    };
    private movingTabletop:boolean;
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    public cells: Array<Cell>;
    private image: HTMLImageElement;
    private cellSize: number;
    public isGM: boolean;
    public gridType:number;
    public paintMode: PaintMode;
    private mouseDown:boolean;
    private render:boolean;
    private mutatedCells:Array<number>;
    private brushSize:number;

    constructor(){
        super();
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

    private down:EventListener = (e:MouseEvent|TouchEvent)=>{
        this.mouseDown = true;
        let x = 0;
        let y = 0;
        if (e instanceof MouseEvent){
            if (e.button === 0){
                x = e.clientX;
                y = e.clientY;
            }
        } else if (e instanceof TouchEvent){
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        let doCapture = false;
        if (e.target instanceof Tabletop || e.target instanceof HTMLCanvasElement){
            if (e instanceof MouseEvent){
                if (e.buttons === 1){
                    doCapture = true;
                }
            }else{
                doCapture = true;
            }
        }
        if (doCapture){
            if (this.paintMode === "None"){
                this.movingTabletop = true;
            }else{
                this.paintCell(this.convertViewportToTabletopPosition(x, y));
            }
        }
    }
    private move:EventListener = (e:MouseEvent|TouchEvent) => {
        let x = 0;
        let y = 0;

        if (e instanceof MouseEvent){
            x = e.clientX;
            y = e.clientY;
        } else if (e instanceof TouchEvent){
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }

        this.pos = {
            left: this.scrollLeft,
            top: this.scrollTop,
            x: x,
            y: y,
        };

        if (this.movingTabletop){
            this.scrollTo({
                top: this.pos.top - (y - this.pos.y),
                left: this.pos.left - (x - this.pos.x),
                behavior: "auto",
            });
        } else if (this.paintMode !== "None" && this.mouseDown){
            if (e.target instanceof Tabletop || e.target instanceof HTMLCanvasElement){
                if (e instanceof MouseEvent){
                    if (e.buttons === 1){
                        this.paintCell(this.convertViewportToTabletopPosition(x, y));
                    }
                }else{
                    this.paintCell(this.convertViewportToTabletopPosition(x, y));
                }
            }
        }
    };
    private end:EventListener = () => {
        this.movingTabletop = false;
        this.mouseDown = false;
    }

    public ping(x:number, y:number){
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

    private generateCanvas(){
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth / 2;
        this.canvas.height = window.innerHeight / 2;
        this.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    private logCellMutation(cellIndex:number){
        let newMutation = true;
        for (let i = 0; i < this.mutatedCells.length; i++){
            if (this.mutatedCells[i] === cellIndex){
                newMutation = false;
                break;
            }
        }
        if (newMutation){
            this.mutatedCells.push(cellIndex);
        }
    }

    private paintCell(position:Array<number>){
        const cellPosition = this.convertTabletopPositionToCell(position);
        const minXCell = cellPosition[0] - Math.floor(this.brushSize / 2);
        const maxXCell = cellPosition[0] + Math.floor(this.brushSize / 2);
        const minYCell = cellPosition[1] - Math.floor(this.brushSize / 2);
        const maxYCell = cellPosition[1] + Math.floor(this.brushSize / 2);
        for (let i = 0; i < this.cells.length; i++){
            if (
                this.cells[i].position[0] === cellPosition[0] && this.cells[i].position[1] === cellPosition[1] ||
                this.cells[i].position[0] >= minXCell && this.cells[i].position[0] <= maxXCell && this.cells[i].position[1] >= minYCell && this.cells[i].position[1] <= maxYCell
            ){
                let wasMutated = false;
                switch(this.paintMode){
                    case "Fog":
                        if (this.cells[i].style !== "fog"){
                            this.cells[i].style = "fog";
                            wasMutated = true;
                        }
                        break;
                    case "Highlighter":
                        if (this.cells[i].style !== "fog" || this.isGM){
                            if (this.cells[i].style !== "highlight"){
                                this.cells[i].style = "highlight";
                                wasMutated = true;
                            }
                        }
                        break;
                    default:
                        if (this.isGM || this.cells[i].style === "highlight"){
                            if (this.cells[i].style !== "clear"){
                                this.cells[i].style = "clear";
                                wasMutated = true;
                            }
                        }
                        break;
                }
                if (wasMutated){
                    this.logCellMutation(i);
                }
            }
        }
    }

    private renderer(){
        if (this.render){
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.image, 0, 0);
            if (this.gridType !== 3){
                for (let i = 0; i < this.cells.length; i++){
                    switch (this.cells[i].style){
                        case "highlight":
                            this.ctx.fillStyle = "rgba(255, 13, 65, 0.15)";
                            break;
                        case "fog":
                            this.ctx.fillStyle = `rgba(100,100,100,${this.isGM ? "0.6" : "1"})`;
                            break;
                        default:
                            this.ctx.fillStyle = "transparent";
                            break;
                    }
                    const x = this.cells[i].position[0] * this.cellSize;
                    const y = this.cells[i].position[1] * this.cellSize;
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    if (this.gridType === 1){
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
                if (this.brushSize > 1 && this.paintMode !== "None"){
                    const pos = this.convertViewportToTabletopPosition(this.pos.x, this.pos.y);
                    const buffer = Math.floor(this.brushSize * this.cellSize / 2);
                    this.ctx.strokeStyle = "rgb(0,0,0,0.87)";
                    this.ctx.fillStyle = "rgba(255,255,255,0.6)";
                    this.ctx.beginPath();
                    this.ctx.rect(pos[0] - buffer + 1, pos[1] - buffer + 3, this.brushSize * this.cellSize, this.brushSize * this.cellSize);
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }
        }
        window.requestAnimationFrame(this.renderer.bind(this));
    }

    public setBrushSize(size:number){
        this.brushSize = size;
    }

    public setCellSize(size:number){
        this.cellSize = size;
    }

    public async loadImage(url:string, size:Array<number>){
        if (!this.canvas){
            this.generateCanvas();
        }
        if (this.image?.src !== url){
            this.setAttribute("state", "loading");
            this.canvas.width = 400;
            this.canvas.height = 250;

            let audio:HTMLAudioElement = null;
            if (!localStorage.getItem("loadingDisabled")){
                audio = new Audio(`${location.origin}/sfx/loading.wav`);
                audio.autoplay = true;
                audio.loop = true;
                this.appendChild(audio);
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
                if (audio){
                    audio.remove();
                }
                this.render = true;
                this.setAttribute("state", "loaded");
            };
            this.image.src = url;
        } else {
            this.render = true;
            this.setAttribute("state", "loaded");
        }
    }

    public setCells(cells:Array<Cell>){
        this.cells = cells;
    }

    public clearImage(){
        this.setAttribute("state", "waiting");
    }

    public convertViewportToTabletopPosition(clientX:number, clientY:number):Array<number>{
        const tabletop = this.getBoundingClientRect();
        const x = Math.round(clientX - tabletop.left + this.scrollLeft);
        const y = Math.round(clientY - tabletop.top + this.scrollTop);
        return [x, y];
    }

    public convertTabletopPositionToCell(position:Array<number>):Array<number>{
        const cellX = Math.floor(position[0] / this.cellSize);
        const cellY = Math.floor(position[1] / this.cellSize);
        return [cellX, cellY]
    }

    public setPaintMode(mode:number){
        switch (mode){
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
        if (this.paintMode === "None"){
            this.setAttribute("painter", "inactive");
        }else{
            this.setAttribute("painter", "active");
        }
    }

    public getMutatedCells(){
        const output = [...this.mutatedCells];
        this.mutatedCells = [];
        return output;
    }

    connectedCallback(){
        tabletop = this;

        this.addEventListener("mousedown", this.down);
        this.addEventListener("touchstart", this.down);
    
        document.addEventListener('mousemove', this.move);
        document.addEventListener("touchmove", this.move);
    
        document.addEventListener('mouseup', this.end);
        document.addEventListener("touchend", this.end);
    }

    disconnectedCallback(){
        this.removeEventListener("mousedown", this.down);
        this.removeEventListener("touchstart", this.down);
    
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener("touchmove", this.move);
    
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener("touchend", this.end);
    }
}
customElements.define('tabletop-component', Tabletop);

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

function LoadImage(url:string, cellSize:number, tabletopSize:Array<number>, cells:Array<Cell>, isGM:boolean, gridType:string):void{
    if (tabletop){
        tabletop.isGM = isGM;
        tabletop.gridType = parseInt(gridType);
        tabletop.setCellSize(cellSize);
        tabletop.loadImage(url, tabletopSize);
        tabletop.setCells(cells);
    }
}
function SyncCells(cells:Array<Cell>){
    if (tabletop){
        tabletop.setCells(cells);
    }
}
function SyncCell(index:number, style:CellStyle){
    if (tabletop){
        tabletop.cells[index].style = style;
    }
}
function ClearImage(){
    if (tabletop){
        tabletop.clearImage();
    }
}
async function CalculateNewPawnLocation(event:any){
    if (tabletop){
        const pos = tabletop.convertViewportToTabletopPosition(event.clientX, event.clientY);
        return pos;
    } else {
        return [0,0];
    }
}
async function GetCellPosition(x:number, y:number){
    let output = [0,0];
    if (tabletop){
        output = tabletop.convertViewportToTabletopPosition(x, y);
    }
    return output;
}
async function CalculateLocalPosition(x:number, y:number){
    let pos = [0, 0];
    if (tabletop){
        pos = tabletop.convertViewportToTabletopPosition(x, y);
    }
    return pos;
}
function Ping(x:number, y:number){
    if (tabletop){
        tabletop.ping(x, y);
    }
}
function SetPaintMode(mode:number){
    if (tabletop){
        tabletop.setPaintMode(mode);
    }
}
async function GetCells(){
    let output = [];
    if (tabletop){
        output = tabletop.getMutatedCells();
    }
    return output;
}
function LocatePawn(){
    const player = document.body.querySelector(".js-player-pawn");
    if (player){
        player.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }
}
function ClearFogCell(index:number){
    const cell:HTMLElement = document.body.querySelector(`.js-fog[data-index="${index}"]`);
    if (cell){
        cell.style.background = "transparent";
    }
}
function SetBrushSize(size:number){
    if (tabletop){
        tabletop.setBrushSize(size);
    }
}