import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../../App'
import styles from './style.module.scss'
import { useContext } from 'react';
const avatars = ['https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesar&accessoriesType=Sunglasses&hairColor=Auburn&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Side&eyebrowType=RaisedExcitedNatural&mouthType=Smile&skinColor=Yellow',
    'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Kurt&hairColor=SilverGray&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Wink&eyebrowType=RaisedExcitedNatural&mouthType=Sad&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat2&accessoriesType=Prescription01&hatColor=PastelGreen&facialHairType=MoustacheFancy&facialHairColor=BrownDark&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light'
]

export const Setting = () => {
    const { setPlayer, player } = useContext(PlayerContext)

    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.innerText; 
        setPlayer({ ...player, name: value });
    };

    return (
        <div className={styles.container}>
            <img src="../assets/LogoSmall.svg" width={'370px'} />
            <div className={styles.border}>
                <span className={styles.text} > YOUR NAME</span>
                <div contentEditable="true"
                    className={styles.input}
                    onInput={handleChange}
                ></div>
            </div>
            <span className={styles.avatarText} > CHOOSE AVATAR</span>
            <div className={styles.avatarContainer}>
                {avatars.map((url, index) => (
                    <img onClick={() => {  setPlayer({ ...player, avatar:url });}} key={index} src={url} />
                )
                )}
            </div>
            <div className={styles.buttonsContainer}>
                <img onClick={() => { navigate("/") }} className={styles.back} src="../../../assets/backBtn.png" width={'80px'} />
                <img onClick={() => { navigate("/") }} className={styles.back} src="../../../assets/confirm.svg" width={'80px'} />
            </div>
        </div>
    )
}
