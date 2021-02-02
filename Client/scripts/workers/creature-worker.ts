type Creature = {
    index: string;
    name: string;
    size: string;
    type: string;
    subtype: string;
    alignment: string;
    ac: number;
    hp: number;
    hitDice: string;
    speed: string;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    savingThrows: string;
    skills: string;
    vulnerabilities: string;
    resistances: string;
    immunities: string;
    senses: string;
    languages: string;
    abilities: Array<{
        name: string;
        desc: string;
    }>;
    actions: Array<{
        name: string;
        desc: string;
    }>;
    legendaryActions: Array<{
        name: string;
        desc: string;
    }>;
    cr: number;
    xp: number;
};

type Usage = {
    times?:string;
    dice?:string;
    type?:string;
    min_value?:string
};

// @ts-ignore
self.importScripts("/js/lib/idb.js");
// @ts-ignore
self.importScripts("/js/lib/fuzzy-search.js");

declare const fuzzysort:any;

class CreatureManager{
    private db: any;

    constructor(){
        self.onmessage = this.inbox.bind(this);
        this.db = null;
        this.main();
    }

    private async inbox(e:MessageEvent){
        const data = e.data;
        switch (data.type) {
            case "delete":
                await this.db.delete("creatures", data.index);
                break;
            case "lookup":
                this.lookupCreature(data.name).then((creature: Creature) => {
                    // @ts-ignore
                    self.postMessage({
                        data: creature,
                        messageId: data.messageId,
                    });
                });
                break;
            case "add":
                this.addCreature(data.creature);
                break;
            case "search":
                this.searchByName(data.query).then((creatures) => {
                    // @ts-ignore
                    self.postMessage({
                        data: creatures,
                        messageId: data.messageId,
                    });
                });
                break;
            default:
                console.warn(`Uncaught DB Worker message type: ${data.type}`);
                break;
        }
    }

    private searchByName(query:string): Promise<Array<Creature>>{
        return new Promise(async (resolve) => {
            let creatures:Array<Creature> = [];
            const creatureData = await this.getCreaturesFromIDB();
            if (query){
                const results = fuzzysort.go(query, creatureData, {
                    threshold: -10000,
                    limit: Infinity,
                    allowTypo: false,
                    key: "name",
                });
                for (let i = 0; i < results.length; i++) {
                    creatures.push(results[i].obj);
                }
            } else {
                creatures = creatureData;
            }
            resolve(creatures);
        });
    }

    private addCreature(creature:Creature){
        this.db.put("creatures", {
            index: creature?.index?.toLowerCase() ?? this.toKebabCase(creature.name).toLowerCase(),
            name: creature.name,
            ac: creature.ac,
            hp: creature.hp,
            size: creature?.size ?? "Medium",
            type: creature?.type?.toLowerCase() ?? null,
            subtype: creature?.subtype?.toLowerCase() ?? null,
            alignment: creature?.alignment?.toLowerCase() ?? "unaligned",
            hitDice: creature?.hitDice ?? null,
            speed: creature?.speed ?? "—",
            str: creature?.str ?? 10,
            dex: creature?.dex ?? 10,
            con: creature?.con ?? 10,
            int: creature?.int ?? 10,
            wis: creature?.wis ?? 10,
            cha: creature?.cha ?? 10,
            vulnerabilities: creature?.vulnerabilities ?? "—",
            resistances: creature?.resistances ?? "—",
            immunities: creature?.immunities ?? "—",
            senses: creature?.senses ?? "—",
            savingThrows: creature?.savingThrows ?? "—",
            skills: creature?.skills ?? "—",
            languages: creature?.languages ?? "—",
            abilities: creature?.abilities ?? [],
            actions: creature?.actions ?? [],
            legendaryActions: creature?.legendaryActions ?? [],
            cr: creature?.cr ?? 0,
            xp: creature?.xp ?? 0,
        });
    }

    private toKebabCase(str:string){
        return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');
    }

    private async lookupCreature(name:string): Promise<Creature>{
        return await this.db.getFromIndex("creatures", "name", name);
    }

    private async main() {
		// @ts-ignore
		this.db = await idb.openDB("entities", 1, {
			upgrade(db) {
				const store = db.createObjectStore("creatures", {
					keyPath: "index",
				});
				store.createIndex("index", "index");
                store.createIndex("name", "name");
                store.createIndex("size", "size");
                store.createIndex("type", "type");
                store.createIndex("subtype", "subtype");
                store.createIndex("alignment", "alignment");
                store.createIndex("ac", "ac");
                store.createIndex("hp", "hp");
                store.createIndex("hitDice", "hitDice");
                store.createIndex("speed", "speed");
                store.createIndex("str", "str");
                store.createIndex("dex", "dex");
                store.createIndex("con", "con");
                store.createIndex("int", "int");
                store.createIndex("wis", "wis");
                store.createIndex("cha", "cha");
                store.createIndex("savingThrows", "savingThrows");
                store.createIndex("skills", "skills");
                store.createIndex("vulnerabilities", "vulnerabilities");
                store.createIndex("resistances", "resistances");
                store.createIndex("immunities", "immunities");
                store.createIndex("senses", "senses");
                store.createIndex("languages", "languages");
                store.createIndex("abilities", "abilities");
                store.createIndex("actions", "actions");
                store.createIndex("legendaryActions", "legendaryActions");
                store.createIndex("cr", "cr");
                store.createIndex("xp", "xp");
			},
		});
		const creatures = await this.fetchCreatures();
		for (let i = 0; i < creatures.length; i++) {
            this.addCreature(creatures[i]);
        }
        // @ts-ignore
        self.postMessage({type: "ready"});
    }

    private async getCreaturesFromIDB(): Promise<Array<Creature>> {
		const creatures: Array<Creature> = await this.db.getAllFromIndex("creatures", "index");
		return creatures;
	}
    
    private async fetchCreatures(): Promise<Array<any>>{
        const request = await fetch("https://www.dnd5eapi.co/api/monsters", {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        let creatures = [];
        if (request.ok) {
            const response = await request.json();
            if (response?.results?.length){
                creatures = await this.fetchCreatureData(response.results);
            }
        }
        return creatures;
    }

    private fetchCreatureData(creatures: Array<{ name: string; url: string, index:string }>): Promise<Array<Creature>> {
        return new Promise((resolve) => {
            const creatureData: Array<Creature> = [];
            let resolved = 0;
            for (let i = 0; i < creatures.length; i++) {
                this.db.get("creatures", creatures[i].index).then(result => {
                    if (!result){
                        fetch(`https://www.dnd5eapi.co/${creatures[i].url.replace(/^(\/)/, "")}`)
                            .then((request) => request.json())
                            .then((response) => {
                                const creature = this.formatCreatureData(response);
                                creatureData.push(creature);
                                resolved++;
                            })
                            .catch(() => {
                                resolved++;
                            })
                            .finally(() => {
                                if (resolved === creatures.length) {
                                    resolve(creatureData);
                                }
                            });
                    } else {
                        resolved++;
                        if (resolved === creatures.length) {
                            resolve(creatureData);
                        }
                    }
                });
                
            }
        });
    }

    private formatMixed(data:Array<any>): string{
        let value = "";
        for (let i = 0; i < data.length; i++){
            if (typeof data[i] === "object"){
                value += `${data[i].name}, `;
            } else {
                value += `${data[i]}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatObject(data): string{
        let value = "";
        for (const key in data){
            value += `${key} ${data[key]}, `;
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatSavingThrows(data): string{
        let value = "";
        const regex = new RegExp("Saving Throw:");
        for (let i = 0; i < data.length; i++){
            if (regex.test(data[i].proficiency.name)){
                value += `${data[i].proficiency.name.replace("Saving Throw:", "").trim()} ${data[i].value >= 0 ? "+" : "-"}${data[i].value}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatSkills(data): string{
        let value = "";
        const regex = new RegExp("Skill:");
        for (let i = 0; i < data.length; i++){
            if (regex.test(data[i].proficiency.name)){
                value += `${data[i].proficiency.name.replace("Skill:", "").trim()} ${data[i].value >= 0 ? "+" : "-"}${data[i].value}, `;
            }
        }
        value = value.trim().replace(/\,$/, "").replace(/\_/g, " ");
        if (!value){
            value = "—";
        }
        return value;
    }

    private formatUsage(usage:Usage): string{
        let output = "";
        if (usage?.times){
            output = `${usage?.times} ${usage?.type}`;
        } else if (usage?.dice){
            output = `${usage?.type} ${usage?.dice} ${usage?.["min_value"] ? `min ${usage?.["min_value"]}` : null}`;
        }
        output = output.trim();
        return `(${output})`;
    }

    private formatTableData(data:Array<any>):Array<any>{
        const output = [];
        for (let i = 0; i < data.length; i++){
            let usage = "";
            if (data[i]?.usage){
                usage = this.formatUsage(data[i].usage);
            }
            output.push({
                name: `${data[i].name} ${usage}`.trim(),
                desc: data[i].desc,
            });
        }
        return output;
    }

    private formatSpeed(speedObject):string {
        let speed = "";
        for (const key in speedObject){
            if (key !== "hover"){
                speed += `${speedObject[key]} ${key}, `;
            }
        }
        speed = speed.trim().replace(/\,$/, "").replace(/\_/g, " ");
        return speed;
    }

    private formatCreatureData(response): Creature{
        const immunities = [];
        response["damage_immunities"].map(value => {
            immunities.push(value);
        });
        response["condition_immunities"].map(value => {
            immunities.push(value);
        });

        const legendaryActions = response?.["legendary_actions"] ?? [];

        return {
            index: response.index,
            name: response.name,
            size: response.size,
            type: response.type,
            subtype: response.subtype,
            alignment: response.alignment,
            ac: response["armor_class"],
            hp: response["hit_points"],
            hitDice: response["hit_dice"],
            str: response.strength,
            dex: response.dexterity,
            con: response.constitution,
            int: response.intelligence,
            wis: response.wisdom,
            cha: response.charisma,
            languages: response.languages,
            cr: response["challenge_rating"],
            xp: response.xp,
            speed: this.formatSpeed(response["speed"]),
            vulnerabilities: this.formatMixed(response["damage_vulnerabilities"]),
            resistances: this.formatMixed(response["damage_resistances"]),
            immunities: this.formatMixed(immunities),
            senses: this.formatObject(response.senses),
            savingThrows: this.formatSavingThrows(response["proficiencies"]),
            skills: this.formatSkills(response["proficiencies"]),
            abilities: this.formatTableData(response["special_abilities"]),
            actions: this.formatTableData(response.actions),
            legendaryActions: this.formatTableData(legendaryActions),
        };
    }
}
new CreatureManager();