type ModalProps = {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation">
      <section aria-labelledby="modal-title" aria-modal="true" className="modal-card" role="dialog">
        <div className="modal-heading">
          <div><span className="modal-kicker">STACK FINANCE</span><h2 id="modal-title">{title}</h2></div>
          <button aria-label="Fechar janela" className="icon-button modal-close" onClick={onClose} type="button">×</button>
        </div>
        {children}
      </section>
    </div>
  )
}

export default Modal
