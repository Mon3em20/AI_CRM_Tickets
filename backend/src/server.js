const app = require('./app');
const config = require('./config/env');

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 CRM Ticket System Backend');
  console.log('=================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 Client Origin: ${config.CLIENT_ORIGIN}`);
  console.log(`📊 Database: ${config.DB_NAME}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 API Status: http://localhost:${PORT}/api/status`);
  console.log('=================================');
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Process terminated.');
    process.exit(0);
  });
});

module.exports = server;