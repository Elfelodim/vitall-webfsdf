'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@clicksalud.com');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Credenciales inválidas');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="brand-header">
                    <div className="logo">CS</div>
                    <h1>ClickSalud ERP</h1>
                    <p>Software Integral para Médicos e IPS</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                        <div className="forgot-password-wrapper">
                            <Link href="/forgot-password" title="¿Olvidó su contraseña?">
                                ¿Olvidó su contraseña?
                            </Link>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <span className="loader"></span> : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 ClickSalud ERP v2.0 - Todos los derechos reservados</p>
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
            margin-bottom: 2.5rem;
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

        .form-group {
            margin-bottom: 1.5rem;
            position: relative;
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

        .forgot-password-wrapper {
            margin-top: 0.5rem;
            text-align: right;
        }

        .forgot-password-wrapper :global(a) {
            color: var(--primary);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
        }

        .forgot-password-wrapper :global(a:hover) {
            color: var(--primary-dark);
            text-decoration: underline;
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

        .login-btn:active {
            transform: translateY(0);
        }

        .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
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
