const siteUrl = 'https://vestas.sharepoint.com/sites/DEP-MyDailyTask';
const lists = ['Personnel', 'Planning', 'UserRoles'];

function tableHtml(rows) {
  if (!rows || !rows.length) return '<p>Nessun dato.</p>';
  const cols = Object.keys(rows[0]);
  return `<table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

async function loadList(listName) {
  const url = `${siteUrl}/_api/web/lists/getbytitle('${listName}')/items?$top=5`;
  const res = await fetch(url, { headers: { Accept: 'application/json;odata=nometadata' } });
  if (!res.ok) throw new Error(`${listName}: ${res.status}`);
  const data = await res.json();
  return data.value || data.d?.results || [];
}

async function loadAll() {
  for (const name of lists) {
    const el = document.getElementById(name === 'UserRoles' ? 'roles' : name.toLowerCase());
    try {
      const rows = await loadList(name);
      el.innerHTML = tableHtml(rows);
    } catch (e) {
      el.innerHTML = `<p>Errore caricamento ${name}: ${e.message}</p>`;
    }
  }
}

loadAll();