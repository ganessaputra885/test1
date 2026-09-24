const STORAGE_KEY = 'sparepart-inventory-v1';
const demoItems = Array.isArray(window.demoItems) ? window.demoItems : [];

const form = document.getElementById('sparepartForm');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const tableBody = document.getElementById('sparepartTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetDemoBtn = document.getElementById('resetDemoBtn');

const totalItemsEl = document.getElementById('totalItems');
const lowStockCountEl = document.getElementById('lowStockCount');
const totalStockEl = document.getElementById('totalStock');
const totalValueEl = document.getElementById('totalValue');

let spareparts = loadSpareparts();

function resetForm() {
  form.reset();
  form.dataset.mode = 'create';
  form.dataset.editId = '';
  submitBtn.textContent = 'Simpan Sparepart';
  cancelEditBtn.style.display = 'none';
  document.getElementById('stock').value = 0;
  document.getElementById('minStock').value = 5;
  document.getElementById('price').value = 0;
}

function fillForm(item) {
  form.dataset.mode = 'edit';
  form.dataset.editId = item.id;
  submitBtn.textContent = 'Update Sparepart';
  cancelEditBtn.style.display = 'inline-flex';

  document.getElementById('name').value = item.name;
  document.getElementById('sku').value = item.sku;
  document.getElementById('category').value = item.category;
  document.getElementById('stock').value = item.stock;
  document.getElementById('minStock').value = item.minStock;
  document.getElementById('price').value = item.price;
  document.getElementById('supplier').value = item.supplier || '';
  document.getElementById('location').value = item.location || '';
  document.getElementById('notes').value = item.notes || '';

  document.getElementById('name').focus();
  document.getElementById('name').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function loadSpareparts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    if (!demoItems.length) return [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoItems));
    return [...demoItems];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [...demoItems];
  } catch (error) {
    console.error('Error reading storage', error);
    return [...demoItems];
  }
}

function saveSpareparts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spareparts));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getFilteredSpareparts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  return spareparts.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query);

    const matchesCategory = category === 'all' || item.category === category;
    return matchesQuery && matchesCategory;
  });
}

function renderStats() {
  const totalItems = spareparts.length;
  const lowStockCount = spareparts.filter((item) => item.stock <= item.minStock).length;
  const totalStock = spareparts.reduce((sum, item) => sum + Number(item.stock), 0);
  const totalValue = spareparts.reduce((sum, item) => sum + Number(item.stock) * Number(item.price), 0);

  totalItemsEl.textContent = totalItems;
  lowStockCountEl.textContent = lowStockCount;
  totalStockEl.textContent = totalStock;
  totalValueEl.textContent = formatCurrency(totalValue);
}

function renderTable() {
  const filteredItems = getFilteredSpareparts();

  if (!filteredItems.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="px-4 py-10 text-center text-sm text-slate-500">Data sparepart tidak ditemukan.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredItems
    .map((item) => {
      const lowStock = item.stock <= item.minStock;
      const stockClass = lowStock
        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
        : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';

      return `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-4 align-top">
            <div class="font-semibold text-slate-900">${item.name}</div>
            ${item.notes ? `<p class="mt-1 text-xs text-slate-500">${item.notes}</p>` : ''}
          </td>
          <td class="px-4 py-4">
            <span class="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">${item.sku}</span>
          </td>
          <td class="px-4 py-4">
            <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">${item.category}</span>
          </td>
          <td class="px-4 py-4">
            <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${stockClass}">${item.stock}</span>
          </td>
          <td class="px-4 py-4 text-sm text-slate-600">${item.minStock}</td>
          <td class="px-4 py-4 text-sm font-medium text-slate-700">${formatCurrency(item.price)}</td>
          <td class="px-4 py-4 text-sm text-slate-600">${item.location || '-'}</td>
          <td class="px-4 py-4 text-sm text-slate-600">${item.supplier || '-'}</td>
          <td class="px-4 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100" data-action="edit" data-id="${item.id}">Edit</button>
              <button type="button" class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200" data-action="decrease" data-id="${item.id}">-</button>
              <button type="button" class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200" data-action="increase" data-id="${item.id}">+</button>
              <button type="button" class="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100" data-action="delete" data-id="${item.id}">Hapus</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function updateItemStock(id, delta) {
  spareparts = spareparts.map((item) => {
    if (item.id !== id) return item;
    const nextStock = Math.max(0, Number(item.stock) + delta);
    return { ...item, stock: nextStock };
  });

  saveSpareparts();
  render();
}

function deleteItem(id) {
  spareparts = spareparts.filter((item) => item.id !== id);
  saveSpareparts();
  render();
}

function addSparepart(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const item = {
    name: String(formData.get('name')).trim(),
    sku: String(formData.get('sku')).trim(),
    category: String(formData.get('category')).trim(),
    stock: Number(formData.get('stock')) || 0,
    minStock: Number(formData.get('minStock')) || 0,
    price: Number(formData.get('price')) || 0,
    supplier: String(formData.get('supplier')).trim(),
    location: String(formData.get('location')).trim(),
    notes: String(formData.get('notes')).trim(),
  };

  if (!item.name || !item.sku) return;

  if (form.dataset.mode === 'edit' && form.dataset.editId) {
    spareparts = spareparts.map((part) => {
      if (part.id !== form.dataset.editId) return part;
      return { ...part, ...item };
    });
  } else {
    spareparts.unshift({ ...item, id: crypto.randomUUID() });
  }

  saveSpareparts();
  resetForm();
  render();
}

function resetDemoData() {
  spareparts = [...demoItems.map((item) => ({ ...item, id: crypto.randomUUID() }))];
  saveSpareparts();
  render();
}

function handleTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  const item = spareparts.find((part) => part.id === id);

  if (action === 'increase') updateItemStock(id, 1);
  if (action === 'decrease') updateItemStock(id, -1);
  if (action === 'delete') deleteItem(id);
  if (action === 'edit' && item) fillForm(item);
}

function render() {
  renderStats();
  renderTable();
}

form.addEventListener('submit', addSparepart);
cancelEditBtn.addEventListener('click', () => resetForm());
tableBody.addEventListener('click', handleTableClick);
searchInput.addEventListener('input', renderTable);
categoryFilter.addEventListener('change', renderTable);
resetDemoBtn.addEventListener('click', () => {
  resetDemoData();
  resetForm();
});

resetForm();
render();
