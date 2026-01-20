import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function DiscountRulesPanel() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [categories, setCategories] = useState([]);

    // EXTENSIBLE PROMOTION TYPES - Add new types here without modifying core code
    const promotionTypes = [
        {
            id: 'percentage',
            label: '% Descuento',
            icon: '🏷️',
            description: 'Descuento porcentual en el precio',
            requiresValue: true,
            valueLabel: 'Porcentaje (%)',
            valuePlaceholder: '15'
        },
        {
            id: '2x1',
            label: '2x1',
            icon: '🎁',
            description: 'Paga 1, lleva 2',
            requiresValue: false
        },
        {
            id: 'second_unit',
            label: '2da Unidad %',
            icon: '✨',
            description: 'Descuento en la segunda unidad',
            requiresValue: true,
            valueLabel: 'Descuento 2da unidad (%)',
            valuePlaceholder: '50'
        },
        {
            id: '3x2',
            label: '3x2',
            icon: '🎉',
            description: 'Paga 2, lleva 3',
            requiresValue: false
        },
        {
            id: 'fixed_price',
            label: 'Precio Fijo',
            icon: '💰',
            description: 'Precio especial fijo',
            requiresValue: true,
            valueLabel: 'Precio ($)',
            valuePlaceholder: '9.99'
        }
    ];

    const [form, setForm] = useState({
        name: '',
        category: '',
        promotion_type: 'percentage',
        discount_percent: '',
        days_of_week: [],
        is_active: true
    });

    const daysOfWeek = [
        { value: 0, label: 'Dom' },
        { value: 1, label: 'Lun' },
        { value: 2, label: 'Mar' },
        { value: 3, label: 'Mié' },
        { value: 4, label: 'Jue' },
        { value: 5, label: 'Vie' },
        { value: 6, label: 'Sáb' }
    ];

    useEffect(() => {
        fetchRules();
        fetchCategories();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('discount_rules')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error);
        } else {
            setRules(data || []);
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('products')
            .select('category');

        if (data) {
            const unique = [...new Set(data.map(p => p.category))];
            setCategories(unique);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const resetForm = () => {
        setForm({
            name: '',
            category: '',
            promotion_type: 'percentage',
            discount_percent: '',
            days_of_week: [],
            is_active: true
        });
        setEditingRule(null);
        setShowForm(false);
    };

    const handleDayToggle = (day) => {
        setForm(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.days_of_week.length === 0) {
            showMessage('error', 'Selecciona al menos un día');
            return;
        }

        const selectedPromoType = promotionTypes.find(p => p.id === form.promotion_type);

        const ruleData = {
            name: form.name,
            category: form.category,
            promotion_type: form.promotion_type,
            discount_percent: selectedPromoType?.requiresValue ? parseFloat(form.discount_percent) : 0,
            days_of_week: form.days_of_week,
            is_active: form.is_active
        };

        let error;
        if (editingRule) {
            ({ error } = await supabase
                .from('discount_rules')
                .update(ruleData)
                .eq('id', editingRule.id));
        } else {
            ({ error } = await supabase
                .from('discount_rules')
                .insert(ruleData));
        }

        if (error) {
            showMessage('error', 'Error: ' + error.message);
        } else {
            showMessage('success', editingRule ? 'Regla actualizada' : 'Regla creada');
            resetForm();
            fetchRules();
        }
    };

    const handleEdit = (rule) => {
        setForm({
            name: rule.name,
            category: rule.category,
            promotion_type: rule.promotion_type || 'percentage',
            discount_percent: rule.discount_percent?.toString() || '',
            days_of_week: rule.days_of_week,
            is_active: rule.is_active
        });
        setEditingRule(rule);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta regla de descuento?')) return;

        const { error } = await supabase
            .from('discount_rules')
            .delete()
            .eq('id', id);

        if (error) {
            showMessage('error', 'Error: ' + error.message);
        } else {
            showMessage('success', 'Regla eliminada');
            fetchRules();
        }
    };

    const toggleActive = async (rule) => {
        const { error } = await supabase
            .from('discount_rules')
            .update({ is_active: !rule.is_active })
            .eq('id', rule.id);

        if (!error) fetchRules();
    };

    const getDaysLabel = (days) => {
        return days.sort((a, b) => a - b).map(d => daysOfWeek.find(dw => dw.value === d)?.label).join(', ');
    };

    return (
        <div className="discount-rules-panel">
            <div className="panel-header">
                <h2>🏷️ Reglas de Descuento Automático</h2>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cerrar' : '+ Nueva Regla'}
                </button>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {showForm && (
                <form className="rule-form" onSubmit={handleSubmit}>
                    <h3>{editingRule ? '✏️ Editar Regla' : '➕ Nueva Regla'}</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre de la regla</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Ej: Lunes de Cardiología"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Categoría</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Promoción</label>
                        <div className="promo-type-selector">
                            {promotionTypes.map(type => (
                                <button
                                    type="button"
                                    key={type.id}
                                    className={`promo-type-btn ${form.promotion_type === type.id ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, promotion_type: type.id })}
                                >
                                    <span className="promo-icon">{type.icon}</span>
                                    <span className="promo-label">{type.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="promo-description">
                            {promotionTypes.find(p => p.id === form.promotion_type)?.description}
                        </p>
                    </div>

                    {promotionTypes.find(p => p.id === form.promotion_type)?.requiresValue && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>{promotionTypes.find(p => p.id === form.promotion_type)?.valueLabel}</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.discount_percent}
                                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                                    placeholder={promotionTypes.find(p => p.id === form.promotion_type)?.valuePlaceholder}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Días de la semana</label>
                        <div className="days-selector">
                            {daysOfWeek.map(day => (
                                <button
                                    type="button"
                                    key={day.value}
                                    className={`day-btn ${form.days_of_week.includes(day.value) ? 'active' : ''}`}
                                    onClick={() => handleDayToggle(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            {editingRule ? 'Actualizar' : 'Crear Regla'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loading">Cargando reglas...</div>
            ) : rules.length === 0 ? (
                <div className="empty-state">
                    <p>No hay reglas de descuento creadas</p>
                    <p className="hint">Crea una regla para aplicar descuentos automáticos por día y categoría</p>
                </div>
            ) : (
                <div className="rules-table-wrapper">
                    <table className="rules-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Días</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map(rule => {
                                const promoType = promotionTypes.find(p => p.id === rule.promotion_type) || promotionTypes[0];
                                return (
                                    <tr key={rule.id} className={!rule.is_active ? 'inactive' : ''}>
                                        <td className="rule-name">{rule.name}</td>
                                        <td><span className="category-badge">{rule.category}</span></td>
                                        <td className="promo-type-cell">
                                            <span className="promo-type-badge">{promoType.icon} {promoType.label}</span>
                                        </td>
                                        <td className="discount">
                                            {promoType.requiresValue
                                                ? (rule.promotion_type === 'fixed_price' ? `$${rule.discount_percent}` : `-${rule.discount_percent}%`)
                                                : '-'}
                                        </td>
                                        <td className="days">{getDaysLabel(rule.days_of_week)}</td>
                                        <td>
                                            <button
                                                className={`status-btn ${rule.is_active ? 'active' : 'inactive'}`}
                                                onClick={() => toggleActive(rule)}
                                            >
                                                {rule.is_active ? '✓ Activo' : '○ Inactivo'}
                                            </button>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-edit" onClick={() => handleEdit(rule)}>✏️</button>
                                            <button className="btn-delete" onClick={() => handleDelete(rule.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
        .discount-rules-panel { width: 100%; }

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
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .message {
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .message.success { background: #d1fae5; color: #065f46; }
        .message.error { background: #fee2e2; color: #991b1b; }

        .rule-form {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .rule-form h3 {
          margin-bottom: 1.5rem;
          color: #0f172a;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
        .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0284c7;
        }

        .days-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .day-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .day-btn.active {
          background: #0284c7;
          color: white;
          border-color: #0284c7;
        }

        .promo-type-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }

        .promo-type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 1.25rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 80px;
        }

        .promo-type-btn:hover {
          border-color: #0284c7;
          background: #f0f9ff;
        }

        .promo-type-btn.active {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          border-color: #0284c7;
        }

        .promo-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .promo-label { font-size: 0.85rem; font-weight: 600; }

        .promo-description {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          font-style: italic;
        }

        .promo-type-cell { white-space: nowrap; }

        .promo-type-badge {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0284c7;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-cancel, .btn-save {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-save {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
        }

        .loading, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .empty-state .hint {
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .rules-table-wrapper { overflow-x: auto; }

        .rules-table {
          width: 100%;
          border-collapse: collapse;
        }

        .rules-table th,
        .rules-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .rules-table th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .rules-table tr:hover { background: #f8fafc; }
        .rules-table tr.inactive { opacity: 0.5; }

        .rule-name { font-weight: 600; color: #0f172a; }

        .category-badge {
          background: #e0f2fe;
          color: #0284c7;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .discount {
          font-weight: 700;
          color: #dc2626;
          font-size: 1.1rem;
        }

        .days {
          color: #64748b;
          font-size: 0.9rem;
        }

        .status-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .status-btn.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-btn.inactive {
          background: #f1f5f9;
          color: #64748b;
        }

        .actions { display: flex; gap: 0.5rem; }

        .btn-edit, .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-edit { background: #dbeafe; }
        .btn-edit:hover { background: #bfdbfe; }
        .btn-delete { background: #fee2e2; }
        .btn-delete:hover { background: #fecaca; }

        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .panel-header { flex-direction: column; gap: 1rem; }
        }
      `}</style>
        </div>
    );
}
