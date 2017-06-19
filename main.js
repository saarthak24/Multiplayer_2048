var socket = io();
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var restartButton = document.getElementById('restart-button');
var scoreLabel = document.getElementById('score');
var score = 0;
var size = 4;
var width = canvas.width / size - 6;
var cells = [];
var fontSize;
var loss = false;
var name = "";
startGame();

var curTime = 10;
var timer;

socket.on("highScores", function(data) {
    var row = $("<tr>");
    row.append($("<td>" + data.sqlName + "</td>")).append($("<td>" + data.sqlScore + "</td>"));
    $("#resTable tbody").append(row);
})

socket.on('fromserver', function(data){
        console.log(data.newscore)
})
function start() {
    clearInterval(timer);
    curTime = 10;
    startTimer();
};

function stop() {
    clearInterval(timer);
    stopTimer();
};

function stopTimer() {
    clearInterval();
    curTime = 10;
}

function startTimer() {
    timer = setInterval(decreaseTime, 1000)
    document.getElementById("timer").innerHTML = "Time Left: " + curTime.toString() + " seconds";
}

function decreaseTime() {
    curTime--;
    if (curTime < 0) {
        stop();
        alert("Time is Up! Your final score was: "+score)
        finishGame();
        } else {
        document.getElementById("timer").innerHTML = "Time Left: " + curTime.toString() + " seconds";
    }
}
function submitScore() {
    name = $("#nameInput").val();
    socket.emit("score", {
        score: score,
        name: name
    })
};

function restart() {
    if (!loss) {
        console.log(sizeInput.value);
        canvasClean();
        startGame();
    } else {
        loss = false;
        score = 0;
        canvasClean();
        startGame();
        canvas.style.opacity = 1;
    }
}

function cell(row, col) {
    this.value = 0;
    this.x = col * width + 5 * (col + 1);
    this.y = row * width + 5 * (row + 1);
}

function createCells() {
    var i;
    var j;
    for (i = 0; i < size; i++) {
        cells[i] = [];
        for (j = 0; j < size; j++) {
            cells[i][j] = new cell(i, j);
        }
    }
}

function drawCell(cell) {
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, width, width);
    switch (cell.value) {
        case 0:
            ctx.fillStyle = '#CDC1B4';
            break;
        case 2:
            ctx.fillStyle = '#eee4da';
            break;
        case 4:
            ctx.fillStyle = '#ede0c8';
            break;
        case 8:

            ctx.fillStyle = '#f2b179';
            break;
        case 16:
            ctx.fillStyle = '#f59563';
            break;
        case 32:
            ctx.fillStyle = '#f67c5f';
            break;
        case 64:
            ctx.fillStyle = '#f65e3b';
            break;
        case 128:
            ctx.fillStyle = '#edcf72';
            break;
        case 256:
            ctx.fillStyle = '#edcc61';
            break;
        case 512:
            ctx.fillStyle = '#edc850';
            break;
        case 1024:
            ctx.fillStyle = '#edc53f';
            break;
        case 2048:
            ctx.fillStyle = '#FF7F50';
            break;
        case 4096:
            ctx.fillStyle = '#edc22e';
            break;
        default:
            ctx.fillStyle = '#ff0080';
    }
    ctx.fill();
    if (cell.value != 0) {
        fontSize = width / 2;
        ctx.font = fontSize + 'px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(cell.value, cell.x + width / 2, cell.y + width / 2 + width / 7);
    }
}

function canvasClean() {
    ctx.clearRect(0, 0, 500, 500);
}

document.onkeydown = function(event) {
    if (!loss) {
        if (event.keyCode === 38 || event.keyCode === 87) {
            moveUp();
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            moveRight();
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            moveDown();
        } else if (event.keyCode === 37 || event.keyCode === 65) {
            moveLeft();
        }
        socket.emit("updateMove", {
            myScore: score
        })
        scoreLabel.innerHTML = 'Score : ' + score;
    }
}

function startGame() {
    restartButton.style.visibility = "hidden";
    createCells();
    drawAllCells();
    pasteNewCell();
    pasteNewCell();
    start()
}

function finishGame() {
    canvas.style.opacity = '0.1';
    loss = true;
    $("#myModal").modal();
    restartButton.style.visibility = "visible";
    alert("You lost! Your final score was: " + score + " !")
    stop()
}

function drawAllCells() {
    var i;
    var j;
    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            drawCell(cells[i][j]);
        }
    }
}

function pasteNewCell() {
    var countFree = 0;
    var i;
    var j;
    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            if (!cells[i][j].value) {
                countFree++;
            }
        }
    }
    if (countFree == 0) {
        finishGame();
        return;
    }
    while (true) {
        var row = Math.floor(Math.random() * size);
        var col = Math.floor(Math.random() * size);
        if (!cells[row][col].value) {
            cells[row][col].value = 2 * Math.ceil(Math.random() * 2);
            drawAllCells();
            return;
        }
    }
}

function moveRight() {
    var i;
    var j;
    var col;
    for (i = 0; i < size; i++) {
        for (j = size - 2; j >= 0; j--) {
            if (cells[i][j].value) {
                col = j;
                while (col + 1 < size) {
                    if (!cells[i][col + 1].value) {
                        cells[i][col + 1].value = cells[i][col].value;
                        cells[i][col].value = 0;
                        col++;
                    } else if (cells[i][col].value == cells[i][col + 1].value) {
                        cells[i][col + 1].value *= 2;
                        score += cells[i][col + 1].value;
                        cells[i][col].value = 0;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    pasteNewCell();
}

function moveLeft() {
    var i;
    var j;
    var col;
    for (i = 0; i < size; i++) {
        for (j = 1; j < size; j++) {
            if (cells[i][j].value) {
                col = j;
                while (col - 1 >= 0) {
                    if (!cells[i][col - 1].value) {
                        cells[i][col - 1].value = cells[i][col].value;
                        cells[i][col].value = 0;
                        col--;
                    } else if (cells[i][col].value == cells[i][col - 1].value) {
                        cells[i][col - 1].value *= 2;
                        score += cells[i][col - 1].value;
                        cells[i][col].value = 0;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    pasteNewCell();
}

function moveUp() {
    var i;
    var j;
    var row;
    for (j = 0; j < size; j++) {
        for (i = 1; i < size; i++) {
            if (cells[i][j].value) {
                row = i;
                while (row > 0) {
                    if (!cells[row - 1][j].value) {
                        cells[row - 1][j].value = cells[row][j].value;
                        cells[row][j].value = 0;
                        row--;
                    } else if (cells[row][j].value == cells[row - 1][j].value) {
                        cells[row - 1][j].value *= 2;
                        score += cells[row - 1][j].value;
                        cells[row][j].value = 0;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    pasteNewCell();
}

function moveDown() {
    var i;
    var j;
    var row;
    for (j = 0; j < size; j++) {
        for (i = size - 2; i >= 0; i--) {
            if (cells[i][j].value) {
                row = i;
                while (row + 1 < size) {
                    if (!cells[row + 1][j].value) {
                        cells[row + 1][j].value = cells[row][j].value;
                        cells[row][j].value = 0;
                        row++;
                    } else if (cells[row][j].value == cells[row + 1][j].value) {
                        cells[row + 1][j].value *= 2;
                        score += cells[row + 1][j].value;
                        cells[row][j].value = 0;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
    }
    pasteNewCell();
}
