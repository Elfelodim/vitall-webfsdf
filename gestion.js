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

// Variables globales para la lógica de filtros
window.todosLosTickets = [];

// 3. Función principal para extraer los datos de la base de datos
async function cargarTickets() {
    const user = Auth.requireAuth('gestion');
    if(!user) return;

    const tbody = document.getElementById('ticketsTabla');
    
    // Mostramos estado de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-state">
                <i class="ph ph-spinner ph-spin" style="font-size: 2rem; color: var(--green); margin-bottom: 1rem;"></i>
                <p>Cargando información fresca de la base de datos...</p>
            </td>
        </tr>
    `;

    try {
        // Pedimos todos los registros al mismo tiempo que pedimos las estadísticas
        const fetchTickets = supabaseClient
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false });
        
        const fetchStats = supabaseClient
            .from('estadisticas')
            .select('contador')
            .eq('id', 1)
            .single();

        const [ticketsResponse, statsResponse] = await Promise.all([fetchTickets, fetchStats]);

        if (ticketsResponse.error) throw ticketsResponse.error;
        
        let tickets = ticketsResponse.data;

        // Actualizar UI Contador Visitas
        const contadorSpan = document.getElementById('contadorVisitasTotal');
        if(contadorSpan && statsResponse.data && statsResponse.data.contador !== null) {
            contadorSpan.textContent = statsResponse.data.contador;
        } else if (contadorSpan) {
            contadorSpan.textContent = '0';
        }

        // Mapa de retro-compatibilidad para que no desaparezcan tus registros antiguos
        const equivalenciasAntiguas = {
            'Asesoría Legal en Salud': ['tutela'],
            'Gestión de Autorizaciones Médicas': ['autorizacion'],
            'Agendamiento de Citas Especializadas': ['cita'],
            'Afiliaciones y Traslados': ['afiliacion'],
            // 'otro' podría verse por cualquier admin, pero dejémoslo libre si queremos
        };

        // Filtramos por permisos (Dependiendo del rol del usuario en auth.js)
        if(user && user.tramites) {
            tickets = tickets.filter(ticket => {
                const tramite = ticket.tipo_tramite;
                // Si el trámite coincide directamente con los nuevos nombres
                if (user.tramites.includes(tramite)) return true;
                
                // Si el trámite es un texto antiguo ("tutela", "cita"), ver si el usuario tiene permiso para la categoría equivalente
                for (let permisoNuevo of user.tramites) {
                    if(equivalenciasAntiguas[permisoNuevo] && equivalenciasAntiguas[permisoNuevo].includes(tramite)) {
                        return true;
                    }
                }
                
                // Dejar ver los de "otro" solo si es admin
                if(tramite === 'otro' && user.modulos.includes('admin')) return true;

                return false;
            });
        }

        // Guardamos los tickets obtenidos en la variable global
        window.todosLosTickets = tickets;
        
        // Llenamos el select de trámites de acuerdo a los permisos
        llenarFiltroTramites(user.tramites);

        // Disparamos la función que finalmente dibuja
        aplicarFiltrosLocales();

    } catch (error) {
        console.error("Error cargando los tickets:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-state" style="color: #ef4444;">
                    <i class="ph-fill ph-warning-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Ocurrió un error al cargar los datos: ${error.message}</p>
                </td>
            </tr>
        `;
        }
}

// 4. Función encargada de dibujar la tabla dado un arreglo de tickets
function renderTabla(lista) {
    const tbody = document.getElementById('ticketsTabla');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-state">
                    <p>No se encontraron resultados o registros.</p>
                </td>
            </tr>
        `;
        return;
    }

    const ahora = new Date();

    lista.forEach(ticket => {
        let documentoHTML = `<span style="color: #94a3b8;">Sin adjunto</span>`;
        if (ticket.archivo_url) {
            const urls = ticket.archivo_url.split(',');
            if(urls.length === 1) {
                documentoHTML = `
                    <a href="${urls[0]}" target="_blank" class="btn btn-primary-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; text-decoration: none;">
                        <i class="ph-bold ph-download-simple"></i> Ver PDF
                    </a>
                `;
            } else {
                // Hay múltiples archivos
                documentoHTML = `<div style="display: flex; flex-direction: column; gap: 0.3rem;">`;
                urls.forEach((url, idx) => {
                    documentoHTML += `
                        <a href="${url.trim()}" target="_blank" style="color: var(--blue-main); font-size: 0.8rem; text-decoration: underline; display: flex; align-items: center; gap: 0.2rem;">
                            <i class="ph-fill ph-file-pdf"></i> Doc ${idx + 1}
                        </a>
                    `;
                });
                documentoHTML += `</div>`;
            }
        }

        const estadoActual = ticket.estado || 'Pendiente';
        const fechaTicket = new Date(ticket.created_at);
        const diffTime = Math.abs(ahora - fechaTicket);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        let colorSemaforo = '#22c55e';
        if (diffDays === 2) colorSemaforo = '#eab308';
        if (diffDays >= 3) colorSemaforo = '#ef4444';
        
        let textoTiempo = diffDays === 1 ? '1 día (Hoy)' : `${diffDays} días`;

        // Apagar / Detener semáforo si el ticket ya no requiere gestión
        if (estadoActual === 'Gestionado') {
            colorSemaforo = '#3b82f6'; // Azul: resuelto exitosamente
            textoTiempo = 'Completado';
        } else if (estadoActual === 'Rechazado') {
            colorSemaforo = '#94a3b8'; // Gris: archivado/rechazado
            textoTiempo = 'Archivado';
        }

        let alertClass = '';
        if (estadoActual === 'Pendiente' && diffDays >= 3) {
            alertClass = 'row-alert';
        }

        const estadoHTML = `
            <div style="display: flex; align-items: center;">
                <span class="semaforo-dot" style="background-color: ${colorSemaforo};"></span>
                <div>
                    <select class="select-estado" onchange="cambiarEstado('${ticket.id}', this.value)">
                        <option value="Pendiente" ${estadoActual === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En Gestión" ${estadoActual === 'En Gestión' ? 'selected' : ''}>En Gestión</option>
                        <option value="Escalado" ${estadoActual === 'Escalado' ? 'selected' : ''}>Escalado</option>
                        <option value="Gestionado" ${estadoActual === 'Gestionado' ? 'selected' : ''}>Gestionado</option>
                        <option value="Rechazado" ${estadoActual === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
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
            <td><div style="max-width: 250px; font-size: 0.85rem; color: var(--gray-600); line-height: 1.4; word-wrap: break-word; white-space: normal; overflow-wrap: break-word;">${ticket.observaciones || '<span style="color:#cbd5e1;font-style:italic;">Sin observación</span>'}</div></td>
            <td>${estadoHTML}</td>
            <td>${documentoHTML}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. Función para actualizar el estado
async function cambiarEstado(ticketId, nuevoEstado) {
    try {
        const { error } = await supabaseClient
            .from('clientes')
            .update({ estado: nuevoEstado })
            .eq('id', ticketId);

        if (error) throw error;
        
        // Actualizamos localmente para no tener que recargar todo
        const elTicket = window.todosLosTickets.find(t => String(t.id) === String(ticketId));
        if (elTicket) elTicket.estado = nuevoEstado;
        
        // Refrescamos vista
        aplicarFiltrosLocales();
        
    } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Hubo un error al cambiar el estado. Intenta de nuevo.');
        cargarTickets();
    }
}

// 6. Funcionalidades de Filtros
function llenarFiltroTramites(tramitesAutorizados) {
    const selector = document.getElementById('filterTramite');
    if(!selector) return;
    
    // Dejar la opcion "Todos"
    selector.innerHTML = '<option value="todos">Todos los trámites</option>';
    
    if(tramitesAutorizados) {
        tramitesAutorizados.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            selector.appendChild(opt);
        });
    }
}

function aplicarFiltrosLocales() {
    let listData = window.todosLosTickets;
    
    // Obtener valores de los inputs
    const textSearch = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const tramiteSelect = document.getElementById('filterTramite')?.value || 'todos';
    const estadoSelect = document.getElementById('filterEstado')?.value || 'todos';

    // Aplicar Filtro 1: Buscador Libre (Nombre o teléfono)
    if(textSearch) {
        listData = listData.filter(t => 
            (t.nombre_completo && t.nombre_completo.toLowerCase().includes(textSearch)) ||
            (t.telefono && t.telefono.includes(textSearch))
        );
    }
    
    // Aplicar Filtro 2: Trámite
    if(tramiteSelect !== 'todos') {
        listData = listData.filter(t => t.tipo_tramite === tramiteSelect);
    }
    
    // Aplicar Filtro 3: Estado
    /* Los estados en el select son: pendiente, en_gestion, etc (algunos con mayusculas). 
       Vamos a comparar unicamente asumiendo los string literales que asignamos al select o ignorando cases. */
    if(estadoSelect !== 'todos') {
        // En el HTML, los option tienen values: recibido, revision, aprobado, pendiente_documento, rechazado.
        // Pero en la base de datos se guardan como en el select-estado literal ('Pendiente', 'En Gestión').
        // Ah, he visto que el HTML decia recibido/revision pero mi select estado usa Pendiente / En Gestión.
        // Convertiré ambos a minusculas y buscaré substring para mayor robustez
        listData = listData.filter(t => {
            const tEstado = (t.estado || 'Pendiente').toLowerCase();
            return tEstado.includes(estadoSelect.substring(0,4)); // e.g., 'pend', 'en g', etc.
        });
    }

    window.ticketsFiltrados = listData;
    renderTabla(listData);
}

function limpiarFiltros() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterTramite').value = 'todos';
    document.getElementById('filterEstado').value = 'todos';
    aplicarFiltrosLocales();
}

function descargarExcel() {
    const data = window.ticketsFiltrados || window.todosLosTickets;
    if (!data || data.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Cabeceras
    const headers = ['Fecha de Solicitud', 'Paciente', 'Teléfono', 'Trámite', 'Estado', 'Observaciones'];
    
    // Crear el contenido CSV
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para acentos en Excel
    csvContent += headers.join(';') + '\r\n'; // Delimitador punto y coma

    data.forEach(t => {
        const fecha = formatearFecha(t.created_at).replace(/;/g, ',');
        const nombre = (t.nombre_completo || '').replace(/;/g, ',').replace(/\n/g, ' ');
        const telefono = (t.telefono || '').replace(/;/g, ',').replace(/\n/g, ' ');
        const tramite = (t.tipo_tramite || '').replace(/;/g, ',').replace(/\n/g, ' ');
        const estado = (t.estado || 'Pendiente').replace(/;/g, ',').replace(/\n/g, ' ');
        const obs = (t.observaciones || '').replace(/;/g, ',').replace(/\n/g, ' ');

        const row = [fecha, nombre, telefono, tramite, estado, obs];
        csvContent += row.join(';') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fechaDescarga = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Consolidado_Tickets_${fechaDescarga}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Iniciar
document.addEventListener('DOMContentLoaded', cargarTickets);
