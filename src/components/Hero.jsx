import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function Hero({ onAddToCart }) {
  const [deals, setDeals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState('today'); // 'today' or 'tomorrow'
  const intervalRef = useRef(null);

  const getDayName = (dayNum) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNum];
  };

  useEffect(() => {
    const fetchDeals = async () => {
      // Fetch active discount rules
      const { data: rules } = await supabase
        .from('discount_rules')
        .select('*')
        .eq('is_active', true);

      // Get target day (today or tomorrow)
      const today = new Date().getDay();
      const targetDay = selectedDay === 'today' ? today : (today + 1) % 7;

      // Find categories with discounts for target day
      const targetRules = (rules || []).filter(rule => rule.days_of_week?.includes(targetDay));


      if (targetRules.length > 0) {
        // Get products from those categories
        const categories = [...new Set(targetRules.map(r => r.category))];
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('category', categories)
          .limit(5);

        // Apply discounts from rules to products
        const dealsWithDiscount = (products || []).map(product => {
          const matchingRule = targetRules.find(r => r.category === product.category);
          return {
            ...product,
            discount_percent: matchingRule?.discount_percent || 0,
            rule_name: matchingRule?.name || '',
            promotion_type: matchingRule?.promotion_type || 'percentage'
          };
        });

        setDeals(dealsWithDiscount);
        setCurrentIndex(0);
      } else {
        setDeals([]);
      }
    };
    fetchDeals();
  }, [selectedDay]);

  useEffect(() => {
    if (deals.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [deals.length]);

  const currentDeal = deals[currentIndex];
  const today = new Date().getDay();
  const targetDayName = selectedDay === 'today' ? getDayName(today) : getDayName((today + 1) % 7);

  const handleAddToCart = () => {
    if (currentDeal && onAddToCart) {
      const discountedPrice = currentDeal.price * (1 - currentDeal.discount_percent / 100);
      onAddToCart({ ...currentDeal, price: discountedPrice });
    }
  };

  // Helper to get promotion type label
  const getPromotionLabel = (type, value) => {
    const types = {
      'percentage': { icon: '🏷️', label: `-${value}%` },
      '2x1': { icon: '🎁', label: '2x1' },
      'second_unit': { icon: '✨', label: `2da -${value}%` },
      '3x2': { icon: '🎉', label: '3x2' },
      'fixed_price': { icon: '💰', label: `$${value}` }
    };
    return types[type] || types['percentage'];
  };

  return (
    <section className="hero" id="deals">
      <div className="container hero-grid">
        <div className="hero-text animate-fade-up">
          <div className="day-selector">
            <button
              className={`day-btn ${selectedDay === 'today' ? 'active' : ''}`}
              onClick={() => setSelectedDay('today')}
            >
              🔥 Hoy
            </button>
            <button
              className={`day-btn ${selectedDay === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setSelectedDay('tomorrow')}
            >
              📅 Mañana
            </button>
          </div>
          <span className="hero-badge">
            {selectedDay === 'today' ? '🔥' : '📅'} Ofertas {selectedDay === 'today' ? 'del Día' : 'de Mañana'} - {targetDayName}
          </span>
          <h1>Descuentos <span className="gradient-text">Imperdibles</span></h1>
          <p>
            {selectedDay === 'today'
              ? 'Aprovecha nuestras ofertas especiales de hoy.'
              : 'Prepárate para las ofertas de mañana.'}
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
                <div className={`promo-badge promo-${currentDeal.promotion_type}`}>
                  {getPromotionLabel(currentDeal.promotion_type, currentDeal.discount_percent).icon}
                  {' '}
                  {getPromotionLabel(currentDeal.promotion_type, currentDeal.discount_percent).label}
                </div>
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
                  {selectedDay === 'today' && (
                    <button className="btn btn-accent btn-add-deal" onClick={handleAddToCart}>
                      🛒 Agregar al Carrito
                    </button>
                  )}
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
        .promo-badge {
          position: absolute;
          top: -15px;
          right: -15px;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.25rem;
          box-shadow: 0 8px 20px rgba(247, 37, 133, 0.4);
          z-index: 10;
        }
        .promo-percentage { background: linear-gradient(135deg, #dc2626, #ef4444); }
        .promo-2x1 { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .promo-second_unit { background: linear-gradient(135deg, #059669, #10b981); }
        .promo-3x2 { background: linear-gradient(135deg, #ea580c, #f97316); }
        .promo-fixed_price { background: linear-gradient(135deg, #0284c7, #0ea5e9); }
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

        .day-selector {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .day-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #f472b6;
          background: white;
          color: #ec4899;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .day-btn:hover {
          background: #fdf2f8;
        }

        .day-btn.active {
          background: linear-gradient(135deg, #ec4899, #f472b6);
          color: white;
          border-color: #ec4899;
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
