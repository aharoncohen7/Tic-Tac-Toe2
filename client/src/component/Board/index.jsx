import styles from './style.module.scss'

export const Board = ({children}) => {
    return (
            <div className={styles.container}>{children}</div>
    )
}
