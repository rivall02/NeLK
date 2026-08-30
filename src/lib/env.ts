/** 
 * Environment configuration and runtime validation. 
 * Safe defaults and clear status checks for external integrations.
 */

export const env = {
  // Environment URL
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Auth
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-secret-key-replace-in-production",

  // AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Google OAuth & Classroom
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",

  // Strava
  STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID || "",
  STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || "",
  STRAVA_VERIFY_TOKEN: process.env.STRAVA_VERIFY_TOKEN || "NELK_STRAVA_DEFAULT_TOKEN",

  // Billing (Stripe / Payment Gateway)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Storage
  STORAGE_DIR: process.env.STORAGE_DIR || "storage/documents",
  MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES || "10485760", 10), // 10MB default
};

/** 
 * Check if Gemini AI is configured 
 */
export const hasGeminiConfigured = (): boolean => {
  return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 5);
};

/** 
 * Check if Google OAuth is configured 
 */
export const hasGoogleAuthConfigured = (): boolean => {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
};

/** 
 * Check if Strava is configured 
 */
export const hasStravaConfigured = (): boolean => {
  return Boolean(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET);
};

/** 
 * Check if Billing is configured 
 */
export const hasBillingConfigured = (): boolean => {
  return Boolean(env.STRIPE_SECRET_KEY);
};