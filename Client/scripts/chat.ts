let messenger:Messenger;

type Message = {
    author: string;
    msg: string;
    recipientUID: string;
    authorUID: string;
};

type Player = {
    name: string;
    messageUID: string;
    unreadMessages: boolean;
    messages: Array<Message>;
};

type MessengerState = {
    players: Array<Player>;
    activePlayerUID: string;
    message: string;
    clientUID: string;
    allChat: {
        unreadAllChatMessages: boolean;
        messages: Array<Message>;
    }
};
class Messenger extends HTMLElement{
    private state: MessengerState;

    constructor(){
        super();
        this.state = {
            players: [],
            activePlayerUID: null,
            message: "",
            clientUID: null,
            allChat: {
                unreadAllChatMessages: false,
                messages: []
            }
        };
    }

    public addMessage(message:Message){
        const updatedState ={...this.state};
        if (message.recipientUID === null){
            updatedState.allChat.messages.push(message);
            if (updatedState.activePlayerUID !== null){
                updatedState.allChat.unreadAllChatMessages = true;
                PlaySound("message.wav");
            }
        } else {
            for (let i = 0; i < updatedState.players.length; i++){
                if (updatedState.players[i].messageUID === message.authorUID || updatedState.players[i].messageUID === message.recipientUID){
                    updatedState.players[i].messages.push(message);
                    if (this.state.activePlayerUID !== updatedState.players[i].messageUID){
                        updatedState.players[i].unreadMessages = true;
                        PlaySound("message.wav");
                    }
                    break;
                }
            }
        }
        this.setState(updatedState);
    }

    public getMessage(){
        const response = [this.state.activePlayerUID, this.state.message.trim()];
        this.setState({ message: "" });
        const textarea:HTMLTextAreaElement = this.querySelector(".js-messenger-input");
        textarea.value = "";
        textarea.innerHTML = "";
        textarea.style.height = `0px`;
        return response;
    }

    public setPlayers(players:Array<Player>, gmUID:string, playerUID:string){        
        if (!playerUID){
            return;
        } else if (!this.state.clientUID){
            this.setState({clientUID: playerUID});
        }
        const newPlayers = [...this.state.players];
        // Only add GM once
        if (newPlayers.length === 0 && gmUID !== playerUID){
            newPlayers.push({
                name: "Game Master",
                messageUID: gmUID,
                unreadMessages: false,
                messages: [],
            });
        }
        // Only add new players
        for (let i = 0; i < players.length; i++){
            let isNew = true;
            for (let j = 0; j < newPlayers.length; j++){
                if (newPlayers[j].messageUID === players[i].messageUID){
                    isNew = false;
                    break;
                }
            }
            if (isNew && players[i].messageUID !== playerUID){
                newPlayers.push({
                    name: players[i].name,
                    messageUID: players[i].messageUID,
                    unreadMessages: false,
                    messages: [],
                });
            }
        }
        this.setState({ players: newPlayers });
    }

    private setState(state:Partial<MessengerState>):void{
        this.state = Object.assign(this.state, state);
        this.render();
    }

    private setActivePlayerUID:EventListener = (e:Event) => {
        const updatedState = {...this.state};
        const target = e.target as HTMLElement;
        if (target.dataset?.uid){
            for (let i = 0; i < updatedState.players.length; i++){
                if (updatedState.players[i].messageUID === target.dataset.uid){
                    updatedState.activePlayerUID = updatedState.players[i].messageUID;
                    updatedState.players[i].unreadMessages = false;
                    break;
                }
            }
        } else {
            updatedState.activePlayerUID = null;
            updatedState.allChat.unreadAllChatMessages = false;
        }
        this.setState(updatedState);
    }

    private handleKeyup:EventListener = (e:KeyboardEvent) => {
        const target = e.target as HTMLTextAreaElement;
        if (e instanceof KeyboardEvent){
            target.style.height = `${target.scrollHeight}px`;
            this.setState({ message: target.value });
        }
    }

    private parseMessage(message:string){
        let parsedMessage = message;
        const links = parsedMessage.match(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*))/gm) ?? [];
        const imageTest = new RegExp(/\.gif$|\.png$|\.jpeg$|\.jpg$|\.webp$|\.svg$|\.avif$|\.apng$/);
        const youtubeTest = new RegExp(/https?:\/\/(www\.)?(youtube|youtu)\.(com|be)\//);
        const images:Array<string> = [];
        const youtubeVideos:Array<string> = [];
        for (let i = 0; i < links.length; i++){
            const href = `<a href="${links[i].trim()}" target="_blank" ref="noopener">${links[i]}</a>`;
            parsedMessage = parsedMessage.replace(links[i], href);
            if (imageTest.test(links[i].trim())){
                images.push(links[i]);
            }else if (youtubeTest.test(links[i])){
                const videoID = links[i].replace(/https?:\/\/(www\.)?(youtube|youtu)\.(com|be)\/|(watch)|(\?v\=)|(&.*)/g, "");
                youtubeVideos.push(videoID);
            }
        }
        let onlyLinks = false;
        if (links.length){
            let tempMessage = message;
            for (let i = 0; i < links.length; i++){
                tempMessage = tempMessage.replace(links[i], "");
            }
            tempMessage = tempMessage.trim();
            if (!tempMessage.length){
                onlyLinks = true;
            }
        }
        return html`
            ${!onlyLinks ? html`<span class="msg" .innerHTML=${parsedMessage}></span>` : null}
            ${images.map(image => {
                return html`
                    <a class="img" href="${image}" target="_blank" ref="noopener">
                        <img src="${image}">
                    </a>
                `;
            })}
            ${youtubeVideos.map(video => {
                return html`<iframe width="386" height="183" src="https://www.youtube-nocookie.com/embed/${video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            })}
        `;
    }

    private renderPlayerChat(){
        let player:Player;
        for (let i = 0; i < this.state.players.length; i++){
            if (this.state.players[i].messageUID === this.state.activePlayerUID){
                player = this.state.players[i];
                break;
            }
        }
        let view;
        if (player){
            view = html`
                <ul class="js-messenger-chat">
                    <li class="font-xs font-grey-700 text-center py-0.5">Beginning of message history with ${player.name}.</li>
                    ${player.messages.map(message => {
                        return html`
                            <li class="${message.authorUID === this.state.clientUID ? "outgoing" : "incoming"}">
                                <div class="msg-container">
                                    ${this.parseMessage(message.msg)}
                                </div>
                                <span class="author">${message.author}</span>
                            </li>
                        `;
                    })}
                </ul>
                <textarea class="js-messenger-input" placeholder="Send ${player.name} a message..." @keyup=${this.handleKeyup}></textarea>
            `;
        } else {
            view = html`
                <ul class="js-messenger-chat">
                    <li class="font-xs font-grey-700 text-center py-0.5">Beginning of all chat message history.</li>
                    ${this.state.allChat.messages.map(message => {
                        return html`
                            <li class="${message.authorUID === this.state.clientUID ? "outgoing" : "incoming"}">
                                <div class="msg-container">
                                    ${this.parseMessage(message.msg)}
                                </div>
                                <span class="author">${message.author}</span>
                            </li>
                        `;
                    })}
                </ul>
                <textarea class="js-messenger-input" placeholder="Send everyone a message..." @keyup=${this.handleKeyup}></textarea>
            `;
        }
        return view;
    }

    private render(){
        const view = html`
            <div class="p-0.5">
                <button title="all chat" class="chat-toggle-button ${this.state.activePlayerUID === null ? "is-active" : ""}" @click=${this.setActivePlayerUID}>
                    All Chat
                    ${this.state.allChat.unreadAllChatMessages ? html`<i class="badge"></i>` : null}
                </button>
                ${this.state.players.map(player => {
                    return html`
                        <button data-uid="${player.messageUID}" title="${player.name}" class="chat-toggle-button ${this.state.activePlayerUID === player.messageUID ? "is-active" : ""}" @click=${this.setActivePlayerUID}>
                            ${player.name}
                            ${player.unreadMessages ? html`<i class="badge"></i>` : null}
                        </button>
                    `
                })}
            </div>
            <div class="p-0.5">
                ${this.renderPlayerChat()}
            </div>
        `;
        // @ts-ignore
        render(view, this);
        const chat:HTMLElement = this.querySelector(".js-messenger-chat");
        if (chat){
            chat.scrollTo({
                top: chat.scrollHeight,
                left: 0,
                behavior: "auto",
            });
        }
    }

    connectedCallback(){
        messenger = this;
        this.render();
    }
}
customElements.define("messenger-component", Messenger);

function GetChatMessage(){
    let output = [null, null];
    if (messenger){
        output = messenger.getMessage();
    }
    return output;
}
function ScrollChatMessages(){
    const container:HTMLElement = document.body.querySelector(".js-chat-messages");
    if (container){
        container.scrollTo({
            top: container.scrollHeight,
            left: 0,
            behavior: "auto",
        });
    }
}
function SetPlayers(players:Array<Player>, gmUID:string, playerUID:string){
    if (messenger){
        messenger.setPlayers(players, gmUID, playerUID);
    }
}
function RenderMessage(message:Message){
    if (messenger){
        messenger.addMessage(message);
    }
}