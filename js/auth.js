// ============================================
// CRYSANTEM - AUTHENTICATION MODULE
// Google OAuth2 & Supabase Integration
// Backend API Integration
// ============================================

// === CONFIGURATION ===
// Usar configuración centralizada desde config.js
const API_BASE_URL = (window.CrConfig && window.CrConfig.BACKEND_API_URL) || window.location.origin;
// Usar directamente window.CrConfig.APP_BASE_URL sin redeclarar

// Variables que se cargarán desde el backend
let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;

// === LOAD CONFIG FROM BACKEND ===
async function loadConfigFromBackend() {
    try {
        // Solo intentar cargar si hay una URL de backend configurada
        if (!API_BASE_URL || API_BASE_URL === '') {
            console.log('No backend URL configured, using local Supabase config');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/config`);
        if (response.ok) {
            const config = await response.json();
            SUPABASE_URL = config.supabaseUrl;
            SUPABASE_ANON_KEY = config.supabaseAnonKey;
            console.log('Config loaded securely from backend');
        } else {
            console.error('Failed to load config from backend');
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

console.log('=== AUTH DEBUG INFO ===');
console.log('API Base URL:', API_BASE_URL || 'No backend configured');
console.log('App Base URL:', (window.CrConfig && window.CrConfig.APP_BASE_URL) || window.location.origin);
console.log('Current window.location.href:', window.location.href);
console.log('Current window.location.origin:', window.location.origin);
console.log('=======================');

// === STATE ===
let supabaseClient = null;
let currentUser = null;
let isGoogleConnected = false;
let isEmailVerified = false;

// Make currentUser globally accessible and keep it in sync
Object.defineProperty(window, 'currentUser', {
    get() { return currentUser; },
    set(value) { currentUser = value; }
});

// === INITIALIZATION ===
async function initSupabase() {
    try {
        // Primero cargar configuración desde backend
        await loadConfigFromBackend();
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('Configuration not loaded from backend');
            return null;
        }
        
        if (typeof supabase === 'undefined') {
            console.error('Supabase SDK not loaded');
            return null;
        }

        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        console.log('Supabase initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return null;
    }
}



// === GOOGLE OAUTH2 (DIRECT URL CONSTRUCTION) ===
async function connectWithGoogle(skipTermsCheck = false) {
    console.log('=== CONNECT WITH GOOGLE ===');
    console.log('skipTermsCheck:', skipTermsCheck);
    
    // Asegurar que la configuración esté cargada
    if (!SUPABASE_URL) {
        console.error('SUPABASE_URL not loaded, waiting for config...');
        await loadConfigFromBackend();
    }
    
    if (!SUPABASE_URL) {
        alert('Error: No se pudo cargar la configuración del servidor. Por favor, recarga la página.');
        return;
    }
    
    console.log('SUPABASE_URL:', SUPABASE_URL);
    
    // Verificar si se han aceptado los términos y condiciones
    const termsAccepted = localStorage.getItem('crysantem_terms_accepted');
    const privacyAccepted = localStorage.getItem('crysantem_privacy_accepted');
    
    console.log('termsAccepted:', termsAccepted);
    console.log('privacyAccepted:', privacyAccepted);
    
    if (!skipTermsCheck && (termsAccepted !== 'true' || privacyAccepted !== 'true')) {
        console.log('Showing login consent modal');
        showLoginConsent();
        return;
    }
    
    console.log('Terms accepted, proceeding with Google OAuth');
    
    // Limpiar cualquier URL malformada actual
    if (window.location.pathname.includes('/auth/undefined')) {
        console.log('Cleaning up malformed URL, redirecting to home');
        window.location.href = window.location.origin;
        return;
    }
    
    // Usar el callback de Supabase nativo
    const redirectUri = `${window.location.origin}/auth/callback`;
    console.log('Redirect URI:', redirectUri);

    // Construir URL de autorización de Supabase
    const googleOAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}&scopes=${encodeURIComponent('https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar')}&access_type=offline&prompt=consent`;
    
    console.log('Google OAuth URL:', googleOAuthUrl);
    console.log('Redirecting to Google OAuth with Supabase');
    
    window.location.href = googleOAuthUrl;
}

// Función para continuar con la conexión después de aceptar términos
function proceedWithGoogleConnection() {
    console.log('Proceeding with Google connection after terms acceptance');
    connectWithGoogle(true); // Skip terms check since they were just accepted
}

// === EMAIL VERIFICATION ===
async function sendVerificationCode() {
    if (!currentUser || !currentUser.email) {
        alert('Debes iniciar sesión primero');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: currentUser.email,
                user_id: currentUser.id
            })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Código de verificación enviado a ${currentUser.email}. Por favor, revisa tu correo e ingresa el código.`);
            return data.verification_id;
        } else {
            throw new Error('Error al enviar código de verificación');
        }
    } catch (error) {
        console.error('Error sending verification code:', error);
        alert('Error al enviar código de verificación. Por favor, intenta nuevamente.');
    }
}

async function verifyEmailCode(code, verificationId) {
    if (!currentUser) {
        alert('Debes iniciar sesión primero');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                verification_id: verificationId,
                user_id: currentUser.id,
                email: currentUser.email
            })
        });

        if (response.ok) {
            const data = await response.json();
            isEmailVerified = data.verified;
            if (isEmailVerified) {
                alert('✅ Email verificado correctamente. Ahora puedes usar el agente.');
                updateAuthUI();
            }
            return data.verified;
        } else {
            throw new Error('Código inválido o expirado');
        }
    } catch (error) {
        console.error('Error verifying email code:', error);
        alert('Error al verificar el código. Por favor, intenta nuevamente.');
        return false;
    }
}

// === GOOGLE CONNECTION STATUS ===
async function checkGoogleConnection() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/google/status/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            isGoogleConnected = data.connected;
            console.log('Google connection status:', data);
        } else {
            isGoogleConnected = false;
        }
    } catch (error) {
        console.error('Error checking Google connection:', error);
        isGoogleConnected = false;
    }
}

async function disconnectGoogle() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/google/disconnect/${currentUser.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            isGoogleConnected = false;
            updateAuthUI();
            alert('Google desconectado exitosamente');
        } else {
            throw new Error('Error al desconectar Google');
        }
    } catch (error) {
        console.error('Error disconnecting Google:', error);
        alert('Error al desconectar Google: ' + error.message);
    }
}

// === UI UPDATES ===
function updateAuthUI() {
    const accountMenuButton = document.getElementById('accountMenuButton');
    const accountButtonText = document.getElementById('accountButtonText');
    const accountEmail = document.getElementById('accountEmail');
    const accountDropdown = document.getElementById('accountDropdown');

    console.log('=== UPDATE AUTH UI ===');
    console.log('currentUser:', currentUser);
    console.log('accountMenuButton:', !!accountMenuButton);
    console.log('accountButtonText:', !!accountButtonText);
    console.log('=======================');

    if (!accountMenuButton) return;

    if (currentUser) {
        // User is logged in
        if (accountButtonText) {
            accountButtonText.textContent = 'Cuenta';
        }
        if (accountEmail) {
            accountEmail.textContent = currentUser.email || 'Cuenta';
        }
        if (accountMenuButton) {
            accountMenuButton.classList.add('btn-connected');
        }
        
        // Show dropdown if it was hidden
        if (accountDropdown && accountDropdown.classList.contains('hidden')) {
            accountDropdown.classList.remove('hidden');
        }
    } else {
        // User is not logged in
        if (accountButtonText) {
            accountButtonText.textContent = 'Iniciar Sesión';
        }
        if (accountEmail) {
            accountEmail.textContent = 'No conectado';
        }
        if (accountMenuButton) {
            accountMenuButton.classList.remove('btn-connected');
        }
        
        // Hide dropdown
        if (accountDropdown) {
            accountDropdown.classList.add('hidden');
        }
    }
}

// === ACCOUNT MENU ===
function toggleAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    if (!dropdown) return;
    
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        setTimeout(() => dropdown.classList.add('show'), 10);
    } else {
        dropdown.classList.remove('show');
        setTimeout(() => dropdown.classList.add('hidden'), 300);
    }
}

function closeAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    if (!dropdown) return;
    
    dropdown.classList.remove('show');
    setTimeout(() => dropdown.classList.add('hidden'), 300);
}

async function disconnectGoogle() {
    if (!supabaseClient || !currentUser) return;

    try {
        const { error } = await supabaseClient
            .from('user_google_tokens')
            .delete()
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Error disconnecting Google:', error);
            alert('Error al desconectar Google: ' + error.message);
        } else {
            isGoogleConnected = false;
            updateAuthUI();
            alert('Google desconectado exitosamente');
        }
    } catch (error) {
        console.error('Exception disconnecting Google:', error);
        alert('Error al desconectar Google');
    }
}

async function signOut() {
    if (!supabaseClient) return;

    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        isGoogleConnected = false;
        isEmailVerified = false;
        updateAuthUI();
        
        // Limpiar localStorage para forzar que aparezca el modal de consentimiento nuevamente
        localStorage.removeItem('crysantem_terms_accepted');
        localStorage.removeItem('crysantem_privacy_accepted');
        
        console.log('User signed out successfully, terms cleared');
        
        // Redirigir a la página principal
        window.location.href = window.location.origin;
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error al cerrar sesión');
    }
}

// === FORCE LOGOUT FOR REFRESH TOKEN REGENERATION ===
async function handleForceLogout() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }

    try {
        console.log('Force logout initiated - clearing Supabase session');
        await supabaseClient.auth.signOut();
        currentUser = null;
        isGoogleConnected = false;
        updateAuthUI();
        
        console.log('Session cleared, redirecting to home for fresh login');
        window.location.href = (window.CrConfig && window.CrConfig.APP_BASE_URL) || window.location.origin;
    } catch (error) {
        console.error('Error during force logout:', error);
        alert('Error al forzar logout: ' + error.message);
    }
}

// === DOM READY ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing auth...');
    
    // Limpiar URL malformada al cargar
    if (window.location.pathname.includes('/auth/undefined')) {
        console.log('Cleaning up malformed URL on page load');
        window.location.href = window.location.origin;
        return;
    }
    
    // Initialize Supabase and wait for it
    supabaseClient = await initSupabase();
    
    console.log('Supabase client initialized:', !!supabaseClient);
    
    // Make functions globally available
    window.connectWithGoogle = connectWithGoogle;
    window.signOut = signOut;
    window.disconnectGoogle = disconnectGoogle;
    window.handleForceLogout = handleForceLogout;
    window.sendVerificationCode = sendVerificationCode;
    window.verifyEmailCode = verifyEmailCode;
    
    console.log('Functions made global, looking for account menu button...');
    
    // Add event listener to account menu button
    const accountMenuButton = document.getElementById('accountMenuButton');
    console.log('Account menu button element:', accountMenuButton);
    
    if (accountMenuButton) {
        console.log('Account menu button found, adding click listener');
        
        accountMenuButton.addEventListener('click', (e) => {
            console.log('Account menu button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Current user:', currentUser);
            
            if (!currentUser) {
                // If not logged in, connect with Google
                console.log('No user logged in, initiating Google OAuth via backend');
                connectWithGoogle();
            } else {
                // If logged in, toggle dropdown
                console.log('User logged in, toggling dropdown');
                toggleAccountDropdown();
            }
        });
    } else {
        console.error('Account menu button not found in DOM');
        console.log('Available buttons:', document.querySelectorAll('button'));
    }
    
    // Add event listeners to dropdown buttons
    const disconnectGoogleBtn = document.getElementById('disconnectGoogleBtn');
    if (disconnectGoogleBtn) {
        disconnectGoogleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            disconnectGoogle();
            closeAccountDropdown();
        });
    }
    
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signOut();
            closeAccountDropdown();
        });
    }
    
    const forceLogoutBtn = document.getElementById('forceLogoutBtn');
    if (forceLogoutBtn) {
        forceLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleForceLogout();
            closeAccountDropdown();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const accountMenuContainer = document.querySelector('.account-menu-container');
        if (accountMenuContainer && !accountMenuContainer.contains(e.target)) {
            closeAccountDropdown();
        }
    });
    
    // Check for OAuth callback from Supabase
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // Primero verificar si hay tokens en el hash (implicit flow)
    if (hash && (hash.includes('access_token') || hash.includes('provider_refresh_token'))) {
        console.log('=== TOKENS IN HASH DETECTED ===');
        console.log('Hash:', hash);
        
        // Extraer tokens del hash
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const providerRefreshToken = hashParams.get('provider_refresh_token');
        const expiresIn = hashParams.get('expires_in');
        
        console.log('Access token present:', !!accessToken);
        console.log('Provider refresh token present:', !!providerRefreshToken);
        
        // Usar Supabase para establecer la sesión con los tokens
        if (supabaseClient && accessToken) {
            try {
                const { data, error } = await supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                
                if (error) {
                    console.error('Error setting session from hash:', error);
                    alert('Error al establecer sesión: ' + error.message);
                } else {
                    console.log('Session set successfully from hash tokens');
                    currentUser = data.user;
                    console.log('User:', currentUser);
                    console.log('User email:', currentUser?.email);
                    
                    // Guardar provider_refresh_token si existe
                    if (providerRefreshToken && currentUser) {
                        console.log('Saving provider_refresh_token to backend...');
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/auth/save-tokens`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    user_id: currentUser.id,
                                    email: currentUser.email,
                                    provider_refresh_token: providerRefreshToken
                                })
                            });
                            
                            if (response.ok) {
                                console.log('✅ Provider refresh token saved successfully');
                                isGoogleConnected = true;
                            } else {
                                console.error('Error saving tokens to backend');
                            }
                        } catch (error) {
                            console.error('Exception saving tokens:', error);
                        }
                    }
                    
                    console.log('Updating auth UI after successful OAuth');
                    updateAuthUI();
                    alert(`¡Cuenta de Google conectada exitosamente! (${currentUser?.email || ''})`);
                }
            } catch (error) {
                console.error('Exception setting session:', error);
                alert('Error al procesar tokens: ' + error.message);
            }
        }
        
        // Limpiar el hash
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    // Luego verificar el callback normal con query params
    if (urlParams.has('auth')) {
        const authStatus = urlParams.get('auth');
        const email = urlParams.get('email');
        
        console.log('=== OAUTH CALLBACK HANDLING ===');
        console.log('Auth status:', authStatus);
        console.log('Email:', email);
        console.log('==============================');
        
        if (authStatus === 'success' && email) {
            console.log('OAuth successful for email:', email);
            alert(`¡Cuenta de Google conectada exitosamente! (${email})`);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Force session refresh and UI update
            if (supabaseClient) {
                console.log('Refreshing Supabase session after OAuth...');
                supabaseClient.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                        currentUser = session.user;
                        console.log('Session established:', currentUser.email);
                        checkGoogleConnection();
                        updateAuthUI();
                    } else {
                        console.log('No session from Supabase, attempting to get user from local storage');
                        // Try to get user from local storage
                        const { data: { user } } = supabaseClient.auth.getUser();
                        if (user) {
                            currentUser = user;
                            console.log('User from local storage:', currentUser.email);
                            checkGoogleConnection();
                            updateAuthUI();
                        } else {
                            console.log('No user found, OAuth completed but no session');
                            updateAuthUI();
                        }
                    }
                });
            }
        } else if (authStatus === 'error') {
            const message = urlParams.get('message');
            console.error('OAuth failed:', message);
            alert('Error al conectar con Google: ' + (message || 'Error desconocido'));
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    
    // Also check for Supabase OAuth callback with tokens in hash
    if (hash && (hash.includes('access_token') || hash.includes('provider_token'))) {
        console.log('=== SUPABASE OAUTH CALLBACK WITH TOKENS ===');
        console.log('Hash present with tokens, letting Supabase handle it automatically');
        console.log('Supabase should auto-detect and set session');
        
        // Give Supabase time to process the hash
        setTimeout(() => {
            console.log('Checking session after Supabase processing...');
            supabaseClient.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    currentUser = session.user;
                    console.log('Session auto-established by Supabase:', currentUser.email);
                    checkGoogleConnection();
                    updateAuthUI();
                    alert(`¡Cuenta de Google conectada exitosamente! (${currentUser.email})`);
                } else {
                    console.log('Supabase did not auto-establish session');
                }
            });
        }, 1000);
    }
    
    // Check for existing session on load
    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                currentUser = session.user;
                console.log('Existing session found:', currentUser.email);
                checkGoogleConnection();
                updateAuthUI();
            } else {
                console.log('No existing session found');
                updateAuthUI(); // Update UI even if no session (to show "Iniciar Sesión")
            }
        });
    }
});
