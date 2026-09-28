// ============================================
// CRYSANTEM - TERMS AND CONDITIONS MODULE
// ============================================

// === STATE ===
let termsAccepted = false;
let privacyAccepted = false;

// Variable global para conexión pendiente
window.pendingGoogleConnection = false;

// === FUNCTIONS ===
function showTerms() {
    console.log('=== SHOW TERMS MODAL ===');
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Terms modal shown');
    } else {
        console.error('Terms modal not found');
    }
}

function closeTerms() {
    console.log('=== CLOSE TERMS MODAL ===');
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('Terms modal closed');
    }
}

function showPrivacy() {
    console.log('=== SHOW PRIVACY MODAL ===');
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Privacy modal shown');
    } else {
        console.error('Privacy modal not found');
    }
}

function closePrivacy() {
    console.log('=== CLOSE PRIVACY MODAL ===');
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('Privacy modal closed');
    }
}

function toggleTermsAccept() {
    const checkbox = document.getElementById('termsAccept');
    const acceptBtn = document.getElementById('termsAcceptBtn');
    
    if (checkbox && acceptBtn) {
        acceptBtn.disabled = !checkbox.checked;
    }
}

function togglePrivacyAccept() {
    const checkbox = document.getElementById('privacyAccept');
    const acceptBtn = document.getElementById('privacyAcceptBtn');
    
    if (checkbox && acceptBtn) {
        acceptBtn.disabled = !checkbox.checked;
    }
}

function acceptTerms() {
    const checkbox = document.getElementById('termsAccept');
    
    if (checkbox && checkbox.checked) {
        termsAccepted = true;
        localStorage.setItem('crysantem_terms_accepted', 'true');
        localStorage.setItem('crysantem_terms_date', new Date().toISOString());
        
        alert('✅ Has aceptado los términos y condiciones de Crysantem.');
        closeTerms();
        
        // Si hay una conexión de Google pendiente, proceder
        if (pendingGoogleConnection) {
            pendingGoogleConnection = false;
            proceedWithGoogleConnection();
        }
    }
}

function acceptPrivacy() {
    privacyAccepted = true;
    localStorage.setItem('crysantem_privacy_accepted', 'true');
    localStorage.setItem('crysantem_privacy_date', new Date().toISOString());
    
    alert('✅ Has aceptado la política de privacidad de Crysantem.');
    closePrivacy();
    
    // Si hay una conexión de Google pendiente, proceder
    if (window.pendingGoogleConnection) {
        window.pendingGoogleConnection = false;
        proceedWithGoogleConnection();
    }
}

// === LOGIN CONSENT MODAL ===
function showLoginConsent() {
    console.log('=== SHOW LOGIN CONSENT MODAL ===');
    const modal = document.getElementById('loginConsentModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Login consent modal shown');
    } else {
        console.error('Login consent modal not found');
    }
}

function closeLoginConsent() {
    console.log('=== CLOSE LOGIN CONSENT MODAL ===');
    const modal = document.getElementById('loginConsentModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('Login consent modal closed');
    }
}

function acceptLoginConsent() {
    console.log('=== ACCEPT LOGIN CONSENT ===');
    localStorage.setItem('crysantem_terms_accepted', 'true');
    localStorage.setItem('crysantem_privacy_accepted', 'true');
    closeLoginConsent();
    
    // Llamar a la función de conexión de Google desde auth.js
    if (window.connectWithGoogle) {
        window.connectWithGoogle(true);
    } else {
        console.error('connectWithGoogle function not available');
    }
}

// === CHECK ACCEPTANCE ON LOAD ===
function checkTermsAcceptance() {
    const accepted = localStorage.getItem('crysantem_terms_accepted');
    if (accepted === 'true') {
        termsAccepted = true;
    }
    
    const privacy = localStorage.getItem('crysantem_privacy_accepted');
    if (privacy === 'true') {
        privacyAccepted = true;
    }
}

// === CLOSE MODAL ON OUTSIDE CLICK ===
window.onclick = function(event) {
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
    
    if (event.target === termsModal) {
        closeTerms();
    }
    
    if (event.target === privacyModal) {
        closePrivacy();
    }
}

// === KEYBOARD ACCESSIBILITY ===
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTerms();
        closePrivacy();
    }
});

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    checkTermsAcceptance();
    
    // Make functions globally available
    window.showTerms = showTerms;
    window.closeTerms = closeTerms;
    window.showPrivacy = showPrivacy;
    window.closePrivacy = closePrivacy;
    window.toggleTermsAccept = toggleTermsAccept;
    window.acceptTerms = acceptTerms;
    window.togglePrivacyAccept = togglePrivacyAccept;
    window.acceptPrivacy = acceptPrivacy;
    window.showLoginConsent = showLoginConsent;
    window.closeLoginConsent = closeLoginConsent;
    window.acceptLoginConsent = acceptLoginConsent;
    
    // Schedule button functionality
    const scheduleButton = document.getElementById('scheduleButton');
    if (scheduleButton) {
        scheduleButton.addEventListener('click', function() {
            // Scroll to chatbot section
            const chatbotSection = document.getElementById('chatbotInterface');
            if (chatbotSection) {
                chatbotSection.scrollIntoView({ behavior: 'smooth' });
                
                // Pre-fill the chat with scheduling information
                setTimeout(() => {
                    const chatbotInput = document.getElementById('chatbotInput');
                    if (chatbotInput) {
                        const prefillText = "Hola, me gustaría agendar una sesión para discutir un proyecto. Mi información:\n\nNombre: [Tu nombre]\nEmail: [Tu email]\nTeléfono: [Tu teléfono]\nEmpresa: [Nombre de tu empresa]\n\n¿Podrías agendarme una reunión con el desarrollador?";
                        chatbotInput.value = prefillText;
                        chatbotInput.focus();
                    }
                }, 500);
            }
        });
    }
});