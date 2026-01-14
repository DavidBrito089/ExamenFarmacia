import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function LogisticsPanel() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('paid'); // paid, shipped, all
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        setLoading(true);

        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const handleDispatch = async (orderId) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'shipped' })
            .eq('id', orderId);

        if (error) {
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Pedido marcado como despachado' });
            fetchOrders();
        }

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleMarkDelivered = async (orderId) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', orderId);

        if (error) {
            setMessage({ type: 'error', text: 'Error: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Pedido marcado como entregado' });
            fetchOrders();
        }

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'paid': { label: 'Pendiente', class: 'status-pending' },
            'shipped': { label: 'Despachado', class: 'status-shipped' },
            'delivered': { label: 'Entregado', class: 'status-delivered' },
            'cancelled': { label: 'Cancelado', class: 'status-cancelled' }
        };
        const s = statusMap[status] || { label: status, class: '' };
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseItems = (itemsJson) => {
        try {
            if (typeof itemsJson === 'string') {
                return JSON.parse(itemsJson);
            }
            return itemsJson || [];
        } catch {
            return [];
        }
    };

    return (
        <div className="logistics-panel">
            <div className="panel-header">
                <h2>🚚 Gestión de Pedidos</h2>
                <div className="filter-tabs">
                    <button
                        className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
                        onClick={() => setFilter('paid')}
                    >
                        📋 Pendientes
                    </button>
                    <button
                        className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilter('shipped')}
                    >
                        🚚 Despachados
                    </button>
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        📊 Todos
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="loading">Cargando pedidos...</div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>No hay pedidos {filter === 'paid' ? 'pendientes' : filter === 'shipped' ? 'despachados' : ''}</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className={`order-card ${expandedOrder === order.id ? 'expanded' : ''}`}
                        >
                            <div
                                className="order-header"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="order-id">
                                    <strong>Pedido #{order.id}</strong>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="order-meta">
                                    <span className="order-date">{formatDate(order.created_at)}</span>
                                    <span className="order-total">${Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            {expandedOrder === order.id && (
                                <div className="order-details">
                                    <div className="detail-section">
                                        <h4>📍 Dirección de Envío</h4>
                                        <p>{order.shipping_address}</p>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🛒 Productos</h4>
                                        <ul className="items-list">
                                            {parseItems(order.items_json).map((item, idx) => (
                                                <li key={idx}>
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-qty">x{item.quantity}</span>
                                                    <span className="item-price">${Number(item.price).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="order-actions">
                                        {order.status === 'paid' && (
                                            <button
                                                className="btn-dispatch"
                                                onClick={() => handleDispatch(order.id)}
                                            >
                                                🚚 Marcar como Despachado
                                            </button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <button
                                                className="btn-delivered"
                                                onClick={() => handleMarkDelivered(order.id)}
                                            >
                                                ✅ Marcar como Entregado
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .logistics-panel {
          width: 100%;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .panel-header h2 {
          font-size: 1.5rem;
          color: #0f172a;
          font-weight: 700;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .filter-btn:hover {
          border-color: #0284c7;
        }

        .filter-btn.active {
          background: #0284c7;
          border-color: #0284c7;
          color: white;
        }

        .message {
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
        }

        .message.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-card {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .order-card:hover {
          border-color: #e2e8f0;
        }

        .order-card.expanded {
          border-color: #0284c7;
        }

        .order-header {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .order-id {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .order-id strong {
          color: #0f172a;
          font-size: 1.1rem;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-shipped {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-delivered {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .order-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .order-date {
          color: #64748b;
          font-size: 0.9rem;
        }

        .order-total {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0284c7;
        }

        .order-details {
          padding: 0 1.25rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          margin-top: -0.5rem;
          padding-top: 1rem;
        }

        .detail-section {
          margin-bottom: 1rem;
        }

        .detail-section h4 {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .detail-section p {
          color: #0f172a;
          line-height: 1.5;
        }

        .items-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .items-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #e2e8f0;
        }

        .items-list li:last-child {
          border-bottom: none;
        }

        .item-name {
          flex: 1;
          color: #0f172a;
        }

        .item-qty {
          color: #64748b;
          margin: 0 1rem;
        }

        .item-price {
          font-weight: 600;
          color: #0284c7;
        }

        .order-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
        }

        .btn-dispatch,
        .btn-delivered {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-dispatch {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
        }

        .btn-dispatch:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }

        .btn-delivered {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .btn-delivered:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            text-align: center;
          }

          .filter-tabs {
            width: 100%;
            justify-content: center;
          }

          .order-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .order-meta {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
        </div>
    );
}
