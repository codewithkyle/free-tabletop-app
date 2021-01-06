type Image = {
    url: string;
    label: string;
};

class ImageHistory extends HTMLElement{
    private handleClick:EventListener = (e:Event) => {
        const target = e.target as HTMLElement;
        RenderPopupImage(target.dataset.url, target.title, false);
    }

    private render(images:Array<Image>){
        this.setAttribute("grid", "columns 1 gap-0.5");
        const view = html`
            ${images.map((image:Image) => {
                return html`
                    <button @click=${this.handleClick} title="${image.label}" data-url="${image.url}">${image.label}</button>
                `;
            })}
        `;
        // @ts-ignore
        render(view, this);
    }

    private getPastImages(){
        GetImages().then((images:Array<Image>) => {
            this.render(images);
        }).catch(() => {
            setTimeout(()=>{
                this.getPastImages();
            }, 1000);
        });
    }

    public reload(){
        this.getPastImages();
    }

    connectedCallback(){
        this.getPastImages();
    }
}
customElements.define("image-history", ImageHistory);