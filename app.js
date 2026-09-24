const STORAGE_KEY = 'sparepart-inventory-v1';
const CATEGORY_STORAGE_KEY = 'sparepart-categories-v1';
const defaultCategories = ['Engine', 'Brake', 'Electrical', 'Body', 'Lubricant'];

let spareparts = [];
let categories = loadCategories();

const form = document.getElementById('sparepartForm');
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
const totalStockEl = document.getElementById('totalStock');
const totalValueEl = document.getElementById('totalValue');

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
  submitBtn.textContent = 'Update Sparepart';
  cancelEditBtn.style.display = 'inline-flex';

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
      console.error('Error reading storage', error);
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
    console.error('Error loading data.json', error);
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
      const imageSrc = item.image || 'https://placehold.co/80x80/edf2f7/475569?text=IMG';

      return `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-4 align-top">
            <div class="flex items-center gap-3">
              <img src="${imageSrc}" alt="${item.name}" class="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200" />
              <div>
                <div class="font-semibold text-slate-900">${item.name}</div>
                ${item.notes ? `<p class="mt-1 text-xs text-slate-500">${item.notes}</p>` : ''}
              </div>
            </div>
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
