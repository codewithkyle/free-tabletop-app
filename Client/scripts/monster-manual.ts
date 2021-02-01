type MonsterManualState = {
    creatures: Array<Creature>;
    view: "loading" | "creature" | "search",
};

class MonsterManual extends Component<MonsterManualState>{
    private container:HTMLElement;
    private search:HTMLInputElement;

    constructor(){
        super();
        this.state = {
            creatures: [],
            view: "loading",
        };
    }

    private async update(){
        const query = this.search.value.trim();
        const creatures = await MonsterManualSearch(query);
        this.setState({
            creatures: creatures,
            view: "search"
        });
    }

    private debounce = debounce(this.update.bind(this), 300, false);

    private handleInput = (e:Event) => {
        this.setState({ view: "loading" });
        this.debounce();
    }

    private deleteCreature:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        DeleteCreature(target.dataset.creature);
        const creatures = [...this.state.creatures];
        creatures.splice(parseInt(target.dataset.index), 1);
        this.setState({
            creatures: creatures,
        });
    }

    private viewCreature:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.dataset.index);
        const creature = this.state.creatures[index];
        console.log(creature);
        this.spawnCreatureModal(creature);
    }

    private formatSpeed(raw:string):string {
        let speed = "";
        const speedObject = JSON.parse(raw);
        for (const key in speedObject){
            if (key !== "hover"){
                speed += `${speedObject[key]} ${key}, `;
            }
        }
        speed = speed.trim().replace(/\,$/, "").replace(/\_/g, " ");
        return speed;
    }

    private calculateModifier(value:number): string{
        const modifier = Math.floor((value - 10) / 2);
        if (modifier >= 0){
            return `+${modifier}`;
        } else {
            return `${modifier}`;
        }
    }

    private formatMixed(raw:string): string{
        let value = "";
        const decoded = JSON.parse(raw);
        for (let i = 0; i < decoded.length; i++){
            if (typeof decoded[i] === "object"){
                value += `${decoded[i].name}, `;
            } else {
                value += `${decoded[i]}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatObject(raw:string): string{
        let value = "";
        const decoded = JSON.parse(raw);
        for (const key in decoded){
            value += `${key} ${decoded[key]}, `;
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatSavingThrows(raw:string){
        let value = "";
        const decoded = JSON.parse(raw);
        const regex = new RegExp("Saving Throw:");
        for (let i = 0; i < decoded.length; i++){
            if (regex.test(decoded[i].proficiency.name)){
                value += `${decoded[i].proficiency.name.replace("Saving Throw:", "").trim()} ${decoded[i].value >= 0 ? "+" : "-"}${decoded[i].value}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatSkills(raw:string){
        let value = "";
        const decoded = JSON.parse(raw);
        const regex = new RegExp("Skill:");
        for (let i = 0; i < decoded.length; i++){
            if (regex.test(decoded[i].proficiency.name)){
                value += `${decoded[i].proficiency.name.replace("Skill:", "").trim()} ${decoded[i].value >= 0 ? "+" : "-"}${decoded[i].value}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatAbilities(raw:string){
        const abilities = [];
        const decoded = JSON.parse(raw);
        for (let i = 0; i < decoded.length; i++){
            const usage = decoded[i]?.usage ? `${decoded[i]?.usage?.times} ${decoded[i]?.usage?.type}` : null;
            abilities.push({
                name: decoded[i].name,
                desc: decoded[i].desc,
                usage: usage,
            });
        }
        return abilities;
    }

    private calculateProficiencyBonue(cr:number): string{
        if (cr >= 0 && cr <=4){
            return "+2";
        } else if (cr >= 5 && cr <= 8){
            return "+3";
        } else if (cr >= 9 && cr <= 12){
            return "+4";
        } else if (cr >= 13 && cr <= 16){
            return "+5";
        } else if (cr >= 17 && cr <= 20){
            return "+6";
        } else if (cr >= 21 && cr <= 24){
            return "+7";
        } else if (cr >= 26 && cr <= 28){
            return "+8";
        } else {
            return "+9";
        }
    }

    private formatAcitons(raw:string){
        const actions = [];
        const decoded = JSON.parse(raw);
        for (let i = 0; i < decoded.length; i++){
            let usage = null;
            if (decoded[i]?.usage){
                if (decoded[i].usage?.times){
                    usage = `${decoded[i].usage?.times} ${decoded[i].usage?.type}`;
                } else if (decoded[i].usage?.dice){
                    usage = `${decoded[i].usage?.type} ${decoded[i].usage?.dice} ${decoded[i].usage?.["min_value"] ? `min ${decoded[i].usage?.["min_value"]}` : null}`;
                    usage = usage.trim();
                }
            }
            actions.push({
                name: decoded[i].name,
                desc: decoded[i].desc,
                usage: usage,
            });
        }
        return actions;
    }

    private spawnCreatureModal(creature:Creature){
        const el = document.createElement("moveable-modal");
        el.className = "stat-block";
        el.style.zIndex = "1001";

        const abilities = this.formatAbilities(creature.abilities);
        const actions = this.formatAcitons(creature.actions);
        const legnedaryActions = this.formatAcitons(creature.legendaryActions);

        // @ts-ignore
        render(html`
            <moveable-handle>
                <span class="inline-block font-xs font-grey-100 font-medium">${creature.name}</span>
                <div>
                    <button class="modal-close js-close-button" tooltip="Close" aria-label="close ${creature.name} modal">
                        <svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="times" class="svg-inline--fa fa-times fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"></path></svg>
                    </button>
                </div>
            </moveable-handle>
            <div class="container">
                <div class="stats line-normal">
                    <div class="block w-full p-0.5">
                        <h3 class="block font-red font-lg font-bold font-serif">${creature.name}</h3>
                        <p style="font-style:italic;" class="block font-neutral-900 font-xs">${creature.size} ${creature.type}${creature.subtype ? ` ${creature.subtype}` : null}, ${creature.alignment}</p>
                    </div>
                    <hr>
                    <p class="block w-full p-0.5 font-red font-sm">
                        <strong>Armor Class</strong>
                        ${creature.ac}
                        <br>
                        <strong>Hit Points</strong>
                        ${creature.hp} (${creature.hitDice})
                        <br>
                        <strong>Speed</strong>
                        ${this.formatSpeed(creature.speed)}
                    </p>
                    <hr>
                    <div class="abilities p-0.5">
                        <div class="text-center font-red font-sm">
                            <strong class="block">STR</strong>
                            <span>${creature.str} (${this.calculateModifier(creature.str)})</span>
                        </div>
                        <div class="text-center font-red font-sm">
                            <strong class="block">DEX</strong>
                            <span>${creature.dex} (${this.calculateModifier(creature.dex)})</span>
                        </div>
                        <div class="text-center font-red font-sm">
                            <strong class="block">CON</strong>
                            <span>${creature.con} (${this.calculateModifier(creature.con)})</span>
                        </div>
                        <div class="text-center font-red font-sm">
                            <strong class="block">INT</strong>
                            <span>${creature.int} (${this.calculateModifier(creature.int)})</span>
                        </div>
                        <div class="text-center font-red font-sm">
                            <strong class="block">WIS</strong>
                            <span>${creature.wis} (${this.calculateModifier(creature.wis)})</span>
                        </div>
                        <div class="text-center font-red font-sm">
                            <strong class="block">CHA</strong>
                            <span>${creature.cha} (${this.calculateModifier(creature.cha)})</span>
                        </div>
                    </div>
                    <hr>
                    <p class="block w-full p-0.5 font-red font-sm">
                        <strong>Immunities</strong>
                        ${this.formatMixed(creature.immunities)}
                        <br>
                        <strong>Resistances</strong>
                        ${this.formatMixed(creature.resistances)}
                        <br>
                        <strong>Vulnerabilities</strong>
                        ${this.formatMixed(creature.vulnerabilities)}
                        <br>
                        <strong>Senses</strong>
                        ${this.formatObject(creature.senses)}
                        <br>
                        <strong>Languages</strong>
                        ${creature.languages.length ? creature.languages : "—"}
                        <br>
                        <strong>Challenge</strong>
                        ${creature.cr} (${creature.xp} XP)
                        <br>
                        <strong>Saving Throws</strong>
                        ${this.formatSavingThrows(creature.proficiencies)}
                        <br>
                        <strong>Skills</strong>
                        ${this.formatSkills(creature.proficiencies)}
                        <br>
                        <strong>Proficiency Bonus</strong>
                        ${this.calculateProficiencyBonue(creature.cr)}
                        <br>
                    </p>
                    <hr>
                    ${abilities.length ? html`
                        <p class="block w-full p-0.5 font-sm font-neutral-900">
                            ${abilities.map((ability, index) => {
                                return html`
                                    <strong class="block mt-0.5">${ability.name} ${ability.usage ? `(${ability.usage})` : null}</strong>
                                    ${ability.desc}
                                    ${index !== abilities.length - 1 ? html`<br>` : null}
                                `;
                            })}
                        </p>
                    ` : null}
                    ${actions.length ? html`
                        <h4 class="py-0.5 block font-red font-md border-b-1 border-b-solid border-b-red mx-auto" style="width:calc(100% - 1rem);">Actions</h4>
                        <p class="block w-full p-0.5 font-sm font-neutral-900">
                            ${actions.map((action, index) => {
                                return html`
                                    <strong class="block mt-0.5">${action.name} ${action.usage ? `(${action.usage})` : null}</strong>
                                    ${action.desc}
                                    ${index !== actions.length - 1 ? html`<br>` : null}
                                `;
                            })}
                        </p>
                    ` : null}
                    ${legnedaryActions.length ? html`
                        <h4 class="py-0.5 block font-red font-md border-b-1 border-b-solid border-b-red mx-auto" style="width:calc(100% - 1rem);">Legendary Actions</h4>
                        <p class="block w-full p-0.5 font-sm font-neutral-900">
                            ${legnedaryActions.map((action, index) => {
                                return html`
                                    <strong class="block mt-0.5">${action.name} ${action.usage ? `(${action.usage})` : null}</strong>
                                    ${action.desc}
                                    ${index !== actions.length - 1 ? html`<br>` : null}
                                `;
                            })}
                        </p>
                    ` : null}
                </div>
            </div>
        `, el);
        const game = document.body.querySelector(".game") || document.body;
        game.appendChild(el);
    }

    render(){
        let view = null;
        switch(this.state.view){
            default:
                view = html`
                    <div class="w-full block text-center py-2">
                        <i style="width: 48px;height: 48px;display: flex;justify-content: center;align-items: center;" class="font-grey-600 mx-auto spinner">
                            <svg style="width: 36px;height:36px;" aria-hidden="true" focusable="false" data-prefix="fad" data-icon="spinner-third" class="svg-inline--fa fa-spinner-third fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="fa-group"><path class="fa-secondary" fill="currentColor" d="M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z" opacity="0.4"></path><path class="fa-primary" fill="currentColor" d="M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z"></path></g></svg>
                        </i>
                    </div>
                `;
                break;
            case "search":
                if (this.state.creatures.length){
                    view = html`
                        <table>
                            <tbody>
                                ${this.state.creatures.map((creature, index) => {
                                    return html`
                                        <tr>
                                            <td>
                                                <button @click=${this.viewCreature} class="creature-name" data-creature="${creature.index}" data-index="${index}">${creature.name}</button>
                                            </td>
                                            <td aria-label="View ${creature.name}" tooltip @click=${this.viewCreature}>
                                                <button class="bttn" data-creature="${creature.index}" data-index="${index}">
                                                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 288a64 64 0 0 0 0-128c-1 0-1.88.24-2.85.29a47.5 47.5 0 0 1-60.86 60.86c0 1-.29 1.88-.29 2.85a64 64 0 0 0 64 64zm284.52-46.6C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 96a128 128 0 1 1-128 128A128.14 128.14 0 0 1 288 96zm0 320c-107.36 0-205.46-61.31-256-160a294.78 294.78 0 0 1 129.78-129.33C140.91 153.69 128 187.17 128 224a160 160 0 0 0 320 0c0-36.83-12.91-70.31-33.78-97.33A294.78 294.78 0 0 1 544 256c-50.53 98.69-148.64 160-256 160z"></path></svg>
                                                </button>
                                            </td>
                                            <td aria-label="Edit ${creature.name}" tooltip>
                                                <button class="bttn" data-creature="${creature.index}" data-index="${index}">
                                                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M417.8 315.5l20-20c3.8-3.8 10.2-1.1 10.2 4.2V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h292.3c5.3 0 8 6.5 4.2 10.2l-20 20c-1.1 1.1-2.7 1.8-4.2 1.8H48c-8.8 0-16 7.2-16 16v352c0 8.8 7.2 16 16 16h352c8.8 0 16-7.2 16-16V319.7c0-1.6.6-3.1 1.8-4.2zm145.9-191.2L251.2 436.8l-99.9 11.1c-13.4 1.5-24.7-9.8-23.2-23.2l11.1-99.9L451.7 12.3c16.4-16.4 43-16.4 59.4 0l52.6 52.6c16.4 16.4 16.4 43 0 59.4zm-93.6 48.4L403.4 106 169.8 339.5l-8.3 75.1 75.1-8.3 233.5-233.6zm71-85.2l-52.6-52.6c-3.8-3.8-10.2-4-14.1 0L426 83.3l66.7 66.7 48.4-48.4c3.9-3.8 3.9-10.2 0-14.1z"></path></svg>
                                                </button>
                                            </td>
                                            <td aria-label="Delete ${creature.name}" tooltip>
                                                <button class="bttn" data-creature="${creature.index}" data-index="${index}" @click=${this.deleteCreature}>
                                                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M296 432h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8zm-160 0h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8zM440 64H336l-33.6-44.8A48 48 0 0 0 264 0h-80a48 48 0 0 0-38.4 19.2L112 64H8a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h24v368a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V96h24a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8zM171.2 38.4A16.1 16.1 0 0 1 184 32h80a16.1 16.1 0 0 1 12.8 6.4L296 64H152zM384 464a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V96h320zm-168-32h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8z"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                })}
                            </tbody>
                        </table>
                    `;
                } else {
                    view = html`
                        <p class="block w-full text-center font-grey-700 font-sm line-normal px-0.5 py-1">
                            No creatures matched your search.
                        </p>
                    `;
                }
                break;
        }
        // @ts-ignore
        render(view, this.container);
    };

    connectedCallback(){
        this.container = this.querySelector(".js-container");
        this.search = this.querySelector(".js-search");
        this.search.addEventListener("input", this.handleInput);
        this.render();
        this.update();
    }
}
customElements.define("monster-manual", MonsterManual);