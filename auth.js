// auth.js
const Auth = {
    // Mismas credenciales que script.js y gestion.js
    supabaseUrl: 'https://zdmiylgzioarginxrmbd.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWl5bGd6aW9hcmdpbnhybWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDAzNzIsImV4cCI6MjA4NzA3NjM3Mn0.xHFSB1pJYB28rMUH57YrOyMNWPwfNh_PXNigHwVSqRM',
    
    getClient() {
        if(!window.supabaseClientAuth && window.supabase) {
            window.supabaseClientAuth = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        }
        return window.supabaseClientAuth;
    },

    // Hash de contraseña en frontend (Cifrado SHA-256)
    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    lastError: null,

    async login(email, password) {
        this.lastError = null;
        try {
            const client = this.getClient();
            if(!client) {
                this.lastError = "No se pudo inicializar el cliente de Supabase.";
                return 'FAILED';
            }

            const cleanEmail = (email || '').trim().toLowerCase();
            const pHash = await this.hashPassword(password);

            // Validar si existe la cuenta por correo primero
            const { data, error } = await client
                .from('usuarios')
                .select('*')
                .eq('email', cleanEmail)
                .maybeSingle();

            if (error) {
                console.warn("Error consultando usuario en Supabase:", error);
                if (error.code === '42501') {
                    this.lastError = "Permiso denegado por RLS en Supabase. Ejecuta en el SQL Editor: ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;";
                } else {
                    this.lastError = `Error Supabase (${error.code || 'DB'}): ${error.message}`;
                }
                return 'FAILED';
            }

            if (!data) {
                this.lastError = `El correo "${cleanEmail}" no está registrado. Si es tu primera vez, puedes crear tu cuenta de Administrador haciendo clic en la pestaña 'Registrar Administrador'.`;
                return 'FAILED';
            }

            // Comparar hashes de contraseña
            if (data.password_hash !== pHash) {
                this.lastError = "La contraseña ingresada es incorrecta. Por favor verifica tus credenciales.";
                return 'FAILED';
            }

            // Parseamos los JSON de permisos
            data.modulos = typeof data.modulos === 'string' ? JSON.parse(data.modulos) : (data.modulos || []);
            data.tramites = typeof data.tramites === 'string' ? JSON.parse(data.tramites) : (data.tramites || []);

            // Guardar sesión del usuario en localStorage
            localStorage.setItem('clicksalud_session', JSON.stringify(data));
            
            if(data.must_change_password) return 'CHANGE_PASSWORD';
            return 'SUCCESS';
            
        } catch(e) {
            console.error("Error en el login:", e);
            this.lastError = `Excepción del sistema: ${e.message}`;
            return 'FAILED';
        }
    },

    async registerUser(nombre, email, password, modulos = ['gestion', 'admin', 'sistemas'], tramites = []) {
        this.lastError = null;
        try {
            const client = this.getClient();
            if(!client) {
                this.lastError = "No se pudo inicializar el cliente de Supabase.";
                return false;
            }

            const cleanEmail = (email || '').trim().toLowerCase();
            const pHash = await this.hashPassword(password);

            const payload = {
                email: cleanEmail,
                password_hash: pHash,
                nombre: nombre.trim(),
                modulos: modulos,
                tramites: tramites,
                must_change_password: false
            };

            const { data, error } = await client
                .from('usuarios')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.error("Error registrando usuario:", error);
                if (error.code === '23505') {
                    this.lastError = `El correo "${cleanEmail}" ya está registrado en el sistema. Puedes iniciar sesión directamente.`;
                } else if (error.code === '42501') {
                    this.lastError = "Permiso denegado por Row Level Security (RLS) en Supabase. Ejecuta en el SQL Editor de Supabase: ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;";
                } else {
                    this.lastError = `Error al crear usuario (${error.code || 'DB'}): ${error.message}`;
                }
                return false;
            }

            if (data) {
                data.modulos = typeof data.modulos === 'string' ? JSON.parse(data.modulos) : (data.modulos || []);
                data.tramites = typeof data.tramites === 'string' ? JSON.parse(data.tramites) : (data.tramites || []);
                localStorage.setItem('clicksalud_session', JSON.stringify(data));
            }
            return true;
        } catch(e) {
            console.error("Error en el registro:", e);
            this.lastError = `Excepción del sistema: ${e.message}`;
            return false;
        }
    },

    async resetPassword(email, newPassword) {
        this.lastError = null;
        try {
            const client = this.getClient();
            if(!client) {
                this.lastError = "No se pudo conectar a la base de datos.";
                return false;
            }

            const cleanEmail = (email || '').trim().toLowerCase();
            const pHash = await this.hashPassword(newPassword);

            // Verificar primero si el correo existe
            const { data: existingUser, error: checkError } = await client
                .from('usuarios')
                .select('email, nombre')
                .eq('email', cleanEmail)
                .maybeSingle();

            if (checkError) {
                console.error("Error verificando usuario:", checkError);
                this.lastError = `Error en base de datos: ${checkError.message}`;
                return false;
            }

            if (!existingUser) {
                this.lastError = `El correo "${cleanEmail}" no está registrado en la plataforma.`;
                return false;
            }

            // Actualizar la contraseña en Supabase
            const { error } = await client
                .from('usuarios')
                .update({ password_hash: pHash, must_change_password: false })
                .eq('email', cleanEmail);

            if (error) {
                console.error("Error actualizando contraseña:", error);
                if (error.code === '42501') {
                    this.lastError = "Permiso denegado por RLS en Supabase. Ejecuta en Supabase SQL Editor: ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;";
                } else {
                    this.lastError = `Error Supabase (${error.code || 'DB'}): ${error.message}`;
                }
                return false;
            }

            return true;
        } catch(e) {
            console.error("Error restableciendo contraseña:", e);
            this.lastError = `Excepción del sistema: ${e.message}`;
            return false;
        }
    },

    logout() {
        localStorage.removeItem('clicksalud_session');
        window.location.href = 'login.html';
    },

    getCurrentUser() {
        const session = localStorage.getItem('clicksalud_session');
        return session ? JSON.parse(session) : null;
    },

    requireAuth(moduloRequerido) {
        const user = this.getCurrentUser();
        // Redirigir si no hay sesión
        if(!user) {
            window.location.href = 'login.html';
            return null;
        }

        // Si requiere un módulo específico y no lo tiene, rebota
        if(moduloRequerido && (!user.modulos || !user.modulos.includes(moduloRequerido))) {
            alert(`Hola ${user.nombre}, no tienes permisos para acceder al módulo de: ${moduloRequerido}`);
            if(user.modulos.includes('gestion')) window.location.href = 'gestion.html';
            else if(user.modulos.includes('admin')) window.location.href = 'admin.html';
            else if(user.modulos.includes('sistemas')) window.location.href = 'configuracion.html';
            else this.logout();
            return null;
        }

        // Si el usuario requiere cambio de clave, nunca dejarlo pasar a otros lados
        if(user.must_change_password && !window.location.pathname.endsWith('cambiar_clave.html')) {
            window.location.href = 'cambiar_clave.html';
            return null;
        }

        return user;
    },
    
    // Inyecta el control UI del usuario (Avatar + Botón de salir)
    setupNavbar() {
        const user = this.getCurrentUser();
        if(!user) return;
        
        const userInfoContainers = document.querySelectorAll('.header-user-info');
        userInfoContainers.forEach(container => {
           container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <button onclick="Auth.logout()" class="btn-action" title="Cerrar Sessión" style="border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white;">
                        <i class="ph ph-sign-out"></i>
                    </button>
                    <div style="text-align: right; line-height: 1.1;">
                        <span style="font-size: 0.95rem; font-weight: 600; display: block; color: white;">${user.nombre}</span>
                        <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${user.email}</span>
                    </div>
                </div>
           `; 
        });
        
        // Ocultar links de módulos a los que no tiene acceso
        const links = document.querySelectorAll('.header-links a');
        links.forEach(link => {
            if(link.getAttribute('href') === 'gestion.html' && !user.modulos.includes('gestion')) link.style.display = 'none';
            if(link.getAttribute('href') === 'admin.html' && !user.modulos.includes('admin')) link.style.display = 'none';
            if(link.getAttribute('href') === 'configuracion.html' && !user.modulos.includes('sistemas')) link.style.display = 'none';
        });
    }
};

// Automáticamente configurar UI en las páginas administrativas
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en cualquier página protegida y no en el index ni en login
    if(!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        Auth.setupNavbar();
    }
});
