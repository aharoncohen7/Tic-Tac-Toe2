import { useNavigate } from 'react-router-dom'
import styles from './style.module.scss'
import { Btn } from '../../component/Btn';
import { WelcomePage } from '../WelcomePage';
import { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../../App';

export const MenuPage = () => {
  const [startGame, setStartGame] = useState(true);
  const { setPlayer, player } = useContext(PlayerContext)
  const navigate = useNavigate();
  

  useEffect(() => {
    setTimeout(() => setStartGame(!startGame), 2000);
  }, [])




  const playWithFriend = () => {navigate('/joingame')}
  // דילוג לבחירת סמל
  const playSolo = () => {setPlayer({...player, status: "solo"}); navigate('/chooseplayer',
  //  {state:{solo:true}}
  )}






  return (
    <>
    {startGame?(
      <WelcomePage/>
   //שינוי

    ):(
      <div className={styles.container}>
           <img src="../assets/LogoSmall.svg" width={'370px'}/>
           <div className={styles.btn} onClick={playSolo} >
                      <Btn>
                          <p className={styles.text} >PLAY SOLO</p>
                      </Btn>
                  </div>
                  <div className={styles.btn} onClick={playWithFriend} >
                      <Btn>
                          <p className={styles.text} >PLAY WITH A FRIEND</p>
                      </Btn>
                  </div>
            <img
             onClick={() =>{  navigate('/setting')}}
             className={styles.settingBtn} 
             src="../../../assets/setting.svg" width={'80px'} />
      </div>
    )}
    </>
  )
}
