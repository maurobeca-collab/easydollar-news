import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.hdr}>
      <div className="w">
        <a href="/" className={styles.logo} aria-label="EasyDollar News - Início">
          <span className={styles.logoEd}>ED$</span>
          <span className={styles.logoNews}>NEWS</span>
        </a>

        <nav className={styles.nav} aria-label="Categorias">
          <a href="#crypto">Cripto</a>
          <a href="#acoes">Ações</a>
          <a href="#forex">Forex</a>
          <a href="#commodities">Commodities</a>
          <a href="#mercados">Mercados</a>
          <a href="#emergentes">Emergentes</a>
        </nav>

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
