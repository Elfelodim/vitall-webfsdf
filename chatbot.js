document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const configBtn = document.getElementById('configBtn');
    const apiModal = document.getElementById('apiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiBtn = document.getElementById('saveApiBtn');

    let apiKey = localStorage.getItem('gemini_api_key') || '';
    let isTyping = false;
    let reportDocumentText = '';
    let chatHistory = []; // { role: "user" | "model", parts: [{ text: string }] }

    // --- Generación de PDF Clínico / ERP ---
    window.downloadPDF = function() {
        if (!window.jspdf) { alert('Error: La librería de PDF no cargó correctamente.'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 40, 80);
        doc.setFontSize(16);
        doc.text("CLICKSALUD ERP - ASISTENCIA CLÍNICA", 105, 20, { align: "center" });
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Informe Asistencial / Resumen de Consulta & Fórmulas", 105, 27, { align: "center" });
        doc.line(20, 31, 190, 31);
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0);
        const margins = { top: 40, bottom: 20, left: 20, width: 170 };
        const textLines = doc.splitTextToSize(reportDocumentText || "Informe clínico generado por Asistente IA.", margins.width);
        doc.text(textLines, margins.left, margins.top);
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Generado por Asistente Clínico IA - ClickSalud ERP (click-salud.com)", 105, 290, { align: "center" });
        }
        doc.save("Resumen_Clinico_ClickSalud_ERP.pdf");
    };

    // --- Lógica del Modal ---
    if(configBtn) configBtn.addEventListener('click', () => { apiModal.classList.remove('hidden'); apiKeyInput.value = apiKey; });
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => { apiModal.classList.add('hidden'); chatInput.disabled = false; });
    if(saveApiBtn) saveApiBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        localStorage.setItem('gemini_api_key', apiKey);
        apiModal.classList.add('hidden');
        if (apiKey) appendMessage('bot', '✅ Clave API guardada. ¡Motor de IA Clínica activado!');
        chatInput.disabled = false;
    });

    // --- UI Helpers ---
    function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
    function updateInputState() {
        const hasText = chatInput.value.trim().length > 0;
        sendBtn.disabled = !hasText || isTyping;
    }
    chatInput.addEventListener('input', updateInputState);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatForm.dispatchEvent(new Event('submit')); }
    });

    function appendMessage(sender, text) {
        const row = document.createElement('div');
        row.className = `message-row animate-slide-up ${sender}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        row.innerHTML = `
            ${sender === 'bot' ? '<div class="bot-avatar"><i class="ph-fill ph-first-aid"></i></div>' : ''}
            <div class="message-bubble">
                <div style="white-space: pre-wrap">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function showTypingIndicator() {
        isTyping = true; updateInputState(); chatInput.disabled = true;
        const row = document.createElement('div');
        row.className = 'message-row animate-slide-up bot';
        row.id = 'typingIndicator';
        row.innerHTML = '<div class="bot-avatar"><i class="ph-fill ph-first-aid"></i></div><div class="message-bubble"><div class="typing-dots"><div></div><div></div><div></div></div></div>';
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
        isTyping = false; chatInput.disabled = false; chatInput.focus(); updateInputState();
    }

    function renderPremiumCard() {
        const row = document.createElement('div');
        row.style.marginTop = '15px';
        row.innerHTML = `
            <div class="premium-card animate-slide-up card-3d-hover glow-effect">
                <h3 class="shimmer-text">Informe Clínico & Registro ERP Listo</h3>
                <p>Se ha estructurado la historia clínica y el reporte asistencial. Descárgalo en PDF.</p>
                <button class="download-btn" onclick="window.downloadPDF()">
                    <i class="ph-fill ph-file-pdf"></i> Descargar Reporte PDF
                </button>
            </div>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    // --- INTEGRACIÓN DIRECTA VIA REST ---
    async function fetchGeminiResponse(userText) {
        if (!apiKey) {
            appendMessage('bot', '⚠️ Sin API Key. Activando modo de simulación clínica...');
            removeTypingIndicator();
            reportDocumentText = "INFORME CLÍNICO ERP SIMULADO - CLICKSALUD\n\n- Diagnóstico principal: Consulta Médica General\n- Código CIE-10: Z000 (Examen médico general)\n- Recomendaciones: Control en 30 días.";
            setTimeout(renderPremiumCard, 2000);
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: chatHistory.concat([{ role: "user", parts: [{ text: userText }] }])
        };

        // Inyectamos el sistema de prompt de asistencia médica ERP
        if (chatHistory.length === 0) {
            payload.contents = [
                { role: "user", parts: [{ text: "Eres el Asistente Clínico Inteligente de ClickSalud ERP. Tu objetivo es orientar a médicos, especialistas e IPS sobre Historia Clínica Electrónica, facturación RIPS, codificación CIE-10/CIE-11, agendamiento de turnos e inventario de insumos. Responde de forma precisa y profesional. Si el usuario pide redactar un resumen clínico o formulación, estructuras los datos y finaliza con [GENERAR_REPORTE]." }] },
                { role: "model", parts: [{ text: "Entendido. Soy el Asistente Inteligente de ClickSalud ERP." }] },
                { role: "user", parts: [{ text: userText }] }
            ];
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            removeTypingIndicator();

            if (data.error) {
                appendMessage('bot', `🔍 RESPUESTA SISTEMA (${data.error.code}): ${data.error.message}`);
                if (data.error.message.includes('404')) {
                    appendMessage('bot', '⚠️ Generando vista previa del informe...');
                    reportDocumentText = "INFORME CLÍNICO SIMULADO - CLICKSALUD ERP.";
                    setTimeout(renderPremiumCard, 2000);
                }
                return;
            }

            const botText = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "user", parts: [{ text: userText }] });
            chatHistory.push({ role: "model", parts: [{ text: botText }] });

            if (botText.includes('[GENERAR_REPORTE]')) {
                reportDocumentText = botText.split('[GENERAR_REPORTE]')[0];
                appendMessage('bot', "¡Informe clínico estructurado con éxito! Generando documento...");
                setTimeout(renderPremiumCard, 2000);
            } else {
                appendMessage('bot', botText);
            }

        } catch (error) {
            removeTypingIndicator();
            appendMessage('bot', `⚠️ Error de conexión: ${error.message}`);
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isTyping) return;
        appendMessage('user', text);
        chatInput.value = '';
        updateInputState();
        showTypingIndicator();
        fetchGeminiResponse(text);
    });

    setTimeout(() => {
        appendMessage('bot', '¡Hola! Soy tu Asistente Clínico ClickSalud ERP. ¿En qué puedo asistirte hoy? (Historia Clínica, RIPS, CIE-10, Agendamiento o Contabilidad).');
        if (!apiKey && apiModal) apiModal.classList.remove('hidden');
        else chatInput.disabled = false;
    }, 500);
});
