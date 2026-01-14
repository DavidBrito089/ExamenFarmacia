import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function Header({ cartCount, onSearch, onCartClick, onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products from Supabase
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 1) {
        setSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(6);

      setSuggestions(data || []);
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
    onSearch(value);
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    onSearch(product.name);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <div className="left-section">
          <button className="btn-menu-premium" onClick={onMenuClick} aria-label="Menu">
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          <Link to="/" className="logo-link">
            <div className="logo">
              <span className="logo-symbol">💊</span>
              <h1>Farmared <span className="highlight">88</span></h1>
            </div>
          </Link>
        </div>

        <div className="search-wrapper" ref={searchRef}>
          <div className="search-bar-premium glass">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            />
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass">
              <div className="suggestions-header">
                <span>🔍 Resultados ({suggestions.length})</span>
              </div>
              <ul>
                {suggestions.map((product) => (
                  <li key={product.id} onClick={() => handleSuggestionClick(product)}>
                    <img src={product.image} alt={product.name} />
                    <div className="suggestion-info">
                      <span className="suggestion-name">{product.name}</span>
                      <span className="suggestion-category">{product.category}</span>
                    </div>
                    <span className="suggestion-price">${Number(product.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <Link to="/profile" className="nav-icon-btn profile-btn" title="Mi Perfil">
              <span className="icon-circle">👤</span>
            </Link>
          ) : (
            <Link to="/login" className="login-link-premium" title="Iniciar Sesión">
              <span>Entrar</span>
            </Link>
          )}

          <button className="nav-icon-btn cart-btn" onClick={onCartClick}>
            <span className="icon-circle">🛒</span>
            {cartCount > 0 && <span className="badge-premium">{cartCount}</span>}
          </button>
        </div>
      </div>

      <style>{`
        .header {
          background: transparent;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .header.scrolled {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 0.8rem 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        
        .left-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .btn-menu-premium {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 5px;
        }
        .btn-menu-premium .bar {
          width: 24px;
          height: 2px;
          background: var(--primary-dark);
          border-radius: 2px;
          transition: 0.3s;
        }
        .btn-menu-premium:hover .bar:first-child { width: 18px; }

        .logo-link { text-decoration: none; }
        .logo { 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
        }
        .logo-symbol { font-size: 1.8rem; }
        .logo h1 {
          font-size: 1.5rem;
          color: var(--primary-dark);
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .highlight {
          color: var(--accent-color);
        }

        .search-wrapper {
          flex: 1;
          max-width: 500px;
          position: relative;
        }
        .search-bar-premium {
          display: flex;
          align-items: center;
          padding: 0.6rem 1.25rem;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s;
        }
        .search-bar-premium:focus-within {
          background: white;
          box-shadow: 0 4px 20px rgba(0, 180, 216, 0.15);
          transform: translateY(-1px);
          border-radius: 20px 20px 0 0;
        }
        .search-icon { font-size: 1rem; color: var(--text-light); margin-right: 0.75rem; }
        .search-bar-premium input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
        }

        /* Search Suggestions */
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 0 0 20px 20px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 100;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .suggestions-header {
          padding: 0.75rem 1.25rem;
          background: #f8fafc;
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 600;
          border-bottom: 1px solid #f1f5f9;
        }
        .search-suggestions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .search-suggestions li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f8fafc;
        }
        .search-suggestions li:hover {
          background: #f0f9ff;
        }
        .search-suggestions li img {
          width: 45px;
          height: 45px;
          object-fit: cover;
          border-radius: 10px;
          background: #f1f5f9;
        }
        .suggestion-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .suggestion-name {
          font-weight: 700;
          color: var(--text-color);
          font-size: 0.95rem;
        }
        .suggestion-category {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .suggestion-price {
          font-weight: 800;
          color: var(--primary-dark);
          font-family: 'Outfit', sans-serif;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .nav-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          text-decoration: none;
        }
        .icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          background: white;
          border-radius: 50%;
          font-size: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
        }
        .nav-icon-btn:hover .icon-circle {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          background: var(--primary-color);
          color: white;
        }
        .login-link-premium {
          text-decoration: none;
          font-weight: 700;
          color: var(--primary-dark);
          font-family: 'Outfit', sans-serif;
          padding: 0.5rem 1rem;
          transition: 0.3s;
        }
        .login-link-premium:hover { color: var(--accent-color); }
        
        .badge-premium {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--accent-color);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        @media (max-width: 968px) {
          .search-wrapper { display: none; }
          .logo h1 { font-size: 1.25rem; }
        }
      `}</style>
    </header>
  );
}
