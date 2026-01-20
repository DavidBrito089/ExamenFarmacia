import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import QRPaymentModal from '../components/QRPaymentModal';
import LocationPicker from '../components/LocationPicker';

export default function Checkout({ cartItems, onClearCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
  const [coordinates, setCoordinates] = useState(null); // { lat, lng }
  const [showMap, setShowMap] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: 'Quito', // Default to Quito
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [shippingCost, setShippingCost] = useState(0);

  // Store Location: Jardín del Valle (Abelardo Flores E20-70)
  const STORE_LOCATION = { lat: -0.2246, lng: -78.4975 };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Update shipping cost when coordinates change
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setShippingCost(0);
      return;
    }

    // Free shipping for orders over $50
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // Note: We use calculated subtotal below, but for free shipping check we use raw or calculated?
    // Let's use calculated Total. We'll check this inside the main component flow or pass it.
    // For now, let's use a simpler check or wait for 'total' variable which is dependent on cartCalculations.
    // Actually, 'total' is derived below. Let's move this effect or use cartCalculations dependency.
  }, [deliveryMethod, coordinates]);

  // Estimated time calculation
  const getEstimatedTime = () => {
    if (deliveryMethod === 'pickup') return '15-20 minutos (Listo para retirar)';
    return '30-45 minutos';
  };

  // Calculate price based on promotion type
  const calculateItemPrice = (item) => {
    const qty = item.quantity;
    const price = item.original_price || item.price;
    const promoType = item.promotion_type || 'percentage';
    const discountValue = item.discount_percent || 0;

    switch (promoType) {
      case '2x1':
        const payFor2x1 = Math.ceil(qty / 2);
        return { subtotal: payFor2x1 * price, savings: (qty - payFor2x1) * price };

      case '3x2':
        const sets3x2 = Math.floor(qty / 3);
        const remainder3x2 = qty % 3;
        const payFor3x2 = (sets3x2 * 2) + remainder3x2;
        return { subtotal: payFor3x2 * price, savings: (qty - payFor3x2) * price };

      case 'second_unit':
        if (qty >= 2) {
          const fullPriceUnits = Math.ceil(qty / 2);
          const discountedUnits = Math.floor(qty / 2);
          const discountedPrice = price * (1 - discountValue / 100);
          const subtotal = (fullPriceUnits * price) + (discountedUnits * discountedPrice);
          return { subtotal, savings: (qty * price) - subtotal };
        }
        return { subtotal: qty * price, savings: 0 };

      case 'fixed_price':
        return { subtotal: qty * discountValue, savings: qty * (price - discountValue) };

      case 'percentage':
      default:
        const discountedPrice = price * (1 - discountValue / 100);
        return { subtotal: qty * discountedPrice, savings: qty * (price - discountedPrice) };
    }
  };

  const cartCalculations = cartItems.map(item => ({
    ...item,
    ...calculateItemPrice(item)
  }));

  const subtotalBeforeShipping = cartCalculations.reduce((acc, item) => acc + item.subtotal, 0);
  const totalSavings = cartCalculations.reduce((acc, item) => acc + item.savings, 0);

  // Calculate final total including shipping
  const total = subtotalBeforeShipping + shippingCost;

  // Recalculate shipping cost when dependencies change
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setShippingCost(0);
      return;
    }

    if (subtotalBeforeShipping >= 50) {
      setShippingCost(0);
      return;
    }

    if (!coordinates) {
      setShippingCost(2.50); // Default base cost if no location selected yet
      return;
    }

    const dist = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, coordinates.lat, coordinates.lng);
    // Base $1.50 + $0.50 per km
    let cost = 1.50 + (dist * 0.50);
    // Max cap $10.00
    if (cost > 10) cost = 10;

    setShippingCost(parseFloat(cost.toFixed(2)));
  }, [deliveryMethod, coordinates, subtotalBeforeShipping]);

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

    if (deliveryMethod === 'delivery') {
      if (shippingInfo.city.trim().toLowerCase() !== 'quito') {
        setError('Lo sentimos, los envíos a domicilio solo están disponibles en Quito.');
        return;
      }
      if (!shippingInfo.address) {
        setError('Por favor ingresa tu dirección de envío.');
        return;
      }
      if (!coordinates) {
        setError('Por favor utiliza el mapa para confirmar tu ubicación exacta y calcular el envío.');
        return;
      }
    }

    if (!shippingInfo.fullName || !shippingInfo.phone) {
      setError('Por favor completa tu nombre y teléfono.');
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

    let finalAddress = '';
    if (deliveryMethod === 'pickup') {
      finalAddress = `RETIRO EN TIENDA - Cliente: ${shippingInfo.fullName}, Tel: ${shippingInfo.phone}`;
    } else {
      const coordString = coordinates ? `(Lat: ${coordinates.lat.toFixed(5)}, Lng: ${coordinates.lng.toFixed(5)})` : '';
      finalAddress = `ENVÍO ($${shippingInfo.address}) - ${shippingInfo.address} ${coordString}, ${shippingInfo.city}. Tel: ${shippingInfo.phone}`;
    }

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
        shipping_address: finalAddress,
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
              {/* Delivery Method Toggle */}
              <div className="delivery-method-toggle">
                <button
                  type="button"
                  className={`method-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  <span className="icon">🛵</span>
                  <div className="text">
                    <span className="label">Envío a Domicilio</span>
                    <span className="sub">Recibe en tu puerta</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`method-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <span className="icon">🏪</span>
                  <div className="text">
                    <span className="label">Retiro en Tienda</span>
                    <span className="sub">Pasa a recoger</span>
                  </div>
                </button>
              </div>

              {/* Estimated Time Box */}
              <div className="estimated-time-box">
                <span className="icon">⏱️</span>
                <div className="time-info">
                  <span className="label">Tiempo Estimado</span>
                  <span className="value">{getEstimatedTime()}</span>
                </div>
              </div>

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

              {deliveryMethod === 'delivery' ? (
                <>
                  <div className="form-group-premium">
                    <label>Dirección de Envío</label>
                    <div className="address-input-wrapper">
                      <input
                        name="address"
                        required
                        value={shippingInfo.address}
                        onChange={handleChange}
                        placeholder="Calle, Edificio, Apto..."
                      />
                      <button
                        type="button"
                        className="btn-map-toggle"
                        onClick={() => setShowMap(!showMap)}
                      >
                        {showMap ? 'Ocultar Mapa' : '📍 Ubicar en Mapa'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showMap && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="map-wrapper"
                      >
                        <LocationPicker position={coordinates} setPosition={setCoordinates} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="form-row-premium">
                    <div className="form-group-premium">
                      <label>Ciudad</label>
                      <input
                        name="city"
                        required
                        value={shippingInfo.city}
                        onChange={handleChange}
                        placeholder="Solo disponible en Quito"
                        readOnly={true} // Enforce Quito visually as well? Or allow typing but validate? Plan said enforce validation. Let's make it readOnly for better UX if strictly Quito.
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#64748b', fontSize: '0.8rem' }}>* Solo disponible en Quito</small>
                    </div>
                    <div className="form-group-premium">
                      <label>Teléfono</label>
                      <input name="phone" required value={shippingInfo.phone} onChange={handleChange} placeholder="+593 ..." />
                    </div>
                  </div>
                </>
              ) : (
                <div className="pickup-info-box">
                  <h4>📍 Dirección de la Farmacia</h4>
                  <p>Jardín del Valle, en la calle Abelardo Flores E20-70 y Cristóbal Troya.</p>
                  <p className="hours">Horario: 8:00 AM - 9:00 PM</p>

                  <div className="form-group-premium" style={{ marginTop: '1rem' }}>
                    <label>Teléfono de Contacto</label>
                    <input name="phone" required value={shippingInfo.phone} onChange={handleChange} placeholder="+593 ..." />
                  </div>
                </div>
              )}

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
              {cartCalculations.map(item => (
                <div key={item.id} className="summary-item-premium">
                  <div className="summary-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="summary-item-text">
                    <p className="name">{item.name}</p>
                    <p className="qty">Cant: {item.quantity}</p>
                    {item.savings > 0 && (
                      <p className="promo-tag">{item.promotion_type === '2x1' ? '🎁 2x1' : item.promotion_type === '3x2' ? '🎉 3x2' : '🏷️ Promo'}</p>
                    )}
                  </div>
                  <div className="subtotal-col">
                    <span className="subtotal">${item.subtotal.toFixed(2)}</span>
                    {item.savings > 0 && <span className="item-save">-${item.savings.toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grand-total-box">
              {totalSavings > 0 && (
                <div className="total-line savings-line">
                  <span>🎉 Tu ahorro</span>
                  <span className="savings-val">-${totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="total-line">
                <span>Método de Entrega</span>
                <span className="method-val">{deliveryMethod === 'delivery' ? '🛵 Domicilio' : '🏪 Retiro'}</span>
              </div>
              <div className="total-line">
                <span>Costo de Envío</span>
                {deliveryMethod === 'delivery' ? (
                  subtotalBeforeShipping >= 50 ? (
                    <span className="free">Gratis (Orden &gt; $50)</span>
                  ) : shippingCost > 0 ? (
                    <span className="shipping-cost">${shippingCost.toFixed(2)}</span>
                  ) : (
                    <span className="calculating">...</span>
                  )
                ) : (
                  <span className="free">Gratis</span>
                )}
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

        .delivery-method-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .method-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
        }

        .method-btn:hover { border-color: #cbd5e1; }
        .method-btn.active { border-color: var(--primary-color); background: #f0f9ff; }
        .method-btn .icon { font-size: 1.5rem; }
        
        .method-btn .text { display: flex; flex-direction: column; }
        .method-btn .label { font-weight: 700; color: var(--text-color); }
        .method-btn .sub { font-size: 0.8rem; color: #64748b; }

        .estimated-time-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border-left: 4px solid var(--primary-color);
        }
        .estimated-time-box .icon { font-size: 1.5rem; }
        .time-info { display: flex; flex-direction: column; }
        .time-info .label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .time-info .value { font-weight: 700; color: var(--text-color); }

        .form-group-premium { margin-bottom: 1.5rem; }
        .form-group-premium label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.6rem; color: var(--text-color); }
        .form-group-premium input { width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; transition: 0.3s; }
        .form-group-premium input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.1); background: white; }
        
        .address-input-wrapper { display: flex; gap: 0.5rem; }
        .btn-map-toggle {
          white-space: nowrap;
          padding: 0 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          color: var(--primary-color);
        }
        .btn-map-toggle:hover { background: #f0f9ff; border-color: var(--primary-color); }

        .pickup-info-box {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }
        .pickup-info-box h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--primary-dark); }
        .pickup-info-box p { margin: 0; color: #64748b; font-size: 0.95rem; line-height: 1.5; }
        .pickup-info-box .hours { margin-top: 0.5rem; font-weight: 600; color: var(--primary-color); }

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

        .payment-icon { font-size: 2rem; }

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

        .promo-tag {
          display: inline-block;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .subtotal-col { text-align: right; }

        .item-save {
          display: block;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .savings-line {
          background: #ecfdf5;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .savings-val { color: #10b981; font-weight: 700; }
        .method-val { font-weight: 600; color: var(--primary-dark); }

        @media (max-width: 968px) { .checkout-grid-premium { grid-template-columns: 1fr; } .checkout-header-premium h1 { font-size: 2rem; } }
      `}</style>
    </div>
  );
}

