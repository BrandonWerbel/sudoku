import {Cell} from "./modules/cell.js"
import game from "./games/game1easy.json" assert {type: 'json'};
import { Board } from "./modules/board.js";

const boardDiv = document.getElementById("board");
const boxes = [];
const rows = [];
const cols = [];

// instantiate groups as 2d arrays
for (var i=0; i < 9; i++){
    boxes[i] = [];
    rows[i] = [];
    cols[i] = [];

}

// create Board object
var board = new Board(boxes, rows, cols);

// Build boxes
for (var i=0; i < 9; i++){
    var box = document.createElement("div");
    box.classList.add("box");
    boardDiv.append(box);

    // build cells for the box
    for(var n=0; n < 9; n++){
        var index = i*9 + n;
        var row_num = Math.floor((index % 9) / 3) + (3 * Math.floor(index / 27));
        var col_index = (index % 3 + (3 * Math.floor(index / 9))) % 9;
        var cell = new Cell(boxes[i], rows[row_num], cols[col_index], index, board);
        box.append(cell.cellDiv);
    }
}

// Allows user to unselect all cells when they click outside the board
document.addEventListener("click", () => {
    board.unselectAll()
});


// Optional: initializes board with preset game
for(var row = 0; row < 9; row ++) {
    for (var col = 0; col < 9; col++) {
        if (game[row][col] != 0)
            rows[row][col].setVal(game[row][col]);
    }
}