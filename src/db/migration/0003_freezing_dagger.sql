ALTER TABLE `user` ADD `nik` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `position` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_nik_unique` ON `user` (`nik`);