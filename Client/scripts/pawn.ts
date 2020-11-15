class Pawn extends HTMLElement{
    public UpdatePosition(x:number, y:number, cellSize:number){
        this.style.transform = `translate(${x * cellSize}px, ${y * cellSize}px)`;
    }
}
customElements.define("tabletop-pawn", Pawn);