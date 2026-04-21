// agenda_turnos.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth check
    const user = Auth.requireAuth(); 
    if(!user) return;

    // La validación de rol específico la haremos después de cargar los médicos
    // para ver si el email coincide con un doctor.

    const supabase = Auth.getClient();

    const filterDate = document.getElementById('filterDate');
    const filterDoctor = document.getElementById('filterDoctor');
    const btnLoadAgenda = document.getElementById('btnLoadAgenda');
    
    // Set today 
    filterDate.value = new Date().toISOString().split('T')[0];

    let medicos = [];
    let citasDelDia = [];
    let horarioDelDia = null;

    // Load Doctors
    try {
        const { data, error } = await supabase.from('medicos').select('id, nombre, especialidad, correo').order('nombre');
        if(data) {
            medicos = data;
            
            // Validar si el logueado es médico
            let miPerfilMedico = medicos.find(m => m.correo === user.email);
            const isAdmin = user.modulos && (user.modulos.includes('admin') || user.modulos.includes('gestion'));

            if(!isAdmin && !miPerfilMedico) {
                alert("No tienes permisos nivel Admin ni estás registrado como médico en el directorio.");
                window.location.href = 'index.html';
                return;
            }

            filterDoctor.innerHTML = '<option value="" disabled selected>Seleccione un médico</option>';
            
            if(miPerfilMedico && !isAdmin) {
                // Restricción total: Solo él mismo
                filterDoctor.innerHTML = `<option value="${miPerfilMedico.id}" selected>${miPerfilMedico.nombre} (${miPerfilMedico.especialidad})</option>`;
                filterDoctor.disabled = true;
                
                // Auto click para cargar su agenda de hoy
                setTimeout(()=> btnLoadAgenda.click(), 300);
            } else {
                // Admin: Ve a todos
                medicos.forEach(m => {
                    filterDoctor.innerHTML += `<option value="${m.id}">${m.nombre} (${m.especialidad})</option>`;
                });
            }
        }
    } catch(e) {
        console.error("Error cargando médicos", e);
    }

    btnLoadAgenda.addEventListener('click', async () => {
        const dateVal = filterDate.value;
        const medId = filterDoctor.value;

        if(!dateVal || !medId) {
            alert('Por favor selecciona una fecha y un médico.');
            return;
        }

        const med = medicos.find(m => m.id === medId);
        document.getElementById('viewMedName').innerText = `Agenda: ${med.nombre}`;
        document.getElementById('viewDateDesc').innerText = `Para la fecha ${dateVal}`;
        const timeline = document.getElementById('agendaTimeline');
        
        timeline.innerHTML = '<div style="text-align:center; padding:3rem;"><i class="ph ph-spinner ph-spin" style="font-size:3rem; color:var(--blue-main);"></i></div>';

        try {
            // 1. Obtener regla de horario para ese día
            let d = new Date(dateVal + 'T00:00:00'); 
            let dow = d.getDay(); 
            if(dow === 0) dow = 7; 

            const { data: regData } = await supabase.from('horarios_medicos')
                                        .select('*')
                                        .eq('medico_id', medId)
                                        .eq('dia_semana', dow)
                                        .eq('activo', true)
                                        .single();
            
            horarioDelDia = regData;

            if(!horarioDelDia) {
                timeline.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: var(--gray-500); border: 2px dashed var(--gray-300); border-radius: var(--radius-lg);">
                        <i class="ph-fill ph-calendar-x" style="font-size: 3rem; margin-bottom:1rem; color: var(--red);"></i>
                        <h3>Sin servicio programado</h3>
                        <p>El médico no tiene configurado un horario de atención para este día de la semana.</p>
                    </div>`;
                return;
            }

            // 2. Obtener Citas de ese día
            const { data: cData } = await supabase.from('citas')
                                    .select('*')
                                    .eq('medico_id', medId)
                                    .eq('fecha_cita', dateVal)
                                    .order('hora_inicio');
            
            citasDelDia = cData || [];

            renderTimeline();

        } catch(e) {
            console.error("Error al cargar la agenda:", e);
            timeline.innerHTML = '<div style="color:red; text-align:center;">Ocurrió un rrror al consultar la base de datos. Verifica la conexión o el script SQL.</div>';
        }
    });

    function renderTimeline() {
        const timeline = document.getElementById('agendaTimeline');
        timeline.innerHTML = '';

        const duracion = horarioDelDia.duracion_cita_minutos || 20;

        let curTimeMs = timeToMs(horarioDelDia.hora_inicio);
        const endTimeMs = timeToMs(horarioDelDia.hora_fin);

        const breakStart = horarioDelDia.hora_break_inicio ? timeToMs(horarioDelDia.hora_break_inicio) : null;
        const breakEnd = horarioDelDia.hora_break_fin ? timeToMs(horarioDelDia.hora_break_fin) : null;

        let breakShown = false;

        while(curTimeMs + (duracion * 60000) <= endTimeMs) {
            const slotStartMs = curTimeMs;
            const slotEndMs = slotStartMs + (duracion * 60000);
            curTimeMs = slotEndMs; // advance
            
            const strStart = msToTime(slotStartMs).substring(0,5);
            const strEnd = msToTime(slotEndMs).substring(0,5);

            // Break Logic
            if(breakStart && breakEnd) {
                if((slotStartMs >= breakStart && slotStartMs < breakEnd) || 
                   (slotEndMs > breakStart && slotEndMs <= breakEnd)) {
                    
                    if(!breakShown) {
                        timeline.innerHTML += `
                            <div class="t-slot">
                                <div class="t-time empty">${msToTime(breakStart).substring(0,5)}</div>
                                <div class="t-card break-card">
                                    <i class="ph-bold ph-coffee" style="margin-right:0.5rem;"></i> Hora de Descanso (Break)
                                </div>
                            </div>
                        `;
                        breakShown = true;
                    }
                    continue; 
                }
            }

            // Verify Appointment
            const citaSlot = citasDelDia.find(c => c.hora_inicio.substring(0,5) === strStart);

            if(citaSlot) {
                let badgeClass = 'bg-tag-control';
                if(citaSlot.tipo_cita === 'primera_vez') badgeClass = 'bg-tag-primer';
                else if(citaSlot.tipo_cita === 'examen') badgeClass = 'bg-tag-examen';

                const tipoLimpio = citaSlot.tipo_cita.replace('_', ' ').toUpperCase();

                const slotHTML = `
                    <div class="t-slot">
                        <div class="t-time">${strStart}</div>
                        <div class="t-card" style="cursor:pointer;" onclick='showPatientInfo(${JSON.stringify(citaSlot).replace(/'/g, "&#39;")})'>
                            <div>
                                <strong style="display:block; color:var(--blue-dark); font-size:1.1rem;">${citaSlot.paciente_nombre}</strong>
                                <span style="font-size:0.8rem; color:var(--gray-500);"><i class="ph-bold ph-identification-card"></i> ${citaSlot.paciente_tipo_doc} ${citaSlot.paciente_num_doc}</span>
                            </div>
                            <div style="text-align:right;">
                                <span class="t-badge ${badgeClass}">${tipoLimpio}</span>
                            </div>
                        </div>
                    </div>
                `;
                timeline.innerHTML += slotHTML;
            } else {
                const slotHTML = `
                    <div class="t-slot">
                        <div class="t-time empty">${strStart}</div>
                        <div class="t-card empty-card">
                            <span>Espacio Disponible</span>
                        </div>
                    </div>
                `;
                timeline.innerHTML += slotHTML;
            }
        }
    }

    window.showPatientInfo = function(cita) {
        document.getElementById('patientModal').style.display = 'flex';
        
        let wsLink = `https://wa.me/57${cita.paciente_telefono}`; // asumiendo código colombia como defecto o lo que traiga
        
        document.getElementById('patientDetails').innerHTML = `
            <p><strong>Paciente:</strong> ${cita.paciente_nombre}</p>
            <p><strong>Documento:</strong> ${cita.paciente_tipo_doc} ${cita.paciente_num_doc}</p>
            <p><strong>Nacimiento:</strong> ${cita.paciente_fecha_nac}</p>
            <p><strong>Teléfono:</strong> ${cita.paciente_telefono} <a href="${wsLink}" target="_blank" style="color:var(--green); text-decoration:none;"><i class="ph-fill ph-whatsapp-logo"></i> Chatear</a></p>
            <p><strong>Email:</strong> ${cita.paciente_correo || 'No proporcionado'}</p>
            <hr style="border:0; border-top:1px solid var(--gray-200); margin: 1rem 0;">
            <p><strong>EPS:</strong> ${cita.eps || 'Particular'}</p>
            <p><strong>Servicio:</strong> ${cita.especialidad}</p>
            <p><strong>Motivo:</strong> ${cita.tipo_cita}</p>
            <div style="background:#f8fafc; padding:1rem; border-radius:4px; margin-top:1rem; border:1px solid var(--gray-200);">
                <strong>Observaciones:</strong><br>
                ${cita.observacion || 'Ninguna observación.'}
            </div>
        `;
    }

    // Utilidades
    function timeToMs(timeStr) {
        const parts = timeStr.split(':');
        let d = new Date();
        d.setHours(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]||0), 0);
        return d.getTime();
    }
    
    function msToTime(ms) {
        let d = new Date(ms);
        let h = d.getHours().toString().padStart(2, '0');
        let m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}:00`;
    }
});
