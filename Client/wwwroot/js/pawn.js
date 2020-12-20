class Pawn extends HTMLElement {
    constructor() {
        super();
        this.HUD = this.querySelector(".nametag, .creature-hud");
        console.log(this.HUD);
    }
    UpdatePosition(x, y, cellSize) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        this.style.transform = `translate(${cellX * cellSize}px, ${cellY * cellSize}px)`;
    }
    UpdateVisibility(x, y) {
        const cell = document.body.querySelector(`.js-fog[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            if (cell.style.background === "transparent") {
                this.style.display = "inline-flex";
            }
            else {
                this.style.display = "none";
            }
        }
    }
}
customElements.define("tabletop-pawn", Pawn);
