import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DealsCarousel({ products, onAddToCart }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);

    // Filter only daily deals
    const deals = products.filter(p => p.is_daily_deal || p.discount_percent > 0);

    // Auto-advance carousel
    useEffect(() => {
        if (deals.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % deals.length);
            }, 5000);
        }
        return () => clearInterval(intervalRef.current);
    }, [deals.length]);

    const goTo = (index) => {
        setCurrentIndex(index);
        // Reset timer on manual navigation
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % deals.length);
        }, 5000);
    };

    const prevSlide = () => goTo((currentIndex - 1 + deals.length) % deals.length);
    const nextSlide = () => goTo((currentIndex + 1) % deals.length);

    if (deals.length === 0) return null;

    const currentDeal = deals[currentIndex];
    const originalPrice = currentDeal.price;
    const discountedPrice = originalPrice * (1 - (currentDeal.discount_percent || 0) / 100);

    return (
        <section className="deals-section">
            <div className="container">
                <div className="section-header-deals">
                    <span className="deals-badge">🔥 OFERTAS DEL DÍA</span>
                    <h2>Descuentos que No Puedes Perder</h2>
                </div>

                <div className="carousel-container glass">
                    <button className="carousel-btn prev" onClick={prevSlide}>‹</button>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDeal.id}
                            className="deal-card"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="deal-image">
                                <img src={currentDeal.image} alt={currentDeal.name} />
                                <div className="discount-tag">-{currentDeal.discount_percent || 0}%</div>
                            </div>

                            <div className="deal-info">
                                <span className="deal-category">{currentDeal.category}</span>
                                <h3>{currentDeal.name}</h3>
                                <p className="deal-description">{currentDeal.description}</p>

                                <div className="deal-pricing">
                                    <span className="original-price">${originalPrice.toFixed(2)}</span>
                                    <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
                                </div>

                                <div className="deal-timer">
                                    <span>⏰ Oferta válida hoy</span>
                                </div>

                                <button
                                    className="btn btn-accent btn-deal"
                                    onClick={() => onAddToCart({ ...currentDeal, price: discountedPrice })}
                                >
                                    Agregar al Carrito
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button className="carousel-btn next" onClick={nextSlide}>›</button>
                </div>

                {/* Dots indicator */}
                <div className="carousel-dots">
                    {deals.map((_, idx) => (
                        <button
                            key={idx}
                            className={`dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => goTo(idx)}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        .deals-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #fff8f0 0%, #fef2f2 100%);
          margin-bottom: 4rem;
        }
        .section-header-deals {
          text-align: center;
          margin-bottom: 3rem;
        }
        .deals-badge {
          display: inline-block;
          background: var(--accent-color);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .section-header-deals h2 {
          font-size: 2.5rem;
          color: var(--primary-dark);
          font-weight: 800;
        }

        .carousel-container {
          position: relative;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.9);
          overflow: hidden;
        }
        
        .deal-card {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
          align-items: center;
        }
        
        .deal-image {
          position: relative;
        }
        .deal-image img {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: var(--radius-md);
        }
        .discount-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--accent-color);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 800;
          font-size: 1.25rem;
          box-shadow: 0 4px 15px rgba(247, 37, 133, 0.3);
        }
        
        .deal-info {
          padding: 1rem 0;
        }
        .deal-category {
          color: var(--primary-color);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        .deal-info h3 {
          font-size: 2rem;
          margin: 0.5rem 0 1rem;
          color: var(--primary-dark);
          font-weight: 800;
        }
        .deal-description {
          color: var(--text-light);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        
        .deal-pricing {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .original-price {
          text-decoration: line-through;
          color: #94a3b8;
          font-size: 1.25rem;
        }
        .discounted-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--accent-color);
          font-family: 'Outfit', sans-serif;
        }
        
        .deal-timer {
          background: #fef3c7;
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 600;
          color: #92400e;
        }
        
        .btn-deal {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10;
          box-shadow: var(--shadow-md);
          transition: 0.3s;
          color: var(--primary-dark);
        }
        .carousel-btn:hover {
          background: var(--primary-color);
          color: white;
        }
        .carousel-btn.prev { left: 1rem; }
        .carousel-btn.next { right: 1rem; }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .dot.active {
          background: var(--accent-color);
          width: 30px;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .deal-card {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
          .deal-info h3 { font-size: 1.5rem; }
          .discounted-price { font-size: 2rem; }
          .carousel-btn { display: none; }
        }
      `}</style>
        </section>
    );
}
