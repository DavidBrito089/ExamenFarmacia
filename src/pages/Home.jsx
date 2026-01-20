import { useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function Home({ products, allProducts, liquidationProducts = [], loading, addToCart, selectedCategory, onClearCategory }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <span className="loader-icon">💊</span>
          <p>Cargando productos...</p>
        </div>
        <style>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
          }
          .loader {
            text-align: center;
          }
          .loader-icon {
            font-size: 4rem;
            display: block;
            animation: bounce 1s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .loader p {
            margin-top: 1rem;
            color: var(--text-light);
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-page-premium">
      <Hero onAddToCart={addToCart} />

      <main className="container main-catalog" id="products">

        {selectedCategory && (
          <div className="filter-status-premium glass">
            <span>Explorando la categoría: <strong className="gradient-text">{selectedCategory}</strong></span>
            <button className="btn-clear-premium" onClick={onClearCategory}>
              Ver Todo el Catálogo
            </button>
          </div>
        )}

        {products.length === 0 ? (
          <div className="no-results-premium glass">
            <div className="no-results-icon">🔍</div>
            <h3>No encontramos lo que buscas</h3>
            <p>Prueba con otros términos o explora nuestras categorías destacadas.</p>
            <button className="btn btn-primary" onClick={onClearCategory}>
              Mostrar todo
            </button>
          </div>
        ) : (
          categories.map(category => (
            <section key={category} className="category-section-premium">
              <div className="section-header">
                <h2 className="section-title-premium">{category}</h2>
                <div className="section-line"></div>
              </div>

              <div className="product-grid-premium">
                {products
                  .filter(p => p.category === category)
                  .map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={() => setSelectedProduct(product)}
                      onAdd={addToCart}
                    />
                  ))}
              </div>
            </section>
          ))
        )}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}

      <style>{`
        .home-page-premium {
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }
        .main-catalog {
          padding-bottom: 6rem;
        }
        
        .filter-status-premium {
          margin-bottom: 4rem;
          padding: 1.5rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--radius-lg);
        }
        .filter-status-premium span { font-size: 1.1rem; color: var(--text-light); }
        .btn-clear-premium {
          background: var(--white);
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          padding: 0.6rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-clear-premium:hover { background: var(--primary-color); color: white; }

        .category-section-premium { margin-bottom: 5rem; }
        .section-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        .section-title-premium {
          font-size: 2rem;
          color: var(--primary-dark);
          white-space: nowrap;
          font-weight: 800;
        }
        .section-line {
          height: 2px;
          flex: 1;
          background: linear-gradient(90deg, var(--primary-color) 0%, transparent 100%);
          opacity: 0.2;
        }

        .product-grid-premium {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2.5rem;
        }

        .no-results-premium {
          text-align: center;
          padding: 5rem 2rem;
          max-width: 600px;
          margin: 4rem auto;
        }
        .no-results-icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .no-results-premium h3 { font-size: 1.75rem; margin-bottom: 1rem; color: var(--primary-dark); }
        .no-results-premium p { color: var(--text-light); margin-bottom: 2rem; }

        .liquidation-section {
          margin-bottom: 5rem;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          padding: 2rem;
          border-radius: 20px;
        }

        .liquidation-header {
          flex-wrap: wrap;
        }

        .liquidation-title {
          color: #dc2626 !important;
        }

        .liquidation-badge {
          background: #dc2626;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }


  @media (max-width: 768px) {
          .section-header { gap: 1rem; margin-bottom: 1.5rem; }
          .section-title-premium { font-size: 1.5rem; }
          .filter-status-premium { flex-direction: column; gap: 1rem; text-align: center; padding: 1.5rem; }
          
          .product-grid-premium {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
