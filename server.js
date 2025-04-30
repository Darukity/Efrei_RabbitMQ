const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');

const clientResult = require('./client_result');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Démarrage du listener RabbitMQ
clientResult.setOnResult((result) => {
    io.emit('result', result); // envoi à tous les clients connectés
});

clientResult.start();

// Ecoute des requêtes du front
io.on('connection', (socket) => {
    console.log('🧠 Nouveau client connecté');

    socket.on('startProducer', ({ mode, operations, count, delay, n1, n2 }) => {
        console.log('⚙️ Lancement de client_producer avec :', { mode, operations, count, delay, n1, n2 });

        const args = [`--mode=${mode}`];

        if (mode === 'user') {
            if (operations) args.push(`--operation=${operations.join(',')}`);
            if (count) args.push(`--count=${count}`);
            if (delay) args.push(`--delay=${delay}`);
            if (n1 != null) args.push(`--n1=${n1}`);
            if (n2 != null) args.push(`--n2=${n2}`);
        }

        const producer = spawn('node', ['client_producer.js', ...args]);

        producer.stdout.on('data', data => {
            console.log(`📤 [Producer]: ${data}`);
        });

        producer.stderr.on('data', data => {
            console.error(`❌ [Producer Error]: ${data}`);
        });

        producer.on('close', code => {
            console.log(`🔚 Producteur terminé avec le code ${code}`);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
