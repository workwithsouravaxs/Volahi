const { execSync } = require('child_process');

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

function killPorts() {
  const isWindows = process.platform === 'win32';
  const currentPid = process.pid;

  for (const port of PORTS) {
    try {
      if (isWindows) {
        let output;
        try {
          output = execSync(`netstat -ano | findstr LISTENING | findstr :${port}`, { encoding: 'utf8' });
        } catch (err) {
          // execSync throws if findstr finds no match (which means the port is free)
          continue;
        }

        const lines = output.split('\n');
        const pids = new Set();
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const localAddress = parts[1];
            const pidStr = parts[4];
            const pid = parseInt(pidStr, 10);
            
            if (localAddress.endsWith(`:${port}`) && pid && pid !== currentPid) {
              pids.add(pid);
            }
          }
        }

        for (const pid of pids) {
          console.log(`[kill-ports] Killing process ${pid} listening on port ${port}...`);
          try {
            execSync(`taskkill /F /PID ${pid}`);
          } catch (err) {
            console.warn(`[kill-ports] Could not kill process ${pid}: ${err.message}`);
          }
        }
      } else {
        try {
          const output = execSync(`lsof -t -i:${port}`, { encoding: 'utf8' });
          const pids = output.split('\n')
            .map(p => parseInt(p.trim(), 10))
            .filter(p => p && p !== currentPid);
          
          for (const pid of pids) {
            console.log(`[kill-ports] Killing process ${pid} listening on port ${port}...`);
            try {
              execSync(`kill -9 ${pid}`);
            } catch (err) {
              console.warn(`[kill-ports] Could not kill process ${pid}: ${err.message}`);
            }
          }
        } catch (lsofErr) {
          // lsof returns non-zero code if no process is found on the port
        }
      }
    } catch (err) {
      console.warn(`[kill-ports] Error checking port ${port}: ${err.message}`);
    }
  }
}

killPorts();
