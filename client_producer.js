const amqplib = require('amqplib');

const dotenv = require('dotenv');
dotenv.config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const exchange = 'Groupe_LSG_exchange';

const args = process.argv.slice(2);

// args be like --mode=random or user --operation=add,sub,mul,div,all --count=50 --delay=number -n1=number -n2=number
// each arg is optional
// --mode=random or user (default random)
const mode = args?.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'random';

let operations = ['add', 'sub', 'mul', 'div', 'all'];
let MAX_REQUESTS = 50;
let DELAY = 1000;
let n1 = Math.floor(Math.random() * 100);
let n2 = Math.floor(Math.random() * 100);

if (mode !== 'random') {
    operations = args?.find(arg => arg.startsWith('--operation='))?.split('=')[1]?.split(',') || operations;
    MAX_REQUESTS = parseInt(args?.find(arg => arg.startsWith('--count='))?.split('=')[1]) || MAX_REQUESTS;
    DELAY = parseInt(args?.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || DELAY;
    n1 = parseInt(args?.find(arg => arg.startsWith('--n1='))?.split('=')[1]) || n1;
    n2 = parseInt(args?.find(arg => arg.startsWith('--n2='))?.split('=')[1]) || n2;
} else {
    console.log('Mode aléatoire activé autres arguments ignorés.');
}

// Validate args
if (!['random', 'user'].includes(mode)) {
    console.error('Mode non valide. Utilisez --mode=random ou --mode=user.');
    process.exit(1);
}

if (!Array.isArray(operations) || operations.length === 0) {
    console.error('Opérations non valides. Utilisez --operation=add,sub,mul,div,all.');
    process.exit(1);
}
if (operations.some(op => !['add', 'sub', 'mul', 'div', 'all'].includes(op))) {
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

//n1 and n2 can be any number
if (isNaN(n1) || isNaN(n2)) {
    console.error('n1 et n2 doivent être des nombres.');
    process.exit(1);
}

// debug
console.log(`Mode: ${mode}`);
console.log(`Operations: ${operations}`);
console.log(`Max requests: ${MAX_REQUESTS}`);
console.log(`Delay: ${DELAY}`);
return;
async function startRequester() {
    const connection = await amqplib.connect(rabbitmq_url);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'direct', { durable: false });

    let count = 0;

    while (count < MAX_REQUESTS) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        const n1 = mode === 'user' ? n1 : Math.floor(Math.random() * 100);
        const n2 = mode === 'user' ? n2 : Math.floor(Math.random() * 100);
        const message = { n1, n2, op };

        const targets = op === 'all' ? ['add', 'sub', 'mul', 'div'] : [op];

        for (const routingKey of targets) {
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
            console.log(`Envoyé à ${routingKey}: ${JSON.stringify(message)}`);
        }

        count++;
        await new Promise(res => setTimeout(res, DELAY));
    }

    console.log('✓ 50 requêtes envoyées, arrêt du client_producer');

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, DELAY * 2);
}

startRequester().catch(console.error);
