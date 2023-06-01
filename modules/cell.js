import { Board } from "./board.js";

/**
 * Cell object
 */
export class Cell {

    /**
     * 
     * @param {Cell[]} box Array of cells in box group
     * @param {Cell[]} row Array of cells in row group
     * @param {Cell[]} col Array of cells in column group
     * @param {int} i Cell's index (0-80)
     * @param {Board} board Board object
     */
    constructor (box, row, col, i, board){
        this.box = box;
        this.row = row;
        this.col = col;
        this.index = i;
        this.board = board;
        this.val = 0;
        this.isSelected = false;

        // use index value to calculate where this cell belongs in its box, row, and column
        var box_index = this.index % 9;
        var row_index = (this.index % 3 + (3 * Math.floor(this.index / 9))) % 9;
        var col_index = Math.floor(box_index / 3) + (3 * Math.floor(this.index / 27));
        
        // add cell to groups array
        box[box_index] = this;
        row[row_index] = this;
        col[col_index] = this;

        // initialize all possible values as true
        this.poss_vals = [];
        for(var i=0; i<9; i++){
            this.poss_vals[i] = true;
        }

        // build UI cell
        this.cellDiv = document.createElement("div");
        this.cellDiv.classList.add("box");
        this.cellDiv.classList.add("cell");

        this.nums = [];
        for (var i=0; i < 9; i++){
            this.nums[i] = document.createElement("div");
            this.nums[i].classList.add("box");
            this.nums[i].classList.add("num");
            this.nums[i].textContent = (i+1);
            this.cellDiv.append(this.nums[i]);
        }

        // functions for interacting with UI
        this.cellDiv.addEventListener("mouseover", () => {
            if (!this.isSelected)
                this.cellDiv.style.backgroundColor = "lightblue"
        });
        this.cellDiv.addEventListener("mouseout", () => {
            if (!this.isSelected)
                this.cellDiv.style.backgroundColor = ""
        });
        this.cellDiv.addEventListener("click", (event) => {
            // does not allow event to "pass up" through html hierarchy
            event.stopPropagation();
            this.board.unselectAll();
            this.isSelected = true;
            this.cellDiv.style.backgroundColor = "rgb(129, 160, 170)"
        });

        document.addEventListener("keydown", (event) => {
            // only takes input as digit 1-9
            if(/\d/.test(event.key) && event.key != "0" && this.isSelected){
                this.setVal(parseInt(event.key));
            }
        })
    }

    /**
     * Get possible values for this cell
     * @returns {int[]} Array of integer values possible for this cell
     */
    getPossVals() {
        var vals = []
        for(var val = 0; val < 9; val++) {
            if (this.poss_vals[val])
                vals[vals.length] = val+1
        }
        return vals
    }
 
    /**
     * set this cell to a given value and
     * recursively goes through different logic strategies
     * @param {int} val Value assigned to cell
     */
    setVal(val){
        // do not set value if this cell has already been asssigned
        // or the specified value is not available
        if (this.val != 0 || !this.poss_vals[val-1]){
            return;
        }

        // set val
        this.val = val;

        // update UI
        this.nums[val-1].style.fontSize = "43px";
        this.nums[val-1].style.margin = "0";
        this.nums[val-1].style.marginLeft = "15px";
        this.nums[val-1].style.marginTop = "5px";

        // remove other values from this cell
        for (var i = 0; i < 9; i++){
            // if value is not in exceptions list
            if (i+1 != val){
                this.nums[i].remove();
                this.elimVal(i+1);
            }
        }

        // eliminate this value from the cell's groups
        this.elimValFromGroups(val);

        // look for hidden singles
        this.board.hiddenSingles();

        // look for hidden doubles
        this.board.hiddenDoubles();

        // look for pointing pairs
        this.board.pointingPairs();
        
        // look for pointing triples
        this.board.pointingTriples();
    }

    /**
     * Eliminate specified value from this cell and 
     * recursively goes through different logic strategies
     * @param {int} val Value to be eliminated
     */
    elimVal(val){
        //eliminate this value
        this.poss_vals[val-1] = false;
        this.nums[val-1].textContent = "";

        // get possible values in separate array
        var poss = this.getPossVals();

        //make sure there's at least one possible value
        if (poss.length == 0) {
            console.log(this);
            throw "Error: No possible values for index " + this.index;
        }

        if (this.val == 0){
            if (poss.length == 1) {
                this.setVal(poss[0])
            } else {
                this.nakedNums(poss);
            }
        }
    }

    /**
     * eliminate a certain value from every cell in each group this cell belongs to
     * @param {int} val Value to eliminate
     */
    elimValFromGroups(val){
        this.board.elimValFromGroupExcept(this.box, val);
        this.board.elimValFromGroupExcept(this.row, val);
        this.board.elimValFromGroupExcept(this.col, val);
    }

    /**
     * Eliminate all values for this cell except for certain exceptions
     * @param {int[]} exceptions Integer array of values not to eliminate
     */
    elimAllValsExcept(exceptions) {
        // remove other values from this cell
        for (var i = 0; i < 9; i++){
            // if value is not in exceptions list
            if (exceptions.indexOf(i+1) == -1){
                // console.log(this)
                // console.log(i+1);
                this.elimVal(i+1);
            }
        }
    }

    /**
     * run nakedNum on this each of this cell's groups
     * @param {int[]} vals Integer of arrays to run nakedNum with
     */
    nakedNums(vals) {
        this.board.nakedNum(this.box, vals);
        this.board.nakedNum(this.row, vals);
        this.board.nakedNum(this.col, vals);
    }

    /**
     * Unselect this cell in GUI
     */
    unselect() {
        this.isSelected = false;
        this.cellDiv.style.backgroundColor = ""
    }
}