import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, cartItems, onRemove, onUpdateQty }) {
  const navigate = useNavigate();

  // Calculate price based on promotion type
  const calculateItemPrice = (item) => {
    const qty = item.quantity;
    const price = item.original_price || item.price;
    const promoType = item.promotion_type || 'percentage';
    const discountValue = item.discount_percent || 0;

    switch (promoType) {
      case '2x1':
        // Pay for half (rounded up)
        const payFor2x1 = Math.ceil(qty / 2);
        return {
          subtotal: payFor2x1 * price,
          savings: (qty - payFor2x1) * price,
          label: `🎁 2x1: Pagas ${payFor2x1}, llevas ${qty}`
        };

      case '3x2':
        // Pay for 2 out of every 3
        const sets3x2 = Math.floor(qty / 3);
        const remainder3x2 = qty % 3;
        const payFor3x2 = (sets3x2 * 2) + remainder3x2;
        return {
          subtotal: payFor3x2 * price,
          savings: (qty - payFor3x2) * price,
          label: `🎉 3x2: Pagas ${payFor3x2}, llevas ${qty}`
        };

      case 'second_unit':
        // Second unit discount
        if (qty >= 2) {
          const fullPriceUnits = Math.ceil(qty / 2);
          const discountedUnits = Math.floor(qty / 2);
          const discountedPrice = price * (1 - discountValue / 100);
          const subtotal = (fullPriceUnits * price) + (discountedUnits * discountedPrice);
          return {
            subtotal,
            savings: (qty * price) - subtotal,
            label: `✨ 2da unidad: -${discountValue}%`
          };
        }
        return { subtotal: qty * price, savings: 0, label: null };

      case 'fixed_price':
        return {
          subtotal: qty * discountValue,
          savings: qty * (price - discountValue),
          label: `💰 Precio especial: $${discountValue}`
        };

      case 'percentage':
      default:
        const discountedPrice = price * (1 - discountValue / 100);
        return {
          subtotal: qty * discountedPrice,
          savings: qty * (price - discountedPrice),
          label: discountValue > 0 ? `🏷️ -${discountValue}%` : null
        };
    }
  };

  // Calculate totals
  const cartCalculations = cartItems.map(item => ({
    ...item,
    ...calculateItemPrice(item)
  }));

  const subtotal = cartCalculations.reduce((acc, item) => acc + item.subtotal, 0);
  const totalSavings = cartCalculations.reduce((acc, item) => acc + item.savings, 0);

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
                    {cartCalculations.map(item => (
                      <div key={item.id} className="cart-item-premium">
                        <div className="item-img-premium">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-info-premium">
                          <h4>{item.name}</h4>
                          <span className="unit-price">${(item.original_price || item.price).toFixed(2)} c/u</span>
                          {item.label && <span className="promo-label">{item.label}</span>}
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
                          ${item.subtotal.toFixed(2)}
                          {item.savings > 0 && (
                            <span className="item-savings">Ahorras ${item.savings.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="cart-footer-premium">
                  <div className="summary-card-inner">
                    {totalSavings > 0 && (
                      <div className="summary-row savings">
                        <span>🎉 Tu ahorro total</span>
                        <span className="savings-amount">-${totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total de tu orden</span>
                      <span className="amount">${subtotal.toFixed(2)}</span>
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

        .item-subtotal-premium { 
          font-weight: 800; 
          color: var(--primary-dark); 
          font-family: 'Outfit', sans-serif; 
          font-size: 1.1rem; 
          text-align: right;
        }

        .promo-label {
          display: inline-block;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .item-savings {
          display: block;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .summary-row.savings {
          background: #ecfdf5;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .savings-amount {
          color: #10b981;
          font-weight: 700;
        }

        .cart-footer-premium { padding: 2rem; background: #f8fafc; }
        .summary-card-inner { margin-bottom: 1.5rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; }
        .summary-row.total { color: var(--text-color); border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem; margin-top: 1rem; font-weight: 800; font-size: 1.25rem; }
        .summary-row.total .amount { color: var(--primary-color); }
      `}</style>
    </>
  );
}
