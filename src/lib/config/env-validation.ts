/**
 * Validate required environment variables for DRAIS
 */
export function validateEnvironment() {
  const requiredVars = [
    'DB_HOST',
    'DB_USER', 
    'DB_NAME',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about development defaults
  if (process.env.JWT_SECRET === 'drais-dev-secret-change-in-production') {
    console.warn('⚠️ Using default JWT secret. Change in production!');
  }
}
