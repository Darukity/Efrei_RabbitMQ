// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const amqplib = require('amqplib');
const dotenv = require('dotenv');
dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE = 'Groupe_LSG_exchange';
const RESULT_ROUTING = 'result';
const MAX_REQUESTS = 50;

async function startRabbit() {
  const conn = await amqplib.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, 'direct', { durable: false });
  const resultQueue = 'Groupe_LSG_results';
  await ch.assertQueue(resultQueue, { durable: false });
  await ch.bindQueue(resultQueue, EXCHANGE, RESULT_ROUTING);
  return { ch, resultQueue };
}

// génère des requêtes aléatoires
async function generateRequests(ch) {
  const operations = ['add', 'sub', 'mul', 'div', 'all'];
  let count = 0;
  while (count < MAX_REQUESTS) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    const n1 = Math.floor(Math.random() * 100);
    const n2 = Math.floor(Math.random() * 100);
    const msg = { op, n1, n2, clientId: null }; // clientId null = broadcast
    const targets = op === 'all' ? ['add','sub','mul','div'] : [op];
    for (const routingKey of targets) {
      ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(msg)));
    }
    count++;
    await new Promise(res => setTimeout(res, Math.random() * 3000 + 1000));
  }
  console.log(`✓ ${MAX_REQUESTS} requêtes aléatoires envoyées`);
}

(async () => {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);
  const { ch, resultQueue } = await startRabbit();

  app.use(express.static('public'));

  io.on('connection', socket => {
    console.log(`Client connecté : ${socket.id}`);

    // calcul individuel
    socket.on('compute', ({ op, n1, n2 }) => {
      const msg = { op, n1, n2, clientId: socket.id };
      ch.publish(EXCHANGE, op, Buffer.from(JSON.stringify(msg)));
    });

    // lancement du producteur depuis le front
    socket.on('startProducer', () => {
      console.log(`Lancement du producteur pour ${socket.id}`);
      generateRequests(ch).catch(console.error);
    });

    // consommation des résultats
    ch.consume(resultQueue, m => {
      const data = JSON.parse(m.content.toString());
      // n'envoyer que si clientId correspond (ou si broadcast)
      if (!data.clientId || data.clientId === socket.id) {
        socket.emit('result', data);
      }
      ch.ack(m);
    }, { noAck: false });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`GUI server running on http://localhost:${PORT}`));
})();
