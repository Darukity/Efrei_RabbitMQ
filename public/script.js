const socket = io();

const lists = {
  add: document.getElementById('results-add'),
  sub: document.getElementById('results-sub'),
  mul: document.getElementById('results-mul'),
  div: document.getElementById('results-div'),
};

document.getElementById('calc-form').addEventListener('submit', e => {
  e.preventDefault();
  const op = document.getElementById('op').value;
  const n1 = parseFloat(document.getElementById('n1').value);
  const n2 = parseFloat(document.getElementById('n2').value);

  socket.emit('startProducer', {
    mode: 'user',
    operations: [op],
    count: 1,
    delay: 100,
    n1,
    n2
  });
});

document.getElementById('start-producer').addEventListener('click', () => {
  socket.emit('startProducer', {
    mode: 'random',
    operations: ['add', 'sub', 'mul', 'div', 'all'],
    count: 50,
    delay: 1000
  });
});

socket.on('result', ({ n1, n2, op, result }) => {
  const sym = { add: '+', sub: '−', mul: '×', div: '÷' }[op] || op;
  const li = document.createElement('li');
  li.textContent = `${n1} ${sym} ${n2} = ${result}`;
  if (lists[op]) lists[op].prepend(li);
});
