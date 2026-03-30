// script.js

// ==========================================
// REGISTRO DE VISITAS A LA LANDING PAGE
// ==========================================
const supabaseUrlGlobal = 'https://zdmiylgzioarginxrmbd.supabase.co';
const supabaseKeyGlobal = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWl5bGd6aW9hcmdpbnhybWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDAzNzIsImV4cCI6MjA4NzA3NjM3Mn0.xHFSB1pJYB28rMUH57YrOyMNWPwfNh_PXNigHwVSqRM';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar cliente localmente para este bloque
    const supabase = window.supabase.createClient(supabaseUrlGlobal, supabaseKeyGlobal);

    // Solo contar 1 visita por sesión del navegador
    if(!sessionStorage.getItem('visited_clicksalud_hoy')) {
        try {
            // Obtener contador actual
            const { data: stats, error: selectErr } = await supabase.from('estadisticas').select('contador').eq('id', 1).single();
            
            if(selectErr) throw selectErr;

            if(stats) {
                // Sumar 1 (protegiendo en caso de ser nulo por primera vez)
                const valorActual = stats.contador !== null ? stats.contador : 0;
                const { error: updErr } = await supabase.from('estadisticas').update({contador: valorActual + 1}).eq('id', 1);
                if (updErr) throw updErr;
                
                // Solo marcar como visitado si logró sumar en DB
                sessionStorage.setItem('visited_clicksalud_hoy', '1');
            }
        } catch(e) {
            console.error("⛔ Supabase bloqueó el conteo de tu visita (Probablemente por RLS):", e);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar styling on scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    }

    // Close mobile menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        });
    });
    // 3.1 Data Protection Acceptance Logic
    const acceptDataCheck = document.getElementById('acceptDataCheck');
    const acceptDataLabel = document.getElementById('acceptDataLabel');
    const formFieldsWrapper = document.getElementById('formFieldsWrapper');
    const dataProtectionSection = document.getElementById('dataProtectionSection');

    if (acceptDataCheck && formFieldsWrapper) {
        acceptDataCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                acceptDataLabel.style.borderColor = 'var(--green)';
                acceptDataLabel.style.backgroundColor = 'var(--green-light)';
                
                formFieldsWrapper.style.display = 'block';
                // Trigger reflow
                void formFieldsWrapper.offsetWidth; 
                formFieldsWrapper.style.opacity = '1';
                formFieldsWrapper.style.marginTop = '1rem';
                
                // Optional: visually minimize the DP section slightly
                dataProtectionSection.style.opacity = '0.9';
            } else {
                acceptDataLabel.style.borderColor = 'var(--gray-200)';
                acceptDataLabel.style.backgroundColor = 'white';
                
                formFieldsWrapper.style.opacity = '0';
                setTimeout(() => {
                    formFieldsWrapper.style.display = 'none';
                }, 400); // Wait for transition
            }
        });
    }

    // 3.2 File Upload UI Interaction
    const fileUpload = document.getElementById('fileUpload');
    const fileDropArea = document.getElementById('fileDropArea');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileMsg = fileDropArea.querySelector('.file-msg');

    if (fileUpload && fileDropArea) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileDropArea.addEventListener(eventName, () => {
                fileDropArea.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        fileDropArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            handleFiles(files);
        }

        // Handle selected files via click
        fileUpload.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                if(files.length === 1) {
                    fileNameDisplay.textContent = `1 archivo seleccionado: ${files[0].name}`;
                } else {
                    fileNameDisplay.textContent = `${files.length} archivos seleccionados listos para enviar.`;
                }
                fileMsg.textContent = "Haz clic o arrastra más para cambiarlos";
            }
        }
    }

    // Initialize Supabase Client
    const supabaseUrl = 'https://zdmiylgzioarginxrmbd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWl5bGd6aW9hcmdpbnhybWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDAzNzIsImV4cCI6MjA4NzA3NjM3Mn0.xHFSB1pJYB28rMUH57YrOyMNWPwfNh_PXNigHwVSqRM';
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    // 4. Real Form Submission to Supabase
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            
            // Visual feedback
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                // Collect values
                const fullName = document.getElementById('fullName').value;
                const phone = document.getElementById('phone').value;
                const serviceType = document.getElementById('serviceType').value;
                const observations = document.getElementById('observations').value || 'Ninguna';
                
                let fileUrls = [];
                const fileInput = document.getElementById('fileUpload');

                if (fileInput.files.length > 0) {
                    submitBtn.textContent = 'Subiendo documentos...';
                    
                    for (let selectedFile of fileInput.files) {
                        const fileExt = selectedFile.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const filePath = `solicitudes/${fileName}`;

                        // Upload file to Supabase Storage
                        const { data: uploadData, error: uploadError } = await supabaseClient
                            .storage
                            .from('documentos')
                            .upload(filePath, selectedFile);
                        
                        if (uploadError) throw uploadError;

                        // Get public URL
                        const { data: publicUrlData } = supabaseClient
                            .storage
                            .from('documentos')
                            .getPublicUrl(filePath);
                            
                        fileUrls.push(publicUrlData.publicUrl);
                    }
                }

                const finalFileUrl = fileUrls.length > 0 ? fileUrls.join(',') : null;

                submitBtn.textContent = 'Guardando registro...';
                
                // Insert record into Supabase Database
                const { data: insertData, error: insertError } = await supabaseClient
                    .from('clientes')
                    .insert([
                        { 
                            nombre_completo: fullName, 
                            telefono: phone, 
                            tipo_tramite: serviceType,
                            archivo_url: finalFileUrl,
                            observaciones: observations,
                            consentimiento_datos: true
                        }
                    ]);

                if (insertError) throw insertError;

                // Enviar notificación por correo con FormSubmit
                submitBtn.textContent = 'Enviando email de confirmación...';
                try {
                    await fetch('https://formsubmit.co/ajax/clicksaludcol@gmail.com', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            "Asunto": "Nueva Solicitud Web - ClickSalud",
                            "Nombre del Paciente": fullName,
                            "Teléfono de Contacto": phone,
                            "Tipo de Trámite": serviceType,
                            "Observaciones": observations,
                            "Enlace al Documento": fileUrl ? fileUrl : "El usuario no adjuntó archivo",
                            "_template": "table",
                            "_subject": `Nuevo trámite web de ${fullName}`
                        })
                    });
                } catch (e) {
                    console.error("El registro se procesó, pero el correo no pudo ser enviado: ", e);
                }

                alert('¡Solicitud enviada con éxito! Un asesor de ClickSalud se pondrá en contacto pronto.');
                uploadForm.reset();
                if(fileNameDisplay) fileNameDisplay.textContent = '';
                if(fileMsg) fileMsg.textContent = 'Haz clic o arrastra tu archivo aquí';

            } catch (error) {
                console.error("Error al enviar solicitud:", error);
                alert("Ocurrió un error al enviar tu solicitud: " + error.message);
            } finally {
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }
});
