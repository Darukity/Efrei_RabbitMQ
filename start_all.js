const os = require('os');
const { exec, spawn } = require('child_process');

const isWindows = os.platform() === 'win32';

function startScript(title, command) {
    if (isWindows) {
        // Windows: ouvre une nouvelle fenêtre cmd
        exec(`start "${title}" cmd /k "${command}"`);
    } else {
        // Linux/macOS: ouvre une nouvelle fenêtre gnome-terminal
        // Remplace 'gnome-terminal' par 'x-terminal-emulator', 'konsole', ou autre si besoin
        spawn('gnome-terminal', ['--title', title, '--', 'bash', '-c', `${command}; exec bash`]);
    }
}

// Workers
['add', 'sub', 'mul', 'div'].forEach(op => {
    startScript(`worker_${op}`, `node worker.js ${op}`);
});

// Client pour afficher les résultats
startScript('client_result', 'node client_result.js');

// Client pour envoyer les requêtes
startScript('client_producer', 'node client_producer.js');
