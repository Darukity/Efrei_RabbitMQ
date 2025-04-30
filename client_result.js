const amqplib = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const rabbitmq_url = process.env.RABBITMQ_URL;
const exchange = 'Groupe_LSG_exchange';
const queue = 'Groupe_LSG_results';
const routingKey = 'result';

let channel;
let onResultCallback = null;

function setOnResult(callback) {
    onResultCallback = callback;
}

async function receive() {
    const connection = await amqplib.connect(rabbitmq_url);
    channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'direct', { durable: false });
    await channel.assertQueue(queue, { durable: false });
    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, consume);
}

function consume(message) {
    const data = JSON.parse(message.content.toString());
    console.log(`Résultat: ${data.n1} ${data.op} ${data.n2} = ${data.result}`);

    if (onResultCallback) {
        onResultCallback(data); // On envoie au front
    }

    setTimeout(() => {
        channel.ack(message);
    }, 15000);
}

module.exports = {
    start: receive,
    setOnResult
};
