class Pawn extends HTMLElement{
    private HUD:HTMLElement;

    constructor(){
        super();
        this.HUD = null;
    }

    public UpdatePosition(x:number, y:number, cellSize:number){
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        this.style.transform = `translate(${cellX * cellSize}px, ${cellY * cellSize}px)`;
    }

    public UpdateVisibility(x:number, y:number){
        const cell:HTMLElement = document.body.querySelector(`.js-fog[data-x="${x}"][data-y="${y}"]`);
        if (cell){
            if (cell.style.background === "transparent"){
                this.style.display = "inline-flex";
            }else{
                this.style.display = "none";
            }
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

    connectedCallback(){
        this.addEventListener("mouseenter", this.checkHUD);
    }    
}
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
customElements.define("tabletop-pawn", Pawn);