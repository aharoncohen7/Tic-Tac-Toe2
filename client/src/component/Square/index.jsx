import { NavLink } from 'react-router-dom'
import styles from './style.module.scss'

export const Square = ({children}) => {
  return (
    <div className={styles.container}>{children}</div>
  )
}
