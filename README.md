Projet réalisé par Loris NAVARRO / Gaëtan Maire / Samuel CHARTON

Le projet peut fonctionner de 2 facons avec les start all.
- Le premier avec le start all python qui fonctionne avec le fichier producer en python sans interface web.
- Le deuxième avec le start all basique qui permet l'utilisation d'une interface web.

# Projet RabbitMQ – Calculatrice distribuée

Ce dépôt contient une application de calcul distribué basée sur [RabbitMQ](https://www.rabbitmq.com/download.html), avec plusieurs workers effectuant des opérations arithmétiques (`add`, `sub`, `mul`, `div`), un producteur de requêtes et un consommateur de résultats.

---

## Table des matières

1. [Prérequis](#prérequis)  
2. [Installation](#installation)  
3. [Configuration](#configuration)  
4. [Structure du projet](#structure-du-projet)  
5. [Lancement](#lancement)  
6. [Utilisation](#utilisation)  
7. [Dépannage & FAQ](#dépannage--faq)  
8. [Liens utiles](#liens-utiles)

---

## Prérequis

Assurez-vous d'avoir **les versions minimales suivantes** installées sur votre machine (Windows recommandé) :

| Outil     | Version minimale requise |
|-----------|---------------------------|
| **Node.js**   | 20.11.0                   |
| **npm**       | 10.5.0                    |
| **Python**    | 3.12.0                    |
| **pip**       | 25.0.1                    |
| **Git**       | Dernière version          |

> Sur **macOS**, **Windows** ou **Linux**. Les commandes ci-dessous couvrent les trois environnements.

---

## Installation

### 1. Installer Node.js & npm

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS
```bash
brew update
brew install node
```

#### Windows  
Téléchargez l’installateur depuis https://nodejs.org/ et suivez les instructions.

### 2. Installer RabbitMQ

#### Linux (Ubuntu/Debian)
```bash
# Installer Erlang
sudo apt-get update
sudo apt-get install -y erlang-nox

# Installer RabbitMQ
sudo apt-get install -y rabbitmq-server

# Activer et démarrer
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

#### macOS
```bash
brew update
brew install rabbitmq
brew services start rabbitmq
```

#### Windows  
1. Installez Erlang (via le package officiel) : https://www.erlang.org/downloads  
2. Installez RabbitMQ (via l’installateur Windows) : https://www.rabbitmq.com/install-windows.html  
3. Démarrez le service RabbitMQ depuis le Panneau de services.

### 3. Cloner le projet & installer ses dépendances

```bash
git clone <URL_DU_REPO>
cd <NOM_DU_REPO>
npm i
pip install -r requirements.txt
```

---

## Configuration

1. Dupliquez le fichier d’exemple `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
2. Éditez `.env` pour définir votre URL RabbitMQ :
   ```dotenv
   RABBITMQ_URL=amqp://guest:guest@localhost:5672
   PORT=3000           # (optionnel si vous utilisez l’interface web)
   ```

---

## Structure du projet

```
.
├── .env                 # Variables d’environnement
├── package.json         # Dépendances & scripts npm
├── start_all.js         # Lance tous les workers et clients (terminaux séparés)
├── worker.js            # Code des workers (calculs)
├── client_producer.js   # Producteur de requêtes aléatoires
├── client_result.js     # Consommateur de résultats
├── server.js            # (Optionnel) Serveur web + Socket.IO pour UI
└── public/              # (Optionnel) UI web
    ├── index.html
    └── script.js
```

---

## Lancement

### A. Avec script d’automatisation avec la partie python Sans interface web
1. Installez en plus :
   ```bash
   pip install -r requirements.txt
   ```
```bash
node start_all_python.js
```

### B. Avec interface web

1. Assurez-vous d’avoir le dossier `public/` contenant `index.html` et `script.js`.  
2. Installez en plus :
   ```bash
   npm i
   ```
3. Lancez le serveur :
   ```bash
   node start_all.js
   ```
4. Ouvrez votre navigateur sur :
   ```
   http://localhost:3000
   ```
5. Utilisez le formulaire pour envoyer vos calculs ou cliquez sur **Démarrer le producteur** pour lancer des requêtes aléatoires.
---
##🖱️ Options disponibles dans le formulaire

Champ	Description
Nombre 1 (n1)	Premier nombre à utiliser pour les calculs.
Nombre 2 (n2)	Deuxième nombre à utiliser pour les calculs.
Nombre de calculs (count)	Nombre total de requêtes à envoyer.
Type (type)	Choix du mode d’envoi :
- user : utilise les valeurs définies pour n1 et n2.
- random : ignore n1 et n2, et utilise des nombres aléatoires pour chaque requête.
Opération (operation)	Type d’opération à effectuer :
- add (addition)
- sub (soustraction)
- mul (multiplication)
- div (division)
📝 Note : En mode random, les champs n1 et n2 et count et operation sont ignorés.

---

## Utilisation

- **Workers** : écoutent les files `calc_add`, `calc_sub`, `calc_mul`, `calc_div`, calculent avec un délai aléatoire, et publient les réponses sous la clé `result`.  
- **client_producer.js** : envoie 10 messages aléatoires (opération + deux nombres). Si `op === 'all'`, envoie vers les 4 workers.  
- **client_result.js** : consomme la file `Groupe_LSG_results` et affiche chaque résultat dans la console.  
- **Interface web** : optionnelle, front temps réel via Socket.IO.

---

## Dépannage & FAQ

- `ECONNREFUSED` à RabbitMQ : vérifiez que le service tourne (`systemctl status rabbitmq-server`).  
- `Usage: node worker.js <add|sub|mul|div>` : passez bien l’opération en argument.  
- `Cannot GET /` : assurez-vous que le dossier `public/` existe et est servi par Express.

---

## Liens utiles

- Node.js : https://nodejs.org/  
- npm : inclus avec Node.js  
- Visual Studio Code : https://code.visualstudio.com/  
- RabbitMQ : https://www.rabbitmq.com/download.html  
- Erlang/OTP : https://www.erlang.org/downloads  

---
