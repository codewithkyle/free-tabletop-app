async function ResetChatMessage() {
    const textarea = document.body.querySelector(".js-messenger-input");
    textarea.value = "";
    textarea.innerHTML = "";
    textarea.style.height = `0px`;
    return;
}
function GetChatMessage() {
    const textarea = document.body.querySelector(".js-messenger-input");
    return textarea.value;
}
async function AdjustChatMessageHeight() {
    const textarea = document.body.querySelector(".js-messenger-input");
    textarea.style.height = `${textarea.scrollHeight}px`;
    return;
}
function ScrollChatMessages() {
    const container = document.body.querySelector(".js-chat-messages");
    if (container) {
        container.scrollTo({
            top: container.scrollHeight,
            left: 0,
            behavior: "auto",
        });
    }
}
