import { NavLink } from 'react-router-dom'
import styles from './style.module.scss'

export const Button = ({ content }) => {
  return (
    <NavLink to={'/chooseplayer'} className={styles.btn}>
      <img src={content} width={'350px'} />
    </NavLink>
  )
}
