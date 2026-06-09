const siteUrl = 'https://vestas.sharepoint.com/sites/DEP-MyDailyTask';
const lists = ['personale', 'Planning', 'UserRoles'];

function tableHtml(rows) {
  if (!rows || !rows.length) return '<p>Nessun dato.</p>';
  const cols = Object.keys(rows[0]);
  return `
    <table class="table">
      <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

async function getListType(listName) {
  const res = await fetch(`${siteUrl}/_api/web/lists/GetByTitle('${listName}')?$select=ListItemEntityTypeFullName`, {
    headers: { Accept: 'application/json;odata=nometadata' }
  });
  const data = await res.json();
  return data.ListItemEntityTypeFullName;
}

async function savePersonale(row) {
  const listName = 'personale';
  const type = await getListType(listName);
  const payload = {
    __metadata: { type },
    id: row.id || '',
    team: row.team || '',
    nome: row.nome || '',
    cognome: row.cognome || '',
    lwww: row.lwww || '',
    processo: row.processo || '',
    training: row.training || ''
  };

  const isUpdate = !!row.itemId;
  const url = isUpdate
    ? `${siteUrl}/_api/web/lists/GetByTitle('${listName}')/items(${row.itemId})`
    : `${siteUrl}/_api/web/lists/GetByTitle('${listName}')/items`;

  const headers = {
    Accept: 'application/json;odata=nometadata',
    'Content-Type': 'application/json;odata=nometadata'
  };

  if (isUpdate) {
    headers['If-Match'] = '*';
    headers['X-HTTP-Method'] = 'MERGE';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`Salvataggio fallito (${res.status})`);
  return true;
}

async function fetchList(listName) {
  const res = await fetch(`${siteUrl}/_api/web/lists/GetByTitle('${listName}')/items?$top=50`, {
    headers: { Accept: 'application/json;odata=nometadata' }
  });
  const data = await res.json();
  return data.value || [];
}

async function loadAll() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '<p>Caricamento...</p>';
  let html = '';
  for (const name of lists) {
    try {
      const rows = await fetchList(name);
      html += `<h2>${name}</h2>${tableHtml(rows)}`;
    } catch (e) {
      html += `<h2>${name}</h2><p>Errore caricamento ${name}: ${e.message}</p>`;
    }
  }
  app.innerHTML = html;
}

window.savePersonale = savePersonale;
window.loadAll = loadAll;
loadAll();