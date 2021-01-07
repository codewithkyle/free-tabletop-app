class Pawn extends HTMLElement{
    private HUD:HTMLElement;
    public timeToSplatter:number;
    public fov:number;
    public cell:{
        x: number;
        y: number;
    }

    constructor(){
        super();
        this.HUD = null;
        this.timeToSplatter = 0;
        this.fov = 0;
        this.cell = {
            x: 0,
            y: 0,
        };
    }

    public UpdatePosition(x:number, y:number, cellSize:number){
        this.cell = {
            x: Math.floor(x / cellSize),
            y: Math.floor(y / cellSize)
        };
        this.style.transform = `translate(${this.cell.x * cellSize}px, ${this.cell.y * cellSize}px)`;
    }

    public UpdateVisibility(visible:boolean){
        if (visible){
            this.style.opacity = "1";
            this.style.visibility = "visible";
            this.style.pointerEvents = "all";
        }else{
            this.style.opacity = "0";
            this.style.visibility = "hidden";
            this.style.pointerEvents = "none";
        }
    }

    public updateHUD(){
        if (this.HUD){
            this.HUD.style.transform = "translate(0px,0px)";
            const hudBounds = this.HUD.getBoundingClientRect();
            const tabletopBounds = this.parentElement.getBoundingClientRect();
            const icon:HTMLElement = this.querySelector("i");

            let topOffset = hudBounds.height * -1;
            if (hudBounds.top + topOffset < tabletopBounds.top){
                topOffset += hudBounds.height + icon.scrollHeight + 4;
            }

            let leftOffset = hudBounds.width / 2 * -1 + icon.scrollWidth / 2 + 2;
            if (hudBounds.left + leftOffset < tabletopBounds.left){
                leftOffset += (tabletopBounds.left - (hudBounds.left + leftOffset)) + 16;
            }

            if (hudBounds.right + leftOffset > tabletopBounds.right){
                leftOffset -= ((hudBounds.right + leftOffset) - tabletopBounds.right) + 16;
            }
            this.HUD.style.transform = `translate(${leftOffset}px, ${topOffset}px)`;
        }
    }
    private checkHUD:EventListener = this.updateHUD.bind(this);

    public register(el:HTMLElement){
        this.HUD = el;
    }

    public celebrateDeath(){
        const { top, height, left, width, } = this.getBoundingClientRect();
        const x = (left + width / 2);
        const y = (top + height / 2);
        const tabletopPos = tabletop.convertViewportToTabletopPosition(x, y);
        const origin = { x: tabletopPos[0], y: tabletopPos[1] };
        deathCanvas.spawnConfetti(origin);
    }

    connectedCallback(){
        this.addEventListener("mouseenter", this.checkHUD);
    }    
}
customElements.define("tabletop-pawn", Pawn);

class PawnHud extends HTMLElement{
    private switchView:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        this.dataset.view = target.dataset.index;
        // @ts-ignore
        this.parentElement.updateHUD();
    }

    private getButtons(){
        const buttons = Array.from(this.querySelectorAll(".js-view-button"));
        if (buttons.length){
            for (let i = 0; i < buttons.length; i++){
                buttons[i].addEventListener("click", this.switchView);
            }
        }else{
            setTimeout(this.getButtons.bind(this), 300);
        }
    }

    connectedCallback(){
        // @ts-ignore
        this.parentElement.register(this);
        setTimeout(this.getButtons.bind(this), 300)
    }
}
customElements.define("pawn-hud", PawnHud);

function UpdateEntityPosition(uid:string, position:Array<number>, cellSize:number){
    const pawn:Pawn = document.body.querySelector(`tabletop-pawn[data-uid="${uid}"]`);
    if (pawn){
        pawn.UpdatePosition(position[0], position[1], cellSize);
    }
}
function RenderDeathCelebration(uid:string){
    const pawn:Pawn = document.body.querySelector(`tabletop-pawn[data-uid="${uid}"]`);
    if (pawn){
        pawn.celebrateDeath();
    }
}
function UpdateEntities(entities:Array<{uid: string, position:Array<number>, foV:number}>, cellSize:number){
    if (entities.length){
        for (let i = 0; i < entities.length; i++){
            const pawn:Pawn = document.body.querySelector(`tabletop-pawn[data-uid="${entities[i].uid}"]`);
            if (pawn){
                pawn.UpdatePosition(entities[i].position[0], entities[i].position[1], cellSize);
                pawn.fov = entities[i].foV;
            }
        }
    }
}
function SetEntityFoV(uid:string, fov:number){
    const pawn:Pawn = document.body.querySelector(`tabletop-pawn[data-uid="${uid}"]`);
    if (pawn){
        pawn.fov = fov;
    }
}