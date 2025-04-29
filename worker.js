const amqplib = require('amqplib');

const dotenv = require('dotenv');
dotenv.config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const exchange = 'Groupe_LSG_exchange';

const args = process.argv.slice(2);
const operation = args[0];
if (!['add', 'sub', 'mul', 'div'].includes(operation)) {
    console.error("Usage: node worker.js <add|sub|mul|div>");
    process.exit(1);
}

let channel;

function compute(op, n1, n2) {
    switch (op) {
        case 'add': return n1 + n2;
        case 'sub': return n1 - n2;
        case 'mul': return n1 * n2;
        case 'div': return n2 !== 0 ? n1 / n2 : null;
        default: return null;
    }
}

async function receive() {
    const connection = await amqplib.connect(rabbitmq_url);
    channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'direct', { durable: false });

    const queue = `calc_${operation}`;
    await channel.assertQueue(queue, { durable: false });
    await channel.bindQueue(queue, exchange, operation);

    channel.consume(queue, consume);
}

function consume(message) {
    const data = JSON.parse(message.content.toString());
    const delay = Math.floor(Math.random() * 10000) + 5000;

    setTimeout(() => {
        const result = compute(operation, data.n1, data.n2);
        const resultMsg = { ...data, result };

        channel.publish('Groupe_LSG_exchange', 'result', Buffer.from(JSON.stringify(resultMsg)));
        console.log(`Résultat envoyé: ${JSON.stringify(resultMsg)}`);
        channel.ack(message);
    }, delay);
}

receive().catch(console.error);
