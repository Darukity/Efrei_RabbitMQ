import asyncio
import json
import os
import random
import sys
import aio_pika
from dotenv import load_dotenv

load_dotenv()

rabbitmq_url = os.getenv('RABBITMQ_URL')
exchange_name = 'Groupe_LSG_exchange'

args = sys.argv[1:]
mode = 'random'
operations = ['add', 'sub', 'mul', 'div', 'all']
MAX_REQUESTS = 50
DELAY = 1.0
n1 = random.randint(0, 99)
n2 = random.randint(0, 99)

for arg in args:
    if arg.startswith('--mode='):
        mode = arg.split('=')[1]

if mode not in ['random', 'user']:
    print('Mode non valide. Utilisez --mode=random ou --mode=user.')
    sys.exit(1)

if mode == 'user':
    for arg in args:
        if arg.startswith('--operation='):
            operations = arg.split('=')[1].split(',')
        elif arg.startswith('--count='):
            MAX_REQUESTS = int(arg.split('=')[1])
        elif arg.startswith('--delay='):
            DELAY = int(arg.split('=')[1]) / 1000
        elif arg.startswith('--n1='):
            n1 = int(arg.split('=')[1])
        elif arg.startswith('--n2='):
            n2 = int(arg.split('=')[1])

    if any(op not in ['add', 'sub', 'mul', 'div', 'all'] for op in operations):
        print('Opérations non valides. Utilisez --operation=add,sub,mul,div,all.')
        sys.exit(1)

connection = None
channel = None

async def graceful_shutdown():
    if channel:
        await channel.close()
    if connection:
        await connection.close()

async def start_requester():
    global connection, channel
    try:
        connection = await aio_pika.connect_robust(rabbitmq_url)
        channel = await connection.channel()

        exchange = await channel.declare_exchange(exchange_name, aio_pika.ExchangeType.DIRECT, durable=False)

        for count in range(MAX_REQUESTS):
            op = random.choice(operations)
            num1 = n1 if mode == 'user' else random.randint(0, 99)
            num2 = n2 if mode == 'user' else random.randint(0, 99)
            message = {'n1': num1, 'n2': num2, 'op': op}
            payload = json.dumps(message).encode()

            targets = ['add', 'sub', 'mul', 'div'] if op == 'all' else [op]
            for routing_key in targets:
                await exchange.publish(aio_pika.Message(body=payload), routing_key=routing_key)
                print(f"Envoyé à {routing_key}: {message}")

            await asyncio.sleep(DELAY)

        print(f"✓ {MAX_REQUESTS} requêtes envoyées, fermeture propre...")

    except Exception as e:
        print(f"Erreur dans le requester : {e}")
    finally:
        await graceful_shutdown()

if __name__ == '__main__':
    try:
        asyncio.run(start_requester())
    except KeyboardInterrupt:
        print("Interruption clavier reçue, fermeture propre...")
        asyncio.run(graceful_shutdown())
