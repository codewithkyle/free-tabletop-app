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
};
class Messenger extends HTMLElement{
    private state: MessengerState;

    constructor(){
        super();
        this.state = {
            players: [],
            activePlayerUID: null,
            message: "",
            clientUID: null
        };
    }

    public addMessage(message:Message){
        const updatedState ={...this.state};
        for (let i = 0; i < updatedState.players.length; i++){
            if (updatedState.players[i].messageUID === message.authorUID || updatedState.players[i].messageUID === message.recipientUID){
                updatedState.players[i].messages.push(message);
                if (this.state.activePlayerUID !== updatedState.players[i].messageUID){
                    updatedState.players[i].unreadMessages = true;
                    PlaySound("message.wav");
                } else {
                    const textarea:HTMLTextAreaElement = this.querySelector(".js-messenger-input");
                    if (textarea){
                        textarea.scrollTo({
                            top: textarea.scrollHeight,
                            left: 0,
                            behavior: "auto",
                        });
                    }
                }
                break;
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
        for (let i = 0; i < updatedState.players.length; i++){
            // @ts-ignore
            if (updatedState.players[i].messageUID === e.target.dataset.uid){
                updatedState.activePlayerUID = updatedState.players[i].messageUID;
                updatedState.players[i].unreadMessages = false;
                break;
            }
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

    private renderPlayerChat(){
        let player:Player;
        for (let i = 0; i < this.state.players.length; i++){
            if (this.state.players[i].messageUID === this.state.activePlayerUID){
                player = this.state.players[i];
                break;
            }
        }
        return html`
            <ul>
                <li class="font-xs font-grey-700 text-center py-0.5">Beginning of message history with ${player.name}.</li>
                ${player.messages.map(message => {
                    return html`
                        <li class="${message.authorUID === this.state.clientUID ? "outgoing" : "incoming"}">
                            <span class="msg">${message.msg}</span>
                            <span class="author">${message.author}</span>
                        </li>
                    `;
                })}
            </ul>
            <textarea class="js-messenger-input" placeholder="Send ${player.name} a message..." @keyup=${this.handleKeyup}></textarea>
        `;
    }

    private render(){
        const view = html`
            <div class="p-0.5">
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
                ${!this.state.activePlayerUID ? 
                    html`
                        <p class="font-xs font-grey-700 w-full h-full" flex="items-center justify-center">
                            <span class="inline-block">Select a player to begin sending messages.</span>
                        </p>
                    ` : this.renderPlayerChat()}
            </div>
        `;
        // @ts-ignore
        render(view, this);
        const textarea:HTMLTextAreaElement = this.querySelector(".js-messenger-input");
        if (textarea){
            textarea.scrollTo({
                top: textarea.scrollHeight,
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