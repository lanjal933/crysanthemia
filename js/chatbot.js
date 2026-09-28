// ============================================
// CRYSANTEM - CHATBOT MODULE
// ============================================

// === CONFIGURATION ===
// Usar configuración centralizada desde config.js
const CHATBOT_WEBHOOK_URL = `${(window.CrConfig && window.CrConfig.BACKEND_API_URL) || window.location.origin}/api/chat`;
const DEVELOPER_EMAIL = "benjamin@crysantem.com"; // Email del desarrollador para restricciones

// === MODO DE OPERACIÓN ===
// En desarrollo o cuando el backend no está disponible, usar modo demo
const DEMO_MODE = true; // Siempre true cuando no hay backend disponible

// === SESSION MANAGEMENT ===
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// === DOM ELEMENTS ===
let chatbotInterface = null;
let chatbotMessages = null;
let chatbotInput = null;
let chatbotSend = null;

// Variables globales para estado de autenticación (definidas en auth.js)
// isGoogleConnected, isEmailVerified se definen en auth.js

// === TEXTAREA AUTO-RESIZE ===
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// === KEYBOARD HANDLING ===
function handleKeyPress(event) {
    console.log('Key pressed:', event.key, 'Shift key:', event.shiftKey);
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        console.log('Sending message via Enter key');
        sendMessage();
    }
    // Shift+Enter permite el comportamiento por defecto (bajar de línea)
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== CHATBOT DOMContentLoaded ===');
    
    // Get DOM elements
    chatbotInterface = document.getElementById('chatbotInterface');
    chatbotMessages = document.getElementById('chatbotMessages');
    chatbotInput = document.getElementById('chatbotInput');
    chatbotSend = document.getElementById('chatbotSend');
    
    console.log('DOM Elements:', {
        chatbotInterface,
        chatbotMessages,
        chatbotInput,
        chatbotSend
    });
    
    // Auto-resize textarea
    if (chatbotInput) {
        console.log('Adding input event listener to chatbotInput');
        chatbotInput.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        
        // Handle Enter key
        console.log('Adding keydown event listener to chatbotInput');
        chatbotInput.addEventListener('keydown', handleKeyPress);
    } else {
        console.error('chatbotInput not found!');
    }
    
    // Send button
    if (chatbotSend) {
        console.log('Adding click event listener to chatbotSend');
        chatbotSend.addEventListener('click', sendMessage);
    } else {
        console.error('chatbotSend not found!');
    }
});

// === DEBUGGING VARIABLES ===
let lastMessageAttempt = '';
let lastErrorData = null;

// === DEMO RESPONSES ===
const demoResponses = {
    greeting: [
        "Hola. Soy el asistente virtual oficial de Crysantem. ¿En qué puedo ayudarte?",
        "Claro. Soy el asistente de Crysantem. ¿Qué necesitas saber?",
        "Perfecto. Soy el asistente de Crysantem. ¿Te explico qué podemos hacer por tu empresa?"
    ],
    price: [
        "Claro. Crysantem desarrolla agentes de IA personalizados para empresas. Las capacidades y costos dependen de cómo se configure el agente según las necesidades de tu negocio. ¿Te gustaría que te contacte con Benjamín para revisar tu caso específico?",
        "Entiendo. Como cada proyecto es diferente, los costos varían según las funcionalidades que necesites. ¿Podrías contarme qué tipo de tareas te gustaría automatizar? Así puedo ayudarte a entender qué podríamos desarrollar."
    ],
    capabilities: [
        "Claro. Crysantem desarrolla agentes de IA personalizados. Según el proyecto, pueden responder preguntas frecuentes, atender clientes, consultar información, gestionar documentos, agendar reuniones mediante Google Calendar, enviar correos o automatizar tareas específicas. ¿Hay alguna funcionalidad específica que te interese?",
        "Perfecto. Nuestros agentes se adaptan a cada empresa. Pueden responder consultas, asistir clientes, trabajar con documentos, gestionar calendarios, enviar correos y automatizar procesos. ¿Qué tipo de tareas te gustaría automatizar en tu negocio?"
    ],
    integration: [
        "Claro. Actualmente podemos implementar agentes para páginas web. También estamos trabajando en integraciones para Telegram y Discord. ¿Te gustaría saber más sobre alguna plataforma en particular?",
        "Entiendo. La integración web está disponible. Para otros canales, dependiendo del proyecto, se pueden desarrollar integraciones personalizadas. ¿En qué canal te gustaría utilizar el agente?"
    ],
    about: [
        "Claro. Crysantem es una empresa especializada en el desarrollo e implementación de agentes de inteligencia artificial personalizados para empresas. El responsable y desarrollador es Benjamín. ¿Te gustaría saber más sobre algún servicio específico?",
        "Perfecto. Crysantem crea soluciones de IA adaptadas a las necesidades de cada negocio. ¿Qué tipo de empresa tienes? Así puedo explicarte qué podríamos hacer por ti."
    ],
    contact: [
        "Claro. Si querés hablar con el equipo, puedo enviar un correo a Benjamín con tu consulta. ¿Podrías decirme cuál es el motivo del contacto?",
        "Perfecto. Puedo enviar tu consulta a Benjamín para que pueda revisarla. ¿Cuál es tu nombre y qué necesitas saber o qué tipo de servicio te interesa?"
    ],
    default: [
        "Entiendo. No tengo información suficiente para responderte con precisión. ¿Podrías ser más específico sobre qué necesitas saber?",
        "Claro. Depende de cómo se configure el agente para tu empresa. ¿Podrías contarme más sobre qué tipo de consultas reciben tus clientes o qué tareas te gustaría automatizar?",
        "Perfecto. Crysantem puede desarrollar diferentes soluciones según el proyecto. ¿Te gustaría que te contacte con Benjamín para revisar tu caso específico?",
        "Entiendo. Para darte una respuesta más precisa, necesito más información sobre tu negocio. ¿Qué tipo de empresa tienes y qué tareas te gustaría automatizar?",
        "No estoy seguro de tener la información exacta que necesitas. Prefiero ser honesto contigo. ¿Te gustaría hablar directamente con Benjamín para obtener una respuesta más precisa?\n\n[WHATSAPP phone=\"+13237093568\" message=\"Hola, tuve una consulta que la IA no pudo responder: \"/]"
    ]
};

// === HELPER FUNCTIONS ===
function getDemoResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hola') || message.includes('buen') || message.includes('hi') || message.includes('hey')) {
        return randomResponse(demoResponses.greeting);
    }
    
    if (message.includes('precio') || message.includes('cost') || message.includes('cuánto') || message.includes('vale') || message.includes('$')) {
        return randomResponse(demoResponses.price);
    }
    
    if (message.includes('pued') || message.includes('capacidad') || message.includes('funcionalidad') || message.includes('hacer') || message.includes('ofrece')) {
        return randomResponse(demoResponses.capabilities);
    }
    
    if (message.includes('integraci') || message.includes('telegram') || message.includes('discord') || message.includes('web') || message.includes('plataforma')) {
        return randomResponse(demoResponses.integration);
    }
    
    if (message.includes('crysantem') || message.includes('empresa') || message.includes('quién sois') || message.includes('qué haceis')) {
        return randomResponse(demoResponses.about);
    }
    
    if (message.includes('contact') || message.includes('hablar') || message.includes('benjamín') || message.includes('equipo') || message.includes('reunión')) {
        return randomResponse(demoResponses.contact);
    }
    
    return randomResponse(demoResponses.default);
}

function randomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
    
    // Convert text to paragraphs for better formatting
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Split by newlines and create paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.className = 'message-paragraph';
        p.textContent = paragraph.trim();
        contentDiv.appendChild(p);
    });
    
    // If no paragraphs were created (single line or empty), create one
    if (contentDiv.children.length === 0) {
        const p = document.createElement('p');
        p.className = 'message-paragraph';
        p.textContent = text.trim();
        contentDiv.appendChild(p);
    }
    
    messageDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return messageDiv;
}

function addMessageWithHTML(htmlContent, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = htmlContent;
    messageDiv.appendChild(contentDiv);
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    // Execute charts after HTML is inserted into DOM
    if (typeof enhancedMarkdown !== 'undefined') {
        setTimeout(() => enhancedMarkdown.executeCharts(), 100);
    }
    
    return messageDiv;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-host typing';
    typingDiv.innerHTML = `
        <span class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </span>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return typingDiv;
}

function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}

// === DEBUGGING FUNCTIONS ===
function showDebugCard(errorType, errorDetails, statusCode = null, responseBody = null) {
    // Remove existing debug card if present
    const existingCard = document.getElementById('debugCard');
    if (existingCard) {
        existingCard.remove();
    }

    const debugCard = document.createElement('div');
    debugCard.id = 'debugCard';
    debugCard.className = 'debug-card';
    
    let errorTitle = '';
    let errorDescription = '';
    
    switch(errorType) {
        case 'CORS':
            errorTitle = '❌ Error de CORS';
            errorDescription = 'La petición fue bloqueada por políticas de origen cruzado. El servidor n8n no tiene configurado CORS para permitir peticiones desde este dominio.';
            break;
        case '404':
            errorTitle = '❌ Error 404 - Webhook no encontrado';
            errorDescription = 'La URL del webhook no existe o el flujo en n8n está inactivo. Verifica que el flujo esté en modo "Production".';
            break;
        case '400':
            errorTitle = '❌ Error 400 - Bad Request';
            errorDescription = 'El cuerpo JSON está mal formado o falta algún parámetro requerido (user_id, prompt, session_id).';
            break;
        case '500':
            errorTitle = '❌ Error 500 - Error del servidor';
            errorDescription = 'El flujo de n8n o la API de Google/Gemini falló durante la ejecución. Revisa los logs de n8n.';
            break;
        case 'TIMEOUT':
            errorTitle = '❌ Error de Timeout';
            errorDescription = 'La petición excedió el tiempo de espera. El servidor tardó demasiado en responder.';
            break;
        case 'NETWORK':
            errorTitle = '❌ Error de Red';
            errorDescription = 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté accesible.';
            break;
        default:
            errorTitle = '❌ Error Desconocido';
            errorDescription = 'Ocurrió un error inesperado al procesar la petición.';
    }

    debugCard.innerHTML = `
        <div class="debug-header">
            <span class="debug-title">${errorTitle}</span>
            <button class="debug-close" data-action="close">✕</button>
        </div>
        <div class="debug-content">
            <p class="debug-description">${errorDescription}</p>
            ${statusCode ? `<div class="debug-info"><strong>Status Code:</strong> ${statusCode}</div>` : ''}
            ${responseBody ? `<div class="debug-info"><strong>Response Body:</strong><pre>${JSON.stringify(responseBody, null, 2)}</pre></div>` : ''}
            ${errorDetails ? `<div class="debug-info"><strong>Error Details:</strong><pre>${errorDetails}</pre></div>` : ''}
            <div class="debug-actions">
                <button class="debug-retry" data-action="retry">🔄 Reintentar envío</button>
                <button class="debug-copy" data-action="copy">📋 Copiar info de depuración</button>
            </div>
        </div>
    `;
    
    // Add event listeners using event delegation
    debugCard.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'close') closeDebugCard();
        if (action === 'retry') retryLastMessage();
        if (action === 'copy') copyDebugInfo();
    });

    chatbotInterface.appendChild(debugCard);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    // Store error data for retry
    lastErrorData = { errorType, errorDetails, statusCode, responseBody };
}

function closeDebugCard() {
    const debugCard = document.getElementById('debugCard');
    if (debugCard) {
        debugCard.remove();
    }
}

function retryLastMessage() {
    closeDebugCard();
    if (lastMessageAttempt) {
        chatbotInput.value = lastMessageAttempt;
        sendMessage();
    }
}

function copyDebugInfo() {
    if (lastErrorData) {
        const debugInfo = `
Error Type: ${lastErrorData.errorType}
Status Code: ${lastErrorData.statusCode || 'N/A'}
Response Body: ${JSON.stringify(lastErrorData.responseBody, null, 2)}
Error Details: ${lastErrorData.errorDetails}
Timestamp: ${new Date().toISOString()}
Webhook URL: ${CHATBOT_WEBHOOK_URL}
        `.trim();
        
        navigator.clipboard.writeText(debugInfo).then(() => {
            alert('Información de depuración copiada al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
        });
    }
}

function classifyError(error, response, responseText) {
    // Check for CORS error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'CORS';
    }
    
    // Check for network error
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        return 'NETWORK';
    }
    
    // Check for timeout
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return 'TIMEOUT';
    }
    
    // Check HTTP status codes
    if (response) {
        if (response.status === 404) {
            return '404';
        }
        if (response.status === 400) {
            return '400';
        }
        if (response.status >= 500) {
            return '500';
        }
    }
    
    // Default classification
    return 'UNKNOWN';
}

async function sendMessage() {
    const message = chatbotInput.value.trim();
    
    if (!message) return;
    
    // Verificar si el usuario está logueado (acceder a currentUser de auth.js)
    if (!window.currentUser) {
        addMessage('⚠️ Debes iniciar sesión para usar el servicio del bot.');
        return;
    }
    
    // MODO DEMO: Cuando el backend no está disponible o en desarrollo
    if (DEMO_MODE) {
        // Store message for retry functionality
        lastMessageAttempt = message;
        
        // Add user message
        addMessage(message, true);
        chatbotInput.value = '';
        chatbotInput.style.height = 'auto'; // Reset height
        
        // Disable input and button during request
        chatbotInput.disabled = true;
        chatbotSend.disabled = true;
        
        // Show typing indicator
        const typingDiv = addTypingIndicator();
        
        // Simular respuesta con delay
        setTimeout(() => {
            removeTypingIndicator(typingDiv);
            const response = getDemoResponse(message);
            addMessage(response);
            
            // Re-enable input and button
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            chatbotInput.focus();
        }, 1000);
        
        return;
    }
    
    // MODO PRODUCCIÓN: Verificaciones de seguridad
    // Verificar si el usuario tiene Gmail conectado (consultar al backend)
    try {
        const userId = window.currentUser?.id;
        if (!userId) {
            addMessage('⚠️ Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.');
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            return;
        }
        
        const backendUrl = window.CrConfig && window.CrConfig.BACKEND_API_URL;
        if (!backendUrl || backendUrl === '') {
            console.log('No backend configured, skipping Google status check');
            addMessage('⚠️ Para usar el agente, primero debes conectar tu cuenta de Gmail.');
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            return;
        }
        
        const statusResponse = await fetch(`${backendUrl}/api/auth/google/status/${userId}`);
        const statusData = await statusResponse.json();
        
        console.log('=== GOOGLE STATUS CHECK ===');
        console.log('Status data:', statusData);
        console.log('==========================');
        
        if (!statusData.connected) {
            addMessage('⚠️ Para usar el agente, primero debes conectar tu cuenta de Gmail.');
            showDebugCard(
                'AUTH_REQUIRED',
                'No hay cuenta de Gmail conectada',
                null,
                { message: 'Conecta tu cuenta de Gmail usando el botón superior' }
            );
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            return;
        }
        
        // Google OAuth ya verifica el email, así que si está conectado, asumimos que está verificado
        // Solo verificamos email_verified si está explícitamente en false
        if (statusData.email_verified === false) {
            addMessage('⚠️ Debes verificar tu email antes de usar el agente.');
            showDebugCard(
                'VERIFICATION_REQUIRED',
                'Email no verificado',
                null,
                { message: 'Usa el botón "Enviar código de verificación" y verifica tu email' }
            );
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            return;
        }
    } catch (error) {
        console.error('Error verificando estado de Gmail:', error);
        addMessage('⚠️ Error al verificar el estado de conexión con Gmail. Por favor, intenta nuevamente.');
        chatbotInput.disabled = false;
        chatbotSend.disabled = false;
        return;
    }
    
    // Store message for retry functionality
    lastMessageAttempt = message;
    
    // Add user message
    addMessage(message, true);
    chatbotInput.value = '';
    chatbotInput.style.height = 'auto'; // Reset height
    
    // Disable input and button during request
    chatbotInput.disabled = true;
    chatbotSend.disabled = true;
    
    // Show typing indicator
    const typingDiv = addTypingIndicator();
    
    // Prepare payload
    const userId = window.currentUser?.id;
    if (!userId) {
        addMessage('⚠️ Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.');
        chatbotInput.disabled = false;
        chatbotSend.disabled = false;
        return;
    }
    
    const payload = {
        user_id: userId,
        prompt: message,
        session_id: sessionId
    };
    
    // === DETAILED LOGGING ===
    console.log('=== CHATBOT DEBUG LOG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Webhook URL:', CHATBOT_WEBHOOK_URL);
    console.log('Request Method: POST');
    console.log('Request Headers:', { 'Content-Type': 'application/json' });
    console.log('Request Payload:', JSON.stringify(payload, null, 2));
    console.log('========================');
    
    // Send to webhook
    try {
        const backendUrl = window.CrConfig && window.CrConfig.BACKEND_API_URL;
        if (!backendUrl || backendUrl === '') {
            console.log('No backend configured, skipping webhook call');
            // Si no hay backend, usar modo demo
            const response = getDemoResponse(message);
            addMessage(response);
            chatbotInput.disabled = false;
            chatbotSend.disabled = false;
            chatbotInput.focus();
            return;
        }
        
        const response = await fetch(CHATBOT_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('=== RESPONSE DEBUG LOG ===');
        console.log('Response Status:', response.status);
        console.log('Response Status Text:', response.statusText);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
        
        // Try to get response body
        let responseText = '';
        let responseData = null;
        
        try {
            responseText = await response.text();
            console.log('Response Body (raw):', responseText);
            
            // Try to parse as JSON
            try {
                responseData = JSON.parse(responseText);
                console.log('Response Body (parsed):', JSON.stringify(responseData, null, 2));
            } catch (e) {
                console.log('Response could not be parsed as JSON');
            }
        } catch (e) {
            console.log('Could not read response body:', e);
        }
        
        console.log('========================');
        
        removeTypingIndicator(typingDiv);
        
        if (response.ok) {
            // Success case
            const data = responseData || {};
            const output = data.output || data.response || data.message || responseText || 'Respuesta recibida';
            
            console.log('✅ Request successful');
            
            // Render markdown with enhanced renderer if available
            console.log('=== MARKDOWN RENDERING ===');
            console.log('Output type:', typeof output);
            console.log('Output value:', output);
            console.log('enhancedMarkdown available:', typeof enhancedMarkdown);
            console.log('marked available:', typeof marked);
            
            if (typeof enhancedMarkdown !== 'undefined') {
                console.log('Using enhancedMarkdown');
                try {
                    const htmlContent = enhancedMarkdown.parseWithComponents(output);
                    console.log('Parsed HTML type:', typeof htmlContent);
                    console.log('Parsed HTML:', htmlContent);
                    addMessageWithHTML(htmlContent);
                } catch (e) {
                    console.error('Error parsing enhanced markdown:', e);
                    console.error('Error stack:', e.stack);
                    addMessage(output);
                }
            } else if (typeof marked !== 'undefined') {
                console.log('Using standard marked');
                try {
                    const htmlContent = marked.parse(output);
                    console.log('Parsed HTML type:', typeof htmlContent);
                    console.log('Parsed HTML:', htmlContent);
                    addMessageWithHTML(htmlContent);
                } catch (e) {
                    console.error('Error parsing markdown:', e);
                    addMessage(output);
                }
            } else {
                console.log('No markdown parser available');
                addMessage(output);
            }
        } else {
            // Error case - classify and show debug info
            const errorType = classifyError(new Error(`HTTP ${response.status}`), response, responseText);
            const errorDetails = `HTTP ${response.status}: ${response.statusText}`;
            
            console.error('❌ Request failed:', errorType, errorDetails);
            
            showDebugCard(
                errorType,
                errorDetails,
                response.status,
                responseData || responseText
            );
            
            addMessage('❌ Error en la petición. Revisa la tarjeta de depuración para más detalles.');
        }
    } catch (error) {
        console.error('=== NETWORK ERROR DEBUG LOG ===');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('==============================');
        
        removeTypingIndicator(typingDiv);
        
        // Classify the error
        const errorType = classifyError(error, null, null);
        const errorDetails = `${error.name}: ${error.message}`;
        
        console.error('❌ Network error:', errorType, errorDetails);
        
        showDebugCard(
            errorType,
            errorDetails,
            null,
            null
        );
        
        addMessage('❌ Error de conexión. Revisa la tarjeta de depuración para más detalles.');
    } finally {
        // Re-enable input and button
        chatbotInput.disabled = false;
        chatbotSend.disabled = false;
        chatbotInput.focus();
    }
}

// === INITIALIZE ===
console.log('Crysantem - Chatbot module loaded');
console.log('Session ID:', sessionId);
