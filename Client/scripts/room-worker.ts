class RoomWorker{
    private idb:IDBDatabase;

    constructor(){
        this.idb = null;
        self.onmessage = this.inbox.bind(this);
        this.send("ready");
    }

    private init(roomCode:string){
        const idbRequest: any = indexedDB.open(roomCode, 1);

        idbRequest.onupgradeneeded = (event) => {
            this.idb = event.target.result;

            const messageStore = this.idb.createObjectStore("messages", { autoIncrement: true });
            messageStore.createIndex("author", "author", { unique: false });
            messageStore.createIndex("msg", "msg", { unique: false });
            messageStore.createIndex("recipientUID", "recipientUID", { unique: false });
            messageStore.createIndex("authorUID", "authorUID", { unique: false });

            this.send("live");
        };
        idbRequest.onsuccess = (event) => {
            this.idb = event.target.result;
            this.send("live");
        };
    }

    private send(type:string, data:any = null, messageUid:string = null){
        // @ts-ignore
        self.postMessage({
            type: type,
            messageUid: messageUid,
            data: data
        });
    }

    private cleanup(rooms:object){
        for (const key in rooms){
            if (!rooms[key]){
                indexedDB.deleteDatabase(key);
            }
        }
    }

    private getMessages(){
        return new Promise((resolve) => {
            let messages = [];
            const messageStore = this.idb.transaction("messages", "readonly").objectStore("messages");
            const request = messageStore.getAll();
            request.onsuccess = () => {
                messages = request.result;
                resolve(messages);
            };
            request.onerror = () => {
                resolve(messages);
            };
        });
    }

    private addMessage(message){
        return new Promise((resolve) => {
            const messageStore = this.idb.transaction("messages", "readwrite").objectStore("messages");
            const request = messageStore.put(message);
            request.onsuccess = resolve;
            request.onerror = resolve;
        });
    }

    private inbox(e: MessageEvent) {
        const {type, data, messageUid} = e.data;
        switch (type) {
            case "init":
                this.init(data);
                break;
            case "cleanup":
                this.cleanup(data);
                break;
            case "get":
                this.getMessages().then(messages => {
                    this.send("get", messages);
                });
                break;
            case "add":
                this.addMessage(data);
                break;
            default:
                console.warn(`Uncaught DB Worker message type: ${type}`);
                break;
        }
    }
}
new RoomWorker();