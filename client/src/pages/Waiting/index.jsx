import { useLocation, useNavigate } from 'react-router-dom'
import styles from './style.module.scss'
import { Loader } from '../../component/Loader'
import { PlayerContext } from '../../App';
import { useContext } from 'react';


export const Waiting = () => {
  const { socket } = useContext(PlayerContext);
  const location = useLocation();
  const navigate = useNavigate();

  socket.on("join-room", (isJoined) => {
    if (isJoined) {
      navigate('/chooseplayer', { state: { solo: false, creator: true, roomNum: isJoined } })
    }
  })

  return (
    <div className={styles.container}>
      <img onClick={() => { navigate(-1) }} className={styles.back} src="../../../assets/backBtn.png" width={'80px'} />
      <div className={styles.border}>
        <span className={styles.text} > YOUR CODE</span>
        <div className={styles.code} >{location.state.number}</div>
      </div>
      <Loader />
      <div className={styles.text} > WAITING FOR OPPONENT</div>


    </div>
  )
}
