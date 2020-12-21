class Draggable extends HTMLElement{
    private moving:boolean;
    private pos1:number;
    private pos2:number;
    private pos3:number;
    private pos4:number;
    private handle:HTMLElement;
    private closeButton:HTMLButtonElement;

    constructor(){
        super();
        this.moving = false;
        this.pos1 = 0;
        this.pos2 = 0;
        this.pos3 = 0;
        this.pos4 = 0;
        this.closeButton = null;
    }

    private handleMouseDown:EventListener = (e:MouseEvent|TouchEvent) => {
        this.moving = true;
        if (e instanceof MouseEvent){
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
        } else if (e instanceof TouchEvent){
            this.pos3 = e.touches[0].clientX;
            this.pos4 = e.touches[0].clientY;
        }
    }

    private handleMouseUp:EventListener = () => {
        this.moving = false;
    }

    private handleMouseMove:EventListener = (e:MouseEvent|TouchEvent) => {
        if (this.moving){
            if (e instanceof MouseEvent){
                this.pos1 = this.pos3 - e.clientX;
                this.pos2 = this.pos4 - e.clientY;
                this.pos3 = e.clientX;
                this.pos4 = e.clientY;
            }else if (e instanceof TouchEvent){
                this.pos1 = this.pos3 - e.touches[0].clientX;
                this.pos2 = this.pos4 - e.touches[0].clientY;
                this.pos3 = e.touches[0].clientX;
                this.pos4 = e.touches[0].clientY;
            }

            const bounds = this.getBoundingClientRect();
            let top = parseInt(this.dataset.top) - this.pos2;
            let left = parseInt(this.dataset.left) - this.pos1;

            const topLimit = 0;
            const bottomLimit = window.innerHeight - bounds.height;
            if (top < topLimit){
                top = topLimit;
            }
            if (top > bottomLimit){
                top = bottomLimit;
            }

            const leftLimit = 0;
            const rightLimit = window.innerWidth - bounds.width;
            if (left < leftLimit){
                left = leftLimit;
            }
            if (left > rightLimit){
                left = rightLimit;
            }

            this.style.transform = `translate(${left}px, ${top}px)`;
            this.dataset.top = `${top}`;
            this.dataset.left = `${left}`;
        }
    }

    public toggleVisability(visible:boolean){
        if (visible){
            this.style.transform = "translate(0px,0px)";
            this.dataset.top = "0";
            this.dataset.left = "0";
        }
        this.style.visibility = `${visible ? "visible" : "hidden"}`;
    }

    public registerEvents(handle:HTMLElement){
        this.handle = handle;
        this.handle.addEventListener("mousedown", this.handleMouseDown);
        this.handle.addEventListener("touchstart", this.handleMouseDown);
    }

    connectedCallback(){        
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseleave", this.handleMouseMove);
        window.addEventListener("mouseout", this.handleMouseMove);
        window.addEventListener("mouseleave", this.handleMouseUp);
        window.addEventListener("touchend", this.handleMouseUp);
        window.addEventListener("touchmove", this.handleMouseMove);
        window.addEventListener("touchcancel", this.handleMouseMove);

        this.dataset.top = "0";
        this.dataset.left = "0";

        this.closeButton = this.querySelector(".js-close-button");
        if (this.closeButton){
            this.closeButton.addEventListener("click", () => { this.remove(); });
        }
    }
}
class DraggableHandle extends HTMLElement{
    connectedCallback(){
        // @ts-ignore
        this.parentElement.registerEvents(this);
    }
}
customElements.define("moveable-handle", DraggableHandle);
function ToggleModal(className:string, visible:boolean){
    const el:Draggable = document.body.querySelector(`.${className}`);
    if (el){
        el.toggleVisability(visible);
    }
}
customElements.define("moveable-modal", Draggable);