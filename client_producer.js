const amqplib = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const exchange = 'Groupe_LSG_exchange';
const operations = ['add', 'sub', 'mul', 'div', 'all'];
const MAX_REQUESTS = 10;

let connection = null;
let channel = null;

async function startRequester() {
    try {
        connection = await amqplib.connect(rabbitmq_url);
        channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'direct', { durable: false });

        for (let count = 0; count < MAX_REQUESTS; count++) {
            const op = operations[Math.floor(Math.random() * operations.length)];
            const n1 = Math.floor(Math.random() * 100);
            const n2 = Math.floor(Math.random() * 100);
            const message = { n1, n2, op };

            const targets = op === 'all' ? ['add', 'sub', 'mul', 'div'] : [op];

            for (const routingKey of targets) {
                channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
                console.log(`Envoyé à ${routingKey}: ${JSON.stringify(message)}`);
            }

            await new Promise(res => setTimeout(res, Math.random() * 3000 + 1000)); // entre 1 et 4 secondes
        }

        console.log('✓ 50 requêtes envoyées, fermeture propre...');
        await gracefulShutdown();

    } catch (err) {
        console.error('Erreur dans le requester :', err);
        await gracefulShutdown();
    }
}

async function gracefulShutdown() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err) {
        console.error('Erreur lors de la fermeture :', err);
    } finally {
        process.exit(0);
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startRequester();
