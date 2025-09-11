require('dotenv').config();

module.exports = {
  // App Configuration
  PORT: process.env.PORT || 3000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ,
  
  // Secret Key for JWT
  SECRET_KEY: process.env.SECRET_KEY || 'your-super-secret-jwt-key-change-in-production',
  
  // MongoDB Configuration
  DB_NAME: process.env.DB_NAME || 'crm_tickets',
  DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/crm_tickets',
  
  // Default values for optional features
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_EXPIRE: '7d',
  BCRYPT_SALT_ROUNDS: 10,
  MAX_FILE_SIZE: '10485760', // 10MB
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};