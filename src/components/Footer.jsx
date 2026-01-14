export default function Footer() {
  return (
    <footer className="footer-premium">
      <div className="container footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>Farmared <span className="highlight">88</span> Premium</h2>
            <p>Elevando el estándar de la salud digital.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Contacto</h4>
              <p>Email: hola@farmared88.com</p>
              <p>Tel: +593 999 888 777</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Farmared 88. Todos los derechos reservados.</p>
          <div className="legal-links">
            <span>Privacidad</span>
            <span>Términos</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-premium {
          background: #0f172a;
          color: #f8fafc;
          padding: 5rem 0 2rem;
          margin-top: 4rem;
        }
        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }
        .footer-main {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-brand h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }
        .footer-brand .highlight { color: var(--accent-color); }
        .footer-brand p { color: #94a3b8; font-size: 1.1rem; }
        
        .footer-links h4 {
          color: var(--primary-color);
          margin-bottom: 1rem;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        .footer-links p { color: #cbd5e1; font-size: 0.95rem; }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: #64748b;
        }
        .legal-links { display: flex; gap: 1.5rem; }
      `}</style>
    </footer>
  );
}
