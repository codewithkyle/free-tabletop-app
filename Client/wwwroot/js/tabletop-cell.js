class TabletopCell extends HTMLElement {
    constructor() {
        super(...arguments);
        this.handleLeftClick = (e) => {
            if (e instanceof MouseEvent && (e.ctrlKey || e.metaKey)) {
                const fogCell = document.body.querySelector(`.js-fog[data-index="${this.dataset.index}"]`);
                if (fogCell) {
                    fogCell.style.background = "transparent";
                }
            }
        };
        this.handleDrop = () => {
            this.classList.remove("highlight");
            PlaySound("plop.wav");
        };
        this.handleDragEnter = () => {
            this.classList.add("highlight");
        };
        this.handleDragLeave = () => {
            this.classList.remove("highlight");
        };
    }
    connectedCallback() {
        this.addEventListener("click", this.handleLeftClick);
        this.addEventListener("drop", this.handleDrop);
        this.addEventListener("dragenter", this.handleDragEnter);
        this.addEventListener("dragend", this.handleDragLeave);
        this.addEventListener("dragexit", this.handleDragLeave);
        this.addEventListener("dragleave", this.handleDragLeave);
    }
    disconnectedCallback() {
        this.removeEventListener("click", this.handleLeftClick);
        this.removeEventListener("drop", this.handleDrop);
        this.removeEventListener("dragenter", this.handleDragEnter);
        this.removeEventListener("dragend", this.handleDragLeave);
        this.removeEventListener("dragexit", this.handleDragLeave);
        this.removeEventListener("dragleave", this.handleDragLeave);
    }
}
customElements.define('tabletop-cell', TabletopCell);
