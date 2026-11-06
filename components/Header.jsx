import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.hdr}>
      <div className="w">
        <a href="/" className={styles.logo} aria-label="EasyDollar News - Início">
          <span className={styles.logoEd}>ED$</span>
          <span className={styles.logoNews}>NEWS</span>
        </a>










        <div className={styles.right}>
          <span className={styles.live}>
            <span className="live-dot" aria-hidden="true" />
            AO VIVO
          </span>
          <a href="https://easy-dollar.com" className={styles.cta} target="_blank" rel="noopener noreferrer">
            Plataforma →
          </a>
        </div>
      </div>
    </header>
  )
}
