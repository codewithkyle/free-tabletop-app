declare const confetti:any;

let deathCanvas:DeathCanvas = null;

class DeathCanvas extends HTMLElement{
    private canvas: HTMLCanvasElement;
    private confettiLauncher:Function;

    constructor(){
        super();
        this.confettiLauncher = null;
    }

    public spawnConfetti(tabletopPosition:{x:number, y:number}){
        if (this.canvas.width !== parseInt(this.dataset.width) || this.canvas.height !== parseInt(this.dataset.height)){
            this.canvas.width = parseInt(this.dataset.width);
            this.canvas.height = parseInt(this.dataset.height);
        }
        if (!this.confettiLauncher){
            this.confettiLauncher = confetti.create(this.canvas, { resize: false });
        }
        // Convert tabletop pixel position to canvas position
        const position = {
            x: tabletopPosition.x / this.canvas.width,
            y: tabletopPosition.y / this.canvas.height,
        };
        PlaySound("death-celebration.mp3");
        this.confettiLauncher({
            origin: position,
            spread: 360,
            startVelocity: 10,
            gravity: 0,
            particleCount: 200,
            ticks: 200,
        });
    }

    private checkIfReady(){
        if (this.dataset.width && this.dataset.height){
            this.canvas = document.createElement("canvas");
            this.appendChild(this.canvas);
            this.canvas.width = parseInt(this.dataset.width);
            this.canvas.height = parseInt(this.dataset.height);
            deathCanvas = this;
        }else{
            setTimeout(()=>{
                this.checkIfReady();
            }, 150);
        }
    }

    connectedCallback(){
        this.checkIfReady();
    }
}
customElements.define("death-canvas", DeathCanvas);