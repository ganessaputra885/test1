const demoItems = [
  {
    id: crypto.randomUUID(),
    name: 'Filter Oli',
    sku: 'SP-001',
    category: 'Engine',
    stock: 12,
    minStock: 5,
    price: 65000,
    supplier: 'PT Mitra Teknik',
    location: 'Rak A-01',
    notes: 'Umur pakai 12 bulan'
  },
  {
    id: crypto.randomUUID(),
    name: 'Kampas Rem',
    sku: 'SP-002',
    category: 'Brake',
    stock: 4,
    minStock: 6,
    price: 180000,
    supplier: 'CV Karya Jaya',
    location: 'Rak B-02',
    notes: 'Stok perlu restock'
  },
  {
    id: crypto.randomUUID(),
    name: 'Relay Lampu',
    sku: 'SP-003',
    category: 'Electrical',
    stock: 20,
    minStock: 8,
    price: 95000,
    supplier: 'PT Sinar Elektrik',
    location: 'Rak C-01',
    notes: 'Stock aman'
  },
  {
    id: crypto.randomUUID(),
    name: 'Seal Piston',
    sku: 'SP-004',
    category: 'Engine',
    stock: 3,
    minStock: 5,
    price: 120000,
    supplier: 'PT Nusantara Parts',
    location: 'Rak A-06',
    notes: 'Pesan ulang segera'
  }
];

window.demoItems = demoItems;
