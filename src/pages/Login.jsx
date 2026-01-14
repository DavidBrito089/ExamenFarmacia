import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="auth-page-premium">
      <div className="container">
        <motion.div
          className="auth-card-premium glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="auth-header">
            <span className="logo-symbol">💊</span>
            <h2>Bienvenido a <span className="gradient-text">Farmared 88</span></h2>
            <p>Accede a tu cuenta premium para continuar.</p>
          </div>

          {error && <div className="error-box-premium">{error}</div>}

          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-group-premium">
              <label>Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group-premium">
              <label>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className="btn btn-primary btn-block btn-xl" disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar Sesión Premium'}
            </button>
          </form>

          <p className="auth-footer-premium">
            ¿No tienes una cuenta? <Link to="/register">Crea una ahora</Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        .auth-page-premium {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: radial-gradient(circle at top right, #e0f2fe, #f8fafc);
          padding: 6rem 1rem;
        }
        .auth-card-premium {
          max-width: 480px;
          margin: 0 auto;
          padding: 3.5rem;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.8);
        }
        .auth-header { text-align: center; margin-bottom: 2.5rem; }
        .auth-header .logo-symbol { font-size: 3rem; margin-bottom: 1rem; display: block; }
        .auth-header h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-light); }

        .form-group-premium { margin-bottom: 1.5rem; }
        .form-group-premium label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.6rem; }
        .form-group-premium input { width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; transition: 0.3s; }
        .form-group-premium input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.1); }
        
        .error-box-premium { background: #ffe3e3; color: #c92a2a; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 600; font-size: 0.9rem; text-align: center; }
        .btn-xl { font-size: 1.1rem; padding: 1.1rem; }

        .auth-footer-premium { text-align: center; margin-top: 2rem; color: var(--text-light); }
        .auth-footer-premium a { color: var(--primary-color); text-decoration: none; font-weight: 700; }
        .auth-footer-premium a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
