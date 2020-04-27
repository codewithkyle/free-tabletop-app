class LoginComponent extends HTMLElement {
    private form: HTMLFormElement;
    private createButton: HTMLButtonElement;

    constructor() {
        super();
        this.form = this.querySelector("form");
        this.createButton = this.querySelector(".js-create");
    }

    private handleSubmit: EventListener = (e: Event) => {
        e.preventDefault();
        console.log("Submit code");
    };

    private handleCreate: EventListener = () => {
        console.log("Create room");
    };

    connectedCallback() {
        this.form.addEventListener("submit", this.handleSubmit);
        this.createButton.addEventListener("click", this.handleCreate);
    }
}
customElements.define("login-component", LoginComponent);
