'use strict';
var gameController = gameApp.controller('gameController', function($scope){
    //#region scope variables
    $scope.settings = {
        rows: 3,
        columns: 3,
        difficulty: 9,
    };

    $scope.rows = $scope.settings.rows;
    $scope.columns = $scope.settings.columns;
    $scope.mines = [];
    $scope.gameOverFlag = false;
    $scope.flaggedCells = [];
    $scope.discoveredCells = [];
    $scope.disabledCells = [];
    //#endregion
    
    pageLoad();

    //#region scope functions
    $scope.range = function(number){
        var arr = new Array(number);
        for(var i = 0; i < number; i++){ arr[i] = i; }
        return arr;
    }
    
    $scope.cellClicked = function(cellName, event){
        switch (event.which) {
            case 1: //left mouse button
                //do nothing here to handle showing the number or exploding the mine    
                break;
            case 3: //right mouse button
            {
                toggleFlaggedCell(cellName);
                detectGameEnd();
                return;
            }
            default:
                break;
        }
        if($scope.gameOverFlag) return;
        if(isDisabled(cellName)) return;
        if(isDiscovered(cellName)) return;
        if(isFlagged(cellName)) hideFlag(cellName.row, cellName.col);

        var rowIndex = cellName.row;
        var colIndex = cellName.col;
        
        if(isMine(rowIndex, colIndex)){
            showAllMines();
            gameOver();
            return;
        }else{
            var minesCount = getSurroundingMinesCount(colIndex, rowIndex);
            if(minesCount != 0)
            {
                showNumber(rowIndex, colIndex, minesCount);
            }
            else 
            {
                disableCellAndSurroundingCells(rowIndex, colIndex);
            }
        }

        //detect if game ended successfully
        detectGameEnd();
    }

    $scope.newGame = function(){
        $scope.gameOverFlag = false;
        location.reload(true);
    }
    //#endregion
    
    //#region private functions
    function detectGameEnd(){
        if(isGameEnded()){
            showAllMines();
            success();
        }
    }
    function getMinesLocations(){
        var minesCount = Math.floor($scope.settings.rows * $scope.settings.columns / $scope.settings.difficulty);
        var mines = [];
        for(var i = 0; i < minesCount; i++){
            var mine = getRandomMine();
            if(isMine(mine.y, mine.x)) {
                i--;
                continue;
            }
            mines.push(mine);
        }
        return mines;
    }

    function getRandomMine(){
        return {
            x : Math.floor(Math.random() * $scope.settings.columns),
            y : Math.floor(Math.random() * $scope.settings.rows),
        };
    }
    function isMine(rowIndex, colIndex){
        var indexes = jQuery.map($scope.mines, function(val, idx){
            if(val.x == colIndex && val.y == rowIndex) return idx;
        });

        if(indexes != undefined && indexes.length != 0) return true;
        return false;
    }
    function pageLoad(){
        $scope.mines = getMinesLocations();
        
    }
    function showAllMines(){
        $scope.mines.forEach(function(mine){
            showMine(mine.y, mine.x);
        });
    }
    function showMine(row, col){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").css("background", "#ef7389 url('img/bomb.png') no-repeat center center");
    }
    function toggleFlaggedCell(cell){
        if(isDisabled(cell) || isDiscovered(cell)) return;

        var indexes = jQuery.map($scope.flaggedCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });

        if(indexes != undefined && indexes.length != 0){
            $scope.flaggedCells.splice(indexes[0], 1);
            hideFlag(cell.row, cell.col);
        }else{
            $scope.flaggedCells.push(cell);
            showFlag(cell.row, cell.col);
        }
    }
    function isFlagged(cell){
        var indexes = jQuery.map($scope.flaggedCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });
        if(indexes != undefined && indexes.length != 0) return true;
        return false;
    }
    function isDisabled(cell){
        var indexes = jQuery.map($scope.disabledCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });
        if(indexes != undefined && indexes.length != 0) return true;
        return false;
    }
    function isDiscovered(cell){
        var indexes = jQuery.map($scope.discoveredCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });
        if(indexes != undefined && indexes.length != 0) return true;
        return false;
    }
    function showFlag(row, col){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").css("background", "#e1ea83 url('img/flag.png') no-repeat center center");
    }
    function hideFlag(row, col){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").css("background", "darkgrey none");
    }
    function getSurroundingMinesCount(x , y){
        var x_max = $scope.settings.rows - 1;
        var y_max = $scope.settings.columns - 1;

        //decide mine surroundings
        // c0  c1  c2
        // c7      c3
        // c6  c5  c4
        var cells = getSurroundingCells(x, y);
        var minesCount = 0;
        
        cells.forEach(function(cell){
            if(isMine(cell.y, cell.x)) minesCount ++;
        });

        return minesCount;
    }
    function getSurroundingCells(x, y){
        
        var cells = [{x: x - 1, y: y - 1},
                     {x: x    , y: y - 1},
                     {x: x + 1, y: y - 1},
                     {x: x + 1, y: y    },
                     {x: x + 1, y: y + 1},
                     {x: x    , y: y + 1},
                     {x: x - 1, y: y + 1},
                     {x: x - 1, y: y    }];
        
        var validCells = [];

        var indices = jQuery.map(cells, function(val, index){
            if(val.x == -1 || val.y == -1 || val.x >= $scope.settings.columns || val.y >= $scope.settings.rows) return index;
            else { validCells.push(val); }
        });
        
        return validCells;
    }
    
    function showNumber(row, col, number){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").val(number);
        addDiscoveredCell({row: row, col: col});
    }
    function gameOver(){
        $scope.gameOverFlag = true;
        $(".gameOver").show(500);
    }
    function success(){
        $scope.gameOverFlag = true;
        $(".success").show(500);
    }
    function disableCellAndSurroundingCells(row, col){
        disableCell(row, col);
        
        var cells = getSurroundingCells(col, row);
        cells.forEach(function(cell){
            var minesCount = getSurroundingMinesCount(cell.x, cell.y);
            if(minesCount == 0){
                disableCell(cell.y, cell.x);
            }else{
                showNumber(cell.y, cell.x, minesCount);
            }
        });
    }
    function disableCell(row, col){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").addClass("disabled");
        addDisabledCell({row: row, col: col});
    }
    function addDisabledCell(cell){
        if(!isDisabled(cell)) $scope.disabledCells.push(cell);
    }
    function addDiscoveredCell(cell){
        if(!isDiscovered(cell)) $scope.discoveredCells.push(cell);        
    }
    function isGameEnded(){
        var total = $scope.settings.columns * $scope.settings.rows;
        var end1 = total == $scope.discoveredCells.length + $scope.disabledCells.length + $scope.flaggedCells.length;
        var end2 = areEqual($scope.mines, $scope.flaggedCells);
        return end1 || end2;
    }
    function areEqual(array1, array2){
        if(array1.length != array2.length) return false;
        for(var i=0; i< array1.length; i++){
            var element = array1[i];
            var indexes = jQuery.map(array2, function(val, index){
                if(val.row == element.y && val.col == element.x) return index;
            });
            if(indexes == undefined || indexes.length == 0) return false;
        }
        return true;
    }
    //#endregion
})