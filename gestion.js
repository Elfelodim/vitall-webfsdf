// gestion.js

// 1. Conexión a Supabase (Mismas llaves que en script.js)
const supabaseUrl = 'https://zdmiylgzioarginxrmbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWl5bGd6aW9hcmdpbnhybWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDAzNzIsImV4cCI6MjA4NzA3NjM3Mn0.xHFSB1pJYB28rMUH57YrOyMNWPwfNh_PXNigHwVSqRM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. Función para formatear fechas amigables
function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-CO', {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 3. Función principal para extraer los datos de la base de datos
async function cargarTickets() {
    const user = Auth.requireAuth('gestion');
    if(!user) return;

    const tbody = document.getElementById('ticketsTabla');
    
    // Mostramos estado de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="loading-state">
                <i class="ph ph-spinner ph-spin" style="font-size: 2rem; color: var(--green); margin-bottom: 1rem;"></i>
                <p>Cargando información fresca de la base de datos...</p>
            </td>
        </tr>
    `;

    try {
        // Pedimos todos los registros de la tabla "clientes", ordenados del más reciente al más antiguo
        let { data: tickets, error } = await supabaseClient
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Filtramos por permisos (Dependiendo del rol del usuario en auth.js)
        if(user && user.tramites) {
            tickets = tickets.filter(ticket => user.tramites.includes(ticket.tipo_tramite));
        }

        // Limpiamos la tabla
        tbody.innerHTML = '';

        // Si no hay datos
        if (tickets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-state">
                        <p>Aún no hay ninguna solicitud registrada.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const ahora = new Date();

        // Si hay datos, los escribimos en la tabla HTML
        tickets.forEach(ticket => {
            // Evaluamos si el cliente subió un archivo o no
            let documentoHTML = `<span style="color: #94a3b8;">Sin adjunto</span>`;
            if (ticket.archivo_url) {
                documentoHTML = `
                    <a href="${ticket.archivo_url}" target="_blank" class="btn btn-primary-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">
                        <i class="ph-bold ph-download-simple"></i> Ver PDF
                    </a>
                `;
            }

            // ====== LÓGICA DE SEMÁFORO Y ESTADOS ======
            // Asignar estado por defecto si no existe (para datos viejos)
            const estadoActual = ticket.estado || 'Pendiente';
            
            // Calcular días transcurridos contando el día actual como 1 (sumando el día de radicación)
            const fechaTicket = new Date(ticket.created_at);
            const diffTime = Math.abs(ahora - fechaTicket);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            // Color del semáforo
            let colorSemaforo = '#22c55e'; // Verde (1 día)
            if (diffDays === 2) colorSemaforo = '#eab308'; // Amarillo (2 días)
            if (diffDays >= 3) colorSemaforo = '#ef4444'; // Rojo (3+ días)
            
            // Crear el texto de "X días"
            let textoTiempo = diffDays === 1 ? '1 día (Hoy)' : `${diffDays} días`;

            // Verificar si debe cambiar TODA la fila a rojo (Pendiente y más de 3 días)
            let alertClass = '';
            if (estadoActual === 'Pendiente' && diffDays >= 3) {
                alertClass = 'row-alert';
            }

            // HTML del Dropdown de Estado
            const estadoHTML = `
                <div style="display: flex; align-items: center;">
                    <span class="semaforo-dot" style="background-color: ${colorSemaforo};"></span>
                    <div>
                        <select class="select-estado" onchange="cambiarEstado(${ticket.id}, this.value)">
                            <option value="Pendiente" ${estadoActual === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="En Gestión" ${estadoActual === 'En Gestión' ? 'selected' : ''}>En Gestión</option>
                            <option value="Escalado" ${estadoActual === 'Escalado' ? 'selected' : ''}>Escalado</option>
                            <option value="Gestionado" ${estadoActual === 'Gestionado' ? 'selected' : ''}>Gestionado</option>
                        </select>
                        <span class="tiempo-badge">${textoTiempo}</span>
                    </div>
                </div>
            `;

            const tr = document.createElement('tr');
            if (alertClass) tr.classList.add(alertClass);
            
            tr.innerHTML = `
                <td style="color: #64748b; font-size: 0.85rem;">${formatearFecha(ticket.created_at)}</td>
                <td class="td-name">${ticket.nombre_completo}</td>
                <td>
                    <a href="https://wa.me/57${ticket.telefono.replace(/\s+/g, '')}" target="_blank" style="color: var(--green); display: flex; align-items: center; gap: 0.3rem; font-weight: 500;">
                        <i class="ph-fill ph-whatsapp-logo"></i> ${ticket.telefono}
                    </a>
                </td>
                <td><span class="badge-type">${ticket.tipo_tramite}</span></td>
                <td>${estadoHTML}</td>
                <td>${documentoHTML}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error cargando los tickets:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-state" style="color: #ef4444;">
                    <i class="ph-fill ph-warning-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Ocurrió un error al cargar los datos: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

// 4. Función para actualizar el estado en la base de datos
async function cambiarEstado(ticketId, nuevoEstado) {
    try {
        const { error } = await supabaseClient
            .from('clientes')
            .update({ estado: nuevoEstado })
            .eq('id', ticketId);
            
        if (error) throw error;
        
        // Recargar la tabla para aplicar el cambio visual instantáneamente
        cargarTickets();
        
    } catch (error) {
        alert("Hubo un error al actualizar el estado: " + error.message);
    }
}

// 5. Ejecutar la función apenas se abra la página
document.addEventListener('DOMContentLoaded', cargarTickets);
