import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import QRPaymentModal from '../components/QRPaymentModal';

export default function Checkout({ cartItems, onClearCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, address')
          .eq('id', user.id)
          .single();

        if (data) {
          setShippingInfo(prev => ({
            ...prev,
            fullName: data.full_name || '',
            address: data.address || ''
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Debes iniciar sesión para completar tu compra premium.');
      return;
    }

    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      setError('Por favor completa todos los campos de envío.');
      return;
    }

    // Generate a temporary order ID for the QR
    const tempOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setPendingOrderId(tempOrderId);
    setShowQRModal(true);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setShowQRModal(false);

    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total.toFixed(2),
        items_json: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shipping_address: `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}. Tel: ${shippingInfo.phone}`,
        status: 'paid'
      });

    if (insertError) {
      setError('Error al procesar tu pedido: ' + insertError.message);
      setLoading(false);
      return;
    }

    onClearCart();
    navigate('/profile');
  };

  return (
    <div className="checkout-page-premium">
      <div className="container">
        <motion.div
          className="checkout-header-premium"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Finalizar Compra <span className="highlight">Premium</span></h1>
          <p>Confirma tus detalles para la entrega exclusiva.</p>
        </motion.div>

        <div className="checkout-grid-premium">
          <motion.div
            className="checkout-form-main glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>📝 Detalles de Entrega</h2>

            {error && <div className="error-box-premium">{error}</div>}

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group-premium">
                <label>Nombre Completo</label>
                <input
                  name="fullName"
                  required
                  value={shippingInfo.fullName}
                  onChange={handleChange}
                  placeholder="Ej. Alexander Pierce"
                />
              </div>

              <div className="form-group-premium">
                <label>Dirección de Envío</label>
                <input
                  name="address"
                  required
                  value={shippingInfo.address}
                  onChange={handleChange}
                  placeholder="Calle, Edificio, Apto..."
                />
              </div>

              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>Ciudad</label>
                  <input name="city" required value={shippingInfo.city} onChange={handleChange} placeholder="Ciudad" />
                </div>
                <div className="form-group-premium">
                  <label>Teléfono</label>
                  <input name="phone" required value={shippingInfo.phone} onChange={handleChange} placeholder="+593 ..." />
                </div>
              </div>

              <div className="payment-method-box">
                <div className="payment-method-header">
                  <span className="payment-icon">💳</span>
                  <div>
                    <h4>Pago con Deuna QR</h4>
                    <p>Escanea y paga desde tu app bancaria</p>
                  </div>
                </div>
                <div className="payment-badge">Recomendado</div>
              </div>

              <button className="btn btn-deuna btn-block btn-xl" disabled={loading}>
                {loading ? 'Procesando...' : `Pagar con Deuna — $${total.toFixed(2)}`}
              </button>
            </form>
          </motion.div>

          <motion.div
            className="checkout-summary-sidebar glass"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Resumen del Pedido</h3>
            <div className="summary-list-premium">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item-premium">
                  <div className="summary-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="summary-item-text">
                    <p className="name">{item.name}</p>
                    <p className="qty">Cant: {item.quantity}</p>
                  </div>
                  <span className="subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="grand-total-box">
              <div className="total-line">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Envío Premium</span>
                <span className="free">Gratis</span>
              </div>
              <div className="total-line final">
                <span>Total Final</span>
                <span className="amount">${total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        orderData={{
          orderId: pendingOrderId,
          total: total,
          items: cartItems
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <style>{`
        .checkout-page-premium { padding: 8rem 0 6rem; background: #f8fafc; min-height: 100vh; }
        .checkout-header-premium { text-align: center; margin-bottom: 4rem; }
        .checkout-header-premium h1 { font-size: 3rem; font-weight: 800; letter-spacing: -1px; }
        .checkout-header-premium .highlight { color: var(--primary-color); }
        .checkout-header-premium p { color: var(--text-light); font-size: 1.25rem; }

        .checkout-grid-premium { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; align-items: start; }
        .checkout-form-main, .checkout-summary-sidebar { padding: 3rem; border-radius: var(--radius-lg); }
        .checkout-form-main h2 { margin-bottom: 2rem; font-size: 1.75rem; color: var(--primary-dark); }

        .error-box-premium {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .form-group-premium { margin-bottom: 1.5rem; }
        .form-group-premium label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.6rem; color: var(--text-color); }
        .form-group-premium input { width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; transition: 0.3s; }
        .form-group-premium input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.1); background: white; }
        
        .form-row-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

        .payment-method-box {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 1.5rem;
          border-radius: 16px;
          margin: 2rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .payment-method-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .payment-icon {
          font-size: 2rem;
        }

        .payment-method-header h4 {
          color: white;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .payment-method-header p {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .payment-badge {
          background: linear-gradient(90deg, #00d4aa, #00b4d8);
          color: #1a1a2e;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
        }

        .btn-deuna {
          background: linear-gradient(90deg, #00d4aa, #00b4d8) !important;
          color: #1a1a2e !important;
          font-weight: 800;
          border: none;
        }

        .btn-deuna:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3);
        }

        .btn-xl { font-size: 1.25rem; padding: 1.25rem; }

        .summary-list-premium { margin-bottom: 2rem; }
        .summary-item-premium { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
        .summary-item-img { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; }
        .summary-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .summary-item-text { flex: 1; }
        .summary-item-text .name { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem; }
        .summary-item-text .qty { font-size: 0.8rem; color: #94a3b8; }
        .summary-item-premium .subtotal { font-weight: 800; font-family: 'Outfit'; }

        .grand-total-box { border-top: 2px solid #f1f5f9; padding-top: 2rem; }
        .total-line { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; }
        .total-line.final { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; font-weight: 800; font-size: 1.5rem; color: var(--text-color); }
        .total-line .amount { color: var(--primary-color); }
        .free { color: #10b981; font-weight: 700; }

        @media (max-width: 968px) { .checkout-grid-premium { grid-template-columns: 1fr; } .checkout-header-premium h1 { font-size: 2rem; } }
      `}</style>
    </div>
  );
}

