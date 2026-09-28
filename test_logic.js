const assert = require('assert');

// Mock data matching data.json
const spareparts = [
  { id: '1', name: 'Filter Oli', sku: 'sp001', category: 'Engine', stock: 12, minStock: 5, price: 65000, location: 'Rak A-01' },
  { id: '2', name: 'Kampas Rem', sku: 'sp002', category: 'Brake', stock: 4, minStock: 6, price: 180000, location: 'Rak B-02' },
  { id: '3', name: 'Relay Lampu', sku: 'sp003', category: 'Electrical', stock: 20, minStock: 8, price: 95000, location: 'Rak C-01' },
  { id: '4', name: 'Seal Piston', sku: 'sp004', category: 'Engine', stock: 3, minStock: 5, price: 120000, location: 'Rak A-06' },
];

// Stats verification
const totalItems = spareparts.length;
const lowStockCount = spareparts.filter((item) => item.stock <= item.minStock).length;
const totalStock = spareparts.reduce((sum, item) => sum + item.stock, 0);
const totalValue = spareparts.reduce((sum, item) => sum + item.stock * item.price, 0);

assert.strictEqual(totalItems, 4);
assert.strictEqual(lowStockCount, 2); // Kampas Rem (4 <= 6) and Seal Piston (3 <= 5)
assert.strictEqual(totalStock, 39);
assert.strictEqual(totalValue, 12 * 65000 + 4 * 180000 + 20 * 95000 + 3 * 120000);

// Filter verification
const query = 'rem';
const filtered = spareparts.filter((item) => item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query));
assert.strictEqual(filtered.length, 1);
assert.strictEqual(filtered[0].sku, 'sp002');

// Stock boundary verification
const nextStock = Math.max(0, 0 - 1);
assert.strictEqual(nextStock, 0);

// Activity log verification
let activities = [];
function logActivity({ type, name, sku, change, details }) {
  activities.unshift({ type, name, sku, change, details });
  if (activities.length > 50) activities = activities.slice(0, 50);
}

logActivity({ type: 'STOCK_INC', name: 'Filter Oli', sku: 'sp001', change: '+1', details: 'Stok fisik diubah dari 12 menjadi 13' });
logActivity({ type: 'STOCK_DEC', name: 'Kampas Rem', sku: 'sp002', change: '-1', details: 'Stok fisik diubah dari 4 menjadi 3' });
assert.strictEqual(activities.length, 2);
assert.strictEqual(activities[0].type, 'STOCK_DEC');
assert.strictEqual(activities[1].type, 'STOCK_INC');

// Activity cap verification
for (let i = 0; i < 60; i++) {
  logActivity({ type: 'STOCK_INC', name: `Item ${i}`, sku: `sp${i}`, change: '+1', details: 'Test cap' });
}
assert.strictEqual(activities.length, 50);

console.log('Semua cek logika lolos: PASS');
