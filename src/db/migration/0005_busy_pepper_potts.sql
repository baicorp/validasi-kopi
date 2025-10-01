CREATE TABLE `rasa_treshold_mix` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rasa_mix` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rasaTresholdMixUniqueIndex` ON `rasa_treshold_mix` (lower("rasa_mix"));