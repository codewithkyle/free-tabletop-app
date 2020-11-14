class Tabletop extends HTMLElement{
    private pos:any;
    private movingTabletop:boolean;

    constructor(){
        super();
        this.pos = { top: 0, left: 0, x: 0, y: 0 };
        this.movingTabletop = false;
    }

    private mouseDown:EventListener = (e:MouseEvent)=>{
        if (e.button === 0 && e.target instanceof HTMLTableCellElement){
            this.pos = {
                left: this.scrollLeft,
                top: this.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };
            this.movingTabletop = true;
        }
    }
    private touchDown:EventListener = (e:TouchEvent)=>{
        if (e.target instanceof HTMLTableCellElement){
            this.pos = {
                left: this.scrollLeft,
                top: this.scrollTop,
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            this.movingTabletop = true;
        }
    }
    private mouseMove:EventListener = (e:MouseEvent) => {
        if (this.movingTabletop){
            const dx = e.clientX - this.pos.x;
            const dy = e.clientY - this.pos.y;

            this.scrollTo({
                top: this.pos.top - dy,
                left: this.pos.left - dx,
                behavior: "auto",
            });
        }
    };
    private touchMove:EventListener = (e:TouchEvent) => {
        if (this.movingTabletop){
            const dx = e.touches[0].clientX - this.pos.x;
            const dy = e.touches[0].clientY - this.pos.y;

            this.scrollTo({
                top: this.pos.top - dy,
                left: this.pos.left - dx,
                behavior: "auto",
            });
        }
    }
    private end:EventListener = () => {
        this.movingTabletop = false;
    }

    connectedCallback(){
        this.addEventListener("mousedown", this.mouseDown);
        this.addEventListener("touchstart", this.touchDown);
    
        document.addEventListener('mousemove', this.mouseMove);
        document.addEventListener("touchmove", this.touchMove);
    
        document.addEventListener('mouseup', this.end);
        document.addEventListener("touchend", this.end);
    }

    disconnectedCallback(){
        this.removeEventListener("mousedown", this.mouseDown);
        this.removeEventListener("touchstart", this.touchDown);
    
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener("touchmove", this.touchMove);
    
        document.removeEventListener('mouseup', this.end);
        document.removeEventListener("touchend", this.end);
    }
}
customElements.define('tabletop-component', Tabletop);