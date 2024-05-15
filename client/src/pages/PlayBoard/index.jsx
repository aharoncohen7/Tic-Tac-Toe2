import { useNavigate } from 'react-router-dom';
import { Board } from '../../component/Board';
import { Btn } from '../../component/Btn';
import { Square } from '../../component/Square';
import styles from './style.module.scss';
import { useContext, useState } from 'react';
import { PlayerContext } from '../../App';
import { checkBoard } from '../../functions/checkBoard';

export const PlayBoard = ({ }) => {
    const { player, setPlayer, socket } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [currentPlayer, setCurrentPlayer] = useState(player.symbol ? player.symbol : 'X');
    const [isGameOver, setIsGameOver] = useState(false);
    // const [steps, setSteps] = useState(0);
    const [winner, setWinner] = useState(null);
    const [boardSize, setBoardSize] = useState(0);
    const [board, setBoard] = useState([]);

    // אצל יוצר
    // פונקציה לשידור בחירת הגודל של הלוח
    const createBoard = (e) => {
        const size = Number(e.target.value)
        socket.emit('set-size', size);
        // setSize(s);
        // setBoard(Array(s * s).fill(null))
    };

    // אצל משתתף
    // שידור גדול הלוח לשקחן היריב ועדכון לוח המשחק שלו
    socket.on('get-board-size', (boardSize, firstPlayer) => {
        console.log(boardSize);
        setBoard(Array(boardSize * boardSize).fill(null));
        // כאשר נבחר גודל - נחסמת האפשרות לבחירת גודל
        setBoardSize(boardSize)
        setCurrentPlayer(firstPlayer)
    })

    socket.on('update-user', user=>{setPlayer(user);console.log(user); })


    //אצל שני השחקנים
    // כאשר פרטי התור הקודם נשמרו ועובדו בצד השרת והתור עבור ליריב
    socket.on('change-turn', (currentPlayer, boardGame) => {
        // setIsYourTurn(currentPlayer == player.symbol? true : false);
        // הגדרת השחקן הנוכחי
        setCurrentPlayer(currentPlayer);
        //עדכון תצוגת הלוח
        setBoard(boardGame);
    })


    socket.on('error-message', (message) => {
        console.log(message);
    })

    socket.on('restart-game', () => {
        setBoardSize(0)
        setWinner(null);
        setBoard([]);
        setIsGameOver(false);
    })


    socket.on('game-over-without-winner', () => {
        console.log("לא ניתן להגיע לסיום המשחק");
        setIsGameOver(true);
    });

    socket.on('game-over-with-winner', (winnerSymbol) => {
        console.log("the winner of the game is: " + winnerSymbol);
        setWinner(winnerSymbol);
    });


    const play = (pos) => {
        // בודק אם התור של התור שייך למפעיל הפונקציה
        if (currentPlayer==player.symbol && board[pos]==null) {
            // if (!board[i]) {
            // העתקת מצב הלוח אצל השחקן 
            // let newBoard = [...board];
            // שיבוץ הפעולה החדשה
            // newBoard[i] = currentPlayer;
            // עדכון זמני של מצב הלוח לפי הפעולה
            // setBoard(newBoard);
            //שידור הפעולה לשרת
            socket.emit('move', (pos))
        }
    }

    const restartGame = () => {
        socket.emit('restart-game')
    }


    return (
        <div className={styles.container}>
            <span className={styles.buttons}>


                { player?.status == "creator" || player?.status == "solo" ? <span className={styles.sizeButtons} style={{display: boardSize  ? "none" : "flex"}}> 
                <button value='3'  disabled={boardSize ? true : false} className={styles.text} onClick={createBoard} >3</button>
                <button value='4' disabled={boardSize ? true : false} className={styles.text} onClick={createBoard} >4</button>
                <button value='5' disabled={boardSize ? true : false} className={styles.text} onClick={createBoard} >5</button>
                </span>:
                
                !boardSize&& <p className={styles.text}> "Please wait..."</p>
                }



            </span>
            <div className={styles.board} style={{ gridTemplateColumns: `repeat( ${boardSize} , 1fr)` }} >
                {boardSize ? [...Array(boardSize * boardSize)].map((_, index) => (
                    <button key={index} className={styles.square} onClick={() => play(index)} >
                        <Square>{board[index] && <img className={styles.img} src={`../../../assets/${board[index]}.svg`} />}</Square>
                    </button>
                )) : null}

            </div>
            <div className={styles.btn} onClick={() => { io.emit("quit"); restartGame(); navigate(-1) }} >
                <Btn>
                    <p className={styles.text} >BACK</p>
                </Btn>
            </div>
            {winner && <div onClick={restartGame} className={styles.popup}> 👍THE WINNER IS <img src={`../../../assets/${winner.symbol}.svg`} width={'50px'} /> </div>}
            {isGameOver && <div onClick={restartGame} className={styles.popup}>  😒😒game over!😒😒 </div>}
        </div >
    )

}
