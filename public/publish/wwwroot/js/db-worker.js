async function GetMonstersFromAPI() {
    const request = await fetch("https://www.dnd5eapi.co/api/monsters", {
        method: "GET",
        headers: new Headers({
            Accept: "application/json",
        }),
    });
    let creatures = [];
    if (request.ok) {
        const response = await request.json();
        creatures = (response === null || response === void 0 ? void 0 : response.results) || [];
    }
    return creatures;
}
function GetMonsterDataFromAPI(creatures) {
    return new Promise((resolve) => {
        const creatureData = [];
        let resolved = 0;
        for (let i = 0; i < creatures.length; i++) {
            fetch(`https://www.dnd5eapi.co/${creatures[i].url.replace(/^(\/)/, "")}`)
                .then((request) => request.json())
                .then((response) => {
                const actions = [];
                const abilities = [];
                for (let i = 0; i < response.actions.length; i++) {
                    actions.push({
                        Name: response.actions[i].name,
                        Description: response.actions[i].desc,
                    });
                }
                for (let i = 0; i < response.special_abilities.length; i++) {
                    abilities.push({
                        Name: response.special_abilities[i].name,
                        Description: response.special_abilities[i].desc,
                    });
                }
                const creature = {
                    name: response.name.toLowerCase(),
                    ac: response.armor_class,
                    hp: response.hit_points,
                    str: response.strength,
                    int: response.intelligence,
                    wis: response.wisdom,
                    cha: response.charisma,
                    dex: response.dexterity,
                    con: response.constitution,
                    actions: JSON.stringify(actions),
                    abilities: JSON.stringify(abilities),
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
function PutCreaturesInLocalDB(creatures) {
    return new Promise((resolve) => {
        let stored = 0;
        const creatureStore = idb.transaction("creatures", "readwrite").objectStore("creatures");
        for (let i = 0; i < creatures.length; i++) {
            const request = creatureStore.put(creatures[i]);
            request.onsuccess = () => {
                stored++;
                if (stored === creatures.length) {
                    resolve();
                }
            };
            request.onerror = (e) => {
                stored++;
                if (stored === creatures.length) {
                    resolve();
                }
            };
        }
    });
}
async function SyncMonstersWithAPI() {
    let creatures = await GetMonstersFromAPI();
    creatures = await GetMonsterDataFromAPI(creatures);
    await PutCreaturesInLocalDB(creatures);
}
function LookupCreatureInDB(query) {
    return new Promise((resolve) => {
        let creature = {};
        const creatureStore = idb.transaction("creatures", "readonly").objectStore("creatures");
        const request = creatureStore.get(query);
        request.onsuccess = () => {
            creature = request.result;
            resolve(creature);
        };
        request.onerror = () => {
            resolve(creature);
        };
    });
}
function GetAllCreatures() {
    return new Promise((resolve) => {
        const creatures = [];
        const creatureStore = idb.transaction("creatures", "readonly").objectStore("creatures");
        const request = creatureStore.getAll();
        request.onsuccess = () => {
            const results = request.result;
            for (let i = 0; i < results.length; i++) {
                creatures.push(results[i].name);
            }
            resolve(creatures);
        };
        request.onerror = () => {
            resolve(creatures);
        };
    });
}
const idbRequest = indexedDB.open("monsters", 1);
let idb = null;
idbRequest.onupgradeneeded = (event) => {
    idb = event.target.result;
    var objectStore = idb.createObjectStore("creatures", { keyPath: "name" });
    objectStore.createIndex("name", "name", { unique: true });
    objectStore.createIndex("hp", "hp", { unique: false });
    objectStore.createIndex("ac", "ac", { unique: false });
    objectStore.createIndex("str", "str", { unique: false });
    objectStore.createIndex("int", "int", { unique: false });
    objectStore.createIndex("wis", "wis", { unique: false });
    objectStore.createIndex("cha", "cha", { unique: false });
    objectStore.createIndex("dex", "dex", { unique: false });
    objectStore.createIndex("con", "con", { unique: false });
    objectStore.createIndex("actions", "actions", { unique: false });
    objectStore.createIndex("abilities", "abilities", { unique: false });
    objectStore.transaction.oncomplete = SyncMonstersWithAPI;
};
idbRequest.onsuccess = (event) => {
    idb = event.target.result;
};
self.onmessage = (e) => {
    const data = e.data;
    switch (data.type) {
        case "lookup":
            LookupCreatureInDB(data.query).then((creatureData) => {
                const creature = {
                    BaseHP: creatureData.hp,
                    BaseAC: creatureData.ac,
                    BaseName: creatureData.name,
                    HP: creatureData.hp,
                    AC: creatureData.ac,
                    Strength: creatureData.str,
                    Dexterity: creatureData.dex,
                    Intelligence: creatureData.int,
                    Constitution: creatureData.con,
                    Wisdom: creatureData.wis,
                    Charisma: creatureData.cha,
                    ActionsString: creatureData.actions,
                    AbilitiesString: creatureData.abilities,
                };
                // @ts-ignore
                self.postMessage({
                    creature: creature,
                    messageUid: data.messageUid,
                });
            });
            break;
        case "add":
            const creature = JSON.parse(data.creature);
            const newCreature = {
                name: creature.BaseName.trim().toLowerCase(),
                ac: creature.BaseAC,
                hp: creature.BaseHP,
                str: null,
                int: null,
                wis: null,
                cha: null,
                dex: null,
                con: null,
                actions: null,
                abilities: null,
            };
            PutCreaturesInLocalDB([newCreature]);
            break;
        case "get":
            GetAllCreatures().then((creatures) => {
                // @ts-ignore
                self.postMessage({
                    creatures: creatures,
                    messageUid: data.messageUid,
                });
            });
            break;
        default:
            console.warn(`Uncaught DB Worker message type: ${data.type}`);
            break;
    }
};
