-- Insert Users
INSERT INTO users (username, password, email, full_name, role) VALUES
('admin', '$2a$10$xyz123', 'admin@warehouse.com', 'Administrator System', 'admin'),
('staff1', '$2a$10$xyz456', 'staff1@warehouse.com', 'Staff Gudang A', 'staff'),
('staff2', '$2a$10$xyz789', 'staff2@warehouse.com', 'Staff Gudang B', 'staff');

-- Insert Master Barang
INSERT INTO master_barang (kode_barang, nama_barang, deskripsi, satuan, harga_beli, harga_jual) VALUES
('BRG001', 'Laptop Dell XPS 13', 'Laptop Business Grade', 'unit', 15000000, 17500000),
('BRG002', 'Mouse Wireless Logitech', 'Mouse Wireless 2.4GHz', 'pcs', 250000, 350000),
('BRG003', 'Keyboard Mechanical', 'Keyboard Mechanical RGB', 'pcs', 800000, 1200000),
('BRG004', 'Monitor 24 inch', 'Monitor LED 24 inch Full HD', 'unit', 2000000, 2800000),
('BRG005', 'Webcam HD 1080p', 'Webcam High Definition', 'pcs', 450000, 650000);

-- Insert Initial Stock
INSERT INTO mstok (barang_id, stok_akhir) VALUES
(1, 10), (2, 50), (3, 30), (4, 15), (5, 25);

-- Insert Pembelian Data
INSERT INTO beli_header (no_faktur, supplier, total, user_id, status) VALUES
('BLI001', 'PT Supplier Elektronik', 32500000, 2, 'selesai'),
('BLI002', 'CV Komputer Jaya', 12500000, 3, 'selesai');

INSERT INTO beli_detail (beli_header_id, barang_id, qty, harga, subtotal) VALUES
(1, 1, 2, 15000000, 30000000),
(1, 2, 10, 250000, 2500000),
(2, 3, 5, 800000, 4000000),
(2, 4, 3, 2000000, 6000000),
(2, 5, 4, 450000, 1800000);

-- Insert Penjualan Data
INSERT INTO jual_header (no_faktur, customer, total, user_id, status) VALUES
('JUAL001', 'PT Customer Indonesia', 18700000, 2, 'selesai'),
('JUAL002', 'CV Tech Solution', 4150000, 3, 'selesai');

INSERT INTO jual_detail (jual_header_id, barang_id, qty, harga, subtotal) VALUES
(1, 1, 1, 17500000, 17500000),
(1, 2, 2, 350000, 700000),
(1, 3, 1, 1200000, 1200000),
(2, 2, 5, 350000, 1750000),
(2, 4, 1, 2800000, 2800000);

-- Insert History Stok
INSERT INTO history_stok (barang_id, user_id, jenis_transaksi, jumlah, stok_sebelum, stok_sesudah, keterangan) VALUES
(1, 2, 'masuk', 2, 0, 2, 'Pembelian BLI001'),
(2, 2, 'masuk', 10, 0, 10, 'Pembelian BLI001'),
(3, 3, 'masuk', 5, 0, 5, 'Pembelian BLI002'),
(4, 3, 'masuk', 3, 0, 3, 'Pembelian BLI002'),
(5, 3, 'masuk', 4, 0, 4, 'Pembelian BLI002'),
(1, 2, 'keluar', 1, 2, 1, 'Penjualan JUAL001'),
(2, 2, 'keluar', 2, 10, 8, 'Penjualan JUAL001'),
(3, 2, 'keluar', 1, 5, 4, 'Penjualan JUAL001'),
(2, 3, 'keluar', 5, 8, 3, 'Penjualan JUAL002'),
(4, 3, 'keluar', 1, 3, 2, 'Penjualan JUAL002');
