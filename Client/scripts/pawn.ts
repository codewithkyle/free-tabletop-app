class Pawn extends HTMLElement{
    public UpdatePosition(x:number, y:number, cellSize:number){
        this.style.transform = `translate(${x * cellSize}px, ${y * cellSize}px)`;
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