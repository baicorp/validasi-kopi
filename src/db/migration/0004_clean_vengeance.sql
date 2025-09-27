ALTER TABLE `kategori_produk` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE UNIQUE INDEX `kategoriUniqueIndex` ON `kategori_produk` (lower("kategori"));--> statement-breakpoint
ALTER TABLE `kode` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE UNIQUE INDEX `kodeUniquePerUjian` ON `kode` (`kode`,`session_uuid`);--> statement-breakpoint
ALTER TABLE `produk` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `produk` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE UNIQUE INDEX `produkUniquePerKategori` ON `produk` (lower("nama_produk"),`kategori_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `jenisUjianUniqueIndex` ON `jenis_ujian` (lower("jenis_ujian"));--> statement-breakpoint
CREATE UNIQUE INDEX `namUjianUniqueIndex` ON `nama_ujian` (lower("nama_ujian"));