// agendar_cita.js
const supabaseUrlGlobal = 'https://zdmiylgzioarginxrmbd.supabase.co';
const supabaseKeyGlobal = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWl5bGd6aW9hcmdpbnhybWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDAzNzIsImV4cCI6MjA4NzA3NjM3Mn0.xHFSB1pJYB28rMUH57YrOyMNWPwfNh_PXNigHwVSqRM';
const supabase = window.supabase.createClient(supabaseUrlGlobal, supabaseKeyGlobal);

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- WIZARD LOGIC ---
    let currentStep = 1;
    const totalSteps = 4;
    
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    const btnSubmit = document.getElementById('btnSubmit');
    const citaDate = document.getElementById('citaDate');
    
    // Set min date to today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    citaDate.min = tomorrow.toISOString().split('T')[0];

    // Data Cache
    let medicosRaw = [];
    let horarioActual = []; // Horarios del médico seleccionado
    let citasOcupadas = []; // Citas del médico en la fecha seleccionada

    // State Variables
    let selectedDoctorId = null;
    let selectedSlotStart = null;
    let selectedSlotEnd = null;

    btnNext.addEventListener('click', async () => {
        if (!validateStep(currentStep)) return;
        
        // Hooks de transición
        if(currentStep === 2) {
            await loadDoctorsForSpecialty(document.getElementById('citaSpecialty').value);
        }
        if(currentStep === 3) {
            if(!selectedSlotStart) {
                alert("Debes seleccionar una fecha y una hora disponible para continuar.");
                return;
            }
            populateResume();
        }

        currentStep++;
        updateUI();
    });

    btnPrev.addEventListener('click', () => {
        currentStep--;
        updateUI();
    });

    function updateUI() {
        for (let i = 1; i <= totalSteps; i++) {
            document.getElementById(`step-${i}`).classList.remove('active');
            
            const indicator = document.getElementById(`indicator-${i}`);
            if(i < currentStep) {
                indicator.className = 'w-step completed';
                indicator.innerHTML = '<i class="ph-bold ph-check"></i>';
            } else if (i === currentStep) {
                indicator.className = 'w-step active';
                indicator.innerHTML = i;
            } else {
                indicator.className = 'w-step';
                indicator.innerHTML = i;
            }
        }
        document.getElementById(`step-${currentStep}`).classList.add('active');

        btnPrev.style.display = currentStep > 1 ? 'block' : 'none';
        
        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'flex';
        } else {
            btnNext.style.display = 'block';
            btnSubmit.style.display = 'none';
        }
    }

    function validateStep(step) {
        let valid = true;
        const requiredInputs = document.getElementById(`step-${step}`).querySelectorAll('input[required], select[required]');
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                valid = false;
            } else {
                input.style.borderColor = 'var(--gray-300)';
            }
        });

        if (!valid) alert("Por favor completa los campos marcados en rojo.");
        return valid;
    }

    // --- DATA LOADING ---
    async function initData() {
        try {
            const { data } = await supabase.from('especialidades').select('nombre').order('nombre');
            const selectEsp = document.getElementById('citaSpecialty');
            if(data && data.length > 0) {
                data.forEach(e => selectEsp.innerHTML += `<option value="${e.nombre}">${e.nombre}</option>`);
            } else {
                // Fallback
                ['Cardiología', 'Pediatría', 'Medicina General'].forEach(e => selectEsp.innerHTML += `<option value="${e}">${e}</option>`);
            }
        } catch(e) {}
    }
    await initData();

    async function loadDoctorsForSpecialty(specialty) {
        const container = document.getElementById('doctorsListContainer');
        const msg = document.getElementById('noDoctorsMsg');
        const timeBox = document.getElementById('dateTimeContainer');
        
        container.innerHTML = '<i class="ph p-spinner ph-spin"></i> Buscando especialistas...';
        msg.style.display = 'none';
        timeBox.style.display = 'none';
        selectedDoctorId = null;
        selectedSlotStart = null;

        try {
            const { data, error } = await supabase.from('medicos').select('*').eq('especialidad', specialty);
            if(error) throw error;
            medicosRaw = data || [];
            
            if(medicosRaw.length === 0) {
                container.innerHTML = '';
                msg.style.display = 'block';
                return;
            }

            container.innerHTML = '';
            medicosRaw.forEach(med => {
                const card = document.createElement('div');
                card.className = 'doctor-card';
                card.innerHTML = `
                    <div style="font-size: 2rem; color: var(--blue-main);"><i class="ph-fill ph-user-circle"></i></div>
                    <div>
                        <strong style="display:block;">${med.nombre}</strong>
                        <span style="font-size:0.8rem; color: var(--gray-500);">Especialista</span>
                    </div>
                `;
                card.onclick = () => selectDoctorUI(card, med.id);
                container.appendChild(card);
            });

            // Si es Control o Primera vez da lo mismo, la UI mostrará los médicos y el paciente escoge.
        } catch(e) {
            console.error(e);
            container.innerHTML = '';
        }
    }

    async function selectDoctorUI(cardElement, medId) {
        document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        selectedDoctorId = medId;
        
        // Reset time
        citaDate.value = '';
        document.getElementById('slotsGrid').innerHTML = '<div style="color:var(--gray-500); grid-column: 1/-1; padding: 1rem 0;">Selecciona una fecha.</div>';
        selectedSlotStart = null;

        // Show calendar
        document.getElementById('dateTimeContainer').style.display = 'block';

        // Load rules
        const { data } = await supabase.from('horarios_medicos').select('*').eq('medico_id', medId);
        horarioActual = data || [];
    }

    citaDate.addEventListener('change', async (e) => {
        const dateVal = e.target.value;
        if(!dateVal || !selectedDoctorId) return;

        // Validar dia de semana (en JS domingo=0, ISO=1-7)
        // en PostgreSQL DOW: domingo=0. Pero en nuestra BD definimos 1=Lunes.
        // Vamos a hacer mapeo estandar:
        const d = new Date(dateVal + 'T00:00:00'); 
        let dow = d.getDay(); // 0(Dom) to 6(Sab)
        if(dow === 0) dow = 7; // Ajustar para que Dom sea 7

        const ruleInfo = horarioActual.find(h => h.dia_semana === dow && h.activo === true);
        const grid = document.getElementById('slotsGrid');
        
        if(!ruleInfo) {
            grid.innerHTML = '<div style="color:var(--red); font-size:0.9rem; grid-column:1/-1;"><i class="ph-bold ph-x-circle"></i> El médico no atiende en el día seleccionado. Elige otra fecha.</div>';
            return;
        }

        grid.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Cargando horarios...';

        // Traer citas de ese doctor en esa fecha
        const { data: ocupadas } = await supabase.from('citas')
                                         .select('hora_inicio, hora_fin, estado')
                                         .eq('medico_id', selectedDoctorId)
                                         .eq('fecha_cita', dateVal)
                                         .neq('estado', 'cancelada');
        
        citasOcupadas = ocupadas || [];

        renderSlots(ruleInfo);
    });

    function renderSlots(ruleInfo) {
        const grid = document.getElementById('slotsGrid');
        grid.innerHTML = '';
        selectedSlotStart = null; // reset

        const duracion = ruleInfo.duracion_cita_minutos || 20;

        let curTimeMs = timeToMs(ruleInfo.hora_inicio);
        const endTimeMs = timeToMs(ruleInfo.hora_fin);

        const breakStart = ruleInfo.hora_break_inicio ? timeToMs(ruleInfo.hora_break_inicio) : null;
        const breakEnd = ruleInfo.hora_break_fin ? timeToMs(ruleInfo.hora_break_fin) : null;

        let hasSlots = false;

        while(curTimeMs + (duracion * 60000) <= endTimeMs) {
            const slotStartMs = curTimeMs;
            const slotEndMs = slotStartMs + (duracion * 60000);
            
            // Avanzar cursor para el loop
            curTimeMs = slotEndMs;

            // Verificar si choca con break
            if(breakStart && breakEnd) {
                if((slotStartMs >= breakStart && slotStartMs < breakEnd) || 
                   (slotEndMs > breakStart && slotEndMs <= breakEnd)) {
                    continue; // Slot toca el break, skipeamos
                }
            }

            // Verificar si choca con citas
            const strStart = msToTime(slotStartMs);
            const strEnd = msToTime(slotEndMs);

            const isOccupied = citasOcupadas.some(c => {
                // Simplificación: si la hora inicial ya existe
                // Como todas miden igual, con chequear igualdad es suficiente 
                return c.hora_inicio.substring(0,5) === strStart.substring(0,5);
            });

            const btn = document.createElement('div');
            btn.className = `time-slot ${isOccupied ? 'disabled' : ''}`;
            btn.innerText = strStart.substring(0,5);
            
            if(!isOccupied) {
                btn.onclick = () => {
                    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedSlotStart = strStart;
                    selectedSlotEnd = strEnd;
                };
            }
            grid.appendChild(btn);
            hasSlots = true;
        }

        if(!hasSlots) {
            grid.innerHTML = '<div style="color:var(--gray-500); grid-column:1/-1;">No hay horarios disponibles (o todos fueron reservados).</div>';
        }
    }

    // Utilidades de Tiempo
    function timeToMs(timeStr) { // 'HH:MM:SS' o 'HH:MM'
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

    // --- SUBMIT ---

    function populateResume() {
        const medName = medicosRaw.find(m => m.id === selectedDoctorId)?.nombre || 'Dr. Asignado';
        
        document.getElementById('resNombre').innerText = document.getElementById('patName').value;
        document.getElementById('resEsp').innerText = document.getElementById('citaSpecialty').value;
        document.getElementById('resMed').innerText = medName;
        document.getElementById('resFecha').innerText = document.getElementById('citaDate').value;
        document.getElementById('resHora').innerText = selectedSlotStart.substring(0,5);
        
        const tipoMap = {
            'primera_vez': 'Primera vez',
            'control': 'Control',
            'examen': 'Examen / Proc.'
        };
        document.getElementById('resTipo').innerText = tipoMap[document.getElementById('citaType').value];
    }

    btnSubmit.addEventListener('click', async () => {
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Procesando...';
        btnSubmit.disabled = true;

        const payload = {
            medico_id: selectedDoctorId,
            paciente_tipo_doc: document.getElementById('patDocType').value,
            paciente_num_doc: document.getElementById('patDocNum').value,
            paciente_nombre: document.getElementById('patName').value,
            paciente_fecha_nac: document.getElementById('patDob').value,
            paciente_telefono: document.getElementById('patPhone').value,
            paciente_direccion: document.getElementById('patAddress').value,
            paciente_correo: document.getElementById('patEmail').value,
            eps: document.getElementById('patEps').value,
            especialidad: document.getElementById('citaSpecialty').value,
            tipo_cita: document.getElementById('citaType').value,
            observacion: document.getElementById('citaObs').value || null,
            fecha_cita: document.getElementById('citaDate').value,
            hora_inicio: selectedSlotStart,
            hora_fin: selectedSlotEnd,
            estado: 'programada'
        };

        try {
            const { error } = await supabase.from('citas').insert([payload]);
            if(error) throw error;

            alert("¡Agendamiento exitoso! Te llegará una notificación de confirmación.");
            window.location.href = 'index.html'; // redirect o mostrar modal de éxito
        } catch(e) {
            console.error("Error al guardar cita:", e);
            alert("Hubo un error al procesar la solicitud o ese horario ya fue tomado. Por favor intenta seleccionar otro. " + (e.message || ''));
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });

});
