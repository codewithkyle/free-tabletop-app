function PlayerConnected(name: string) {
    toast({
        title: `${name} Joined`,
        message: `${name} has joined to the room.`,
        duration: 5,
        classes: "-green",
    });
    PlaySound("alert.wav");
}
function PlayerDisconnected(name: string) {
    toast({
        title: `${name} Disconnected`,
        message: `${name} has disconnected from the room.`,
        duration: 5,
        classes: "-red",
    });
}
function PlayerReconnected(name: string) {
    toast({
        title: `${name} Reconnected`,
        message: `${name} has reconnected to the room.`,
        duration: 5,
        classes: "-green",
    });
}
function PlayerKicked(name: string) {
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
function toUpper(str: string) {
    return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(" ");
}
function EntityOnDeck(name: string) {
    const fixedName = toUpper(name);
    toast({
        title: `${fixedName} Is On Deck`,
        message: `${fixedName} is up next for combat.`,
        duration: 5,
    });
}