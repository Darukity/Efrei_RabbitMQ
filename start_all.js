const os = require('os');
const { exec, spawn } = require('child_process');

const isWindows = os.platform() === 'win32';

// Liste des processus
const processes = [];

function startScript(title, command) {
    let childProcess;

    if (isWindows) {
        // Windows: ouvre une nouvelle fenêtre cmd
        childProcess = exec(`start "${title}" cmd /k "${command}"`);
    } else {
        // Linux/macOS: ouvre une nouvelle fenêtre gnome-terminal
        childProcess = spawn('gnome-terminal', ['--title', title, '--', 'bash', '-c', `${command}; exec bash`]);
    }

    // Ajoute le processus à la liste pour pouvoir l'arrêter plus tard
    processes.push(childProcess);
}

// Workers
['add', 'sub', 'mul', 'div'].forEach(op => {
    startScript(`worker_${op}`, `node worker.js ${op}`);
});

// Client pour afficher les résultats et lancer l' Interface graphique
startScript('client_result', 'node server.js');

