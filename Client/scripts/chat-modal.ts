function StartChatDrag(){
    const modal:HTMLElement = document.body.querySelector(".chat-modal");
    const el:HTMLElement = document.body.querySelector(".js-chat-modal");
    let dragging = false;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.addEventListener("mousedown", (e:MouseEvent)=>{
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        dragging = true;
    });
    el.addEventListener("touchstart", (e:TouchEvent)=>{
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        dragging = true;
    });

    document.addEventListener("mouseup", (e:Event)=>{
        e.preventDefault();
        dragging = false;
    });
    document.addEventListener("touchend", (e:Event)=>{
        e.preventDefault();
        dragging = false;
    });

    document.addEventListener("mousemove", (e:MouseEvent)=>{
        if (dragging){
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            modal.style.top = (modal.offsetTop - pos2) + "px";
            modal.style.left = (modal.offsetLeft - pos1) + "px";
        }
    });
    document.addEventListener("touchmove", (e:TouchEvent)=>{
        if (dragging){
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.touches[0].clientX;
            pos2 = pos4 - e.touches[0].clientY;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            // set the element's new position:
            modal.style.top = (modal.offsetTop - pos2) + "px";
            modal.style.left = (modal.offsetLeft - pos1) + "px";
        }
    });
}

function ResetChatModal(){
    const modal:HTMLElement = document.body.querySelector(".chat-modal");
    modal.style.left = '0px';
    modal.style.top = "calc(36px + 0.5rem)";
}

async function ResetChatMessage(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    textarea.value = "";
    textarea.innerHTML = "";
    textarea.style.height = `0px`;
    return;
}

function GetChatMessage(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    return textarea.value;
}

async function AdjustChatMessageHeight(){
    const textarea:HTMLTextAreaElement = document.body.querySelector(".js-messenger-input");
    textarea.style.height = `${textarea.scrollHeight}px`;
    return;
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