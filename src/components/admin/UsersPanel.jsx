import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function UsersPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', email: '', role: '', address: '' });

    const roles = [
        { value: 'client', label: '👤 Cliente', color: '#64748b' },
        { value: 'inventory', label: '📦 Inventario', color: '#0284c7' },
        { value: 'admin', label: '🛡️ Admin', color: '#7c3aed' },
        { value: 'super_admin', label: '👑 Super Admin', color: '#dc2626' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error);
            setMessage({ type: 'error', text: 'Error al cargar usuarios' });
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setEditForm({
            full_name: u.full_name || '',
            email: u.email || '',
            role: u.role || 'client',
            address: u.address || ''
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: editForm.full_name,
                role: editForm.role,
                address: editForm.address
            })
            .eq('id', editingUser.id);

        if (error) {
            showMessage('error', 'Error: ' + error.message);
        } else {
            showMessage('success', 'Usuario actualizado correctamente');
            setEditingUser(null);
            fetchUsers();
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (userEmail === user?.email) {
            showMessage('error', 'No puedes eliminarte a ti mismo');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}?`)) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            showMessage('error', 'Error: ' + error.message);
        } else {
            showMessage('success', 'Usuario eliminado correctamente');
            fetchUsers();
        }
    };

    const handleQuickRoleChange = async (userId, newRole) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            showMessage('error', 'Error: ' + error.message);
        } else {
            showMessage('success', 'Rol actualizado');
            fetchUsers();
        }
    };

    const getRoleBadge = (role) => {
        const r = roles.find(item => item.value === role) || roles[0];
        return (
            <span className="role-badge" style={{ background: r.color }}>
                {r.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="users-panel">
            <div className="panel-header">
                <h2>👥 Gestión de Usuarios</h2>
                <span className="user-count">{users.length} usuarios</span>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="loading">Cargando usuarios...</div>
            ) : (
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol Actual</th>
                                <th>Cambiar Rol</th>
                                <th>Registrado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className={u.email === user?.email ? 'current-user' : ''}>
                                    <td className="user-info-cell">
                                        <div className="user-avatar">
                                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{u.full_name || 'Sin nombre'}</span>
                                            <span className="user-email">{u.email}</span>
                                        </div>
                                        {u.email === user?.email && <span className="you-badge">Tú</span>}
                                    </td>
                                    <td>{getRoleBadge(u.role)}</td>
                                    <td>
                                        <select
                                            value={u.role || 'client'}
                                            onChange={(e) => handleQuickRoleChange(u.id, e.target.value)}
                                            className="role-select"
                                            disabled={u.email === user?.email}
                                        >
                                            {roles.map(role => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="date">{formatDate(u.created_at)}</td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => openEditModal(u)}
                                            title="Editar usuario"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                            disabled={u.email === user?.email}
                                            title="Eliminar usuario"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>✏️ Editar Usuario</h3>

                        <form onSubmit={handleUpdateUser}>
                            <div className="form-group">
                                <label>Email (no editable)</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>

                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    placeholder="Nombre del usuario"
                                />
                            </div>

                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Dirección de envío"
                                />
                            </div>

                            <div className="form-group">
                                <label>Rol</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .users-panel { width: 100%; }

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

        .user-count {
          background: #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
        }

        .message {
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .message.success { background: #d1fae5; color: #065f46; }
        .message.error { background: #fee2e2; color: #991b1b; }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .users-table-wrapper { overflow-x: auto; }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .users-table th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .users-table tbody tr:hover { background: #f8fafc; }
        .users-table tbody tr.current-user { background: #eff6ff; }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
        }

        .user-email {
          font-size: 0.85rem;
          color: #64748b;
        }

        .you-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: 0.5rem;
        }

        .role-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          display: inline-block;
        }

        .date {
          color: #64748b;
          font-size: 0.9rem;
        }

        .role-select {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          background: white;
        }

        .role-select:hover { border-color: #0284c7; }
        .role-select:disabled { opacity: 0.5; cursor: not-allowed; }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit, .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .btn-edit { background: #dbeafe; }
        .btn-edit:hover { background: #bfdbfe; }
        .btn-delete { background: #fee2e2; }
        .btn-delete:hover { background: #fecaca; }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

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
          max-width: 450px;
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

        .input-disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-cancel, .btn-save {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-cancel:hover { background: #e2e8f0; }

        .btn-save {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
        }

        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            font-size: 0.85rem;
          }
        }
      `}</style>
        </div>
    );
}
