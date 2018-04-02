'use strict';
var gameController = gameApp.controller('gameController', function($scope){
    $scope.settings = {
        rows: 10,
        columns: 12,
        difficulty: 24,
    };

    $scope.rows = $scope.settings.rows;
    $scope.columns = $scope.settings.columns;
    $scope.mines = [];

    pageLoad();

    //scope functions
    $scope.range = function(number){
        var arr = new Array(number);
        for(var i = 0; i < number; i++){ arr[i] = i; }
        return arr;
    }
    $scope.cellClicked = function(cellName){
        var rowIndex = cellName.row;
        var colIndex = cellName.col;
        
        var indexes = jQuery.map($scope.mines, function(val, idx){
            if(val.x == colIndex && val.y == rowIndex) return idx;
        });

        if(indexes != undefined && indexes.length != 0){
            showBomb($scope.mines[indexes[0]]);
        }

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

    function pageLoad(){
        $scope.mines = getMinesLocations();
        
        console.log($scope.mines);
    }

    function showBomb(mineLocation){
        var row = mineLocation.y;
        var col = mineLocation.x;
        var cellName = row + "_" + col;
        $("[name='" + cellName + "']").css("background-color", "black");
    }
})