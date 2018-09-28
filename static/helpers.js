function playerImage(direction) {
    if (direction === "n")
        return document.getElementById('player_n');
    if (direction === "ne")
        return document.getElementById('player_ne');
    if (direction === "e")
        return document.getElementById('player_e');
    if (direction === "se")
        return document.getElementById('player_se');
    if (direction === "s")
        return document.getElementById('player_s');
    if (direction === "sw")
        return document.getElementById('player_sw');
    if (direction === "w")
        return document.getElementById('player_w');
    else
        return document.getElementById('player_nw');
}