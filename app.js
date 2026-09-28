const STORAGE_KEY = 'sparepart-inventory-v1';
const CATEGORY_STORAGE_KEY = 'sparepart-categories-v1';
const defaultCategories = ['Engine', 'Brake', 'Electrical', 'Body', 'Lubricant'];

let spareparts = [];
let categories = loadCategories();

const form = document.getElementById('sparepartForm');
const formTitle = document.getElementById('formTitle');
const formModeBadge = document.getElementById('formModeBadge');
const formModeIcon = document.getElementById('formModeIcon');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const categorySelect = document.getElementById('category');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const tableBody = document.getElementById('sparepartTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const totalItemsEl = document.getElementById('totalItems');
const lowStockCountEl = document.getElementById('lowStockCount');
const lowStockCard = document.getElementById('lowStockCard');
const lowStockBadge = document.getElementById('lowStockBadge');
const totalStockEl = document.getElementById('totalStock');
const totalValueEl = document.getElementById('totalValue');
const statusAlert = document.getElementById('statusAlert');

const categoryModal = document.getElementById('categoryModal');
const openCategoryModalBtn = document.getElementById('openCategoryModalBtn');
const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
const cancelCategoryModalBtn = document.getElementById('cancelCategoryModalBtn');
const quickAddCategoryBtn = document.getElementById('quickAddCategoryBtn');
const categoryForm = document.getElementById('categoryForm');
const newCategoryNameInput = document.getElementById('newCategoryName');

function loadCategories() {
  const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {}
  }
  return [...defaultCategories];
}

function saveCategories() {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

function renderCategoryOptions(selectedCat = '') {
  if (!categorySelect || !categoryFilter) return;

  const currentFormVal = selectedCat || categorySelect.value || categories[0] || '';
  const currentFilterVal = categoryFilter.value || 'all';

  categorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join('');
  if (categories.includes(currentFormVal)) categorySelect.value = currentFormVal;

  categoryFilter.innerHTML = `
    <option value="all">Semua Kategori</option>
    ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
  `;
  if (categories.includes(currentFilterVal) || currentFilterVal === 'all') {
    categoryFilter.value = currentFilterVal;
  }
}

function addCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (!exists) {
    categories.push(trimmed);
    saveCategories();
  }
  renderCategoryOptions(trimmed);
  render();
}

function resetForm() {
  form.reset();
  form.dataset.mode = 'create';
  form.dataset.editId = '';
  form.dataset.imageData = '';
  submitBtn.textContent = 'Simpan Sparepart';
  cancelEditBtn.style.display = 'none';
  if (formTitle) formTitle.textContent = 'Tambah Sparepart Baru';
  if (formModeBadge) formModeBadge.textContent = 'Mode: Entri Baru';
  if (formModeIcon) formModeIcon.className = 'h-2.5 w-2.5 rounded-full bg-zinc-900';
  if (categorySelect && categories.length) categorySelect.value = categories[0];
  if (imageInput) imageInput.value = '';
  if (imagePreview) imagePreview.src = '';
  if (imagePreviewWrap) imagePreviewWrap.classList.add('hidden');
  document.getElementById('stock').value = 0;
  document.getElementById('minStock').value = 5;
  document.getElementById('price').value = 0;
}

function fillForm(item) {
  form.dataset.mode = 'edit';
  form.dataset.editId = item.id;
  form.dataset.imageData = item.image || '';
  submitBtn.textContent = 'Perbarui Sparepart';
  cancelEditBtn.style.display = 'inline-flex';
  if (formTitle) formTitle.textContent = `Edit Sparepart: ${item.name}`;
  if (formModeBadge) formModeBadge.textContent = 'Mode: Edit';
  if (formModeIcon) formModeIcon.className = 'h-2.5 w-2.5 rounded-full bg-amber-500';

  document.getElementById('name').value = item.name;
  document.getElementById('sku').value = item.sku;
  if (item.category && !categories.includes(item.category)) {
    categories.push(item.category);
    saveCategories();
    renderCategoryOptions(item.category);
  } else if (categorySelect) {
    categorySelect.value = item.category;
  }
  document.getElementById('stock').value = item.stock;
  document.getElementById('minStock').value = item.minStock;
  document.getElementById('price').value = item.price;
  document.getElementById('location').value = item.location || '';
  document.getElementById('notes').value = item.notes || '';

  if (item.image) {
    imagePreview.src = item.image;
    imagePreviewWrap.classList.remove('hidden');
  } else {
    imagePreview.src = '';
    imagePreviewWrap.classList.add('hidden');
  }

  document.getElementById('name').focus();
  document.getElementById('name').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function loadSpareparts() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.error('Gagal membaca penyimpanan lokal', error);
    }
  }

  try {
    const res = await fetch('data.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (error) {
    console.error('Gagal memuat data.json', error);
    if (statusAlert) {
      statusAlert.textContent = 'Perhatian: Berkas data.json tidak dapat dimuat otomatis. Pastikan aplikasi berjalan via web server lokal.';
      statusAlert.classList.remove('hidden');
    }
  }

  return [];
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
  const sortBy = sortSelect ? sortSelect.value : 'default';

  let items = spareparts.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query);

    const matchesCategory = category === 'all' || item.category === category;
    return matchesQuery && matchesCategory;
  });

  if (sortBy === 'price-asc') {
    items.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price-desc') {
    items.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'category') {
    items.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  } else if (sortBy === 'stock-asc') {
    items.sort((a, b) => Number(a.stock) - Number(b.stock));
  } else if (sortBy === 'location') {
    items.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
  } else if (sortBy === 'sku') {
    items.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
  }

  return items;
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

  if (lowStockCard && lowStockBadge) {
    if (lowStockCount > 0) {
      lowStockCard.classList.add('border-amber-300', 'bg-amber-50/40');
      lowStockBadge.classList.remove('hidden');
    } else {
      lowStockCard.classList.remove('border-amber-300', 'bg-amber-50/40');
      lowStockBadge.classList.add('hidden');
    }
  }
}

function renderTable() {
  const filteredItems = getFilteredSpareparts();

  if (!filteredItems.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-12 text-center">
          <div class="mx-auto max-w-sm">
            <p class="text-sm font-semibold text-zinc-900">Data sparepart tidak ditemukan</p>
            <p class="mt-1 text-xs text-zinc-500">Sesuaikan kata kunci pencarian, filter kategori, atau tambahkan sparepart baru melalui formulir di atas.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredItems
    .map((item) => {
      const lowStock = item.stock <= item.minStock;
      const stockBadge = lowStock
        ? `<span class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-bold text-amber-900 border border-amber-300"><span class="h-1.5 w-1.5 rounded-full bg-amber-600"></span>${item.stock}</span>`
        : `<span class="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 border border-emerald-200"><span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>${item.stock}</span>`;

      const imageVisual = item.image
        ? `<img src="${item.image}" alt="${item.name}" class="h-11 w-11 shrink-0 rounded-lg object-cover border border-zinc-300 bg-white" />`
        : `<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-400 font-mono text-[11px] font-bold">N/A</div>`;

      return `
        <tr class="hover:bg-zinc-50/80 transition-colors">
          <td class="px-4 py-3.5 align-top">
            <div class="flex items-start gap-3">
              ${imageVisual}
              <div class="min-w-0">
                <div class="font-bold text-zinc-950">${item.name}</div>
                ${item.notes ? `<p class="mt-0.5 text-xs text-zinc-500 line-clamp-2">${item.notes}</p>` : ''}
              </div>
            </div>
          </td>
          <td class="px-4 py-3.5 align-top font-mono text-xs">
            <span class="inline-flex rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800">${item.sku}</span>
          </td>
          <td class="px-4 py-3.5 align-top text-xs font-medium text-zinc-700">
            ${item.category}
          </td>
          <td class="px-4 py-3.5 align-top">
            ${stockBadge}
          </td>
          <td class="px-4 py-3.5 align-top font-mono text-xs text-zinc-600">
            ${item.minStock}
          </td>
          <td class="px-4 py-3.5 align-top font-mono text-xs font-semibold text-zinc-900">
            ${formatCurrency(item.price)}
          </td>
          <td class="px-4 py-3.5 align-top font-mono text-xs text-zinc-600">
            ${item.location || '-'}
          </td>
          <td class="px-4 py-3.5 align-top text-right">
            <div class="flex flex-wrap items-center justify-end gap-1.5">
              <button
                type="button"
                class="inline-flex min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                data-action="edit"
                data-id="${item.id}"
              >
                Edit
              </button>
              <button
                type="button"
                class="inline-flex min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                data-action="decrease"
                data-id="${item.id}"
                aria-label="Kurangi stok ${item.name}"
              >
                -
              </button>
              <button
                type="button"
                class="inline-flex min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                data-action="increase"
                data-id="${item.id}"
                aria-label="Tambah stok ${item.name}"
              >
                +
              </button>
              <button
                type="button"
                class="inline-flex min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                data-action="delete"
                data-id="${item.id}"
              >
                Hapus
              </button>
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

async function addSparepart(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const imageFile = imageInput && imageInput.files && imageInput.files[0];
  const imageData = imageFile ? await fileToDataUrl(imageFile) : form.dataset.imageData || '';

  const item = {
    name: String(formData.get('name')).trim(),
    sku: String(formData.get('sku')).trim(),
    category: String(formData.get('category')).trim(),
    stock: Number(formData.get('stock')) || 0,
    minStock: Number(formData.get('minStock')) || 0,
    price: Number(formData.get('price')) || 0,
    location: String(formData.get('location')).trim(),
    notes: String(formData.get('notes')).trim(),
    image: imageData,
  };

  if (!item.name || !/^[a-z0-9]+$/.test(item.sku)) return;

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
if (imageInput) {
  imageInput.addEventListener('change', async () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      imagePreview.src = '';
      imagePreviewWrap.classList.add('hidden');
      form.dataset.imageData = '';
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    form.dataset.imageData = dataUrl;
    imagePreview.src = dataUrl;
    imagePreviewWrap.classList.remove('hidden');
  });
}
tableBody.addEventListener('click', handleTableClick);
searchInput.addEventListener('input', renderTable);
categoryFilter.addEventListener('change', renderTable);
if (sortSelect) sortSelect.addEventListener('change', renderTable);

function openCategoryModal() {
  if (newCategoryNameInput) newCategoryNameInput.value = '';
  if (categoryModal) categoryModal.showModal();
}

function closeCategoryModal() {
  if (categoryModal) categoryModal.close();
}

if (openCategoryModalBtn) openCategoryModalBtn.addEventListener('click', openCategoryModal);
if (quickAddCategoryBtn) quickAddCategoryBtn.addEventListener('click', openCategoryModal);
if (closeCategoryModalBtn) closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
if (cancelCategoryModalBtn) cancelCategoryModalBtn.addEventListener('click', closeCategoryModal);

if (categoryForm) {
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = newCategoryNameInput.value.trim();
    if (val) {
      addCategory(val);
      closeCategoryModal();
    }
  });
}

async function init() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="8" class="px-4 py-12 text-center text-sm text-zinc-500">
        <div class="inline-flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent"></span>
          <span>Memuat data sparepart...</span>
        </div>
      </td>
    </tr>
  `;

  spareparts = await loadSpareparts();
  spareparts.forEach((item) => {
    if (item.category && !categories.includes(item.category)) {
      categories.push(item.category);
    }
  });
  saveCategories();
  renderCategoryOptions();
  resetForm();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
