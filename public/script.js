// public/script.js
const socket = io();

// références aux listes par opération
const lists = {
  add:  document.getElementById('results-add'),
  sub:  document.getElementById('results-sub'),
  mul:  document.getElementById('results-mul'),
  div:  document.getElementById('results-div'),
};

// envoi d'un calcul individuel
document.getElementById('calc-form').addEventListener('submit', e => {
  e.preventDefault();
  const op = document.getElementById('op').value;
  const n1 = parseFloat(document.getElementById('n1').value);
  const n2 = parseFloat(document.getElementById('n2').value);
  socket.emit('compute', { op, n1, n2 });
});

// lancement du producteur
document.getElementById('start-producer').addEventListener('click', () => {
  socket.emit('startProducer');
});

// réception et routage dans la colonne correspondante
socket.on('result', ({ n1, n2, op, result }) => {
  const sym = { add: '+', sub: '−', mul: '×', div: '÷' }[op] || op;
  const li = document.createElement('li');
  li.textContent = `${n1} ${sym} ${n2} = ${result}`;
  // on prepend pour afficher le plus récent en haut
  lists[op].prepend(li);
});
