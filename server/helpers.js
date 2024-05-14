const updateGame = (index, size , currentPlayer,boardState ) => {
    console.log(index, size ,index / size, index % size);
    const newRow = Math.floor(index / size);
    
    const newColumn = Math.floor(index % size);
    console.log(newRow, newColumn);
    const updatedRows = [...boardState.rows];
    console.log(boardState.rows);
    console.log(updatedRows);
    const updatedColumns = [...boardState.columns];
    let updatedMainDiagonal = boardState.mainDiagonal;
    let updatedSecondaryDiagonal = boardState.secondaryDiagonal;

    if (updatedRows[newRow] === null) {
      updatedRows[newRow] = currentPlayer;
    } 
    else if(updatedRows[newRow] != currentPlayer){
      updatedRows[newRow] = false;
    }
    console.log("🚀 ~ updateGame ~ rows:", updatedRows);

    if (updatedColumns[newColumn] === null) {
      updatedColumns[newColumn] = currentPlayer;
    } else if(updatedColumns[newColumn] != currentPlayer){
      updatedColumns[newColumn] = false;
    }
    console.log("🚀 ~ updateGame ~ columns:", updatedColumns);

    if (newRow === newColumn) {
      if (updatedMainDiagonal === null) {
        updatedMainDiagonal = currentPlayer;
      } else if(updatedMainDiagonal != currentPlayer){
        updatedMainDiagonal = false;
      }
    }

    if (newRow + newColumn + 1 === size) {
      if (updatedSecondaryDiagonal === null) {
        updatedSecondaryDiagonal = currentPlayer;
      } else if(updatedSecondaryDiagonal != currentPlayer){
        updatedSecondaryDiagonal = false;
      }
    }
    const newBoardState = {
        rows: updatedRows,
        columns: updatedColumns,
        mainDiagonal: updatedMainDiagonal,
        secondaryDiagonal: updatedSecondaryDiagonal
      }
    return newBoardState;
  };

  const checkBoard = (newBoard, index, size) => {
    const row = Math.floor(index / size);
    const column = Math.floor(index % size);
    const currentPlayer = newBoard[index];
    console.log(row, column, currentPlayer);
    if(checkRow(newBoard, row, size, currentPlayer)){return true};
    if(checkColumn(newBoard, column,size, currentPlayer)){return true};
    if((row==column)&&checkMainDiagonal(newBoard, index, size, currentPlayer)){return true};
    if((row+column+1==size)&&checkSecondaryDiagonal(newBoard, index, size, currentPlayer)){return true};
    return false;
}

const checkRow = (newBoard, row, size, currentPlayer) => {
    row = Math.floor(row * size);
    for (let i = 0; i < size; i++) {
        if (newBoard[row] !== ( currentPlayer))return false;
        row++;
    }
    return true;
}


const checkColumn = (newBoard, column,size, currentPlayer) => {
    for (let i = 0; i < size; i++) {
        if (newBoard[column] !== (currentPlayer)) return false;
        column += size;
    }
    return true;
}

const checkMainDiagonal = (newBoard, index, size, currentPlayer) => {
    index = 0;
    for (let i = 0; i < size; i++) {
        if (newBoard[index] !== (currentPlayer))return false;
        index+= size +1;
    }
    return true;
}

const checkSecondaryDiagonal = (newBoard, index, size, currentPlayer) => {
        console.log(index % (size -1) == 0);
        index = size -1;
        for (let i = 0; i < size; i++) {
            if (newBoard[index] !== (currentPlayer))return false;
            index+= size-1;
        }
        return true;
}

const checkGameOver = (newBoardState) => {
    const noRow = newBoardState.rows.every(element => element===false)
    const noColumn = newBoardState.columns.every(element => element===false)
    return newBoardState.mainDiagonal===false && newBoardState.secondaryDiagonal===false && noRow && noColumn
}


  


  module.exports = {
    updateGame, 
    checkBoard,
    checkGameOver
}
