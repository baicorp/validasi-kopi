CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jenis_ujian` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jenis_ujian` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jenisUjianUniqueIndex` ON `jenis_ujian` (lower("jenis_ujian"));--> statement-breakpoint
CREATE TABLE `kategori_produk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kategori` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kategoriUniqueIndex` ON `kategori_produk` (lower("kategori"));--> statement-breakpoint
CREATE TABLE `kode` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kode` text NOT NULL,
	`nilai` text NOT NULL,
	`session_uuid` text NOT NULL,
	`session_name` text NOT NULL,
	`nama_ujian_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`nama_ujian_id`) REFERENCES `nama_ujian`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kodeUniquePerUjian` ON `kode` (`kode`,`session_uuid`);--> statement-breakpoint
CREATE TABLE `nama_ujian` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama_ujian` text NOT NULL,
	`jenis_ujian_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`jenis_ujian_id`) REFERENCES `jenis_ujian`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `namUjianUniqueIndex` ON `nama_ujian` (lower("nama_ujian"));--> statement-breakpoint
CREATE TABLE `produk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama_produk` text NOT NULL,
	`kategori_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`kategori_id`) REFERENCES `kategori_produk`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `produkUniquePerKategori` ON `produk` (lower("nama_produk"),`kategori_id`);--> statement-breakpoint
CREATE TABLE `rasa_treshold_mix` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rasa_mix` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rasaTresholdMixUniqueIndex` ON `rasa_treshold_mix` (lower("rasa_mix"));--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL,
	`username` text,
	`display_username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`updated_at` integer DEFAULT (current_timestamp) NOT NULL
);
