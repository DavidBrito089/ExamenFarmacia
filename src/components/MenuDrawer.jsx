export default function MenuDrawer({ isOpen, onClose, categories, onSelectCategory }) {
    return (
        <>
            <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`menu-drawer ${isOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <h2>Menú</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <nav className="menu-body">
                    <ul>
                        {categories.map((category) => (
                            <li key={category}>
                                <button
                                    className="menu-item"
                                    onClick={() => {
                                        onSelectCategory(category);
                                        onClose();
                                    }}
                                >
                                    {category}
                                    <span className="arrow">›</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <style>{`
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 900;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
        }
        .menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        .menu-drawer {
          position: fixed;
          top: 0;
          left: -300px;
          bottom: 0;
          width: 80%;
          max-width: 300px;
          background: white;
          z-index: 1000;
          box-shadow: 5px 0 15px rgba(0,0,0,0.1);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .menu-drawer.open {
          left: 0;
        }
        .menu-header {
          padding: 1rem 1.5rem;
          border-bottom: 2px solid var(--primary-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
        }
        .menu-header h2 {
          font-size: 1.25rem;
          color: #666;
          font-weight: 700;
          margin: 0;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 2.5rem;
          line-height: 1;
          cursor: pointer;
          color: black;
        }
        .menu-body {
          flex: 1;
          overflow-y: auto;
          padding-top: 0.5rem;
        }
        .menu-body ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .menu-item {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          color: var(--primary-dark);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--gray-100);
          transition: background-color 0.2s;
        }
        .menu-item:hover {
          background-color: var(--bg-color);
          color: var(--primary-color);
        }
        .arrow {
          font-size: 1.5rem;
          color: var(--primary-color);
          line-height: 0;
          margin-bottom: 4px; /* Visual adjustment */
        }
      `}</style>
        </>
    );
}
