function StartDiceDrag() {
    const modal = document.body.querySelector(".dice-modal");
    const el = document.body.querySelector(".js-dice-modal");
    let dragging = false;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        dragging = true;
    });
    el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;
        dragging = true;
    });
    document.addEventListener("mouseup", (e) => {
        e.preventDefault();
        dragging = false;
    });
    document.addEventListener("touchend", (e) => {
        e.preventDefault();
        dragging = false;
    });
    document.addEventListener("mousemove", (e) => {
        if (dragging) {
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
    document.addEventListener("touchmove", (e) => {
        if (dragging) {
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
function ResetDiceModal() {
    const modal = document.body.querySelector(".dice-modal");
    modal.style.left = '0px';
    modal.style.top = "calc(36px + 0.5rem)";
}
