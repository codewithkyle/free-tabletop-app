class SFXRenderer extends HTMLElement{
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private images:Array<HTMLImageElement>;
    private time:number;
    private effects:Array<FloatingParticleEffect|BloodSpatter>;
    private heartImage:HTMLImageElement;
    private starImage:HTMLImageElement;
    private spiralImage:HTMLImageElement;

    constructor(){
        super();
        this.images = [];
        this.effects = [];
        for (let i = 1; i <= 5; i++){
            const image = new Image();
            image.src = `${location.origin}/images/blood-${i}.png`;
            image.style.objectFit = "contain";
            image.onload = () => {
                this.images.push(image);
            }
        }
        this.heartImage = new Image();
        this.heartImage.src = `${location.origin}/images/heart.png`;

        this.starImage = new Image();
        this.starImage.src = `${location.origin}/images/star.png`;

        this.spiralImage = new Image();
        this.spiralImage.src = `${location.origin}/images/unconscious.png`;
    }

    private randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private cleanup(){
        for (let i = this.effects.length - 1; i >= 0; i--){
            if (this.effects[i].dead){
                this.effects.splice(i, 1);
            }
        }
    }

    private render(){
        if (this.canvas.width !== parseInt(this.dataset.width) || this.canvas.height !== parseInt(this.dataset.height)){
            this.canvas.width = parseInt(this.dataset.width);
            this.canvas.height = parseInt(this.dataset.height);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const newTime = performance.now();
        const deltaTime = (newTime - this.time) / 1000;
        this.time = newTime; 

        const bleedingPawns:Array<Pawn> = Array.from(document.body.querySelectorAll(`[bleeding="true"]`));
        if (this.images.length){
            for (let i = 0; i < bleedingPawns.length; i++){
                bleedingPawns[i].timeToSplatter -= deltaTime;
                if (bleedingPawns[i].timeToSplatter <= 0){
                    bleedingPawns[i].timeToSplatter = this.randomInt(0, 2);
                    const pawnBounds = bleedingPawns[i].getBoundingClientRect();
                    const imageIndex = this.randomInt(0, this.images.length - 1);
                    const pos = tabletop.convertViewportToTabletopPosition(this.randomInt((pawnBounds.left - (pawnBounds.width / 2)), (pawnBounds.right - (pawnBounds.width / 2))), this.randomInt((pawnBounds.top - (pawnBounds.height / 2)), (pawnBounds.bottom - (pawnBounds.height / 2))));
                    const splatter = new BloodSpatter(this.images[imageIndex], pos, pawnBounds.width);
                    this.effects.push(splatter);
                }
            }
        }

        const charmedPawns:Array<Pawn> = Array.from(document.body.querySelectorAll(`[charmed="true"]`));
        if (this.heartImage.complete){
            for (let i = 0; i < charmedPawns.length; i++){
                if (Math.random() <= 0.1){
                    const pawnBounds = charmedPawns[i].getBoundingClientRect();
                    const pos = tabletop.convertViewportToTabletopPosition((pawnBounds.left + (pawnBounds.width / 2)), (pawnBounds.top + (pawnBounds.height / 2)));
                    const effect = new FloatingParticleEffect(this.heartImage, pos, this.randomInt(-20, 20), this.randomInt(-20, 20), this.randomInt(1, 3));
                    this.effects.push(effect);
                }
            }
        }

        const stunnedPawns:Array<Pawn> = Array.from(document.body.querySelectorAll(`[stunned="true"]`));
        if (this.starImage.complete){
            for (let i = 0; i < stunnedPawns.length; i++){
                if (Math.random() <= 0.075){
                    const pawnBounds = stunnedPawns[i].getBoundingClientRect();
                    const pos = tabletop.convertViewportToTabletopPosition((pawnBounds.left + (pawnBounds.width / 2)), (pawnBounds.top + (pawnBounds.height / 2)));
                    const effect = new FloatingParticleEffect(this.starImage, pos, this.randomInt(-40, 40), this.randomInt(-40, 40), 1.25);
                    this.effects.push(effect);
                }
            }
        }

        const unconsciousPawns:Array<Pawn> = Array.from(document.body.querySelectorAll(`[unconscious="true"]`));
        if (this.spiralImage.complete){
            for (let i = 0; i < unconsciousPawns.length; i++){
                if (Math.random() <= 0.05){
                    const pawnBounds = unconsciousPawns[i].getBoundingClientRect();
                    const pos = tabletop.convertViewportToTabletopPosition((pawnBounds.left + (pawnBounds.width / 2)), (pawnBounds.top + (pawnBounds.height / 2)));
                    const effect = new FloatingParticleEffect(this.spiralImage, pos, this.randomInt(-40, 40), this.randomInt(-40, 40), 1.25, this.randomInt(200, 400) * -1);
                    this.effects.push(effect);
                }
            }
        }
        
        for (let i = 0; i < this.effects.length; i++){
            this.effects[i].render(this.ctx, deltaTime);
        }

        this.cleanup();
        window.requestAnimationFrame(this.render.bind(this));
    }

    private checkIfReady(){
        if (this.dataset.width && this.dataset.height){
            this.canvas = document.createElement("canvas");
            this.appendChild(this.canvas);
            this.canvas.width = parseInt(this.dataset.width);
            this.canvas.height = parseInt(this.dataset.height);
            this.ctx = this.canvas.getContext("2d");
            this.time = performance.now();
            this.render();
        }else{
            setTimeout(()=>{
                this.checkIfReady();
            }, 150);
        }
    }

    connectedCallback(){
        this.checkIfReady();
    }
}
customElements.define("sfx-canvas", SFXRenderer);

class BloodSpatter{
    public dead:boolean;
    private image:HTMLImageElement;
    private size: number;
    private position:Array<number>;
    private life:number;

    constructor(image:HTMLImageElement, position:Array<number>, size:number){
        this.image = image;
        this.position = position;
        this.size = size;
        this.life = 3;
        this.image.width = size;
        this.image.height = size;
    }

    public render(ctx:CanvasRenderingContext2D, deltaTime:number){
        ctx.globalAlpha = this.life;
        ctx.drawImage(this.image, this.position[0], this.position[1], this.size, this.size);
        ctx.globalAlpha = 1;
        this.life -= deltaTime;
        if (this.life <= 0){
            this.dead = true;
        }
    }
}

class FloatingParticleEffect{
    public dead:boolean;
    private image:HTMLImageElement;
    private position:Array<number>;
    private velocityX:number;
    private velocityY:number;
    private life:number;
    private rotation:number;
    private rotationVelocity:number;

    constructor(image:HTMLImageElement, position:Array<number>, velocityX:number, velocityY:number, life:number, rotationVelocity:number = 0){
        this.image = image;
        this.position = position;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.dead = false;
        this.life = life;
        this.rotation = 0;
        this.rotationVelocity = rotationVelocity;
    }

    public render(ctx:CanvasRenderingContext2D, deltaTime:number){
        ctx.globalAlpha = this.life;
        this.position[0] += this.velocityX * deltaTime;
        this.position[1] -= this.velocityY * deltaTime;
        this.rotation += this.rotationVelocity * deltaTime;
        ctx.translate(this.position[0], this.position[1]);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.image, -8, -8, 16, 16);
        this.life -= deltaTime;
        if (this.life <= 0){
            this.dead = true;
        }
        ctx.globalAlpha = 1;
        ctx.setTransform(1,0,0,1,0,0);
    }
}
