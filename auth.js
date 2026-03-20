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

    // Usuarios del prototipo (Modo Demo / Fallback si no existe la tabla 'usuarios' en Supabase)
    mockUsers: [
        {
            email: 'admin@clicksalud.com',
            password: 'admin',
            nombre: 'Gestor Integral',
            modulos: ['gestion', 'admin', 'sistemas'],
            tramites: [
                'Afiliaciones y Traslados',
                'Pólizas y Planes de Salud',
                'Agendamiento de Citas Especializadas',
                'Gestión de Autorizaciones Médicas',
                'Reclamación de Medicamentos',
                'Asesoría Legal en Salud'
            ]
        },
        {
            email: 'asesor1@clicksalud.com',
            password: '123',
            nombre: 'Asesor de Trámites Básicos',
            modulos: ['gestion'],
            tramites: ['Afiliaciones y Traslados', 'Agendamiento de Citas Especializadas', 'Pólizas y Planes de Salud']
        },
        {
            email: 'legal@clicksalud.com',
            password: '123',
            nombre: 'Asesoría Jurídica',
            modulos: ['gestion'],
            tramites: ['Asesoría Legal en Salud', 'Reclamación de Medicamentos', 'Gestión de Autorizaciones Médicas']
        }
    ],

    // Hash de contraseña en frontend (Cifrado SHA-256)
    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async login(email, password) {
        let validUser = null;
        let pHash = await this.hashPassword(password);

        // 1. Intenta validar contra la base de datos Supabase
        try {
            const client = this.getClient();
            if(client) {
                const { data, error } = await client
                    .from('usuarios')
                    .select('*')
                    .eq('email', email)
                    .eq('password_hash', pHash)
                    .single();
                    
                if(!error && data) {
                    // Validamos si la columna existe y es parseada
                    data.modulos = typeof data.modulos === 'string' ? JSON.parse(data.modulos) : data.modulos;
                    data.tramites = typeof data.tramites === 'string' ? JSON.parse(data.tramites) : data.tramites;
                    validUser = data;
                }
            }
        } catch(e) {
            console.warn("Tabla usuarios en Supabase no encontrada o con formato incorrecto. Usando modo local (Prototipo).");
        }

        // 2. Si no encontró en BD, busca en Mock (donde la clave está cruda)
        if(!validUser) {
            validUser = this.mockUsers.find(u => u.email === email && u.password === password);
        }

        if(validUser) {
            localStorage.setItem('clicksalud_session', JSON.stringify(validUser));
            
            // Si el usuario necesita cambiar clave
            if(validUser.must_change_password) {
                return 'CHANGE_PASSWORD';
            }
            return 'SUCCESS';
        }
        return 'FAILED';
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
