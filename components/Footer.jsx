import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.ftr}>
      <div className="w">
        <div className={styles.top}>
          <div>
            <div className={styles.logo}>Easy<span>Dollar</span> News</div>
            <p className={styles.desc}>Notícias financeiras em português. Cripto, acções, forex e commodities actualizadas em tempo real para a comunidade lusófona.</p>
          </div>
          <div className={styles.links}>
            <h4>Categorias</h4>
            <span>Criptomoedas</span>
            <span>Acções</span>
            <span>Forex</span>
            <span>Commodities</span>
            <span>Mercados Emergentes</span>
          </div>
          <div className={styles.links}>
            <h4>EasyDollar</h4>
            <a href="https://easy-dollar.com" target="_blank" rel="noopener noreferrer">Plataforma</a>
            <a href="https://easy-dollar.com" target="_blank" rel="noopener noreferrer">Sobre nós</a>
          </div>
        </div>
        <p className={styles.disc}>
          ⚠️ <strong>Aviso Legal:</strong> O conteúdo deste site destina-se apenas a fins informativos e não constitui aconselhamento financeiro, de investimento, jurídico ou fiscal. Investir em activos financeiros envolve risco de perda de capital. As informações são recolhidas de fontes públicas e traduzidas automaticamente. Consulte sempre um profissional qualificado antes de tomar decisões de investimento.
        </p>
        <p className={styles.copy}>© {year} EasyDollar News · Todos os direitos reservados</p>
      </div>
    </footer>
  )
}
