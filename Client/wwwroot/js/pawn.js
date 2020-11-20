class Pawn extends HTMLElement {
    UpdatePosition(x, y, cellSize) {
        this.style.transform = `translate(${x * cellSize}px, ${y * cellSize}px)`;
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
