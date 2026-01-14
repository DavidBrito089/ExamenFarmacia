import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, cartItems, onRemove, onUpdateQty }) {
  const navigate = useNavigate();
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="cart-overlay-premium"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="cart-drawer-premium glass"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="cart-header-premium">
                <div className="title-group">
                  <span className="icon">🛒</span>
                  <h2>Tu Selección</h2>
                </div>
                <button className="btn-close-cart" onClick={onClose}>&times;</button>
              </div>

              <div className="cart-body-premium">
                {cartItems.length === 0 ? (
                  <div className="empty-cart-premium">
                    <div className="empty-icon">🛍️</div>
                    <p>Tu cesta está esperando ser llenada.</p>
                    <button className="btn btn-outline" onClick={onClose}>Explorar la tienda</button>
                  </div>
                ) : (
                  <div className="cart-items-list">
                    {cartItems.map(item => (
                      <div key={item.id} className="cart-item-premium">
                        <div className="item-img-premium">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-info-premium">
                          <h4>{item.name}</h4>
                          <span className="unit-price">${item.price.toFixed(2)} c/u</span>
                          <div className="item-controls-premium">
                            <div className="qty-pill">
                              <button onClick={() => onUpdateQty(item.id, -1)}>-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => onUpdateQty(item.id, 1)}>+</button>
                            </div>
                            <button className="remove-link" onClick={() => onRemove(item.id)}>Quitar</button>
                          </div>
                        </div>
                        <div className="item-subtotal-premium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="cart-footer-premium">
                  <div className="summary-card-inner">
                    <div className="summary-row">
                      <span>Subtotal estimado</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total de tu orden</span>
                      <span className="amount">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                    Finalizar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .cart-overlay-premium {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1500;
        }
        .cart-drawer-premium {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          background: rgba(255, 255, 255, 0.95);
          z-index: 1600;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .cart-header-premium {
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .title-group { display: flex; align-items: center; gap: 0.75rem; }
        .title-group .icon { font-size: 1.5rem; }
        .title-group h2 { font-size: 1.5rem; font-weight: 800; margin: 0; color: var(--primary-dark); }
        .btn-close-cart { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #94a3b8; line-height: 1; }

        .cart-body-premium { flex: 1; overflow-y: auto; padding: 2rem; }
        .empty-cart-premium { text-align: center; padding-top: 4rem; color: #64748b; }
        .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }

        .cart-item-premium {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .item-img-premium { width: 70px; height: 70px; border-radius: 12px; overflow: hidden; background: #f1f5f9; }
        .item-img-premium img { width: 100%; height: 100%; object-fit: cover; }
        
        .item-info-premium { flex: 1; }
        .item-info-premium h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .unit-price { font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 0.75rem; }
        
        .item-controls-premium { display: flex; align-items: center; gap: 1rem; }
        .qty-pill {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 50px;
        }
        .qty-pill button { background: none; border: none; padding: 5px 10px; cursor: pointer; font-weight: 700; color: var(--primary-dark); }
        .qty-pill span { min-width: 20px; text-align: center; font-weight: 700; }
        .remove-link { background: none; border: none; color: #f43f5e; font-size: 0.8rem; text-decoration: underline; cursor: pointer; }

        .item-subtotal-premium { font-weight: 800; color: var(--primary-dark); font-family: 'Outfit', sans-serif; font-size: 1.1rem; }

        .cart-footer-premium { padding: 2rem; background: #f8fafc; }
        .summary-card-inner { margin-bottom: 1.5rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; }
        .summary-row.total { color: var(--text-color); border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem; margin-top: 1rem; font-weight: 800; font-size: 1.25rem; }
        .summary-row.total .amount { color: var(--primary-color); }
      `}</style>
    </>
  );
}
