type Creature = {
    index: string;
    name: string;
    size: string;
    type: string;
    subtype: string;
    alignment: string;
    ac: string;
    hp: string;
    hitDice: string;
    speed: string;
    str: string;
    dex: string;
    con: string;
    int: string;
    wis: string;
    cha: string;
    proficiencies: string;
    vulnerabilities: string;
    resistances: string;
    immunities: string;
    senses: string;
    languages: string;
    abilities: string;
    actions: string;
    legendaryActions: string;
    cr: string;
    xp: string;
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
                console.warn("Adding custom creatures hasn't been implemented yet");
                // const creature = JSON.parse(data.creature);
                // const newCreature: Creature = {
                //     name: creature.BaseName.trim().toLowerCase(),
                //     ac: creature.BaseAC,
                //     hp: creature.BaseHP,
                //     str: 0,
                //     int: 0,
                //     wis: 0,
                //     cha: 0,
                //     dex: 0,
                //     con: 0,
                //     actions: JSON.stringify([]),
                //     abilities: JSON.stringify([]),
                // };
                // PutCreaturesInLocalDB([newCreature]);
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
		const cached = await this.getCreaturesFromIDB();
		for (let k = 0; k < cached.length; k++) {
			let wasRemoved = true;
			for (let i = 0; i < creatures.length; i++) {
				if (creatures[i].index === cached[k].index) {
					wasRemoved = false;
					break;
				}
			}
			if (wasRemoved) {
				this.db.delete("creatures", cached[k].index);
			}
		}
		for (let i = 0; i < creatures.length; i++) {
			this.db.put("creatures", creatures[i]);
		}
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
                            legendaryActions: JSON.stringify(response["legendary_actions"]),
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