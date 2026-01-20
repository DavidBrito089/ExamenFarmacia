import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import InventoryPanel from '../components/admin/InventoryPanel';
import LogisticsPanel from '../components/admin/LogisticsPanel';
import UsersPanel from '../components/admin/UsersPanel';
import DiscountRulesPanel from '../components/admin/DiscountRulesPanel';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user?.email) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();

        setUserRole(data?.role || 'client');
      }
      setLoadingRole(false);
    };

    fetchRole();
  }, [user]);

  // Fetch expiring products on mount
  useEffect(() => {
    const fetchExpiringProducts = async () => {
      const today = new Date();
      const in90Days = new Date();
      in90Days.setDate(today.getDate() + 90);

      const { data } = await supabase
        .from('products')
        .select('*')
        .not('expiration_date', 'is', null)
        .lte('expiration_date', in90Days.toISOString().split('T')[0])
        .gte('expiration_date', today.toISOString().split('T')[0])
        .order('expiration_date', { ascending: true });

      setExpiringProducts(data || []);
    };

    fetchExpiringProducts();
  }, []);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while fetching role
  if (loadingRole) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">⏳</div>
        <p>Cargando panel de administración...</p>
        <style>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          }
          .loading-spinner {
            font-size: 3rem;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .admin-loading p {
            margin-top: 1rem;
            color: #64748b;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  // Only allow admin roles to access this page
  const allowedRoles = ['super_admin', 'admin', 'inventory'];
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Role-based tab visibility
  const canSeeUsers = userRole === 'super_admin' || userRole === 'admin';

  const getRoleBadge = () => {
    const roleLabels = {
      'super_admin': { label: '👑 Super Admin', color: '#dc2626' },
      'admin': { label: '🛡️ Admin', color: '#7c3aed' },
      'inventory': { label: '📦 Inventario', color: '#0284c7' },
      'client': { label: '👤 Cliente', color: '#64748b' }
    };
    const r = roleLabels[userRole] || roleLabels['client'];
    return (
      <span className="user-role-badge" style={{ background: r.color }}>
        {r.label}
      </span>
    );
  };

  const getDaysUntilExpiry = (dateStr) => {
    const today = new Date();
    const expDate = new Date(dateStr);
    return Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Expiring Products Notification */}
        {showNotification && expiringProducts.length > 0 && (
          <div className="expiring-notification">
            <div className="notification-header">
              <span className="notification-icon">⚠️</span>
              <h3>Productos por Vencer ({expiringProducts.length})</h3>
              <button className="close-btn" onClick={() => setShowNotification(false)}>✕</button>
            </div>
            <div className="notification-body">
              <p>Los siguientes productos vencen en los próximos 90 días:</p>
              <ul className="expiring-list">
                {expiringProducts.slice(0, 5).map(product => (
                  <li key={product.id}>
                    <span className="product-name">{product.name}</span>
                    <span className={`days-badge ${getDaysUntilExpiry(product.expiration_date) <= 30 ? 'critical' : 'warning'}`}>
                      {getDaysUntilExpiry(product.expiration_date)} días
                    </span>
                  </li>
                ))}
                {expiringProducts.length > 5 && (
                  <li className="more-items">... y {expiringProducts.length - 5} productos más</li>
                )}
              </ul>
              <button className="btn-view-all" onClick={() => { setActiveTab('inventory'); setShowNotification(false); }}>
                Ver en Inventario
              </button>
            </div>
          </div>
        )}

        <header className="admin-header">
          <div className="header-content">
            <h1>📊 Panel de Administración</h1>
            <p>Gestiona inventario y logística de Farmared</p>
          </div>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            {getRoleBadge()}
          </div>
        </header>

        <nav className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventario
          </button>
          <button
            className={`tab-btn ${activeTab === 'logistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('logistics')}
          >
            🚚 Logística
          </button>
          <button
            className={`tab-btn ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('discounts')}
          >
            🏷️ Descuentos
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Reportes
          </button>
          {canSeeUsers && (
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Usuarios
            </button>
          )}
        </nav>

        <main className="admin-content">
          {activeTab === 'inventory' && <InventoryPanel />}
          {activeTab === 'logistics' && <LogisticsPanel />}
          {activeTab === 'discounts' && <DiscountRulesPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'users' && canSeeUsers && <UsersPanel />}
        </main>
      </div>

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 2rem;
          padding-top: 6rem;
        }

        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .expiring-notification {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .notification-icon { font-size: 2rem; }

        .notification-header h3 {
          flex: 1;
          margin: 0;
          color: #92400e;
          font-size: 1.25rem;
        }

        .close-btn {
          background: rgba(255,255,255,0.5);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
        }

        .notification-body p {
          color: #78350f;
          margin-bottom: 1rem;
        }

        .expiring-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .expiring-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(245, 158, 11, 0.3);
        }

        .expiring-list li:last-child { border-bottom: none; }

        .expiring-list .product-name {
          font-weight: 600;
          color: #78350f;
        }

        .days-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .days-badge.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .days-badge.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .more-items {
          font-style: italic;
          color: #92400e;
        }

        .btn-view-all {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-view-all:hover {
          background: #d97706;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content { text-align: left; }

        .admin-header h1 {
          font-size: 2.5rem;
          color: #0f172a;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .admin-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .user-email {
          color: #475569;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-role-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .admin-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          color: #64748b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .tab-btn:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
        }

        .admin-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          min-height: 600px;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
            padding-top: 5rem;
          }

          .admin-header {
            flex-direction: column;
            text-align: center;
          }

          .header-content { text-align: center; }

          .admin-header h1 { font-size: 1.75rem; }

          .user-info {
            flex-direction: column;
            gap: 0.5rem;
          }

          .admin-tabs { flex-direction: column; }

          .tab-btn { width: 100%; }

          .admin-content {
            padding: 1rem;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}
