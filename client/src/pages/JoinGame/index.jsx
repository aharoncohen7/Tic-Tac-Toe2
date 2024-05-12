import { useNavigate } from 'react-router-dom';
import styles from './style.module.scss'
import { Btn } from '../../component/Btn';
import { PlayerContext } from '../../App';
import { useContext, useEffect, useState } from 'react';


export const JoinGame = () => {
  const { socket, setPlayer, player } = useContext(PlayerContext)
  console.log(player);

  useEffect(() => { socket.connect() }, [])

  const navigate = useNavigate();
  const [input, setInput] = useState('');

  // יוצר
  const handleCreateGame = () => {
    socket.emit('create-room', player);
    socket.on('create-room', (creator) => {
      // console.log(creator);
      // console.log(creator.id , socket.id);
      if(creator.id !== socket.id){
        alert("There is a mismatch between the data")
        return
      }
      console.log(creator);
      setPlayer(creator)
      // setPlayer({ playerId: socket.id, status: "creator", roomNum })
      navigate('/waiting', { state: { number: creator.roomNum } })
    })
  }

  //  מצטרף
  const handleJoin = () => {
    socket.emit('join-room',  { ...player, roomNum: input });
    socket.on('join-room', (joiner) => {
      // שינוי
      if (joiner.id) {
        if(joiner.id !== socket.id){
          alert("There is a mismatch between the data")
          return
        }
        console.log(joiner);
        setPlayer(joiner);
        navigate('/chooseplayer',
        //  { state: { solo: false, roomNum: input, creator: false } }
        );
      } else {
        alert('Room not found');
      }
    });
  };






  return (
    <div className={styles.container}>
      <img onClick={() => { navigate(-1) }} className={styles.back} src="../../../assets/backBtn.png" width={'80px'} />
      <p className={styles.text}>JOIN TO A GAME</p>
      <input
        type="text"
        placeholder='ENTER CODE GAME'
        className={styles.input}
        onChange={(e) => { setInput(e.target.value) }}
      />
      <div className={styles.join} onClick={handleJoin} >
        <Btn>
          <p className={styles.text} >JOIN</p>
        </Btn>
      </div>
      <div className={styles.or_container} >
        <span className={styles.line} ></span>
        <p className={styles.text} >OR </p>
        <span className={styles.line} ></span>
      </div>
      <div className={styles.create_game} onClick={handleCreateGame} >
        <Btn>
          <p className={styles.text} >CREATE A GAME</p>
        </Btn>
      </div>

    </div>
  )
}

