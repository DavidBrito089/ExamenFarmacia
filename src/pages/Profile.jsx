import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchData() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData);
      setLoading(false);
    }

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>Cargando tu experiencia premium...</div>;

  return (
    <div className="profile-page-premium">
      <div className="container">
        <motion.div
          className="profile-header-premium glass"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-avatar-group">
            <div className="avatar-large">👤</div>
            <div>
              <span className="welcome-tag">Bienvenido de nuevo</span>
              <h1>{profile?.full_name || user.email.split('@')[0]}</h1>
              <p className="user-email-premium">{user.email}</p>
            </div>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>Cerrar Sesión</button>
        </motion.div>

        <div className="profile-grid-premium">
          <motion.div
            className="info-sidebar glass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Mis Detalles</h3>
            <div className="detail-item">
              <label>Dirección Predeterminada</label>
              <p>{profile?.address || user?.user_metadata?.address || 'Pendiente de completar'}</p>
            </div>
            <div className="detail-item">
              <label>Miembro desde</label>
              <p>{new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Editar Perfil</button>
          </motion.div>

          <motion.div
            className="orders-main glass"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Historial de Pedidos Premium</h3>

            {orders.length === 0 ? (
              <div className="no-orders-premium">
                <p>Aún no has descubierto la experiencia Farmared 88.</p>
                <button className="btn btn-outline" onClick={() => navigate('/')}>Comenzar a Comprar</button>
              </div>
            ) : (
              <div className="orders-timeline">
                {orders.map(order => (
                  <div key={order.id} className="order-box-premium">
                    <div className="order-top">
                      <div className="order-meta">
                        <span className="order-id">ORDEN #{order.id}</span>
                        <span className="order-date-premium">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`status-badge status-${order.status || 'pending'}`}>
                        {order.status === 'pending' ? 'En Proceso' : 'Entregado'}
                      </span>
                    </div>

                    <div className="order-products-preview">
                      {order.items_json?.map((item, idx) => (
                        <span key={idx} className="order-item-tag">{item.name} (x{item.quantity})</span>
                      ))}
                    </div>

                    <div className="order-bottom">
                      <div className="shipping-preview">
                        <strong>Envío a:</strong> {order.shipping_address?.split(',')[1] || 'Dirección guardada'}
                      </div>
                      <div className="order-total-premium">
                        Total: <span>${order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        .profile-page-premium {
          padding: 8rem 0 6rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }
        .profile-header-premium {
          padding: 3rem;
          margin-bottom: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: var(--radius-lg);
        }
        .user-avatar-group { display: flex; align-items: center; gap: 2rem; }
        .avatar-large {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          box-shadow: var(--shadow-md);
        }
        .welcome-tag { color: var(--primary-color); font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .profile-header-premium h1 { font-size: 2.5rem; margin: 0.25rem 0; }
        .user-email-premium { color: var(--text-light); font-size: 1.1rem; }

        .profile-grid-premium { display: grid; grid-template-columns: 1fr 2.5fr; gap: 2.5rem; align-items: start; }
        .info-sidebar, .orders-main { padding: 2.5rem; border-radius: var(--radius-lg); }
        .info-sidebar h3, .orders-main h3 { margin-bottom: 2rem; font-size: 1.5rem; color: var(--primary-dark); }
        
        .detail-item { margin-bottom: 2rem; }
        .detail-item label { display: block; font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; font-weight: 800; margin-bottom: 0.5rem; }
        .detail-item p { font-size: 1.1rem; font-weight: 500; }

        .order-box-premium {
          background: white;
          border-radius: var(--radius-md);
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          border: 1px solid rgba(0,0,0,0.05);
          transition: 0.3s;
        }
        .order-box-premium:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        
        .order-top { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
        .order-meta { display: flex; flex-direction: column; }
        .order-id { font-weight: 800; font-size: 0.85rem; color: #94a3b8; }
        .order-date-premium { font-size: 1rem; color: var(--text-color); font-weight: 600; }
        
        .status-badge { padding: 4px 12px; border-radius: 50px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
        .status-pending { background: #fff3bf; color: #d97706; }
        
        .order-products-preview { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
        .order-item-tag { background: #f8fafc; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0; }

        .order-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        .shipping-preview { font-size: 0.9rem; color: var(--text-light); }
        .order-total-premium { font-weight: 800; font-size: 1.25rem; font-family: 'Outfit'; }
        .order-total-premium span { color: var(--primary-color); }

        @media (max-width: 968px) {
          .profile-grid-premium { grid-template-columns: 1fr; }
          .profile-header-premium { flex-direction: column; text-align: center; gap: 2rem; }
          .user-avatar-group { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
}
