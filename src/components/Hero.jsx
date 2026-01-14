import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function Hero({ onAddToCart }) {
  const [deals, setDeals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_daily_deal', true)
        .limit(5);
      if (data) setDeals(data);
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    if (deals.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [deals.length]);

  const currentDeal = deals[currentIndex];

  const handleAddToCart = () => {
    if (currentDeal && onAddToCart) {
      const discountedPrice = currentDeal.price * (1 - currentDeal.discount_percent / 100);
      onAddToCart({ ...currentDeal, price: discountedPrice });
    }
  };

  return (
    <section className="hero" id="deals">
      <div className="container hero-grid">
        <div className="hero-text animate-fade-up">
          <span className="hero-badge">🔥 Ofertas del Día</span>
          <h1>Descuentos <span className="gradient-text">Imperdibles</span></h1>
          <p>
            Aprovecha nuestras ofertas especiales. Productos de calidad farmacéutica al mejor precio del mercado.
          </p>
          <a href="#products" className="btn btn-outline">Ver Todo el Catálogo</a>
        </div>

        <div className="hero-deals">
          {currentDeal && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDeal.id}
                className="deal-spotlight glass"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <div className="discount-badge">-{currentDeal.discount_percent}%</div>
                <div className="deal-image">
                  <img src={currentDeal.image} alt={currentDeal.name} />
                </div>
                <div className="deal-info">
                  <span className="deal-category">{currentDeal.category}</span>
                  <h3>{currentDeal.name}</h3>
                  <p className="deal-desc">{currentDeal.description}</p>
                  <div className="deal-prices">
                    <span className="original">${Number(currentDeal.price).toFixed(2)}</span>
                    <span className="discounted">
                      ${(currentDeal.price * (1 - currentDeal.discount_percent / 100)).toFixed(2)}
                    </span>
                  </div>
                  <button className="btn btn-accent btn-add-deal" onClick={handleAddToCart}>
                    🛒 Agregar al Carrito
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Dots */}
          <div className="deal-dots">
            {deals.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%);
          padding: 7rem 0 4rem;
          min-height: 80vh;
          display: flex;
          align-items: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 4rem;
          align-items: center;
        }
        
        .hero-text { max-width: 500px; }
        .hero-badge {
          display: inline-block;
          background: var(--accent-color);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .hero-text h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-color);
          font-weight: 800;
        }
        .gradient-text {
          background: linear-gradient(135deg, #f72585 0%, #b5179e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-text p {
          font-size: 1.15rem;
          color: var(--text-light);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-deals {
          position: relative;
        }
        .deal-spotlight {
          position: relative;
          background: rgba(255,255,255,0.95);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2rem;
          align-items: center;
          box-shadow: 0 25px 50px rgba(247, 37, 133, 0.15);
        }
        .discount-badge {
          position: absolute;
          top: -15px;
          right: -15px;
          background: var(--accent-color);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.25rem;
          box-shadow: 0 8px 20px rgba(247, 37, 133, 0.4);
          z-index: 10;
        }
        .deal-image {
          background: #f8fafc;
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .deal-spotlight img {
          width: 100%;
          max-height: 220px;
          object-fit: contain;
        }
        .deal-category {
          color: var(--primary-color);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .deal-spotlight h3 {
          font-size: 1.5rem;
          margin: 0.5rem 0;
          color: var(--text-color);
          font-weight: 800;
        }
        .deal-desc {
          font-size: 0.95rem;
          color: var(--text-light);
          margin-bottom: 1rem;
        }
        .deal-prices {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .original {
          text-decoration: line-through;
          color: #94a3b8;
          font-size: 1.1rem;
        }
        .discounted {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--accent-color);
          font-family: 'Outfit', sans-serif;
        }
        .btn-add-deal {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
        }

        .deal-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fda4af;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .dot.active {
          background: var(--accent-color);
          width: 30px;
          border-radius: 10px;
        }

        @media (max-width: 968px) {
          .hero { padding: 6rem 0 3rem; min-height: auto; }
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-text { max-width: 100%; margin: 0 auto; }
          .hero-deals { margin-top: 2rem; }
          .deal-spotlight { grid-template-columns: 1fr; padding: 1.5rem; }
          .deal-image { margin-bottom: 1rem; }
        }
      `}</style>
    </section>
  );
}
