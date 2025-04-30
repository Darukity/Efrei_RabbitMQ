const amqplib = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const exchange = 'Groupe_LSG_exchange';

// Analyse des arguments
const args = process.argv.slice(2);
const mode = args?.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'random';

let operations = ['add', 'sub', 'mul', 'div', 'all'];
let MAX_REQUESTS = 10;
let DELAY = 1000;
let n1 = Math.floor(Math.random() * 100);
let n2 = Math.floor(Math.random() * 100);

if (!['random', 'user'].includes(mode)) {
    console.error('Mode non valide. Utilisez --mode=random ou --mode=user.');
    process.exit(1);
}

if (mode === 'user') {
    operations = args.find(arg => arg.startsWith('--operation='))?.split('=')[1]?.split(',') || operations;
    MAX_REQUESTS = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || MAX_REQUESTS;
    DELAY = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || DELAY;
    n1 = parseInt(args.find(arg => arg.startsWith('--n1='))?.split('=')[1]) || n1;
    n2 = parseInt(args.find(arg => arg.startsWith('--n2='))?.split('=')[1]) || n2;

    // Validations
    if (!Array.isArray(operations) || operations.length === 0 ||
        operations.some(op => !['add', 'sub', 'mul', 'div', 'all'].includes(op))) {
        console.error('Opérations non valides. Utilisez --operation=add,sub,mul,div,all.');
        process.exit(1);
    }
    if (isNaN(MAX_REQUESTS) || MAX_REQUESTS <= 0) {
        console.error('Nombre de requêtes non valide. Utilisez --count=nombre.');
        process.exit(1);
    }
    if (isNaN(DELAY) || DELAY <= 0) {
        console.error('Délai non valide. Utilisez --delay=nombre.');
        process.exit(1);
    }
    if (isNaN(n1) || isNaN(n2)) {
        console.error('n1 et n2 doivent être des nombres.');
        process.exit(1);
    }
} else {
    console.log('Mode aléatoire activé, les autres arguments sont ignorés.');
}

// debug
// console.log(`Mode: ${mode}`);
// console.log(`Operations: ${operations}`);
// console.log(`Max requests: ${MAX_REQUESTS}`);
// console.log(`Delay: ${DELAY}`);

let connection ;//= null;
let channel ;//= null;

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

async function startRequester() {
    try {
        connection = await amqplib.connect(rabbitmq_url);
        channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'direct', { durable: false });

        for (let count = 0; count < MAX_REQUESTS; count++) {
            const op = operations[Math.floor(Math.random() * operations.length)];
            const num1 = mode === 'user' ? n1 : Math.floor(Math.random() * 100);
            const num2 = mode === 'user' ? n2 : Math.floor(Math.random() * 100);
            const targets = op === 'all' ? ['add', 'sub', 'mul', 'div'] : [op];

            for (const routingKey of targets) {
                const operationMessage = {
                    n1: num1,
                    n2: num2,
                    op: routingKey  // ici on remplace "all" par l'opération du worker
                };
            
                channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(operationMessage)));
                console.log(`Envoyé à ${routingKey}: ${JSON.stringify(operationMessage)}`);
            }

            await new Promise(res => setTimeout(res, DELAY));
        }

        console.log(`✓ ${MAX_REQUESTS} requêtes envoyées, fermeture propre...`);
        //await gracefulShutdown();

    } catch (err) {
        console.error('Erreur dans le requester :', err);
        //await gracefulShutdown();
    }
}

startRequester();