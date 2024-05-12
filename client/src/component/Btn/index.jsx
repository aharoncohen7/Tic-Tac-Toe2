import styles from './style.module.scss'

export const Btn = ({children}) => {
  return (
    <button className={styles.btn} >{children}</button>
  )
}
