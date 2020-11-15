class Pawn extends HTMLElement {
    UpdatePosition(x, y, cellSize) {
        this.style.transform = `translate(${x * cellSize}px, ${y * cellSize}px)`;
    }
}
customElements.define("tabletop-pawn", Pawn);
