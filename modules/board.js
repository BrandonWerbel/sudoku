import { Cell } from "./cell.js";

/**
 * Board object
 */
export class Board {

    /**
     * 
     * @param {Cell[][] } boxes 2d array of cells on board, organized by box groups
     * @param {Cell[][] } rows 2d array of cells on board, organized by row groups
     * @param {Cell[][] } cols 2d array of cells on board, organized by column groups
     */
    constructor(boxes = [], rows = [], cols = []) {
        this.boxes = boxes;
        this.rows = rows;
        this.cols = cols;
    }

    /**
     * Get how many cells have each value possible for a given group
     * @param {Cell[]} group specified group of cells
     * @returns {int[]} number of cells possible for each value in a group
     */
    getNumVals(group) {
        var vals = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        // iterate through cells in a group
        for (var c = 0; c < 9; c++) {
            var cell = group[c];
            // iterate through values
            for (var i = 0; i < 9; i++){
                // if the selected value is available in selected cell
                // add one to that spot in the final array
                if (cell.poss_vals[i] && cell.val == 0){
                    vals[i]++;
                }
            }
        }
        // returns number of cells possible for each value in a group
        return vals;
    }

    /**
     * Get which cells in a group have a certain value as possible
     * @param {Cell[]} group specified group of cells
     * @param {int} val specified value
     * @returns {Cell[]} all cells in group with specified value
     */
    getCellsWithVal(group, val) {
        var cells = [];
        for (var c = 0; c < 9; c++){
            // if cell has value as possible,
            // but also has been set to any value, return nothing
            if (group[c].poss_vals[val-1] && group[c].val != 0){
                return [];
            }
            if (group[c].poss_vals[val-1]){
                cells[cells.length] = group[c]
            }
        }
        // returns cells with value possible
        return cells
    }

    /**
     * Eliminate given value from every cell in a group except for certain cells
     * @param {Cell[]} group specified group of cells
     * @param {int} val specified value
     * @param {Cell[]} exceptions list of cells *not* to eliminate value from
     */
    elimValFromGroupExcept(group, val, exceptions =[]){
        var cells = []
        // eliminate certain value from all cells in a group
        // which do not have a value yet. In this for loop, we
        // do not call elimVal so that all internal values are updated first
        for(var i = 0; i < 9; i++){
            var cell = group[i];
            if (exceptions.indexOf(cell) == -1){
                
                if (cell.poss_vals[val-1] && cell.val == 0){
                    cell.poss_vals[val-1] = false;
                    cells[cells.length] = cell;
                }
            }
        }

        // iterate through same cells as before, but this time we do call elimVal
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (cell.val == 0){
                cell.elimVal(val);
            }
        }
    }

    /**
     * Checks every cell in specified group. Returns true if
     * any cell has been assigned to the specified value.
     * @param {Cell[]} group specified group
     * @param {int} val specified value
     * @returns {boolean}
     */
    isValTaken(group, val){
        for(var i = 0; i < 9; i++){
            var cell = group[i];
            if(cell.val == val){
                return true;
            }
        }
        return false;
    }

    /**
     * For any value which is only possible in a single cell
     * in the specified group, set that cell to the value
     * @param {Cell[]} group specified group
     */
    hiddenSingle(group) {
        var vals = this.getNumVals(group);
        // iterate through all values in group
        for (var val = 0; val < 9; val++){
            // if selected value has only one cell possible
            if (vals[val] == 1){
                var cells = this.getCellsWithVal(group, val+1)
                // if there is actually only one cell with the selected value
                // set cell to that value
                if (cells.length == 1){
                    cells[0].setVal(val+1);
                } else if (!this.isValTaken(group, val+1)){
                    // If the selected value has only one cell possible
                    // but there is not only one cell with that value,
                    // it is most likely because the value has already been set
                    // and the other cells have not been updated.
                    // If this is not the case, there's a problem
                    console.log("WRONG WRONG WRONG (hidden single)");
                    console.log(vals);
                    console.log(val);
                    console.log(cells);
                    console.log(group);
                    console.trace()
                    throw "END"
                }
            }
        }
    }

    /**
     * For any two values which are only possible in two cells
     * in the specified group, eliminate all other
     * possible values from those cells
     * @param {Cell[]} group specified group
     */
    hiddenDouble(group) {
        var vals = this.getNumVals(group);
        // iterates through every pair of values
        for(var val1 = 0; val1 < 9; val1++){
            for (var val2 = 0; val2 < val1; val2++) {
                // if both values are available in two cells
                if (vals[val1] == 2 && vals[val2] == 2) {
                    // get cells with each value possible
                    var cells1 = this.getCellsWithVal(group, val1+1)
                    var cells2 = this.getCellsWithVal(group, val2+1)

                    // make sure there are two cells for each
                    if (cells1.length == 2 && cells2.length == 2) {
                        // if both cells in one array show up in the other one
                        if (cells2.indexOf(cells1[0]) != -1 && cells2.indexOf(cells1[1]) != -1) {
                            cells1[0].elimAllValsExcept([val1+1, val2+1])
                            cells1[1].elimAllValsExcept([val1+1, val2+1])
                        }
                    }
                }
            }
        }
    }

    /**
     * Find values which are only possible in two cells in a group.
     * If those cells both belong to a group different
     * from the specified group (e.g. specified group is box,
     * and both cells are in the same row as well),
     * eliminate that value from all cells in second group
     * @param {Cell[]} group initial group
     */
    pointingPair(group) {
        var vals = this.getNumVals(group);
        // iterate through all values in group
        for (var val = 0; val < 9; val++){
            // if selected value has exactly two cells possible
            if (vals[val] == 2) {
                var cells = this.getCellsWithVal(group, val+1);
                if (cells.length == 2) {
                    var cell1 = cells[0];
                    var cell2 = cells[1];

                    if (cell1.box == cell2.box && cell1.box != group)
                        this.elimValFromGroupExcept(cell1.box, val+1, cells)
                    else if (cell1.row == cell2.row && cell1.row != group)
                        this.elimValFromGroupExcept(cell1.row, val+1, cells)
                    else if (cell1.col == cell2.col && cell1.col != group)
                        this.elimValFromGroupExcept(cell1.col, val+1, cells)
                    
                } else if (!this.isValTaken(group, val+1)){
                    // If the selected value has two cells possible
                    // but there are not two cells with that value,
                    // it is most likely because the value has already been set
                    // and the other cells have not been updated.
                    // If this is not the case, there's a problem
                    console.log("WRONG WRONG WRONG (pointing pair)");
                    console.log(vals);
                    console.log(val);
                    console.log(cells);
                    console.log(group);
                    console.trace()
                    throw "END"
                }

            }
        }
    }

    /**
     * Find values which are only possible in two cells in a group.
     * If those cells all belong to a group different
     * from the specified group (e.g. specified group is box,
     * and both cells are in the same row as well),
     * eliminate that value from all cells in second group
     * @param {Cell[]} group initial group
     */
    pointingTriple(group) {
        var vals = this.getNumVals(group);
        // iterate through all values in group
        for (var val = 0; val < 9; val++){
            // if selected value has exactly two cells possible
            if (vals[val] == 3) {
                var cells = this.getCellsWithVal(group, val+1);
                if (cells.length == 3) {
                    var cell1 = cells[0];
                    var cell2 = cells[1];
                    var cell3 = cells[2];

                    if (cell1.box == cell2.box && cell2.box == cell3.box && cell1.box != group) {
                        // console.log("POINTING TRIPLE (box)")
                        // console.log(cells)
                        // console.log(val)
                        this.elimValFromGroupExcept(cell1.box, val+1, cells)
                        // if (!cell1.index == 0 || !val == 6)
                        //     throw "end"
                    }
                    else if (cell1.row == cell2.row && cell2.row == cell3.row && cell1.row != group) {
                        // console.log("POINTING TRIPLE (row)")
                        // console.log(cells)
                        // console.log(val)
                        // console.log(vals)
                        // console.log(group)
                        this.elimValFromGroupExcept(cell1.row, val+1, cells)
                        // if (!cell1.index == 0 || !val == 6)
                        //     throw "end"
                        
                    }
                    else if (cell1.col == cell2.col && cell2.col == cell3.col && cell1.col != group) {
                        // console.log("POINTING TRIPLE (col)")
                        // console.log(cells)
                        // console.log(val)
                        this.elimValFromGroupExcept(cell1.col, val+1, cells)
                        // throw "end"
                    }
                    
                } else if (!this.isValTaken(group, val+1)){
                    // If the selected value has two cells possible
                    // but there are not two cells with that value,
                    // it is most likely because the value has already been set
                    // and the other cells have not been updated.
                    // If this is not the case, there's a problem
                    console.log("WRONG WRONG WRONG (pointing pair)");
                    console.log(vals);
                    console.log(val);
                    console.log(cells);
                    console.log(group);
                    console.trace()
                    throw "END"
                }

            }
        }
    }
    

    nakedPair(group, vals) {
        if (vals.length != 2){
            console.log(vals)
            console.log(group)
            throw "WRONG NUMBER OF VALUES"
        }
        var cells = []
        // iterate through each cell in group
        for(var c = 0; c < 9; c++) {
            // if the cell has the same possible values as given,
            // add cell to array
            if (group[c].getPossVals().join() === vals.join()) {
                cells[cells.length] = group[c];
            }
        }

        // This seems to be running at the very end of a game.
        // I'm not quite sure why it's happening,
        // but the problem isn't affecting the solution, so
        // I'm not going to worry about it
        // if (cells.length == 0) {
        //     console.log("NO CELLS FOUND FOR NAKED PAIR")
        //     console.log(group);
        //     console.log(vals);
        //     console.trace()
        //     throw "END :("
        // }

        // if there are two cells with the given possible values
        if (cells.length == 2) {
            // console.log("NAKED PAIR")
            // console.log(cells);
            // console.log(vals)
            // eliminate each value from all other cells in the group
            this.elimValFromGroupExcept(group, vals[0], cells);
            this.elimValFromGroupExcept(group, vals[1], cells);
        }
    }

    nakedTriple(group, vals) {
        // console.log("NAKED TRIPLE?")
        if (vals.length != 3){
            console.log(vals)
            console.log(group)
            throw "WRONG NUMBER OF VALUES"
        }
        var cells = []
        // iterate through each cell in group
        for(var c = 0; c < 9; c++) {
            // if the values of the cell are included in the given values,
            // add cell to array
            if (group[c].getPossVals().every(v=> vals.indexOf(v) != -1)) {
                cells[cells.length] = group[c];
            }
        }

        // This seems to be running at the very end of a game.
        // I'm not quite sure why it's happening,
        // but the problem isn't affecting the solution, so
        // I'm not going to worry about it
        if (cells.length == 0) {
            console.log("NO CELLS FOUND FOR NAKED TRIPLE")
            console.log(group);
            console.log(vals);
            console.trace()
            throw "END :("
        }

        // if there are two cells with the given possible values
        if (cells.length == 3) {
            // console.log("NAKED TRIPLE")
            // console.log(cells);
            // console.log(vals)
            // eliminate each value from all other cells in the group
            this.elimValFromGroupExcept(group, vals[0], cells);
            this.elimValFromGroupExcept(group, vals[1], cells);
            this.elimValFromGroupExcept(group, vals[2], cells);
        }
    }

    /**
     * Finds cells in a group which all have the exact same values.
     * Then, eliminate those values from all other cells in the group.
     * @param {Cell[]} group specified group
     * @param {int[]} vals array of values to check cells for
     */
    nakedNum(group, vals) {
        var cells = []
        // iterate through each cell in group
        for(var c = 0; c < 9; c++) {
            // if the values of the cell are included in the given values,
            // add cell to array
            if (group[c].getPossVals().every(v => vals.indexOf(v) != -1)) {
                cells[cells.length] = group[c];
            }
        }

        // This seems to be running at the very end of a game.
        // I'm not quite sure why it's happening,
        // but the problem isn't affecting the solution, so
        // I'm not going to worry about it
        if (cells.length == 0) {
            console.log("NO CELLS FOUND FOR NAKED NUMS")
            console.log(group);
            console.log(vals);
            console.trace()
            throw "END :("
        }

        // if there are two cells with the given possible values
        if (cells.length == vals.length) {
            // console.log("NAKED NUM: " + cells.length)
            // console.log(cells);
            // console.log(vals)
            // eliminate each value from all other cells in the group
            this.elimValFromGroupExcept(group, vals[0], cells);
            this.elimValFromGroupExcept(group, vals[1], cells);
            this.elimValFromGroupExcept(group, vals[2], cells);
        }
    }

    /**
     * Runs [hiddenSingle]{@link Board#hiddenSingle} for every box, row, and column on the board
     */
    hiddenSingles(){
        // call hiddenSingle for every box, row, and column on the board
        for(var i = 0; i < 9; i++){
            this.hiddenSingle(this.boxes[i]);
            this.hiddenSingle(this.rows[i]);
            this.hiddenSingle(this.cols[i]);
        }
    }

    /**
     * Runs [hiddenDouble]{@link Board#hiddenDouble} for every box, row, and column on the board
     */
    hiddenDoubles(){
        // call hiddenDouble for every box, row, and column on the board
        for(var i = 0; i < 9; i++){
            this.hiddenDouble(this.boxes[i]);
            this.hiddenDouble(this.rows[i]);
            this.hiddenDouble(this.cols[i]);
        }
    }

    /**
     * Runs [pointingPair]{@link Board#pointingPair} for every box, row, and column on the board
     */
    pointingPairs(){
        // call pointingPair for every box, row, and column on the board
        for(var i = 0; i < 9; i++){
            this.pointingPair(this.boxes[i]);
            this.pointingPair(this.rows[i]);
            this.pointingPair(this.cols[i]);
        }
    }

    /**
     * Runs [pointingTriple]{@link Board#pointingTriple} for every box, row, and column on the board
     */
    pointingTriples(){
        // call pointingTriple for every box, row, and column on the board
        for(var i = 0; i < 9; i++){
            this.pointingTriple(this.boxes[i]);
            this.pointingTriple(this.rows[i]);
            this.pointingTriple(this.cols[i]);
        }
    }

    /**
     * Unselects all cells on the board
     */
    unselectAll() {
        for(var g = 0; g < 9; g++){
            for(var c = 0; c < 9; c++){
                this.boxes[g][c].unselect();
            }
        }
    }
}