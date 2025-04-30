const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const clientResult = require('./client_result');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Stockage temporaire en mémoire
const results = [];

// Callback appelé par client_result.js quand un résultat arrive
clientResult.setOnResult((data) => {
    //console.log('Résultat reçu dans server :', data);
    results.push(data); 
});

clientResult.start(); // Démarre l'écoute des résultats RabbitMQ

// POST /calculate déclenche un calcul
app.post('/calculate', async (req, res) => {
    const { n1, n2, count, type, operation, } = req.body;

    if (isNaN(n1) || isNaN(n2) || !['add', 'sub', 'mul', 'div'].includes(operation)) {
        return res.status(400).json({ error: 'Données invalides' });
    }

    // Lancer le producteur avec spawn
    const producer = spawn('node', [
        'client_producer.js',
        `--n1=${n1}`,
        `--n2=${n2}`,
        `--count=${count}`,
        `--operation=${operation}`,
        `--mode=${type}`
    ]);

    producer.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Erreur dans le processus de calcul' });
        }
        res.json({ message: 'Calcul lancé avec succès' });
    });
});

// GET /results retourne les résultats au front
app.get('/results', (req, res) => {
    res.json(results);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
