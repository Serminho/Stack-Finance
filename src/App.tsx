function StackMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Stack Finance, início">
          <StackMark />
          <span>stack<span className="brand-accent">finance</span></span>
        </a>
        <span className="phase-tag"><span className="phase-dot" /> Fundação do projeto</span>
      </header>

      <main id="inicio">
        <section className="welcome-card" aria-labelledby="welcome-title">
          <div className="welcome-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> SUAS FINANÇAS, EM CAMADAS</p>
            <h1 id="welcome-title">Uma visão mais clara do seu dinheiro.</h1>
            <p className="intro">
              Receitas, despesas, contas e investimentos reunidos em um só lugar.
            </p>
            <div className="next-step">
              <span className="step-number">01</span>
              <span>
                <strong>O projeto está começando</strong>
                <small>A base do Stack Finance está pronta para crescer.</small>
              </span>
            </div>
          </div>
          <div className="visual" aria-hidden="true">
            <div className="visual-grid" />
            <div className="visual-card visual-card-back" />
            <div className="visual-card visual-card-middle"><span /><span /><span /></div>
            <div className="visual-card visual-card-front">
              <span className="mini-label">VISÃO FINANCEIRA</span>
              <span className="mini-value">em construção</span>
              <span className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></span>
            </div>
            <span className="spark spark-one">✳</span>
            <span className="spark spark-two">✳</span>
          </div>
        </section>

        <section className="foundation-row" aria-label="Princípios do projeto">
          <article className="foundation-item">
            <span className="item-index">A</span>
            <div><h2>Clareza</h2><p>Entenda o que entra, o que sai e o que está por vir.</p></div>
          </article>
          <article className="foundation-item">
            <span className="item-index">B</span>
            <div><h2>Controle</h2><p>Acompanhe contas e compromissos sem perder o contexto.</p></div>
          </article>
          <article className="foundation-item">
            <span className="item-index">C</span>
            <div><h2>Progresso</h2><p>Construa uma visão completa das suas finanças, etapa por etapa.</p></div>
          </article>
        </section>
      </main>

      <footer className="footer"><span>STACK FINANCE</span><span>Organização financeira pessoal</span></footer>
    </div>
  )
}

export default App
