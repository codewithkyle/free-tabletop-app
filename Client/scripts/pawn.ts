class Pawn extends HTMLElement{
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
}
customElements.define("tabletop-pawn", Pawn);