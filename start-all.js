const { spawn } = require('child_process');
const path = require('path');

// Port configuration
const gatewayPort = process.env.PORT || 5000;

// Track child processes
const children = [];

// Helper to run a service
function startService(name, dir, port, envOverrides = {}) {
  console.log(`[Orchestrator] Starting ${name} in ${dir}...`);
  
  // Set up child process environment, explicitly setting the PORT and overriding others if needed
  const childEnv = {
    ...process.env,
    PORT: port,
    ...envOverrides
  };

  const child = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, dir),
    env: childEnv,
    shell: true
  });

  children.push({ name, process: child });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] ${line.trim()}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`[${name}] [ERROR] ${line.trim()}`);
      }
    });
  });

  child.on('close', (code) => {
    console.log(`[Orchestrator] ${name} exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error(`[Orchestrator] Failed to start ${name}:`, err);
  });
}

// 1. Start database-dependent microservices on static ports on localhost
startService('User Service', 'user-service', 5001);
startService('Restaurant Service', 'restaurant-service', 5002);
startService('Order Service', 'order-service', 5003);

// 2. Start API Gateway on the Azure-specified PORT, routing to localhost microservices
startService('API Gateway', 'api-gateway', gatewayPort, {
  USER_SERVICE_URL: 'http://localhost:5001',
  RESTAURANT_SERVICE_URL: 'http://localhost:5002',
  ORDER_SERVICE_URL: 'http://localhost:5003'
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Orchestrator] SIGTERM received. Killing child processes...');
  children.forEach(({ name, process: child }) => {
    console.log(`[Orchestrator] Killing ${name}...`);
    child.kill();
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Orchestrator] SIGINT received. Killing child processes...');
  children.forEach(({ name, process: child }) => {
    console.log(`[Orchestrator] Killing ${name}...`);
    child.kill();
  });
  process.exit(0);
});
