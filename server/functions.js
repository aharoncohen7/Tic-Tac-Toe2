// const { player, setPlayer } = useContext(PlayerContext2)
    // const [currentPlayer, setCurrentPlayer] = useState(player || 'X');
    // const [winner, setWinner] = useState(null);
    // const [steps, setSteps] = useState(0);
    // const [size, setSize] = useState(0);
    // const [board, setBoard] = useState([]);
    // const [isGameOver, setIsGameOver]  = useState(false)
    // const navigate = useNavigate();
    // let rows = Array(size ).fill(null)
    // let columns = Array(size).fill(null)
    // let mainDiagonal = null;
    // let secondaryDiagonal = null;
    // // console.log(rows);

  
    // const [boardState, setBoardState] = useState({
    //     rows: Array(3).fill(null),
    //     columns: Array(3).fill(null),
    //     mainDiagonal: null,
    //     secondaryDiagonal: null
    // })

    // const restartGame = () =>{
    //     setSteps(0)
    //     setBoard([])
    //     setCurrentPlayer(player || 'X')
    //     setWinner(null)
    //     setIsGameOver(false)
    //     setBoardState({
    //         rows: Array(3).fill(null),
    //         columns: Array(3).fill(null),
    //         mainDiagonal: null,
    //         secondaryDiagonal: null
    //     })
    //   }

    
    // const startGame = (e) => {
    //     const s = Number(e.target.value)
    //     setSize(s);
    //     setBoard(Array(s * s).fill(null))
    //     setBoardState({
    //         rows: Array(s).fill(null),
    //         columns: Array(s).fill(null),
    //         mainDiagonal: null,
    //         secondaryDiagonal: null
    //     })
        
    // };
    
    const play = (i) => {
        console.log(boardState.rows);
        // if (!board[i]) {
            // let newBoard = [...board];
            // newBoard[i] = currentPlayer;
            // setBoard(newBoard);
            // setCurrentPlayer(prev=>{
            //     if(prev=='X'){
            //         return 'O'
            //     }
            //     else{
            //         return 'X'
            //     }
            // });
            updateGame(i)
            setSteps(steps + 1);
            if (steps + 1 >= (size * 2) - 1) {
                const isWinnerFound = checkBoard(newBoard, i);
                if(isWinnerFound){
                    setWinner(currentPlayer)
                }
            }
        // };

    }

      
    const updateGame = (index) => {
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
        setBoardState(newBoardState);
        const noOp = checkGameOver(newBoardState);
                if(noOp){
                    setIsGameOver(true)
                }
      };
      

    
    const checkBoard = (newBoard, index) => {
        const row = Math.floor(index / size);
        const colume = Math.floor(index % size);
        if(checkRow(newBoard, row)){return true};
        if(checkColumn(newBoard, colume)){return true};
        if((row==colume)&&checkMainDiagonal(newBoard, index)){return true};
        if((row+colume+1==size)&&checkSeconderyDiagonal(newBoard, index)){return true};
        return false;
}

    const checkRow = (newBoard, row) => {
        row = Math.floor(row * size);
        for (let i = 0; i < size; i++) {
            if (newBoard[row] !== ( currentPlayer))return false
            row++;
        }
        return true
    }

    
    const checkColumn = (newBoard, colume) => {
        for (let i = 0; i < size; i++) {
            if (newBoard[colume] !== (currentPlayer)) return false
            colume += size;
        }
        return true
    }

    const checkMainDiagonal = (newBoard, index) => {
        index = 0;
        for (let i = 0; i < size; i++) {
            if (newBoard[index] !== (currentPlayer))return false;
            index+= size +1;
        }
        return true
    }

    const checkSeconderyDiagonal = (newBoard, index) => {
         
            console.log(index % (size -1) == 0);
            index = size -1;
            for (let i = 0; i < size; i++) {
                if (newBoard[index] !== (currentPlayer))return false;
                index+= size-1;
            }
            return true;
    }

    const checkGameOver = (newBoard) => {
        const noRow = newBoard.rows.every(element => element===false)
        const noColume = newBoard.columns.every(element => element===false)
        return newBoard.mainDiagonal===false && newBoard.secondaryDiagonal===false && noRow && noColume
    }