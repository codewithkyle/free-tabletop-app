class BleedingEffect extends HTMLElement {
    constructor() {
        super();
        this.images = [];
        this.splatters = [];
        for (let i = 1; i <= 5; i++) {
            const image = new Image();
            image.src = `${location.origin}/images/blood-${i}.png`;
            image.style.objectFit = "contain";
            image.onload = () => {
                this.images.push(image);
            };
        }
    }
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const newTime = performance.now();
        const deltaTime = (newTime - this.time) / 1000;
        this.time = newTime;
        const bleedingPawns = Array.from(document.body.querySelectorAll(`[bleeding="true"]`));
        if (this.images.length && bleedingPawns.length) {
            for (let i = 0; i < bleedingPawns.length; i++) {
                bleedingPawns[i].timeToSplatter -= deltaTime;
                if (bleedingPawns[i].timeToSplatter <= 0) {
                    bleedingPawns[i].timeToSplatter = this.randomInt(0, 2);
                    const pawnBounds = bleedingPawns[i].getBoundingClientRect();
                    const imageIndex = this.randomInt(0, this.images.length - 1);
                    const pos = tabletop.convertViewportToTabletopPosition(this.randomInt((pawnBounds.left - (pawnBounds.width / 2)), (pawnBounds.right - (pawnBounds.width / 2))), this.randomInt((pawnBounds.top - (pawnBounds.height / 2)), (pawnBounds.bottom - (pawnBounds.height / 2))));
                    const splatter = new BloodSpatter(this.images[imageIndex], pos, pawnBounds.width);
                    this.splatters.push(splatter);
                }
            }
        }
        for (let i = 0; i < this.splatters.length; i++) {
            this.splatters[i].render(this.ctx, deltaTime);
        }
        // Remove old splatters
        for (let i = this.splatters.length - 1; i >= 0; i--) {
            if (this.splatters[i].dead) {
                this.splatters.splice(i, 1);
            }
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
    checkIfReady() {
        if (this.dataset.width && this.dataset.height) {
            this.canvas = document.createElement("canvas");
            this.appendChild(this.canvas);
            this.canvas.width = parseInt(this.dataset.width);
            this.canvas.height = parseInt(this.dataset.height);
            this.ctx = this.canvas.getContext("2d");
            this.time = performance.now();
            this.render();
        }
        else {
            setTimeout(() => {
                this.checkIfReady();
            }, 150);
        }
    }
    connectedCallback() {
        this.checkIfReady();
    }
}
customElements.define("bleeding-effect", BleedingEffect);
class BloodSpatter {
    constructor(image, position, size) {
        this.image = image;
        this.position = position;
        this.size = size;
        this.life = 3;
        this.image.width = size;
        this.image.height = size;
    }
    render(ctx, deltaTime) {
        ctx.globalAlpha = this.life;
        ctx.drawImage(this.image, this.position[0], this.position[1], this.size, this.size);
        ctx.globalAlpha = 1;
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.dead = true;
        }
    }
}
