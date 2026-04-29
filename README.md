# ClickSalud Colombia - v1.0

Este repositorio contiene la versión inicial del sistema web para **ClickSalud Colombia**, una empresa de consultoría en salud que gestiona tutelas, autorizaciones, citas y afiliaciones. 

## 📋 Descripción General

El sistema proporciona una plataforma web completa que incluye una "landing page" informativa para los clientes, un sistema de autenticación, y módulos administrativos para la gestión de solicitudes, tickets y citas médicas. Está construido utilizando tecnologías web estándar (HTML, CSS, JavaScript) y utiliza **Supabase** como backend para la base de datos y la autenticación.

## 🚀 Características Principales (Versión 1)

1. **Portal Público (Landing Page)**
   - Información de la empresa, servicios ofrecidos y equipo.
   - Formulario seguro para que los clientes suban documentos e inicien trámites.
   - Soporte multilingüe (Español e Inglés) gestionado por `lang.js`.

2. **Sistema de Autenticación**
   - Integración con Supabase Auth.
   - Inicio de sesión (`login.html`) y recuperación/cambio de contraseñas (`cambiar_clave.html`).

3. **Módulo de Gestión de Tickets**
   - Interfaz para ver y administrar las solicitudes de los usuarios (`gestion.html` / `gestion.js`).
   - Diferentes estados para el seguimiento de los trámites.

4. **Panel de Administración (Dashboard)**
   - Vista general de estadísticas e indicadores clave (`admin.html`).

5. **Módulo de Agendamiento de Citas**
   - Interfaz para que los pacientes o administradores agenden citas (`agendar_cita.html`).
   - Visualización de la agenda de turnos (`agenda_turnos.html`).
   - Configuración de médicos y especialidades (`medicos_config.html`).
   - Scripts SQL (`supabase_agenda.sql`) para crear las estructuras necesarias en Supabase.

6. **Configuración del Sistema**
   - Módulo de ajustes generales de la plataforma (`configuracion.html`).

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend / Base de Datos:** Supabase (PostgreSQL, Auth, Storage).
- **Iconos:** Phosphor Icons.
- **Tipografías:** Google Fonts (Inter, Outfit).

## 📁 Estructura del Proyecto

- `index.html`: Página principal y formulario de contacto público.
- `login.html`, `auth.js`, `cambiar_clave.html`: Manejo de sesiones y seguridad.
- `admin.html`: Dashboard y estadísticas.
- `gestion.html`, `gestion.js`: Gestión de tickets y solicitudes.
- `agendar_cita.html`, `agenda_turnos.html`, `medicos_config.html`: Sistema de citas médicas.
- `styles.css`: Hoja de estilos principal.
- `lang.js`: Lógica de traducción e internacionalización.
- `script.js`: Scripts generales de la interfaz.
- `assets/`: Directorio que contiene las imágenes y recursos estáticos (`logo.png`, `hero.png`, etc.).
- `supabase_agenda.sql`: Archivo SQL con las tablas, políticas de seguridad (RLS) y funciones para configurar la base de datos en Supabase.

## 📦 Configuración Inicial

Para desplegar este proyecto, es necesario:
1. Crear un proyecto en Supabase.
2. Ejecutar los scripts contenidos en `supabase_agenda.sql` en el SQL Editor de Supabase.
3. Configurar las credenciales de Supabase (URL y API Key) en los scripts de JavaScript (`script.js`, `auth.js`, etc.).
4. Servir los archivos estáticos mediante cualquier servidor web (ej. Vercel, Netlify, GitHub Pages, o localmente con Live Server o Nginx).

---
*Este documento marca el estado de la versión 1 (v1.0) antes de iniciar el desarrollo de la versión 2.*
