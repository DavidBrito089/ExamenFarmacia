import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-content glass"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className="btn-close-premium" onClick={onClose}>&times;</button>

          <div className="modal-grid">
            <div className="modal-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="modal-info">
              <span className="modal-category">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="description">{product.description}</p>

              <div className="modal-price-row">
                <span className="modal-price">${product.price.toFixed(2)}</span>
                <div className="qty-selector-premium">
                  <button onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}>-</button>
                  <span>{quantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}>+</button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-primary btn-block"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(product, quantity);
                    onClose();
                  }}
                >
                  Agregar al Carrito — ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-content {
          max-width: 900px;
          width: 100%;
          padding: 2.5rem;
          position: relative;
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .btn-close-premium {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          transition: 0.3s;
          z-index: 10;
        }
        .btn-close-premium:hover { transform: rotate(90deg); color: var(--accent-color); }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
        }
        .modal-image img {
          width: 100%;
          border-radius: var(--radius-md);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          object-fit: cover;
        }
        
        .modal-category {
          color: var(--primary-color);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 0.5rem;
        }
        .modal-info h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          font-weight: 800;
        }
        .description {
          color: var(--text-light);
          margin-bottom: 2.5rem;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .modal-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(0, 180, 216, 0.05);
          border-radius: var(--radius-md);
          border: 1px solid rgba(0, 180, 216, 0.1);
        }
        .modal-price {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary-dark);
          font-family: 'Outfit', sans-serif;
        }

        .qty-selector-premium {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          box-shadow: var(--shadow-sm);
          border: 1px solid #f1f5f9;
        }
        .qty-selector-premium button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--primary-color);
          width: 30px;
          transition: 0.2s;
        }
        .qty-selector-premium button:hover { transform: scale(1.2); }
        .qty-selector-premium span {
          font-weight: 700;
          font-size: 1.2rem;
          width: 20px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .modal-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .modal-content { padding: 1.5rem; margin-top: 2rem; max-height: 90vh; overflow-y: auto; }
          .modal-info h1 { font-size: 1.8rem; }
          .modal-image { order: -1; }
        }
      `}</style>
    </AnimatePresence>
  );
}
