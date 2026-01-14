import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Register() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          address: formData.address
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setShowVerification(true);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show verification screen after successful registration
  if (showVerification) {
    return (
      <div className="auth-page-premium">
        <div className="container">
          <motion.div
            className="auth-card-premium glass verification-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="verification-icon">📧</div>
            <h2>¡Revisa tu Correo!</h2>
            <p className="verification-subtitle">
              Hemos enviado un enlace de verificación a:
            </p>
            <p className="verification-email">{formData.email}</p>

            <div className="verification-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span>Abre tu bandeja de entrada</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span>Busca el correo de Farmared 88</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Haz clic en el enlace de verificación</span>
              </div>
            </div>

            <div className="verification-note">
              <p>💡 Si no ves el correo, revisa tu carpeta de spam</p>
            </div>

            <Link to="/login" className="btn btn-primary btn-block btn-xl">
              Ir a Iniciar Sesión
            </Link>
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
            max-width: 550px;
            margin: 0 auto;
            padding: 3.5rem;
            border-radius: var(--radius-lg);
            background: rgba(255, 255, 255, 0.8);
          }
          .verification-card {
            text-align: center;
          }
          .verification-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: bounce 2s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .verification-card h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 1rem;
          }
          .verification-subtitle {
            color: #64748b;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }
          .verification-email {
            font-weight: 700;
            color: #0284c7;
            font-size: 1.2rem;
            margin-bottom: 2rem;
          }
          .verification-steps {
            background: #f8fafc;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .step {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            text-align: left;
          }
          .step:not(:last-child) {
            border-bottom: 1px dashed #e2e8f0;
          }
          .step-number {
            background: linear-gradient(135deg, #0284c7, #0ea5e9);
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
          }
          .step span:last-child {
            color: #475569;
            font-weight: 500;
          }
          .verification-note {
            background: #fef3c7;
            color: #92400e;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
          }
          .btn-xl {
            font-size: 1.1rem;
            padding: 1.1rem;
            display: block;
            text-decoration: none;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page-premium">
      <div className="container">
        <motion.div
          className="auth-card-premium glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="auth-header">
            <span className="logo-symbol">🧬</span>
            <h2>Se Parte de <span className="gradient-text">Farmared 88</span></h2>
            <p>Crea tu cuenta de salud hoy mismo.</p>
          </div>

          {error && <div className="error-box-premium">{error}</div>}

          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-group-premium">
              <label>Nombre Completo</label>
              <input name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Alexander Pierce" />
            </div>

            <div className="form-group-premium">
              <label>Dirección de Envío</label>
              <input name="address" required value={formData.address} onChange={handleChange} placeholder="Calle Principal, Ciudad" />
            </div>

            <div className="form-group-premium">
              <label>Email</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="tu@email.com" />
            </div>

            <div className="form-group-premium">
              <label>Contraseña</label>
              <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
            </div>

            <button className="btn btn-primary btn-block btn-xl" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Comenzar Mi Experiencia'}
            </button>
          </form>

          <p className="auth-footer-premium">
            ¿Ya eres miembro? <Link to="/login">Inicia sesión</Link>
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
          max-width: 550px;
          margin: 0 auto;
          padding: 3.5rem;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.8);
        }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-header .logo-symbol { font-size: 3rem; margin-bottom: 1rem; display: block; }
        .auth-header h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-light); }

        .form-group-premium { margin-bottom: 1.25rem; }
        .form-group-premium label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .form-group-premium input { width: 100%; padding: 0.85rem 1rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; transition: 0.3s; }
        .form-group-premium input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.1); }
        
        .btn-xl { font-size: 1.1rem; padding: 1.1rem; margin-top: 1rem; }
        .auth-footer-premium { text-align: center; margin-top: 2rem; color: var(--text-light); }
        .auth-footer-premium a { color: var(--primary-color); text-decoration: none; font-weight: 700; }
        .error-box-premium { background: #ffe3e3; color: #c92a2a; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; font-weight: 600; text-align: center; }
      `}</style>
    </div>
  );
}

