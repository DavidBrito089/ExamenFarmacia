import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function InventoryPanel() {
  const [products, setProducts] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    discount_percent: 0,
    is_daily_deal: false,
    expiration_date: '',
    is_liquidation: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Medicamentos',
    'Suplementos',
    'Equipo Médico',
    'Primeros Auxilios',
    'Cuidado Personal',
    'Bebés'
  ];

  useEffect(() => {
    fetchProducts();
    fetchDiscountRules();
  }, []);

  const fetchDiscountRules = async () => {
    const { data } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('is_active', true);
    setDiscountRules(data || []);
  };

  // Get active discount for a product based on today's rules
  const getActiveDiscount = (product) => {
    const today = new Date().getDay();
    const matchingRule = discountRules.find(
      rule => rule.category === product.category && rule.days_of_week?.includes(today)
    );
    return matchingRule ? { percent: matchingRule.discount_percent, name: matchingRule.name } : null;
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0],
      price: '',
      description: '',
      image: '',
      discount_percent: 0,
      is_daily_deal: false,
      expiration_date: '',
      is_liquidation: false
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      image: product.image || '',
      discount_percent: product.discount_percent || 0,
      is_daily_deal: product.is_daily_deal || false,
      expiration_date: product.expiration_date || '',
      is_liquidation: product.is_liquidation || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      discount_percent: parseInt(formData.discount_percent) || 0,
      is_daily_deal: formData.is_daily_deal,
      expiration_date: formData.expiration_date || null,
      is_liquidation: formData.is_liquidation
    };

    let error;

    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);
      error = insertError;
    }

    if (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } else {
      setMessage({ type: 'success', text: editingProduct ? 'Producto actualizado' : 'Producto agregado' });
      setShowModal(false);
      fetchProducts();
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Producto eliminado' });
      fetchProducts();
    }
  };

  return (
    <div className="inventory-panel">
      <div className="panel-header">
        <h2>📦 Gestión de Inventario</h2>
        <button className="btn-add" onClick={openAddModal}>
          + Agregar Producto
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Vencimiento</th>
                <th>Descuento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const expirationDate = product.expiration_date ? new Date(product.expiration_date) : null;
                const today = new Date();
                const daysUntilExpiry = expirationDate ? Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24)) : null;
                const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

                return (
                  <tr key={product.id} className={isExpired ? 'expired-row' : isExpiringSoon ? 'expiring-row' : ''}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td className="product-name">
                      {product.name}
                      {isExpiringSoon && <span className="expiring-badge" title={`Vence en ${daysUntilExpiry} días`}>⚠️</span>}
                      {isExpired && <span className="expired-badge" title="Producto vencido">❌</span>}
                    </td>
                    <td>{product.category}</td>
                    <td className="price">${Number(product.price).toFixed(2)}</td>
                    <td className="expiration">
                      {expirationDate ? (
                        <span className={isExpired ? 'expired' : isExpiringSoon ? 'expiring' : ''}>
                          {expirationDate.toLocaleDateString('es-EC')}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {(() => {
                        const activeDiscount = getActiveDiscount(product);
                        if (activeDiscount) {
                          return (
                            <span className="discount-tag active-rule" title={`Regla: ${activeDiscount.name}`}>
                              -{activeDiscount.percent}%
                            </span>
                          );
                        }
                        return <span className="no-discount">-</span>;
                      })()}
                    </td>
                    <td className="status-cell">
                      {product.is_liquidation && <span className="liquidation-tag" title="En liquidación">🏷️</span>}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(product)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Paracetamol 500mg"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>URL de Imagen</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="image-preview" />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_daily_deal}
                      onChange={(e) => setFormData({ ...formData, is_daily_deal: e.target.checked })}
                    />
                    🔥 Oferta del Día
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_liquidation}
                      onChange={(e) => setFormData({ ...formData, is_liquidation: e.target.checked })}
                    />
                    🏷️ Liquidación
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear Producto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .inventory-panel {
          width: 100%;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .panel-header h2 {
          font-size: 1.5rem;
          color: #0f172a;
          font-weight: 700;
        }

        .btn-add {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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
          font-size: 1.1rem;
        }

        .products-table-wrapper {
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th,
        .products-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .products-table th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .products-table tbody tr:hover {
          background: #f8fafc;
        }

        .product-thumb {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
          background: #f1f5f9;
        }

        .product-name {
          font-weight: 600;
          color: #0f172a;
        }

        .price {
          font-weight: 700;
          color: #0284c7;
        }

        .discount-tag {
          background: #fee2e2;
          color: #dc2626;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .discount-tag.active-rule {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #b45309;
          cursor: help;
        }

        .no-discount {
          color: #9ca3af;
        }

        .deal-tag {
          font-size: 1.2rem;
        }

        .liquidation-tag {
          font-size: 1.2rem;
          margin-left: 0.25rem;
        }

        .status-cell {
          display: flex;
          gap: 0.25rem;
        }

        .expiring-badge, .expired-badge {
          margin-left: 0.5rem;
        }

        .expiration .expiring {
          color: #f59e0b;
          font-weight: 600;
        }

        .expiration .expired {
          color: #dc2626;
          font-weight: 600;
          text-decoration: line-through;
        }

        .expiring-row {
          background: #fef3c7 !important;
        }

        .expired-row {
          background: #fee2e2 !important;
          opacity: 0.7;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #dbeafe;
        }

        .btn-edit:hover {
          background: #bfdbfe;
        }

        .btn-delete {
          background: #fee2e2;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #0f172a;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #475569;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0284c7;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .image-preview {
          margin-top: 0.5rem;
          max-width: 100%;
          max-height: 150px;
          object-fit: contain;
          border-radius: 8px;
          background: #f1f5f9;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-cancel,
        .btn-save {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-save {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .products-table th,
          .products-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }

          .product-thumb {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
