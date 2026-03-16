// script.js

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

    // 3. File Upload UI Interaction
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
                const fileName = files[0].name;
                fileNameDisplay.textContent = `Archivo seleccionado: ${fileName}`;
                fileMsg.textContent = "Haz clic para cambiar el archivo";
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
                
                let fileUrl = null;
                const fileInput = document.getElementById('fileUpload');
                const selectedFile = fileInput.files[0];

                if (selectedFile) {
                    submitBtn.textContent = 'Subiendo documento...';
                    
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
                        
                    fileUrl = publicUrlData.publicUrl;
                }

                submitBtn.textContent = 'Guardando registro...';
                
                // Insert record into Supabase Database
                const { data: insertData, error: insertError } = await supabaseClient
                    .from('clientes')
                    .insert([
                        { 
                            nombre_completo: fullName, 
                            telefono: phone, 
                            tipo_tramite: serviceType,
                            archivo_url: fileUrl
                        }
                    ]);

                if (insertError) throw insertError;

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
