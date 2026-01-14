import { motion } from 'framer-motion';

export default function ProductCard({ product, onOpen, onAdd }) {
  const { name, category, image, price, description, discount_percent } = product;

  const hasDiscount = discount_percent && discount_percent > 0;
  const discountedPrice = hasDiscount ? price * (1 - discount_percent / 100) : price;

  return (
    <motion.div
      className="product-card glass"
      whileHover={{ y: -10, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onOpen}
    >
      <div className="card-image-wrapper">
        <img src={image} alt={name} loading="lazy" />
        {hasDiscount && (
          <div className="pc-discount-badge">-{discount_percent}%</div>
        )}
        <div className="category-tag">{category}</div>
      </div>

      <div className="card-info">
        <h3>{name}</h3>
        <p className="card-description">{description}</p>

        <div className="card-footer">
          <div className="price-wrapper">
            {hasDiscount ? (
              <div className="price-stack">
                <div className="price-row">
                  <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
                  <span className="savings-badge">-{discount_percent}%</span>
                </div>
                <span className="original-price">${price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="price">${price.toFixed(2)}</span>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onAdd({ ...product, price: discountedPrice });
            }}
          >
            Agregar
          </button>
        </div>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .product-card:hover {
          border-color: transparent;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-5px);
        }
        
        .card-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f8fafc;
        }
        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover .card-image-wrapper img {
          transform: scale(1.05);
        }

        .pc-discount-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #dc2626;
          color: white;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
          z-index: 2;
          width: fit-content;
        }
        
        .category-tag {
          display: none; /* Hidden based on the mockup */
        }

        .card-info {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .card-info h3 {
          font-size: 1.25rem;
          color: #1e293b;
          font-weight: 800;
          margin: 0;
          line-height: tight;
        }
        
        .card-description {
          font-size: 0.95rem;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
          border: none;
        }

        .price-wrapper {
          display: flex;
          flex-direction: column;
        }

        .price-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          font-family: 'Outfit', sans-serif;
        }

        .original-price {
          font-size: 0.95rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 500;
        }

        .discounted-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #dc2626;
          font-family: 'Outfit', sans-serif;
        }

        .savings-badge {
          font-size: 0.75rem;
          background-color: #fee2e2;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        .product-card .btn-primary {
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          border-radius: 9999px;
          background: #0284c7; /* A solid blue matching the mockup */
          border: none;
          color: white;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .product-card .btn-primary:hover {
          background: #0369a1;
          box-shadow: 0 4px 6px rgba(2, 132, 199, 0.3);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .card-image-wrapper { height: 160px; }
          .card-info { padding: 1rem; }
          .card-info h3 { font-size: 1.1rem; }
          /* Keep description hidden on mobile if preferred, or show it */
          .card-description { font-size: 0.85rem; -webkit-line-clamp: 2; display: -webkit-box; }
          .discounted-price { font-size: 1.25rem; }
          .original-price { font-size: 0.85rem; }
          .savings-badge { font-size: 0.7rem; }
          .product-card .btn-primary { 
            padding: 0.5rem 1rem; 
            font-size: 0.85rem; 
          }
          .pc-discount-badge {
            font-size: 0.75rem;
            padding: 4px 10px;
            top: 10px;
            left: 10px;
          }
        }
      `}</style>
    </motion.div>
  );
}
