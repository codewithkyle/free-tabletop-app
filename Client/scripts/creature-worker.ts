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
    proficiencies: string;
    vulnerabilities: string;
    resistances: string;
    immunities: string;
    senses: string;
    languages: string;
    abilities: string;
    actions: string;
    legendaryActions: string;
    cr: number;
    xp: number;
};

// @ts-ignore
self.importScripts("idb.js");
// @ts-ignore
self.importScripts("fuzzy-search.js");

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
            case "monster-manual-search":
                this.monsterManualSearch(data.query).then((creatures) => {
                    // @ts-ignore
                    self.postMessage({
                        data: creatures,
                        messageId: data.messageId,
                    });
                });
                break;
            case "lookup":
                this.lookupCreatureStats(data.name).then((creatureData: Creature) => {
                    const creature = {
                        BaseHP: creatureData.hp,
                        BaseAC: creatureData.ac,
                        BaseName: creatureData.name,
                        HP: creatureData.hp,
                        AC: creatureData.ac,
                    };
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
            case "get":
                const creatures = await this.getAllCreatureNames();
                // @ts-ignore
                self.postMessage({
                    data: creatures,
                    messageId: data.messageId,
                });
                break;
            case "search":
                this.searchCreaturesByName(data.query).then((creatures) => {
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

    private monsterManualSearch(query:string){
        return new Promise(async (resolve) => {
            let creatures = [];
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

    private addCreature(creature){
        this.db.put("creatures", {
            index: this.toKebabCase(creature.baseName),
            name: creature.baseName,
            size: null,
            type: null,
            subtype: null,
            alignment: null,
            ac: creature.baseAC,
            hp: creature.baseHP,
            hitDice: null,
            speed: null,
            str: null,
            dex: null,
            con: null,
            int: null,
            wis: null,
            cha: null,
            proficiencies: null,
            vulnerabilities: null,
            resistances: null,
            immunities: null,
            senses: null,
            languages: null,
            abilities: null,
            actions: null,
            legendaryActions: null,
            cr: null,
            xp: null,
        });
    }

    private toKebabCase(str:string){
        return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');
    }

    private lookupCreatureStats(name:string){
        return new Promise(async (resolve) => {
            const creature = this.db.getFromIndex("creatures", "name", name);
            resolve(creature);
        });
    }

    private searchCreaturesByName(query:string){
        return new Promise(async (resolve) => {
            const creatures = [];
            const creatureNames = await this.getAllCreatureNames();
            const results = fuzzysort.go(query, creatureNames, {
                threshold: -10000,
                limit: Infinity,
                allowTypo: false,
            });
            for (let i = 0; i < results.length; i++) {
                creatures.push(results[i].target);
            }
            resolve(creatures);
        });
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
                store.createIndex("proficiencies", "proficiencies");
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
			this.db.put("creatures", creatures[i]);
        }
        // @ts-ignore
        self.postMessage({type: "ready"});
    }

    private async getAllCreatureNames(): Promise<Array<string>>{
        const results = await this.db.getAllFromIndex("creatures", "name");
        const creatures = [];
        for (let i = 0; i < results.length; i++){
            creatures.push(results[i].name);
        }
        return creatures;
    }

    private async getCreaturesFromIDB(): Promise<Array<Creature>> {
		const creatures: Array<Creature> = await this.db.getAllFromIndex("creatures", "index");
		return creatures;
	}
    
    private async fetchCreatures(): Promise<Array<Creature>>{
        const request = await fetch("https://www.dnd5eapi.co/api/monsters", {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        let creatures:Array<Creature> = [];
        if (request.ok) {
            const response = await request.json();
            if (response?.results?.length){
                creatures = await this.fetchCreatureData(response.results);
            }
        }
        return creatures;
    }

    private fetchCreatureData(creatures: Array<{ name: string; url: string }>): Promise<Array<Creature>> {
        return new Promise((resolve) => {
            const creatureData: Array<Creature> = [];
            let resolved = 0;
            for (let i = 0; i < creatures.length; i++) {
                fetch(`https://www.dnd5eapi.co/${creatures[i].url.replace(/^(\/)/, "")}`)
                    .then((request) => request.json())
                    .then((response) => {

                        const immunities = [];
                        response["damage_immunities"].map(value => {
                            immunities.push(value);
                        });
                        response["condition_immunities"].map(value => {
                            immunities.push(value);
                        });

                        const creature:Creature = {
                            index: response.index,
                            name: response.name,
                            size: response.size,
                            type: response.type,
                            subtype: response.subtype,
                            alignment: response.alignment,
                            ac: response["armor_class"],
                            hp: response["hit_points"],
                            hitDice: response["hit_dice"],
                            speed: JSON.stringify(response["speed"]),
                            str: response.strength,
                            dex: response.dexterity,
                            con: response.constitution,
                            int: response.intelligence,
                            wis: response.wisdom,
                            cha: response.charisma,
                            proficiencies: JSON.stringify(response["proficiencies"]),
                            vulnerabilities: JSON.stringify(response["damage_vulnerabilities"]),
                            resistances: JSON.stringify(response["damage_resistances"]),
                            immunities: JSON.stringify(immunities),
                            senses: JSON.stringify(response.senses),
                            languages: response.languages,
                            abilities: JSON.stringify(response["special_abilities"]),
                            actions: JSON.stringify(response.actions),
                            legendaryActions: JSON.stringify(response?.["legendary_actions"] ?? []),
                            cr: response["challenge_rating"],
                            xp: response.xp,
                        };
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
            }
        });
    }
}
new CreatureManager();