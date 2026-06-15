import 'dotenv/config';
import http from 'http';
import app from './src/app';
import { config } from './src/config/config';
import { startOrderScheduler } from './src/services/orderScheduler.service';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`\n🚀 AgriConnect TypeScript API running`);
  console.log(`   Port    : ${config.port}`);
  console.log(`   Base URL: http://localhost:${config.port}`);
  console.log(`   API     : http://localhost:${config.port}${config.apiV1Prefix}`);
  console.log(`   Health  : http://localhost:${config.port}/health\n`);

  // Start background scheduler
  startOrderScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received — shutting down gracefully');
  server.close(() => process.exit(0));
});
