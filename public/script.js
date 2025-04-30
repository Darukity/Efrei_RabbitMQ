document.getElementById('calcForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const n1 = parseFloat(form.n1.value);
  const n2 = parseFloat(form.n2.value);
  const count = parseInt(form.count.value);
  const type = form.type.value;
  const operation = form.operation.value;

  await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          n1,
          n2,
          count,
          type,
          operation
      })
  });

  // Attendre un peu pour laisser les workers répondre
  setTimeout(loadResults, 1500);
});

async function loadResults() {
  const res = await fetch('/results');
  const data = await res.json();

  const tableBody = document.querySelector('#resultsTable tbody');
  tableBody.innerHTML = '';

  const grouped = { add: [], sub: [], mul: [], div: [] };

  for (const result of data) {
      if (grouped[result.op]) {
          grouped[result.op].push(result);
      }
  }

  const maxRows = Math.max(
      grouped.add.length,
      grouped.sub.length,
      grouped.mul.length,
      grouped.div.length
  );

  for (let i = 0; i < maxRows; i++) {
      const row = document.createElement('tr');
      ['add', 'sub', 'mul', 'div'].forEach(op => {
          const td = document.createElement('td');
          if (grouped[op][i]) {
              const r = grouped[op][i];
              td.textContent = `${r.n1} ${r.op} ${r.n2} = ${r.result}`;
          }
          row.appendChild(td);
      });
      tableBody.appendChild(row);
  }
}

// Actualise automatiquement les résultats toutes les 3 secondes
setInterval(loadResults, 3000);
