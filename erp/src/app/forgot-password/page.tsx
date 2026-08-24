'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Ocurrió un error');
            } else {
                setMessage('Se ha enviado un enlace de recuperación a su correo electrónico.');
                // Optional: redirect after some time
                // setTimeout(() => router.push('/login'), 5000);
            }
        } catch (err) {
            setError('Error de conexión. Intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="brand-header">
                    <div className="logo">AN</div>
                    <h1>ANTINEO</h1>
                    <p>Recuperar Contraseña</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        <p className="instruction-text">
                            Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
                        </p>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field"
                                placeholder="ejemplo@antineo.com"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <span className="loader"></span> : 'Enviar Instrucciones'}
                        </button>
                    </form>
                ) : (
                    <div className="success-container">
                        <div className="success-icon">✓</div>
                        <p className="success-message">{message}</p>
                    </div>
                )}

                <div className="login-footer">
                    <Link href="/login" className="back-link">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .login-container {
          --primary: #007acc;
          --primary-dark: #005f99;
          --primary-rgb: 0, 122, 204;
          --border-color: #dfe6e9;
          --text-secondary: #636e72;
          --background-secondary: #f8f9fa;

          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 3rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            z-index: 10;
            border: 1px solid rgba(255,255,255,0.5);
            animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .brand-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: var(--primary);
            color: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 800;
            margin: 0 auto 1rem;
            box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
        }

        h1 {
            color: var(--primary-dark);
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            margin-bottom: 0.25rem;
        }

        .brand-header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
            font-weight: 500;
        }

        .instruction-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
        }

        .input-field {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.2s;
            background: var(--background-secondary);
        }

        .input-field:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
            outline: none;
            background: white;
        }

        .login-btn {
            width: 100%;
            padding: 1rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
        }

        .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .success-container {
            text-align: center;
            padding: 1rem 0;
        }

        .success-icon {
            width: 50px;
            height: 50px;
            background: #10B981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin: 0 auto 1.5rem;
        }

        .success-message {
            color: #065F46;
            font-weight: 500;
            line-height: 1.6;
        }

        .error-message {
            background: #FEE2E2;
            color: #DC2626;
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .login-footer {
            margin-top: 2rem;
            text-align: center;
            border-top: 1px solid var(--border-color);
            padding-top: 1.5rem;
        }

        .back-link {
            color: var(--primary);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        .loader {
            width: 20px;
            height: 20px;
            border: 2px solid #FFF;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
