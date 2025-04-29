const amqplib = require('amqplib');

const rabbitmq_url = 'amqp://user:password@infoexpertise.hopto.org:5674';
const exchange = 'Groupe_LSG_exchange';
const operations = ['add', 'sub', 'mul', 'div', 'all'];
const MAX_REQUESTS = 50;

async function startRequester() {
    const connection = await amqplib.connect(rabbitmq_url);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'direct', { durable: false });

    let count = 0;

    while (count < MAX_REQUESTS) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        const n1 = Math.floor(Math.random() * 100);
        const n2 = Math.floor(Math.random() * 100);
        const message = { n1, n2, op };

        const targets = op === 'all' ? ['add', 'sub', 'mul', 'div'] : [op];

        for (const routingKey of targets) {
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
            console.log(`Envoyé à ${routingKey}: ${JSON.stringify(message)}`);
        }

        count++;
        await new Promise(res => setTimeout(res, Math.random() * 3000 + 1000));
    }

    console.log('✓ 50 requêtes envoyées, arrêt du client_producer');

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

startRequester().catch(console.error);
