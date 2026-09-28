// ============================================
// CRYSANTEM - CONFIGURATION
// Backend API URL Configuration
// ============================================

// === BACKEND API URL ===
// Cambia esta URL cuando despliegues el backend en un servidor separado
// Desarrollo local: http://localhost:3000
// Producción: https://tu-backend-api.com (o la URL de tu VPS/servidor)
// Si no hay backend disponible, dejar vacío para usar modo demo
const BACKEND_API_URL = '';

// === APP BASE URL ===
// Normalmente es el mismo origen del frontend, pero puede ser diferente si usas dominios separados
const APP_BASE_URL = window.location.origin;

// === DEBUG MODE ===
// Activa logs detallados en consola para desarrollo
const DEBUG_MODE = true;

// === EXPORT CONFIGURATION ===
window.CrConfig = {
    BACKEND_API_URL,
    APP_BASE_URL,
    DEBUG_MODE
};

// Log configuration on load
if (DEBUG_MODE) {
    console.log('=== CRYSANTEM CONFIGURATION ===');
    console.log('Backend API URL:', BACKEND_API_URL || 'No backend configured');
    console.log('App Base URL:', APP_BASE_URL);
    console.log('Debug Mode:', DEBUG_MODE);
    console.log('Current Origin:', window.location.origin);
    console.log('================================');
}

// === APP BASE URL ===
// Normalmente es el mismo origen del frontend, pero puede ser diferente si usas dominios separados
const APP_BASE_URL = window.location.origin;

// === DEBUG MODE ===
// Activa logs detallados en consola para desarrollo
const DEBUG_MODE = true;

// === EXPORT CONFIGURATION ===
window.CrConfig = {
    BACKEND_API_URL,
    APP_BASE_URL,
    DEBUG_MODE
};

// Log configuration on load
if (DEBUG_MODE) {
    console.log('=== CRYSANTEM CONFIGURATION ===');
    console.log('Backend API URL:', BACKEND_API_URL);
    console.log('App Base URL:', APP_BASE_URL);
    console.log('Debug Mode:', DEBUG_MODE);
    console.log('Current Origin:', window.location.origin);
    console.log('================================');
}
