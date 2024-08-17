let startBtns = document.getElementById("cellContainer");
let mines = [];

let minesLeft = document.getElementById("mineCounter").textContent;

let tileCount;
let bombCount;

let ezHighScore = localStorage.getItem('lowest_time_easy');
let medHighScore = localStorage.getItem('lowest_time_med');
let hardHighScore = localStorage.getItem('lowest_time_hard');

if (minesLeft === "10") {
    tileCount = 80;
    bombCount = 10;
    if (ezHighScore === null) {
        document.getElementById("recordTime").textContent = "--";
    } else {
        document.getElementById("recordTime").textContent = ezHighScore;
    }
} else if (minesLeft === "40") {
    tileCount = 252;
    bombCount = 40;
    if (medHighScore === null) {
        document.getElementById("recordTime").textContent = "--";
    } else {
        document.getElementById("recordTime").textContent = medHighScore;
    }
} else if (minesLeft === "99") {
    tileCount = 480;
    bombCount = 99;
    if (hardHighScore === null) {
        document.getElementById("recordTime").textContent = "--";
    } else {
        document.getElementById("recordTime").textContent = hardHighScore;
    }
}

let elapsedTime = 0;
let startTime, timerInterval;
let gameOnGoing = false;
let clickedOnBomb = false;

let bombCoords = [];
let bufferZone = [];
let queue = [];
let visited = [];



document.querySelectorAll("[name=levelChange]")[0].addEventListener("change", () => {
    window.location.href = document.getElementById("levels").value.toLowerCase() + "_level.html";
});

function startGame() {

    for (let i = 0; i < tileCount; i++) {
        mines.push(document.getElementById(i.toString()));
    }

    startBtns.addEventListener("click", () => {
        gameOnGoing = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(function timer() {
            if (gameOnGoing) {
                elapsedTime = Date.now() - startTime;
                document.getElementById("timer").textContent = Math.floor(elapsedTime / 1000).toString().padStart(3, "0");
            }
        }, 10);

        placeBombs();
        continuousOpening();
    }, {once : true});

    mines.forEach(element => {
        element.addEventListener("click", () => {
            let coords = element.id;
            let x, y;
            if (tileCount === 80) {
                x = coords % 10;
                y = Math.floor(coords / 10);
            } else if (tileCount === 252) {
                x = coords % 18;
                y = Math.floor(coords / 18);
            } else if (tileCount === 480) {
                x = coords % 24;
                y = Math.floor(coords / 24);
            }

            if (!gameOnGoing) {
                element.classList.replace("closed_mine", "open_mine");
                queue.push([x, y]);
                for (let r = -1; r < 2; r++) {
                    for (let c = -1; c < 2; c++) {
                        bufferZone.push([x + c, y + r]);
                    }
                }
            } else if (element.classList.contains("closed_mine") && element.textContent !== "🚩") {
                element.classList.replace("closed_mine", "open_mine");
                for (let i = 0; i < bombCoords.length; i++) {
                    if (bombCoords[i][0] === x && bombCoords[i][1] === y) {
                        element.textContent += "💣";
                        element.classList.replace("open_mine", "bomb");
                        clickedOnBomb = true;
                        if (tileCount === 80) {
                            win(false, "easy");
                        } else if (tileCount === 252) {
                            win(false, "med");
                        } else if (tileCount === 480) {
                            win(false, "hard");
                        }
                    }
                }
                if (!clickedOnBomb) {
                    mark(x, y, element);
                    queue.push([x, y]);
                    visited.push([x, y]);
                    continuousOpening();
                    if (visited.length === 70 && tileCount === 80) {
                        win(true, "easy");
                    } else if (visited.length === 212 && tileCount === 252) {
                        win(true, "med");
                    } else if (visited.length === 381 && tileCount === 480) {
                        win(true, "hard");
                    }
                }
            }
        });

        // flag on right click
        element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if (element.classList.contains("closed_mine") && element.textContent !== "🚩" && parseInt(document.getElementById("mineCounter").textContent) > 0) {
                element.textContent += "🚩";
                document.getElementById("mineCounter").textContent = parseInt(document.getElementById("mineCounter").textContent) - 1;
            } else if (element.classList.contains("closed_mine") && element.textContent === "🚩") {
                element.textContent = "";
                document.getElementById("mineCounter").textContent = parseInt(document.getElementById("mineCounter").textContent) + 1;
            }
        }, false);
    });
}

function placeBombs() {
    for (let i = 0; i < bombCount; i++) {
        let placed = false;
        while (!placed) {
            let contains = false;
            let x, y;
            if (bombCount === 10) {
                x = Math.floor(Math.random() * 10);
                y = Math.floor(Math.random() * 8);
            } else if (bombCount === 40) {
                x = Math.floor(Math.random() * 18);
                y = Math.floor(Math.random() * 14);
            } else if (bombCount === 99) {
                x = Math.floor(Math.random() * 24);
                y = Math.floor(Math.random() * 20);
            }

            for (let j = 0; j < bufferZone.length; j++) {
                if (bufferZone[j][0] === x && bufferZone[j][1] === y) {
                    contains = true;
                }
            }
            for (let i = 0; i < bombCoords.length; i++) {
                if (bombCoords[i][0] === x && bombCoords[i][1] === y) {
                    contains = true;
                }
            }
            if (!contains) {
                bombCoords.push([x, y]);
                placed = true;
            }
        }
    }
}

function mark(_x, _y, _element) {
    let counter = 0;
    for (let r = -1; r < 2; r++) {
        for (let c = -1; c < 2; c++) {
            for (let i = 0; i < bombCoords.length; i++) {
                if (bombCoords[i][0] === _x+c && bombCoords[i][1] === _y+r) {
                    counter++;
                }
            }
        }
    }
    switch (counter) {
        case 1:
            _element.classList.replace("open_mine", "tile_1");
            _element.textContent = counter;
            break;
        case 2:
            _element.classList.replace("open_mine", "tile_2");
            _element.textContent = counter;
            break;
        case 3:
            _element.classList.replace("open_mine", "tile_3");
            _element.textContent = counter;
            break;
        case 4:
            _element.classList.replace("open_mine", "tile_4");
            _element.textContent = counter;
            break;
        case 5:
            _element.classList.replace("open_mine", "tile_5");
            _element.textContent = counter;
            break;
        case 6:
            _element.classList.replace("open_mine", "tile_6");
            _element.textContent = counter;
            break;
        case 7:
            _element.classList.replace("open_mine", "tile_7");
            _element.textContent = counter;
            break;
        case 8:
            _element.classList.replace("open_mine", "tile_8");
            _element.textContent = counter;
            break;
    }
}

function continuousOpening() {
    while (queue.length !== 0) {
        let next = queue.shift();
        let bomb = false;
        for (let r = -1; r < 2; r++) {
            for (let c = -1; c < 2; c++) {
                if (bombCount === 10) {
                    if (!(next[0] + c < 0 || next[0] + c > 9 || next[1] + r < 0 || next[1] + r > 7)) {
                        for (let i = 0; i < bombCoords.length; i++) {
                            if (next[0] + c === bombCoords[i][0] && next[1] + r === bombCoords[i][1]) {
                                bomb = true;
                                r = 2;
                                c = 2;
                                break;
                            }
                        }
                    }
                } else if (bombCount === 40) {
                    if (!(next[0] + c < 0 || next[0] + c > 17 || next[1] + r < 0 || next[1] + r > 13)) {
                        for (let i = 0; i < bombCoords.length; i++) {
                            if (next[0] + c === bombCoords[i][0] && next[1] + r === bombCoords[i][1]) {
                                bomb = true;
                                r = 2;
                                c = 2;
                                break;
                            }
                        }
                    }
                } else if (bombCount === 99) {
                    if (!(next[0] + c < 0 || next[0] + c > 23 || next[1] + r < 0 || next[1] + r > 19)) {
                        for (let i = 0; i < bombCoords.length; i++) {
                            if (next[0] + c === bombCoords[i][0] && next[1] + r === bombCoords[i][1]) {
                                bomb = true;
                                r = 2;
                                c = 2;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!bomb) {
            for (let r = -1; r < 2; r++) {
                for (let c = -1; c < 2; c++) {
                    if (bombCount === 10) {
                        if (!(next[0] + c < 0 || next[0] + c > 9 || next[1] + r < 0 || next[1] + r > 7)) {
                            let contains = false;
                            for (let j = 0; j < visited.length; j++) {
                                if (visited[j][0] === next[0] + c && visited[j][1] === next[1] + r) {
                                    contains = true;
                                    break;
                                }
                            }
                            if (!contains) {
                                let id = (next[1] + r).toString() + (next[0] + c).toString();
                                let numId = parseInt(id);
                                document.getElementById(numId.toString()).classList.replace("closed_mine", "open_mine");
                                mark(next[0] + c, next[1] + r, document.getElementById(numId.toString()));
                                queue.push([next[0] + c, next[1] + r]);
                                visited.push([next[0] + c, next[1] + r]);
                            }
                        }
                    } else if (bombCount === 40) {
                        if (!(next[0] + c < 0 || next[0] + c > 17 || next[1] + r < 0 || next[1] + r > 13)) {
                            let contains = false;
                            for (let j = 0; j < visited.length; j++) {
                                if (visited[j][0] === next[0] + c && visited[j][1] === next[1] + r) {
                                    contains = true;
                                    break;
                                }
                            }
                            if (!contains) {
                                let id = ((next[1]+r)*18)+(next[0]+c);
                                document.getElementById(id.toString()).classList.replace("closed_mine", "open_mine");
                                mark(next[0] + c, next[1] + r, document.getElementById(id.toString()));
                                queue.push([next[0] + c, next[1] + r]);
                                visited.push([next[0] + c, next[1] + r]);
                            }
                        }
                    } else if (bombCount === 99) {
                        if (!(next[0] + c < 0 || next[0] + c > 23 || next[1] + r < 0 || next[1] + r > 19)) {
                            let contains = false;
                            for (let j = 0; j < visited.length; j++) {
                                if (visited[j][0] === next[0] + c && visited[j][1] === next[1] + r) {
                                    contains = true;
                                    break;
                                }
                            }
                            if (!contains) {
                                let id = ((next[1]+r)*24)+(next[0]+c);
                                document.getElementById(id.toString()).classList.replace("closed_mine", "open_mine");
                                mark(next[0] + c, next[1] + r, document.getElementById(id.toString()));
                                queue.push([next[0] + c, next[1] + r]);
                                visited.push([next[0] + c, next[1] + r]);
                            }
                        }
                    }
                }
            }
        }
    }
}

function win(won, level) {
    gameOnGoing = false;
    let time = Math.floor(elapsedTime / 1000);
    if (level === "easy") {
        if (won) {
            if (time < ezHighScore || ezHighScore === null) {
                localStorage.setItem('lowest_time_easy', time.toString());
                document.getElementById("bestTime").textContent = ezHighScore;
            } else {
                document.getElementById("bestTime").textContent = "---";
            }
            document.getElementById("time").textContent = Math.floor(elapsedTime / 1000).toString();
        }
        ezHighScore = localStorage.getItem('lowest_time_easy');
        document.getElementById("bestTime").textContent = ezHighScore;
        document.getElementById("popupOverlay").style.display = "block";
    } else if (level === "med") {
        if (won) {
            if (time < medHighScore || medHighScore === null) {
                localStorage.setItem('lowest_time_med', time.toString());
                document.getElementById("bestTime").textContent = medHighScore;
            } else {
                document.getElementById("bestTime").textContent = "---";
            }
            document.getElementById("time").textContent = Math.floor(elapsedTime / 1000).toString();
        }
        medHighScore = localStorage.getItem('lowest_time_med');
        document.getElementById("bestTime").textContent = medHighScore;
        document.getElementById("popupOverlay").style.display = "block";
    } else if (level === "hard") {
        if (won) {
            if (time < hardHighScore || hardHighScore === null) {
                localStorage.setItem('lowest_time_hard', time.toString());
                document.getElementById("bestTime").textContent = hardHighScore;
            } else {
                document.getElementById("bestTime").textContent = "---";
            }
            document.getElementById("time").textContent = Math.floor(elapsedTime / 1000).toString();
        }
        hardHighScore = localStorage.getItem('lowest_time_hard');
        document.getElementById("bestTime").textContent = hardHighScore;
        document.getElementById("popupOverlay").style.display = "block";
    }
}

function reset() {
    document.getElementById("popupOverlay").style.display = "none";
    bombCoords = [];
    bufferZone = [];
    queue = [];
    visited = [];
    mines = [];
    elapsedTime = 0;
    clickedOnBomb = false;

    mines.forEach(element => {
        element.removeEventListener("click", () => {});
        element.removeEventListener("contextmenu", () => {});
    });

    startBtns.removeEventListener("click", () => {});

    for (let i= 0; i < tileCount; i++) {
        document.getElementById(i.toString()).classList.remove(...document.getElementById(i.toString()).classList);
        document.getElementById(i.toString()).classList.add("closed_mine");
        document.getElementById(i.toString()).textContent = "";
    }
    document.getElementById("timer").textContent = "000";
    document.getElementById("mineCounter").textContent = bombCount.toString();
    window.location.reload();
}

startGame();
