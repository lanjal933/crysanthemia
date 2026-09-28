import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import 'dotenv/config';

// 1. Configuración de variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL || "https://pazpomltsuerftqgkvmq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${SUPABASE_URL}/auth/v1/callback`;

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive.file'
];

// Inicialización del cliente de Supabase (modo Admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Obtiene el OAuth2Client configurado con el refresh_token del usuario
 * @param {string} userId - UUID del usuario en Supabase
 * @returns {Promise<google.auth.OAuth2>}
 */
async function getAuthenticatedGoogleClient(userId) {
  const { data, error } = await supabase
    .from('user_google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (error || !data || !data.refresh_token) {
    throw new Error(`No se encontró un Refresh Token válido para el usuario: ${userId}`);
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: data.refresh_token
  });

  return oauth2Client;
}

/**
 * Guarda o actualiza los tokens de Google OAuth en Supabase
 * @param {string} userId - UUID del usuario en Supabase
 * @param {string} email - Email del usuario
 * @param {string} refreshToken - Refresh token de Google
 * @param {string} accessToken - Access token de Google (opcional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function saveGoogleTokens(userId, email, refreshToken, accessToken = null) {
  const { data, error } = await supabase
    .from('user_google_tokens')
    .upsert({
      user_id: userId,
      email: email,
      refresh_token: refreshToken,
      access_token: accessToken,
      scopes: GOOGLE_SCOPES.join(' '),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error("Error guardando tokens en Supabase:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Obtiene los tokens de Google de un usuario
 * @param {string} userId - UUID del usuario en Supabase
 * @returns {Promise<{refresh_token: string, email: string} | null>}
 */
async function getGoogleTokens(userId) {
  const { data, error } = await supabase
    .from('user_google_tokens')
    .select('refresh_token, email')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Elimina los tokens de Google de un usuario
 * @param {string} userId - UUID del usuario en Supabase
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteGoogleTokens(userId) {
  const { error } = await supabase
    .from('user_google_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error("Error eliminando tokens de Supabase:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Refresca el access token usando el refresh token
 * @param {string} userId - UUID del usuario en Supabase
 * @returns {Promise<{access_token: string, expiry_date: number} | null>}
 */
async function refreshAccessToken(userId) {
  try {
    const oauth2Client = await getAuthenticatedGoogleClient(userId);
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (credentials.access_token) {
      // Actualizar el access token en la base de datos
      const { data: userData } = await supabase
        .from('user_google_tokens')
        .select('email')
        .eq('user_id', userId)
        .single();

      if (userData) {
        await saveGoogleTokens(userId, userData.email, oauth2Client.credentials.refresh_token, credentials.access_token);
      }
      
      return {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error refrescando access token:", error);
    return null;
  }
}

// Exportar funciones para uso en otros módulos
export {
  getAuthenticatedGoogleClient,
  saveGoogleTokens,
  getGoogleTokens,
  deleteGoogleTokens,
  refreshAccessToken,
  GOOGLE_SCOPES
};