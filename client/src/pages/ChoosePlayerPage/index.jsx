import { useLocation, useNavigate } from 'react-router-dom'
import { Board } from '../../component/Board'
import { Square } from '../../component/Square'
import styles from './style.module.scss'
import { useContext, useState } from 'react'
import { Btn } from '../../component/Btn'
import { PlayerContext } from '../../App'



export const ChoosePlayerPage = () => {
    const { setPlayer, player } = useContext(PlayerContext)
    console.log(player);
    const navigate = useNavigate();
    const location = useLocation();
    // const { solo, roomNum, creator } = location.state;
    const { socket } = useContext(PlayerContext);
    socket.on('set-player', (play) => setPlayer(prev=>({ ...prev, play })), console.log('on set player',player))
    socket.on('navigate-to-play-board', () => navigate( '/playboard'))


    const choosePlayer = (symbol) => {
        console.log(symbol);
        // שינוי
        if (player.status === "solo") {
            setPlayer((prev) => ({ ...prev, play: symbol }));
        } else {
            setPlayer((prev) => ({ ...prev, play: symbol }));
            socket.emit('choose-player', symbol, player.roomNum);
        }
    };
    
    
    return (
        <div className={styles.container}>
            <img onClick={() => { setPlayer({ ...player, play: null }); navigate(-1) }} className={styles.back} src="../../../assets/backBtn.png" width={'80px'} />
          <p className={styles.text}>{( player?.status && (player.status == "creator" || player.status == "solo")) ? "CHOOSE PLAYER" : "Please wait..."}</p>
            <div className={styles.board} >
                <Board>
                    <div className={styles.square} >
                        <Square>
                            
                            {(!player?.play || player?.play == 'O') ? (<img onClick={() =>{player?.status && (player?.status && (player.status == "creator" || player.status == "solo")) && choosePlayer('X')}} src="../../../assets/X.svg" width={player.play && player?.play == 'O' ? '120px' : '80px'} />)
                                : (<img src="../../../assets/X_gray.svg" width={'80px'} />)}
                        </Square></div>
                    <div className={styles.square} >
                        <Square>
                            {(!player.play || player?.play == 'X') ? (<img onClick={() =>{player.status && (player.status == "creator" || player.status == "solo") && choosePlayer('O')}} src="../../../assets/O.svg" width={player?.play == 'X' ? '120px' : '80px'} />)
                                : (<img src="../../../assets/O_gray.svg" width={'80px'} />)}
                        </Square></div>
                </Board> </div>
            {((player?.play && player.status && player.status == "creator") || (player?.play  && player.status && player.status == "solo")) && (
                <div className={styles.btn} onClick={player.status && player.status == "solo" ?()=> navigate('/playboardsolo') : () => socket.emit('lets-play')} >
                    <Btn>
                         <p className={styles.text} >LET'S PLSY</p>
                    </Btn>
                </div>
            )}



        </div>
    )
}
