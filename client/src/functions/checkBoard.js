

const checkColumn = (newBoard, colume, size, player) => {
    for (let i = 0; i < size; i++) {
        if (newBoard[colume] !== (player)) return
        colume += size;
    }
    return true;
}
const checkRow = (newBoard, row, size, player) => {
    row = Math.floor(row * size);
    for (let i = 0; i < size; i++) {
        if (newBoard[row] !== (player)) return
        row++
    }
    return true
}
const checkMainDiagonal = (newBoard, size, player) => {
    let index = 0;

    for (let i = 0; i < size; i++) {
        if (newBoard[index] !== (player)) return
        index += size + 1;
    }
    return true;
}
const checkSeconderyDiagonal = (newBoard, size, player) => {
   let index = size - 1;

    for (let i = 0; i < size; i++) {
        if (newBoard[index] !== (player)) return
        index += size - 1;
    }
    return true;

}
export const checkBoard = (newBoard, index, size, player) => { 
    const row = Math.floor(index / size)
    const colume = Math.floor(index % size);
    if (checkRow(newBoard, row, size, player)) return true;
    if (checkColumn(newBoard, colume, size, player)) return true;
    if (row === colume) {
        if (checkMainDiagonal(newBoard, size, player)) return true;
    }
    if (index % (size - 1) === 0) {
        if (checkSeconderyDiagonal(newBoard, size, player)) return true;
    }

}