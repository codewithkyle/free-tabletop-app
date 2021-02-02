type MonsterManualState = {
    creatures: Array<Creature>;
    view: "loading" | "search" | "editing",
    activeCreatureIndex: number;
};

class MonsterManual extends Component<MonsterManualState>{
    private container:HTMLElement;
    private search:HTMLInputElement;
    private newCreatureButton:HTMLButtonElement;

    constructor(){
        super();
        this.state = {
            creatures: [],
            view: "loading",
            activeCreatureIndex: null,
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
        this.spawnCreatureModal(creature);
    }

    private editCreature:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.dataset.index);
        this.setState({
            view: "editing",
            activeCreatureIndex: index,
        });
    }

    private saveCreature:EventListener = (e:Event) => {
        const creature:Partial<Creature> = this.state.activeCreatureIndex ? this.state.creatures[this.state.activeCreatureIndex] : {};
        const form = e.currentTarget as HTMLFormElement;
        const updatedState = {...this.state};
        if (this.state.activeCreatureIndex){
            this.state.creatures[this.state.activeCreatureIndex] = creature as Creature;
        }
        updatedState.view = "search";
        updatedState.activeCreatureIndex = null;
        this.setState(updatedState);
    }

    private handleNewCreatureButtonClick:EventListener = () => {
        this.setState({
            activeCreatureIndex: null,
            view: "editing",
        });
    }

    private backToSearch:EventListener = () => {
        this.setState({
            activeCreatureIndex: null,
            view: "search",
        });
    }

    private calculateModifier(value:number): string{
        const modifier = Math.floor((value - 10) / 2);
        if (modifier >= 0){
            return `+${modifier}`;
        } else {
            return `${modifier}`;
        }
    }

    private calculateProficiencyBonus(cr:number): string{
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

    private spawnCreatureModal(creature:Creature){
        const el = document.createElement("moveable-modal");
        el.className = "stat-block";
        el.style.zIndex = "1001";

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
                        <p style="font-style:italic;" class="block font-neutral-900 font-xs">${creature.size}${creature.type}${creature.subtype ? ` ${creature.subtype}` : null}, ${creature.alignment}</p>
                    </div>
                    <hr>
                    <p class="block w-full p-0.5 font-red font-sm">
                        <strong>Armor Class</strong>
                        ${creature.ac}
                        <br>
                        <strong>Hit Points</strong>
                        ${creature.hp} ${creature.hitDice ? `(${creature.hitDice})` : null}
                        <br>
                        <strong>Speed</strong>
                        ${creature.speed}
                        <br>
                        <strong>Challenge</strong>
                        ${creature.cr} (${creature.xp} XP)
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
                        ${creature.immunities}
                        <br>
                        <strong>Resistances</strong>
                        ${creature.resistances}
                        <br>
                        <strong>Vulnerabilities</strong>
                        ${creature.vulnerabilities}
                        <br>
                        <strong>Senses</strong>
                        ${creature.senses}
                        <br>
                        <strong>Languages</strong>
                        ${creature.languages.length ? creature.languages : "—"}
                        <br>
                        <strong>Saving Throws</strong>
                        ${creature.savingThrows}
                        <br>
                        <strong>Skills</strong>
                        ${creature.skills}
                        <br>
                        <strong>Proficiency Bonus</strong>
                        ${this.calculateProficiencyBonus(creature.cr)}
                        <br>
                    </p>
                    <hr>
                    ${creature.abilities.length ? html`
                        <dl class="block w-full p-0.5 font-sm font-neutral-900">
                            ${creature.abilities.map((ability) => {
                                return html`
                                    <dt class="block mt-0.5 font-bold block">${ability.name}</dt>
                                    <dd>${ability.desc}</dd>
                                `;
                            })}
                        </dl>
                    ` : null}
                    ${creature.actions.length ? html`
                        <h4 class="py-0.5 block font-red font-md border-b-1 border-b-solid border-b-red mx-auto" style="width:calc(100% - 1rem);">Actions</h4>
                        <dl class="block w-full p-0.5 font-sm font-neutral-900">
                            ${creature.actions.map((action) => {
                                return html`
                                    <dt class="block mt-0.5 font-bold block">${action.name}</dt>
                                    <dd>${action.desc}</dd>
                                `;
                            })}
                        </dl>
                    ` : null}
                    ${creature.legendaryActions.length ? html`
                        <h4 class="py-0.5 block font-red font-md border-b-1 border-b-solid border-b-red mx-auto" style="width:calc(100% - 1rem);">Legendary Actions</h4>
                        <dl class="block w-full p-0.5 font-sm font-neutral-900">
                            ${creature.legendaryActions.map((action) => {
                                return html`
                                    <dt class="block mt-0.5 font-bold block">${action.name}</dt>
                                    <dd>${action.desc}</dd>
                                `;
                            })}
                        </dl>
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
            case "search":
                this.setAttribute("state", "searching");
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
                                            <td aria-label="View ${creature.name}" tooltip>
                                                <button class="bttn" data-creature="${creature.index}" data-index="${index}" @click=${this.viewCreature}>
                                                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 288a64 64 0 0 0 0-128c-1 0-1.88.24-2.85.29a47.5 47.5 0 0 1-60.86 60.86c0 1-.29 1.88-.29 2.85a64 64 0 0 0 64 64zm284.52-46.6C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 96a128 128 0 1 1-128 128A128.14 128.14 0 0 1 288 96zm0 320c-107.36 0-205.46-61.31-256-160a294.78 294.78 0 0 1 129.78-129.33C140.91 153.69 128 187.17 128 224a160 160 0 0 0 320 0c0-36.83-12.91-70.31-33.78-97.33A294.78 294.78 0 0 1 544 256c-50.53 98.69-148.64 160-256 160z"></path></svg>
                                                </button>
                                            </td>
                                            <td aria-label="Edit ${creature.name}" tooltip data-index="${index}" @click=${this.editCreature}>
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
            case "editing":
                this.setAttribute("state", "editing");
                const creature = this.state.creatures?.[this.state.activeCreatureIndex] ?? null;
                view = html`
                    <form @submit=${this.saveCreature} class="w-full p-0.5" grid="columns 1 gap-0.5">
                        <input type="hidden" name="index" value="${creature?.index ?? null}">
                        <div class="w-full header" flex="row nowrap items-center">
                            <button role="button" @click=${this.backToSearch} aria-label="Back" tooltip class="button -icon-only -text -grey -round mr-0.5">
                                <i>
                                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M231.536 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L60.113 273H436c6.627 0 12-5.373 12-12v-10c0-6.627-5.373-12-12-12H60.113L238.607 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L3.515 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"></path></svg>
                                </i>
                            </button>
                            <div class="input w-full" style="flex:1;">
                                <input type="text"  required .value=${creature?.name ?? null} .placeholder=${!creature?.name ? "Untitled Creature" : null}>
                            </div>
                        </div>
                        <div grid="columns 2 gap-0.5">
                            <div class="select">
                                <label for="size">Size</label>
                                <select name="size" id="size" required>
                                    <option .selected=${creature?.size === "Tiny"}>Tiny</option>
                                    <option .selected=${creature?.size === "Small"}>Small</option>
                                    <option .selected=${creature?.size === "Medium"}>Medium</option>
                                    <option .selected=${creature?.size === "Large"}>Large</option>
                                    <option .selected=${creature?.size === "Huge"}>Huge</option>
                                    <option .selected=${creature?.size === "Gargantuan"}>Gargantuan</option>
                                </select>
                            </div>
                            <div class="select">
                                <label for="alignment">Alignment</label>
                                <select name="alignment" id="alignment" required>
                                    <option value="unaligned">Unaligned</option>
                                    <option .selected=${creature?.alignment === "any alignment"}>Any Alignment</option>
                                    <option .selected=${creature?.alignment === "lawful good"}>Lawful good</option>
                                    <option .selected=${creature?.alignment === "neutral good"}>Neutral good</option>
                                    <option .selected=${creature?.alignment === "chaotic good"}>Chaotic good</option>
                                    <option .selected=${creature?.alignment === "lawful neutral"}>Lawful neutral</option>
                                    <option .selected=${creature?.alignment === "neutral"}>Neutral</option>
                                    <option .selected=${creature?.alignment === "chaotic neutral"}>Chaotic neutral</option>
                                    <option .selected=${creature?.alignment === "lawful evil"}>Lawful evil</option>
                                    <option .selected=${creature?.alignment === "neutral evil"}>Neutral evil</option>
                                    <option .selected=${creature?.alignment === "chaotic evil"}>Chaotic evil</option>
                                    <option .selected=${creature?.alignment === "any neutral alignment"}>Any neutral alignment</option>
                                    <option .selected=${creature?.alignment === "any evil alignment"}>Any evil alignment</option>
                                    <option .selected=${creature?.alignment === "any good alignment"}>Any good alignment</option>
                                    <option .selected=${creature?.alignment === "any chaotic alignment"}>Any chaotic alignment</option>
                                    <option .selected=${creature?.alignment === "any lawful alignment"}>Any lawful alignment</option>
                                    <option .selected=${creature?.alignment === "any non-good alignment"}>Any non-good alignment</option>
                                </select>
                            </div>
                            <div class="input">
                                <label for="type">Type</label>
                                <input name="type" id="type" list="types" required .value=${creature?.type ?? null}>
                                <datalist id="types">
                                    <option value="aberration"></option>
                                    <option value="beast"></option>
                                    <option value="celestial"></option>
                                    <option value="construct"></option>
                                    <option value="dragon"></option>
                                    <option value="elemental"></option>
                                    <option value="fey"></option>
                                    <option value="fiend"></option>
                                    <option value="giant"></option>
                                    <option value="humanoid"></option>
                                    <option value="monstrositie"></option>
                                    <option value="ooze"></option>
                                    <option value="plant"></option>
                                    <option value="undead"></option>
                                    <option value="swam of tiny beasts"></option>
                                </datalist>
                            </div>
                            <div class="input">
                                <label for="subtype">Subtype</label>
                                <input name="subtype" id="subtype" list="subtypes" .value=${creature?.subtype ?? null}>
                                <datalist id="subtypes">
                                    <option value="any race"></option>
                                    <option value="demon"></option>
                                    <option value="devil"></option>
                                    <option value="dwarf"></option>
                                    <option value="elf"></option>
                                    <option value="gnoll"></option>
                                    <option value="gnome"></option>
                                    <option value="goblinoid"></option>
                                    <option value="grimlock"></option>
                                    <option value="human"></option>
                                    <option value="kobold"></option>
                                    <option value="lizardfolk"></option>
                                    <option value="merfolk"></option>
                                    <option value="orc"></option>
                                    <option value="sahuagin"></option>
                                    <option value="shapechanger"></option>
                                    <option value="titan"></option>
                                    <option value="angel"></option>
                                    <option value="swarm"></option>
                                </datalist>
                            </div>
                            <div class="input">
                                <label for="ac">Armor Class</label>
                                <input type="number" id="ac" value="${creature?.ac ?? 0}" required>
                            </div>
                            <div class="input">
                                <label for="hp">Hit Points</label>
                                <input type="number" id="hp" value="${creature?.hp ?? 0}" required>
                            </div>
                        </div>
                        <div class="input">
                            <label for="hitDice">Hit Dice</label>
                            <input type="text" id="hitDice" .value="${creature?.hitDice ?? null}">
                        </div>
                        <div class="input">
                            <label for="speed">Speed</label>
                            <input type="text" id="speed" .value="${creature?.speed ?? null}" required>
                        </div>
                        <div grid="columns 2 gap-0.5">
                            <div class="input">
                                <label for="cr">Challenge Rating</label>
                                <input type="number" id="cr" min="0" step="0.125" value="${creature?.cr ?? 0}" required>
                            </div>
                            <div class="input">
                                <label for="xp">XP</label>
                                <input type="number" id="xp" min="0" step="1" value="${creature?.xp ?? 0}" required>
                            </div>
                        </div>
                        <div grid="columns 3 gap-0.5">
                            <div class="input">
                                <label for="str">Strength</label>
                                <input type="number" id="str" min="1" max="30" step="1" value="${creature?.str ?? 10}" required>
                            </div>
                            <div class="input">
                                <label for="dex">Dexterity</label>
                                <input type="number" id="dex" min="1" max="30" step="1" value="${creature?.dex ?? 10}" required>
                            </div>
                            <div class="input">
                                <label for="con">Constitution</label>
                                <input type="number" id="con" min="1" max="30" step="1" value="${creature?.con ?? 10}" required>
                            </div>
                            <div class="input">
                                <label for="int">Intelligence</label>
                                <input type="number" id="int" min="1" max="30" step="1" value="${creature?.int ?? 10}" required>
                            </div>
                            <div class="input">
                                <label for="wis">Wisdom</label>
                                <input type="number" id="wis" min="1" max="30" step="1" value="${creature?.wis ?? 10}" required>
                            </div>
                            <div class="input">
                                <label for="cha">Charisma</label>
                                <input type="number" id="cha" min="1" max="30" step="1" value="${creature?.cha ?? 10}" required>
                            </div>
                        </div>
                        <div class="input">
                            <label for="immunities">Immunities</label>
                            <input type="text" id="immunities" .value="${creature?.immunities?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="resistances">Resistances</label>
                            <input type="text" id="resistances" .value="${creature?.resistances?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="vulnerabilities">Vulnerabilities</label>
                            <input type="text" id="vulnerabilities" .value="${creature?.vulnerabilities?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="senses">Senses</label>
                            <input type="text" id="senses" .value="${creature?.senses?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="languages">Languages</label>
                            <input type="text" id="languages" .value="${creature?.languages?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="savingThrows">Saving Throws</label>
                            <input type="text" id="savingThrows" .value="${creature?.savingThrows?.replace("—", "") ?? null}">
                        </div>
                        <div class="input">
                            <label for="skills">Skills</label>
                            <input type="text" id="skills" .value="${creature?.skills?.replace("—", "") ?? null}">
                        </div>
                    </form>
                `;
                break;
            default:
                this.setAttribute("state", "searching");
                view = html`
                    <div class="w-full block text-center py-2">
                        <i style="width: 48px;height: 48px;display: flex;justify-content: center;align-items: center;" class="font-grey-600 mx-auto spinner">
                            <svg style="width: 36px;height:36px;" aria-hidden="true" focusable="false" data-prefix="fad" data-icon="spinner-third" class="svg-inline--fa fa-spinner-third fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="fa-group"><path class="fa-secondary" fill="currentColor" d="M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z" opacity="0.4"></path><path class="fa-primary" fill="currentColor" d="M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z"></path></g></svg>
                        </i>
                    </div>
                `;
                break;
        }
        // @ts-ignore
        render(view, this.container);
    };

    connectedCallback(){
        this.container = this.querySelector(".js-container");
        this.search = this.querySelector(".js-search");
        this.search.addEventListener("input", this.handleInput);
        this.newCreatureButton = this.querySelector(".js-add-creature");
        this.newCreatureButton.addEventListener("click", this.handleNewCreatureButtonClick);
        this.render();
        this.update();
    }
}
customElements.define("monster-manual", MonsterManual);