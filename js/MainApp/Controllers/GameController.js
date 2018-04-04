'use strict';
var gameController = gameApp.controller('gameController', function($scope){
    $scope.settings = {
        rows: 10,
        columns: 10,
        difficulty: 100,
    };

    $scope.rows = $scope.settings.rows;
    $scope.columns = $scope.settings.columns;
    $scope.mines = [];
    $scope.gameOverFlag = false;
    $scope.flaggedCells = [];
    $scope.discoveredCells = [];
    $scope.disabledCells = [];

    pageLoad();

    //scope functions
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
                return;
            }
            default:
                break;
        }
        if($scope.gameOverFlag) return;
        
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
    }

    $scope.newGame = function(){
        $scope.gameOverFlag = false;
        location.reload(true);
    }

    //private functions
    function getMinesLocations(){
        var minesCount = Math.floor($scope.settings.rows * $scope.settings.columns / $scope.settings.difficulty);
        var mines = [];
        for(var i = 0; i < minesCount; i++){
            mines.push(getRandomMine());
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
    }
    function isDisabled(cell){
        var indexes = jQuery.map($scope.disabledCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });
        if(indexes != undefined && indexes.length != 0) return true;
    }
    function isDiscovered(cell){
        var indexes = jQuery.map($scope.discoveredCells, function(val, idx){
            if(val.row == cell.row && val.col == cell.col) return idx;
        });
        if(indexes != undefined && indexes.length != 0) return true;
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
        return [{x: x - 1, y: y - 1},
                {x: x    , y: y - 1},
                {x: x + 1, y: y - 1},
                {x: x + 1, y: y    },
                {x: x + 1, y: y + 1},
                {x: x    , y: y + 1},
                {x: x - 1, y: y + 1},
                {x: x - 1, y: y    }];
    }
    function showNumber(row, col, number){
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").val(number);
        $scope.discoveredCells.push({row: row, col: col});
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
        $scope.disabledCells.push({row: row, col: col});
    }
})