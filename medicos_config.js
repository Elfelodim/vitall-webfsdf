// medicos_config.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Autenticación (Solo Admin/Sistemas/Gestión)
    const user = Auth.requireAuth('admin'); // O 'gestion' dependiendo de la política
    if(!user) return; // Redirige internamente

    const supabase = Auth.getClient();

    // DOM Elements
    const doctorsList = document.getElementById('doctorsList');
    const configPanel = document.getElementById('configPanel');
    const emptyStatePanel = document.getElementById('emptyStatePanel');
    const btnNewDoctor = document.getElementById('btnNewDoctor');
    
    const docSpecSelect = document.getElementById('docSpec');
    const scheduleContainer = document.getElementById('scheduleContainer');
    
    // Arrays para mantener estado
    let medicos = [];
    let especialidades = [
        'Cardiología', 'Pediatría', 'Dermatología', 
        'Medicina General', 'Ginecología', 'Ortopedia', 
        'Neurología', 'Oftalmología'
    ];
    let selectedDoctorId = null;

    const DUMMY_UUID_NEW = 'new_doctor_uuid';

    // Inicializar
    await loadEspecialidades();
    await loadMedicos();
    renderDiasSemana();

    // --- CARGA DE DATOS ---

    async function loadEspecialidades() {
        try {
            const { data, error } = await supabase.from('especialidades').select('nombre').order('nombre');
            if(!error && data.length > 0) {
                especialidades = data.map(e => e.nombre);
            }
        } catch(e) {
            console.warn("No se pudo cargar la tabla de especialidades de Supabase, usando locales.");
        }
        
        docSpecSelect.innerHTML = '<option value="" disabled selected>Seleccione una especialidad</option>';
        especialidades.forEach(esp => {
            docSpecSelect.innerHTML += `<option value="${esp}">${esp}</option>`;
        });
    }

    async function loadMedicos() {
        try {
            const { data, error } = await supabase.from('medicos').select('*').order('nombre');
            if(error) throw error;
            medicos = data || [];
        } catch(e) {
            console.warn("Tabla 'medicos' inexistente o error. Usando mock vacio.");
            // Si no existe, podemos crear uno de prueba en la UI por lo menos para no romper
            if(medicos.length === 0 && e.code === '42P01') {
                alert("Advertencia: Las tablas SQL de la agenda no existen en Supabase. Por favor ejecuta el script de base de datos.");
            }
        }
        renderMedicosList();
    }

    // --- RENDERIZADO UI ---

    function renderMedicosList() {
        if(medicos.length === 0) {
            doctorsList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--gray-500); font-size:0.9rem;">No hay médicos registrados.</div>`;
            return;
        }

        doctorsList.innerHTML = '';
        medicos.forEach(med => {
            const div = document.createElement('div');
            div.className = `list-item ${med.id === selectedDoctorId ? 'active' : ''}`;
            div.innerHTML = `
                <div>
                    <strong style="display:block; margin-bottom:0.2rem;">${med.nombre}</strong>
                    <span style="font-size:0.8rem; opacity:0.8;">CC: ${med.documento}</span>
                </div>
                <span class="badge-soft">${med.especialidad}</span>
            `;
            div.onclick = () => selectDoctor(med.id);
            doctorsList.appendChild(div);
        });
    }

    const DATES = [
        { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miércoles' },
        { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' }, { id: 7, name: 'Domingo' }
    ];

    function renderDiasSemana() {
        scheduleContainer.innerHTML = '';
        DATES.forEach(day => {
            const row = document.createElement('div');
            row.className = 'schedule-grid disabled';
            row.id = `dayRow_${day.id}`;
            row.innerHTML = `
                <div>
                    <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                        <input type="checkbox" id="check_${day.id}" class="day-toggle" data-day="${day.id}"> 
                        <strong style="color:var(--blue-dark);">${day.name}</strong>
                    </label>
                </div>
                <div class="time-inputs" id="times_${day.id}" style="pointer-events:none; opacity:0.6; display:flex; flex-direction:column; gap:0.5rem;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <div><small style="display:block; color:var(--gray-500); margin-bottom:0.2rem;">Jornada</small>
                            <input type="time" id="start_${day.id}" class="input-mini" value="08:00"> - 
                            <input type="time" id="end_${day.id}" class="input-mini" value="18:00">
                        </div>
                        <div>
                            <label style="display:flex; align-items:center; gap:0.3rem;"><input type="checkbox" id="hasBreak_${day.id}" class="break-toggle" data-day="${day.id}"> <small style="color:var(--gray-600);">Tiene break</small></label>
                        </div>
                        <div id="breakInputs_${day.id}" style="display:none;">
                            <input type="time" id="breakStart_${day.id}" class="input-mini" value="12:00"> - 
                            <input type="time" id="breakEnd_${day.id}" class="input-mini" value="14:00">
                        </div>
                    </div>
                    <div style="display:flex; gap:0.5rem; background:#f1f5f9; padding:0.5rem; border-radius:6px; border:1px solid #e2e8f0; width:fit-content;">
                        <input type="text" id="sede_${day.id}" placeholder="Sede (Ej: Principal)" class="input-mini" style="width:130px;" value="Sede Principal">
                        <input type="text" id="piso_${day.id}" placeholder="Piso" class="input-mini" style="width:70px;" value="1">
                        <input type="text" id="consultorio_${day.id}" placeholder="Nº Consultorio" class="input-mini" style="width:110px;">
                    </div>
                </div>
            `;
            scheduleContainer.appendChild(row);

            // Listeners locales para habilitar/deshabilitar UI
            const check = row.querySelector(`#check_${day.id}`);
            const timeContainer = row.querySelector(`#times_${day.id}`);
            check.addEventListener('change', (e) => {
                if(e.target.checked) {
                    row.classList.remove('disabled');
                    timeContainer.style.pointerEvents = 'auto';
                    timeContainer.style.opacity = '1';
                } else {
                    row.classList.add('disabled');
                    timeContainer.style.pointerEvents = 'none';
                    timeContainer.style.opacity = '0.6';
                }
            });

            const breakCheck = row.querySelector(`#hasBreak_${day.id}`);
            const breakInputs = row.querySelector(`#breakInputs_${day.id}`);
            breakCheck.addEventListener('change', (e) => {
                if(e.target.checked) breakInputs.style.display = 'block';
                else breakInputs.style.display = 'none';
            });
        });
    }

    // --- ACCIONES DE USUARIO ---

    window.selectDoctor = async function(id) {
        selectedDoctorId = id;
        renderMedicosList();
        
        emptyStatePanel.style.display = 'none';
        configPanel.style.display = 'block';

        const med = medicos.find(m => m.id === id);
        
        if(id === DUMMY_UUID_NEW || !med) {
            // Modo nuevo
            document.getElementById('doctorNameTitle').innerText = "Nuevo Médico";
            document.getElementById('doctorSpecBadge').innerText = "Sin especialidad";
            
            document.getElementById('doctorId').value = '';
            document.getElementById('docName').value = '';
            document.getElementById('docSpec').value = '';
            document.getElementById('docIdNum').value = '';
            document.getElementById('docPhone').value = '';
            document.getElementById('docEmail').value = '';
            
            resetScheduleUI();
            return;
        }

        // Llenar Formulario
        document.getElementById('doctorNameTitle').innerText = med.nombre;
        document.getElementById('doctorSpecBadge').innerText = med.especialidad;
        
        document.getElementById('doctorId').value = med.id;
        document.getElementById('docName').value = med.nombre;
        document.getElementById('docSpec').value = med.especialidad;
        document.getElementById('docIdNum').value = med.documento;
        document.getElementById('docPhone').value = med.telefono || '';
        document.getElementById('docEmail').value = med.correo || '';

        // Cargar Horarios de Base de datos
        await loadSchedulesFromDB(med.id);
    }

    btnNewDoctor.addEventListener('click', () => {
        selectDoctor(DUMMY_UUID_NEW);
    });

    // Guardar Perfil (Create o Update)
    document.getElementById('doctorProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('doctorId').value;
        const nombre = document.getElementById('docName').value;
        const especialidad = document.getElementById('docSpec').value;
        const documento = document.getElementById('docIdNum').value;
        const telefono = document.getElementById('docPhone').value;
        const correo = document.getElementById('docEmail').value;

        const payload = { nombre, especialidad, documento, telefono, correo };

        try {
            if(!id) {
               // Nuevo
               const { data, error } = await supabase.from('medicos').insert([payload]).select().single();
               if(error) throw error;
               medicos.push(data);
               selectedDoctorId = data.id;
               alert('Médico creado correctamente. Ahora configure su horario semanal.');
            } else {
               // Update
               const { data, error } = await supabase.from('medicos').update(payload).eq('id', id).select().single();
               if(error) throw error;
               const index = medicos.findIndex(m=>m.id === id);
               if(index !== -1) medicos[index] = data;
               
               document.getElementById('doctorNameTitle').innerText = data.nombre;
               document.getElementById('doctorSpecBadge').innerText = data.especialidad;
               alert('Perfil de médico guardado.');
            }
            renderMedicosList();
            document.getElementById('doctorId').value = selectedDoctorId;
        } catch(err) {
            console.error(err);
            alert("Error al guardar: " + err.message);
        }
    });

    // --- HORARIOS ---

    function resetScheduleUI() {
        document.getElementById('slotDuration').value = 20;
        DATES.forEach(day => {
            document.getElementById(`check_${day.id}`).checked = false;
            document.getElementById(`hasBreak_${day.id}`).checked = false;
            
            // Trigger events
            document.getElementById(`check_${day.id}`).dispatchEvent(new Event('change'));
            document.getElementById(`hasBreak_${day.id}`).dispatchEvent(new Event('change'));
            
            document.getElementById(`start_${day.id}`).value = "08:00";
            document.getElementById(`end_${day.id}`).value = "18:00";
            document.getElementById(`breakStart_${day.id}`).value = "12:00";
            document.getElementById(`breakEnd_${day.id}`).value = "14:00";
            document.getElementById(`consultorio_${day.id}`).value = "";
        });
    }

    async function loadSchedulesFromDB(medId) {
        resetScheduleUI();
        try {
            const { data, error } = await supabase.from('horarios_medicos').select('*').eq('medico_id', medId);
            if(error) throw error;
            
            if(data && data.length > 0) {
                document.getElementById('slotDuration').value = data[0].duracion_cita_minutos || 20;

                data.forEach(h => {
                    if(!h.activo) return;
                    
                    const dayId = h.dia_semana;
                    document.getElementById(`check_${dayId}`).checked = true;
                    document.getElementById(`check_${dayId}`).dispatchEvent(new Event('change'));

                    // Formatear hora si viene con milisegundos etc.
                    document.getElementById(`start_${dayId}`).value = h.hora_inicio.substring(0,5);
                    document.getElementById(`end_${dayId}`).value = h.hora_fin.substring(0,5);

                    if(h.hora_break_inicio && h.hora_break_fin) {
                        document.getElementById(`hasBreak_${dayId}`).checked = true;
                        document.getElementById(`hasBreak_${dayId}`).dispatchEvent(new Event('change'));
                        document.getElementById(`breakStart_${dayId}`).value = h.hora_break_inicio.substring(0,5);
                        document.getElementById(`breakEnd_${dayId}`).value = h.hora_break_fin.substring(0,5);
                    }
                    if(h.sede) document.getElementById(`sede_${dayId}`).value = h.sede;
                    if(h.piso) document.getElementById(`piso_${dayId}`).value = h.piso;
                    if(h.consultorio_numero) document.getElementById(`consultorio_${dayId}`).value = h.consultorio_numero;
                });
            }
        } catch(e) {
            console.warn("Error cargando horarios:", e);
        }
    }

    // Guardar Horarios configurados en UI
    document.getElementById('btnSaveSchedule').addEventListener('click', async () => {
        if(!selectedDoctorId || selectedDoctorId === DUMMY_UUID_NEW) {
            alert('Por favor guarde primero el perfil del médico (Actualizar Perfil).');
            return;
        }

        const duracion = parseInt(document.getElementById('slotDuration').value) || 20;
        let horariosAGuardar = [];

        DATES.forEach(day => {
            const active = document.getElementById(`check_${day.id}`).checked;
            if(active) {
                const start = document.getElementById(`start_${day.id}`).value;
                const end = document.getElementById(`end_${day.id}`).value;
                
                const hasBreak = document.getElementById(`hasBreak_${day.id}`).checked;
                const bStart = hasBreak ? document.getElementById(`breakStart_${day.id}`).value : null;
                const bEnd = hasBreak ? document.getElementById(`breakEnd_${day.id}`).value : null;

                const cSede = document.getElementById(`sede_${day.id}`).value;
                const cPiso = document.getElementById(`piso_${day.id}`).value;
                const cNum = document.getElementById(`consultorio_${day.id}`).value;

                horariosAGuardar.push({
                    medico_id: selectedDoctorId,
                    dia_semana: day.id,
                    hora_inicio: start,
                    hora_fin: end,
                    hora_break_inicio: bStart,
                    hora_break_fin: bEnd,
                    duracion_cita_minutos: duracion,
                    sede: cSede,
                    piso: cPiso,
                    consultorio_numero: cNum,
                    activo: true
                });
            }
        });

        const btn = document.getElementById('btnSaveSchedule');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Guardando...';
        btn.disabled = true;

        try {
            // Validacion Anti-Colision de Consultorios Físicos
            for(let hw of horariosAGuardar) {
                if(!hw.consultorio_numero) {
                    throw new Error(`Por favor, indique el N° de Consultorio para el día de agenda activo.`);
                }
                const { data: cols } = await supabase.from('horarios_medicos')
                    .select('medico_id, medicos(nombre)')
                    .eq('dia_semana', hw.dia_semana)
                    .eq('sede', hw.sede)
                    .eq('piso', hw.piso)
                    .eq('consultorio_numero', hw.consultorio_numero)
                    .neq('medico_id', selectedDoctorId);
                
                if(cols && cols.length > 0) {
                    // Verificación de choque por tiempo. Si chocan los bloques de hora...
                    // Dejaremos la validacion estricta temporal (no pueden tener mismo consultorio el mismo dia cruzandose horas)
                    const { data: choqueT } = await supabase.from('horarios_medicos')
                    .select('medicos(nombre)')
                    .eq('dia_semana', hw.dia_semana)
                    .eq('sede', hw.sede)
                    .eq('consultorio_numero', hw.consultorio_numero)
                    .neq('medico_id', selectedDoctorId)
                    .lt('hora_inicio', hw.hora_fin)
                    .gt('hora_fin', hw.hora_inicio);
                    
                    if(choqueT && choqueT.length > 0) {
                         let nDoc = choqueT[0].medicos ? choqueT[0].medicos.nombre : 'Otro Médico';
                         throw new Error(`Colisión de espacio físico detectada. \nEl consultorio "${hw.consultorio_numero}" en piso "${hw.piso}" ya está asignado a ${nDoc} en ese rango horario para ese día.`);
                    }
                }
            }

            // 1. Borrar horarios viejos de este médico (Enfoque destructivo-recreativo)
            await supabase.from('horarios_medicos').delete().eq('medico_id', selectedDoctorId);

            // 2. Insertar nuevos si hay
            if(horariosAGuardar.length > 0) {
                const { error } = await supabase.from('horarios_medicos').insert(horariosAGuardar);
                if(error) throw error;
            }
            alert('Configuración de horarios guardada exitosamente.');
        } catch(e) {
            console.error(e);
            alert('Falló el guardado: ' + e.message);
        } finally {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    });

});
