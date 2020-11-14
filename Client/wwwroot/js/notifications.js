function AccounceError(message) {
    toast({
        title: `Something Went Wrong`,
        message: message,
        duration: 10,
        classes: "-red",
    });
    PlaySound("alert.wav");
}
function PlayerConnected(name) {
    toast({
        title: `${name} Joined`,
        message: `${name} has joined to the room.`,
        duration: 5,
        classes: "-green",
    });
    PlaySound("alert.wav");
}
function PlayerDisconnected(name) {
    toast({
        title: `${name} Disconnected`,
        message: `${name} has disconnected from the room.`,
        duration: 5,
        classes: "-red",
    });
}
function PlayerReconnected(name) {
    toast({
        title: `${name} Reconnected`,
        message: `${name} has reconnected to the room.`,
        duration: 5,
        classes: "-green",
    });
}
function PlayerKicked(name) {
    toast({
        title: `${name} Disconnected`,
        message: `${name} was kicked from the room.`,
        duration: 5,
        classes: "-red",
    });
}
function TakeTurn() {
    toast({
        title: `You're Up`,
        message: `It's your turn for combat, use it wisely.`,
        duration: 5,
    });
    PlaySound("alert.wav");
}
function OnDeck() {
    toast({
        title: `On Deck`,
        message: `You're up next for combat. Start planning your turn.`,
        duration: 5,
    });
}
function toUpper(str) {
    return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
        return word[0].toUpperCase() + word.substr(1);
    })
        .join(" ");
}
function EntityOnDeck(name) {
    const fixedName = toUpper(name);
    toast({
        title: `${fixedName} Is On Deck`,
        message: `${fixedName} is up next for combat.`,
        duration: 5,
    });
}
function AnnounceRoll(diceCount, die, results, name) {
    let icon;
    switch (die) {
        case "d4":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="dice-d4" class="svg-inline--fa fa-dice-d4 fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504.9 289.03L280.84 11.86C274.45 3.96 265.23 0 256 0s-18.45 3.96-24.85 11.86L7.1 289.03c-11.31 14-8.84 34.57 5.47 45.49l224.05 170.94c5.72 4.37 12.55 6.55 19.38 6.55s13.66-2.18 19.38-6.55l224.05-170.94c14.31-10.92 16.78-31.5 5.47-45.49zM31.99 309.14L240 51.75v416.04L31.99 309.14zM256.02 480h.03l-.01.01-.02-.01zM272 467.82v-416l208.02 257.26L272 467.82z"></path></svg>`;
            break;
        case "d6":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="dice-d6" class="svg-inline--fa fa-dice-d6 fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M431.88 116.13L239.88 4.3a31.478 31.478 0 0 0-31.76 0l-192 111.84C6.15 121.94 0 132.75 0 144.45v223.09c0 11.71 6.15 22.51 16.12 28.32l192 111.84a31.478 31.478 0 0 0 31.76 0l192-111.84c9.97-5.81 16.12-16.62 16.12-28.32V144.45c0-11.7-6.15-22.51-16.12-28.32zM224 50.6l152.35 88.74L224 228.22 71.65 139.34 224 50.6zM48 181.12l152 88.66v177.64L48 358.88V181.12zm200 266.3V269.78l152-88.66v177.76l-152 88.54z"></path></svg>`;
            break;
        case "d8":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="dice-d8" class="svg-inline--fa fa-dice-d8 fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M502.1 232.1L279.9 9.9C273.3 3.3 264.6 0 256 0s-17.3 3.3-23.9 9.9L9.9 232.1c-13.2 13.2-13.2 34.5 0 47.7L232.1 502c6.6 6.6 15.2 9.9 23.9 9.9s17.3-3.3 23.9-9.9l222.2-222.2c13.2-13.1 13.2-34.5 0-47.7zM240 464.7L61.2 285.9 240 362.5zm0-137L43.7 243.6 240 47.3zm32 137V362.5l178.8-76.6zm0-137V47.3l196.3 196.3z"></path></svg>`;
            break;
        case "d10":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="dice-d10" class="svg-inline--fa fa-dice-d10 fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M503.88 261.29L279.8 10.64C273.45 3.55 264.72 0 256 0s-17.45 3.55-23.8 10.64L8.12 261.29c-11.81 13.21-10.6 33.5 2.69 45.22l224.08 197.52c6.03 5.32 13.57 7.97 21.11 7.97 7.54 0 15.08-2.66 21.11-7.97L501.19 306.5c13.29-11.71 14.49-32.01 2.69-45.21zM256 297.95l-75.86-50.57 75.86-177 75.86 177L256 297.95zm-107.28-58.24L47.69 264.97 220.97 71.12l-72.25 168.59zm214.56 0L291.03 71.12 464.5 265.01l-101.22-25.3zM31.91 282.62l.01.04-.03-.02.02-.02zm17.03 15.03l108.34-27.09 82.76 55.19v140.22L48.94 297.65zM271.96 465.9V325.75l82.76-55.19 108.2 27.06L271.96 465.9z"></path></svg>`;
            break;
        case "d12":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="dice-d12" class="svg-inline--fa fa-dice-d12 fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505.24 178.49l-47.7-95.41a63.972 63.972 0 0 0-28.62-28.62l-95.41-47.7A63.905 63.905 0 0 0 304.89 0h-97.78c-9.94 0-19.73 2.31-28.62 6.76l-95.41 47.7a63.972 63.972 0 0 0-28.62 28.62l-47.7 95.41A63.874 63.874 0 0 0 0 207.11v97.78c0 9.94 2.31 19.73 6.76 28.62l47.7 95.41a63.972 63.972 0 0 0 28.62 28.62l95.41 47.7a64.07 64.07 0 0 0 28.62 6.76h97.78c9.94 0 19.73-2.31 28.62-6.76l95.41-47.7a63.972 63.972 0 0 0 28.62-28.62l47.7-95.41a64.07 64.07 0 0 0 6.76-28.62v-97.78c0-9.94-2.31-19.74-6.76-28.62zm-29.55 12.44l-95.58 109.23L272 246.11V140.22l156.94-42.8 46.75 93.51zM308.8 480H203.2l-55.29-152.06L256 273.89l108.09 54.05L308.8 480zM199.55 32h112.89l82.85 41.42L256 111.41 116.71 73.42 199.55 32zM83.06 97.42L240 140.22V246.1l-108.11 54.05-95.58-109.22 46.75-93.51zM32 312.45v-77.88l81.99 93.7 48.42 133.16-74.56-37.28L32 312.45zm392.15 111.7l-74.56 37.28 48.42-133.16 81.99-93.7v77.88l-55.85 111.7z"></path></svg>`;
            break;
        case "d20":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="dice-d20" class="svg-inline--fa fa-dice-d20 fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M431.88 116.13L239.88 4.3a31.478 31.478 0 0 0-31.76 0l-192 111.84C6.15 121.94 0 132.75 0 144.46v223.09c0 11.71 6.15 22.51 16.12 28.32l192 111.83a31.478 31.478 0 0 0 31.76 0l192-111.83c9.97-5.81 16.12-16.62 16.12-28.32V144.46c0-11.71-6.15-22.52-16.12-28.33zM224 57.62L318.7 176H129.3L224 57.62zM124.62 208h198.75L224 369.47 124.62 208zm68.28 171.99L55.92 362.87l44.43-133.28 92.55 150.4zm154.75-150.41l44.43 133.28-136.98 17.13 92.55-150.41zm7.17-59.69L262.67 54.72l138.01 80.78-45.86 34.39zm-261.64 0l-46.24-34.68 138.54-80.7-92.3 115.38zm-16.01 27.98l-45.13 135.4.17-169.12 44.96 33.72zM208 414.12v56.43L85.4 398.8 208 414.12zm155.6-15.45L240 470.84v-56.72l123.6-15.45zm7.23-200.8l45.15-33.86-.17 168.79-44.98-134.93zM224.14 480h.17l-.09.05-.08-.05z"></path></svg>`;
            break;
        case "d100":
            icon = `<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="badge-percent" class="svg-inline--fa fa-badge-percent fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M349.66 173.65l-11.31-11.31c-3.12-3.12-8.19-3.12-11.31 0l-164.7 164.69c-3.12 3.12-3.12 8.19 0 11.31l11.31 11.31c3.12 3.12 8.19 3.12 11.31 0l164.69-164.69c3.13-3.12 3.13-8.18.01-11.31zM240 192c0-26.47-21.53-48-48-48s-48 21.53-48 48 21.53 48 48 48 48-21.53 48-48zm-64 0c0-8.83 7.19-16 16-16s16 7.17 16 16-7.19 16-16 16-16-7.17-16-16zm144 80c-26.47 0-48 21.53-48 48s21.53 48 48 48 48-21.53 48-48-21.53-48-48-48zm0 64c-8.81 0-16-7.17-16-16s7.19-16 16-16 16 7.17 16 16-7.19 16-16 16zm192-80c0-35.5-19.4-68.2-49.6-85.5 9.1-33.6-.3-70.4-25.4-95.5s-61.9-34.5-95.5-25.4C324.2 19.4 291.5 0 256 0s-68.2 19.4-85.5 49.6c-33.6-9.1-70.4.3-95.5 25.4s-34.5 61.9-25.4 95.5C19.4 187.8 0 220.5 0 256s19.4 68.2 49.6 85.5c-9.1 33.6.3 70.4 25.4 95.5 26.5 26.5 63.4 34.1 95.5 25.4 17.4 30.2 50 49.6 85.5 49.6s68.1-19.4 85.5-49.6c32.7 8.9 69.4.7 95.5-25.4 25.1-25.1 34.5-61.9 25.4-95.5 30.2-17.3 49.6-50 49.6-85.5zm-91.1 68.3c5.3 11.8 29.5 54.1-6.5 90.1-28.9 28.9-57.5 21.3-90.1 6.5C319.7 433 307 480 256 480c-52.1 0-64.7-49.5-68.3-59.1-32.6 14.8-61.3 22.2-90.1-6.5-36.8-36.7-10.9-80.5-6.5-90.1C79 319.7 32 307 32 256c0-52.1 49.5-64.7 59.1-68.3-5.3-11.8-29.5-54.1 6.5-90.1 36.8-36.9 80.8-10.7 90.1-6.5C192.3 79 205 32 256 32c52.1 0 64.7 49.5 68.3 59.1 11.8-5.3 54.1-29.5 90.1 6.5 36.8 36.7 10.9 80.5 6.5 90.1C433 192.3 480 205 480 256c0 52.1-49.5 64.7-59.1 68.3z"></path></svg>`;
            break;
        default:
            icon = null;
            break;
    }
    toast({
        title: `${name} Rolled ${diceCount}${die}`,
        message: results,
        duration: 10,
        icon: icon,
    });
}
