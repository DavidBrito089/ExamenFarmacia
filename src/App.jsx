import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useProducts } from './hooks/useProducts';

import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import MenuDrawer from './components/MenuDrawer';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { products, loading, getCategories } = useProducts();

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cart Logic
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory
        ? p.category === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const allCategories = getCategories();

  return (
    <div className="app">
      <Header
        cartCount={cartTotalItems}
        onSearch={(term) => {
          setSearchTerm(term);
          if (term) setSelectedCategory(null);
        }}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <Routes>
        <Route path="/" element={
          <Home
            products={filteredProducts}
            allProducts={products}
            loading={loading}
            addToCart={addToCart}
            selectedCategory={selectedCategory}
            onClearCategory={() => {
              setSelectedCategory(null);
              setSearchTerm('');
            }}
          />
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={
          <Checkout
            cartItems={cart}
            onClearCart={clearCart}
          />
        } />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {/* Global Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateCartQuantity}
      />

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categories={allCategories}
        onSelectCategory={setSelectedCategory}
      />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
