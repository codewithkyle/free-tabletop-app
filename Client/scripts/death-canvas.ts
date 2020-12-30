declare const confetti:any;

let deathCanvas:DeathCanvas = null;

interface ConfettiCanvas extends HTMLCanvasElement{
    confetti: Function;
}

class DeathCanvas extends HTMLElement{
    private canvas: ConfettiCanvas;
    private confettiLauncher:Function;

    constructor(){
        super();
        this.confettiLauncher = null;
    }

    public spawnConfetti(tabletopPosition:{x:number, y:number}){
        const bounds = this.getBoundingClientRect();
        if (this.canvas.width !== bounds.width || this.canvas.height !== bounds.height){
            this.canvas.width = bounds.width;
            this.canvas.height = bounds.height;
        }
        if (!this.confettiLauncher){
            this.confettiLauncher = confetti.create(this.canvas, { resize: false });
        }
        // Convert tabletop pixel position to canvas position
        const position = {
            x: tabletopPosition.x / bounds.width,
            y: tabletopPosition.y / bounds.height,
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
    
    connectedCallback(){
        this.canvas = document.createElement("canvas") as ConfettiCanvas;
        this.appendChild(this.canvas);
        deathCanvas = this;
    }
}
customElements.define("death-canvas", DeathCanvas);