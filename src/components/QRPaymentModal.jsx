import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRPaymentModal({ isOpen, onClose, orderData, onPaymentSuccess }) {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [dots, setDots] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (paymentStatus === 'pending') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [paymentStatus]);

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 2000);
  };

  const handleOpenPaymentLink = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 3000);
  };

  if (!isOpen) return null;

  const qrData = JSON.stringify({
    merchant: 'Farmared88',
    orderId: orderData.orderId,
    amount: orderData.total,
    currency: 'USD',
    description: `Pedido #${orderData.orderId}`
  });

  return (
    <AnimatePresence>
      <motion.div
        className="qr-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="qr-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="qr-modal-header">
            <div className="deuna-logo">
              <span className="logo-icon">💳</span>
              <span className="logo-text">Deuna</span>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {paymentStatus === 'success' ? (
            <motion.div
              className="payment-success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div className="success-icon">✓</div>
              <h2>¡Pago Exitoso!</h2>
              <p>Tu pedido ha sido procesado</p>
            </motion.div>
          ) : (
            <>
              <div className="qr-modal-body">
                <h2>{isMobile ? 'Pagar con Deuna' : 'Escanea para pagar'}</h2>
                <p className="amount-display">
                  <span className="currency">$</span>
                  <span className="value">{orderData.total.toFixed(2)}</span>
                </p>

                {isMobile ? (
                  <div className="mobile-payment-section">
                    <div className="mobile-payment-icon">
                      <span>📱</span>
                    </div>
                    <p className="mobile-instruction">
                      Toca el botón para abrir la app de Deuna y completar tu pago de forma segura.
                    </p>
                    <button
                      className="btn-open-deuna"
                      onClick={handleOpenPaymentLink}
                      disabled={paymentStatus === 'processing'}
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <span className="spinner"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <span className="deuna-btn-icon">💳</span>
                          Abrir Deuna para Pagar
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="qr-container">
                    <div className="qr-frame">
                      <QRCodeSVG
                        value={qrData}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#1a1a2e"
                      />
                    </div>
                    <div className="qr-corners">
                      <span className="corner top-left"></span>
                      <span className="corner top-right"></span>
                      <span className="corner bottom-left"></span>
                      <span className="corner bottom-right"></span>
                    </div>
                  </div>
                )}

                <p className="waiting-text">
                  {paymentStatus === 'processing'
                    ? 'Procesando pago...'
                    : isMobile
                      ? 'Listo para pagar'
                      : `Esperando pago${dots}`}
                </p>

                <div className="order-details">
                  <div className="detail-row">
                    <span>Pedido</span>
                    <span>#{orderData.orderId}</span>
                  </div>
                  <div className="detail-row">
                    <span>Comercio</span>
                    <span>Farmared 88</span>
                  </div>
                </div>
              </div>

              <div className="qr-modal-footer">
                <p className="demo-notice">🎭 Modo Demostración</p>
                {!isMobile && (
                  <button
                    className="btn-simulate"
                    onClick={handleSimulatePayment}
                    disabled={paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? (
                      <span className="spinner"></span>
                    ) : (
                      '✓ Simular Pago Exitoso'
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>

        <style>{`
          .qr-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
          }
          .qr-modal-content {
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 24px;
            width: 100%;
            max-width: 400px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          }
          .qr-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .deuna-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .logo-icon { font-size: 1.5rem; }
          .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(90deg, #00d4aa, #00b4d8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 1rem;
            cursor: pointer;
            transition: 0.3s;
          }
          .close-btn:hover { background: rgba(255, 255, 255, 0.2); }
          .qr-modal-body {
            padding: 2rem;
            text-align: center;
          }
          .qr-modal-body h2 {
            color: white;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .amount-display { margin-bottom: 1.5rem; }
          .amount-display .currency {
            font-size: 1.5rem;
            color: #00d4aa;
            font-weight: 700;
          }
          .amount-display .value {
            font-size: 3rem;
            font-weight: 800;
            color: white;
            font-family: 'Outfit', sans-serif;
          }
          .mobile-payment-section { margin-bottom: 1.5rem; }
          .mobile-payment-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 180, 216, 0.2));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
          }
          .mobile-instruction {
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
            padding: 0 1rem;
          }
          .btn-open-deuna {
            width: 100%;
            padding: 1.25rem 2rem;
            background: linear-gradient(90deg, #00d4aa, #00b4d8);
            border: none;
            border-radius: 16px;
            color: #1a1a2e;
            font-size: 1.1rem;
            font-weight: 800;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }
          .btn-open-deuna:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(0, 212, 170, 0.4);
          }
          .btn-open-deuna:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .deuna-btn-icon { font-size: 1.5rem; }
          .qr-container {
            position: relative;
            display: inline-block;
            margin-bottom: 1.5rem;
          }
          .qr-frame {
            background: white;
            padding: 12px;
            border-radius: 16px;
          }
          .qr-corners {
            position: absolute;
            inset: -8px;
            pointer-events: none;
          }
          .corner {
            position: absolute;
            width: 24px;
            height: 24px;
            border: 3px solid #00d4aa;
          }
          .corner.top-left {
            top: 0; left: 0;
            border-right: none; border-bottom: none;
            border-radius: 8px 0 0 0;
          }
          .corner.top-right {
            top: 0; right: 0;
            border-left: none; border-bottom: none;
            border-radius: 0 8px 0 0;
          }
          .corner.bottom-left {
            bottom: 0; left: 0;
            border-right: none; border-top: none;
            border-radius: 0 0 0 8px;
          }
          .corner.bottom-right {
            bottom: 0; right: 0;
            border-left: none; border-top: none;
            border-radius: 0 0 8px 0;
          }
          .waiting-text {
            color: #94a3b8;
            font-size: 0.95rem;
            min-width: 140px;
            margin-bottom: 1.5rem;
          }
          .order-details {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1rem;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            padding: 0.5rem 0;
          }
          .detail-row + .detail-row {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .detail-row span:last-child {
            color: white;
            font-weight: 600;
          }
          .qr-modal-footer {
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            text-align: center;
          }
          .demo-notice {
            color: #fbbf24;
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }
          .btn-simulate {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(90deg, #00d4aa, #00b4d8);
            border: none;
            border-radius: 12px;
            color: #1a1a2e;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .btn-simulate:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3);
          }
          .btn-simulate:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid transparent;
            border-top-color: #1a1a2e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .payment-success {
            padding: 4rem 2rem;
            text-align: center;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #00d4aa, #00b4d8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: white;
            margin: 0 auto 1.5rem;
          }
          .payment-success h2 {
            color: white;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
          }
          .payment-success p { color: #94a3b8; }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
