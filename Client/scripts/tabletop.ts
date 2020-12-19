let tabletop = null;

class Tabletop extends HTMLElement{
    private pos:any;
    private movingTabletop:boolean;
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private loadingAnimation:HTMLElement;

    constructor(){
        super();
        this.pos = { top: 0, left: 0, x: 0, y: 0 };
        this.movingTabletop = false;
    }

    private mouseDown:EventListener = (e:MouseEvent)=>{
        if (e.button === 0 && e.target instanceof HTMLTableCellElement){
            this.pos = {
                left: this.scrollLeft,
                top: this.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };
            this.movingTabletop = true;
        }
    }
    private touchDown:EventListener = (e:TouchEvent)=>{
        if (e.target instanceof HTMLTableCellElement){
            this.pos = {
                left: this.scrollLeft,
                top: this.scrollTop,
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            this.movingTabletop = true;
        }
    }
    private mouseMove:EventListener = (e:MouseEvent) => {
        if (this.movingTabletop){
            const dx = e.clientX - this.pos.x;
            const dy = e.clientY - this.pos.y;

            this.scrollTo({
                top: this.pos.top - dy,
                left: this.pos.left - dx,
                behavior: "auto",
            });
        }
    };
    private touchMove:EventListener = (e:TouchEvent) => {
        if (this.movingTabletop){
            const dx = e.touches[0].clientX - this.pos.x;
            const dy = e.touches[0].clientY - this.pos.y;

            this.scrollTo({
                top: this.pos.top - dy,
                left: this.pos.left - dx,
                behavior: "auto",
            });
        }
    }
    private end:EventListener = () => {
        this.movingTabletop = false;
    }

    private generateCanvas(){
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth / 2;
        this.canvas.height = window.innerHeight / 2;
        this.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    public loadImage(url:string, size:Array<number>){
        if (!this.canvas){
            this.generateCanvas();
        }
        this.setAttribute("state", "loading");
        this.canvas.width = 400;
        this.canvas.height = 250;

        let audio:HTMLAudioElement = null;
        if (!localStorage.getItem("loadingDisabled")){
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
                top: bounds.height / 4,
                left: bounds.width / 4,
                behavior: "auto"
            });
            if (audio){
                audio.pause();
            }
        };
        img.src = url;
    }

    public clearImage(){
        this.setAttribute("state", "waiting");
    }

    connectedCallback(){
        tabletop = this;

        this.addEventListener("mousedown", this.mouseDown);
        this.addEventListener("touchstart", this.touchDown);
    
        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener("touchmove", this.touchMove);
    
        document.addEventListener('mouseup', this.end);
        document.addEventListener("touchend", this.end);
    }

    disconnectedCallback(){
        this.removeEventListener("mousedown", this.mouseDown);
        this.removeEventListener("touchstart", this.touchDown);
    
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
    
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener("touchend", this.end);
    }
}
customElements.define('tabletop-component', Tabletop);

function LoadImage(url:string, cellSize:Array<number>, tabletopSize:Array<number>):void{
    if (tabletop){
        tabletop.loadImage(url, tabletopSize);
    }
}
function ClearImage(){
    if (tabletop){
        tabletop.clearImage();
    }
}